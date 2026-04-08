# quarto-revealjs-chat-bubbles

A Quarto extension that adds iOS-style chat bubbles to Reveal.js presentations. Messages can be revealed one at a time using Quarto fragments, and long conversations automatically scroll to keep the latest message visible.

## Installation

```bash
quarto add EmilHvitfeldt/quarto-revealjs-chat-bubbles
```

## Usage

Enable the plugin in your presentation's YAML front matter:

```yaml
format:
  revealjs: default
revealjs-plugins:
  - chat-bubbles
```

Then wrap messages in a `.chat` div. Use `.bubble-right` for the sender (you) and `.bubble-left` for the other person. Add `.fragment` to any bubble you want to reveal on a keypress.

```markdown
::: {.chat}
::: {.bubble-right}
Hey, are you coming tonight?
:::

::: {.fragment .bubble-left}
Yeah! What time does it start?
:::

::: {.fragment .bubble-right}
Doors open at 7
:::
:::
```

The first bubble can be left without `.fragment` to appear immediately when the slide opens.

## Speaker classes

| Class | Side | Default color |
|-------|------|---------------|
| `.bubble-right` | Right | iMessage blue |
| `.bubble-left` | Left | Light gray |
| `.bubble-left-2` | Left | Green |
| `.bubble-left-3` | Left | Purple |

`.bubble-right` is the "self" sender. The three `.bubble-left` variants are for other participants, useful for group conversations.

## Emoji reactions

Add `.reaction` fragments after a bubble to attach emoji reactions to it. Each reaction appears as a small pill at the top corner of the bubble when revealed, and is removed when navigating backwards.

The inline syntax is the most concise:

```markdown
::: {.chat}
::: {.bubble-right}
There are more things in heaven and earth, Horatio.
:::

[😮]{.fragment .reaction}
[👍]{.fragment .reaction}

::: {.fragment .bubble-left}
O day and night, but this is wondrous strange!
:::

[😂]{.fragment .reaction}
:::
```

The fenced div syntax also works and may be clearer when the emoji is ambiguous:

```markdown
::: {.fragment .reaction}
😂
:::
```

Multiple reactions on the same bubble stack side by side. Reactions can be added to any bubble — including ones that are not themselves fragments.

To react to an older message after the conversation has progressed, place the reaction after its target bubble in the source and use `fragment-index` to control when it appears:

```markdown
::: {.chat}
::: {.bubble-right}
Message one
:::

[😮]{.fragment .reaction fragment-index="3"}

::: {.fragment .bubble-left fragment-index="1"}
Message two
:::

::: {.fragment .bubble-right fragment-index="2"}
Message three
:::
:::
```

Here messages one, two, and three appear in order (steps 1–2), and then 😮 reacts to the first message at step 3. The reaction is linked to its target by DOM position, while `fragment-index` controls when it is revealed.

## Typing indicator

Add `.typing` to any `.fragment` bubble to turn it into a two-step reveal. The first keypress shows the bubble with an animated three-dot typing indicator; the next keypress replaces the dots with the message text, with the bubble smoothly expanding to its full size.

```markdown
::: {.chat}
::: {.bubble-right}
Are you still there?
:::

::: {.fragment .bubble-left .typing}
Sorry, was typing a really long reply.
:::
:::
```

Navigating backwards restores the typing indicator. The `.typing` class can be applied to any bubble class (`.bubble-right`, `.bubble-left`, `.bubble-left-2`, `.bubble-left-3`) and works alongside reactions and other fragments.

## Overflow

If a conversation is too long to fit on the slide, the chat container will automatically scroll to keep the latest message visible. Navigating backwards scrolls back up.

## Customizing colors

Override the CSS custom properties in your own stylesheet:

```css
:root {
  --bubble-blue:   #FF3B30;  /* sender bubble */
  --bubble-gray:   #E9E9EB;  /* receiver bubble */
  --bubble-green:  #34C759;  /* second left speaker */
  --bubble-purple: #AF52DE;  /* third left speaker */
}
```
