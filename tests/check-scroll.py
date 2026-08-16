#!/usr/bin/env python3
"""Step through the rendered test decks and assert the transcript scrolled far enough.

Two invariants are checked.

1. Once everything on a step has settled, the newest visible bubble must sit at
   least `buffer` px above the bottom edge of its transcript, or the transcript must
   already be scrolled as far as it goes. That is exactly what chat-bubbles.js aims
   for, so anything that changes height *after* the scroll is computed (a typing
   bubble growing, an image finishing its decode) shows up as a scroll that landed
   short.

2. Attaching a reaction pill must not change the height of the transcript box
   itself. Room for one row of pills is reserved during setup, so a pill landing
   should be invisible to the surrounding slide layout. A theme that places
   reactions in the flow without reserving that row makes the whole chat area grow
   mid-presentation.

Usage:

    quarto render tests/imessage.qmd
    python3 tests/check-scroll.py tests/imessage.html

With no arguments, checks every deck that has been rendered next to this script.
Requires playwright (`pip install playwright && playwright install chromium`).
"""

import pathlib
import sys

from playwright.sync_api import sync_playwright

BUFFER = 150  # keep in sync with `buffer` in chat-bubbles.js
SETTLE_MS = 900  # long enough for the 250ms growth plus a smooth scroll

PROBE = """
(buffer) => {
  const chat = Reveal.getCurrentSlide().querySelector('.chat');
  if (!chat) return null;
  const bubbles = Array.from(chat.querySelectorAll('[data-slot]'))
    .filter(b => !b.classList.contains('fragment') || b.classList.contains('visible'));
  if (!bubbles.length) return null;
  const b = bubbles[bubbles.length - 1];
  const maxScroll = chat.scrollHeight - chat.clientHeight;
  const wanted = Math.min(
    Math.max(0, b.offsetTop + b.offsetHeight - chat.clientHeight + buffer),
    maxScroll
  );
  return {
    scrollTop: Math.round(chat.scrollTop),
    wanted: Math.round(wanted),
    short: Math.round(wanted - chat.scrollTop),
    chatHeight: Math.round(chat.getBoundingClientRect().height),
    pills: chat.querySelectorAll('.reaction-pill').length,
    text: b.textContent.trim().replace(/\\s+/g, ' ').slice(0, 40),
  };
}
"""


def check(page, path):
    failures = []
    page.goto("file://" + str(path))
    page.wait_for_function("() => window.Reveal && Reveal.isReady()")
    page.wait_for_timeout(500)

    for h in range(page.evaluate("() => Reveal.getTotalSlides()")):
        page.evaluate(f"() => Reveal.slide({h}, 0, -1)")
        page.wait_for_timeout(400)
        previous = None
        for step in range(60):
            probe = page.evaluate(PROBE, BUFFER)
            # 2px of slack for sub-pixel layout and rounding
            if probe and probe["short"] > 2:
                failures.append((h, step, f"{probe['short']}px short "
                                          f"(scrollTop {probe['scrollTop']}, "
                                          f"wanted {probe['wanted']})", probe["text"]))
            if (probe and previous
                    and probe["pills"] != previous["pills"]
                    and probe["chatHeight"] != previous["chatHeight"]):
                failures.append((h, step, f"a reaction grew the transcript by "
                                          f"{probe['chatHeight'] - previous['chatHeight']}px "
                                          f"({previous['chatHeight']} to {probe['chatHeight']})",
                                 probe["text"]))
            previous = probe
            page.evaluate("() => Reveal.next()")
            page.wait_for_timeout(SETTLE_MS)
            if page.evaluate("() => Reveal.getIndices().h") != h:
                break
    return failures


def main():
    here = pathlib.Path(__file__).parent
    args = sys.argv[1:]
    decks = [pathlib.Path(a).resolve() for a in args] or sorted(here.glob("*.html"))
    if not decks:
        sys.exit("no rendered decks found; run `quarto render tests/<theme>.qmd` first")

    failed = False
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        for deck in decks:
            failures = check(page, deck)
            if failures:
                failed = True
                print(f"FAIL {deck.name}")
                for h, step, problem, text in failures:
                    print(f"  slide {h} step {step}: {problem} {text!r}")
            else:
                print(f"ok   {deck.name}")
        browser.close()
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
