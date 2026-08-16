# Manual test suite

One deck per theme, each containing every feature the extension supports:

| File | Theme |
|---|---|
| `imessage.qmd` | iMessage (default) |
| `slack.qmd` | Slack |
| `discord.qmd` | Discord |
| `teams.qmd` | Microsoft Teams |

The four files are identical apart from the `theme` attribute, so anything that differs between them is either a deliberate theme choice or a bug.

## Running

```sh
quarto preview tests/imessage.qmd
```

These files are not in the `render` list in `_quarto.yml`, so a plain `quarto render` of the site ignores them. Render them individually when you want to check something.

The plot slide needs R with knitr. The image slides use `../giphy.gif` from the repo root.

## Automated scroll check

`check-scroll.py` drives the rendered decks in headless Chromium and asserts the one thing that is tedious to eyeball: after every step has settled, the newest visible bubble sits at least the 150px buffer above the bottom of its transcript, or the transcript is already scrolled as far as it goes. That catches anything which changes height *after* the scroll position was computed.

```sh
quarto render tests/imessage.qmd
python3 tests/check-scroll.py tests/imessage.html   # or no argument for every rendered deck
```

Needs `pip install playwright && playwright install chromium`. It does not check appearance, only scroll position, so it complements the manual pass below rather than replacing it.

## What to check

Step through each deck **forwards and then backwards**. Most scroll bugs only appear on the way back, or on the second visit to a slide.

- **Static conversation.** Base layout, per-slot colours, avatars and names where the theme uses them, and consecutive messages from one speaker grouping under a single header.
- **Four speakers.** All four slot colours distinct and legible against the theme's surface.
- **Reactions.** Pills animate in, sit in the theme's designated spot, and animate out when stepping back. Attaching a pill grows the message, so the target bubble must still be fully visible afterwards.
- **Delayed reactions.** Same, but the pills land several steps after their bubble, against an already-scrolled transcript.
- **Reactions at the fold.** Pills attaching to the newest bubble while the transcript is already at the bottom. Room for one row is reserved up front, so this should not move anything; pills that wrap to a second row should scroll.
- **Typing indicators.** Two steps per bubble: dots, then text. The bubble grows smoothly, the tail stays visible throughout, and the text fades in only after the growth finishes. Stepping back collapses it to dots again.
- **Typing → tall text.** The growth here exceeds the 150px scroll buffer, so the transcript must scroll a second time once the bubble has settled.
- **Image bubble / plot output.** Hard-reload with the cache disabled: the bubble must end up fully in view *after* the image decodes, not just after it is revealed.
- **Scroll stress.** The newest bubble should sit just above the bottom edge at every step. The top fade mask appears as soon as the transcript is scrolled.
- **Legacy classes.** `bubble-right`/`bubble-left`/`bubble-left-2`/`bubble-left-3` must render identically to `speaker-1` … `speaker-4`.
- **Alternate `self`.** Side-based themes (iMessage, Teams) flip which slot sits on the right; flat themes (Slack, Discord) look unchanged.
- **Avatars.** Explicit image avatars load, the per-message `name` override wins over the roster, and themes without avatars ignore both.
