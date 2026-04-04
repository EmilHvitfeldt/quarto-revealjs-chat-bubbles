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
