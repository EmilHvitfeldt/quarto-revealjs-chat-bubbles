window.RevealChatBubbles = function () {
  return {
    id: "RevealChatBubbles",
    init: function (deck) {

      const bubbleClasses = ['bubble-right', 'bubble-left', 'bubble-left-2', 'bubble-left-3'];

      function isBubble(el) {
        return bubbleClasses.some(cls => el.classList.contains(cls));
      }

      function isReaction(el) {
        return el.classList.contains('reaction');
      }

      const buffer = 150;

      deck.on('ready', () => {
        document.querySelectorAll('.chat').forEach(chat => {
          chat.addEventListener('scroll', () => {
            chat.classList.toggle('is-scrolled', chat.scrollTop > 0);
          });

          // Link each .reaction to the bubble that precedes it.
          // Reactions may be direct children (.div syntax) or wrapped in a <p> (.span syntax).
          let bubbleCounter = 0;
          const children = Array.from(chat.children);

          // Assign IDs to all direct-child bubbles first
          children.forEach(el => {
            if (isBubble(el)) el.dataset.bubbleId = `cb-${bubbleCounter++}`;
          });

          // Find all reactions anywhere inside the chat, link to preceding bubble
          chat.querySelectorAll('.reaction').forEach(reaction => {
            // Walk up to find the direct child of chat (the flow-level container)
            let flowEl = reaction;
            while (flowEl.parentElement !== chat) flowEl = flowEl.parentElement;

            // Hide the flow-level container (reaction div or its <p> wrapper)
            flowEl.style.cssText = 'height:0;overflow:hidden;margin:0!important;padding:0!important;';

            // Find the nearest preceding sibling of flowEl that is a bubble
            let preceding = flowEl.previousElementSibling;
            while (preceding && !isBubble(preceding)) preceding = preceding.previousElementSibling;
            if (!preceding) return;

            reaction.dataset.targetBubble = preceding.dataset.bubbleId;
            if (!preceding.querySelector('.bubble-reactions')) {
              const container = document.createElement('div');
              container.className = 'bubble-reactions';
              preceding.appendChild(container);
              preceding.classList.add('has-reactions');
            }
          });
        });
      });

      deck.on('fragmentshown', (event) => {
        const fragment = event.fragment;
        const chat = fragment.closest('.chat');
        if (!chat) return;

        if (isReaction(fragment)) {
          const bubble = chat.querySelector(`[data-bubble-id="${fragment.dataset.targetBubble}"]`);
          if (!bubble) return;
          const pill = document.createElement('span');
          pill.className = 'reaction-pill';
          pill.textContent = fragment.textContent.trim();
          fragment._reactionPill = pill;
          bubble.querySelector('.bubble-reactions').appendChild(pill);
          return;
        }

        if (!isBubble(fragment)) return;
        const fragBottom = fragment.offsetTop + fragment.offsetHeight;
        const visibleBottom = chat.scrollTop + chat.clientHeight - buffer;
        if (fragBottom > visibleBottom) {
          chat.scrollTo({ top: fragBottom - chat.clientHeight + buffer, behavior: 'smooth' });
        }
      });

      deck.on('fragmenthidden', (event) => {
        const fragment = event.fragment;
        const chat = fragment.closest('.chat');
        if (!chat) return;

        if (isReaction(fragment)) {
          if (fragment._reactionPill) {
            const pill = fragment._reactionPill;
            fragment._reactionPill = null;
            pill.classList.add('is-hiding');
            pill.addEventListener('animationend', () => pill.remove(), { once: true });
          }
          return;
        }

        if (!isBubble(fragment)) return;
        const targetTop = Math.max(0, fragment.offsetTop - chat.clientHeight);
        if (chat.scrollTop > targetTop) {
          chat.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });

    }
  };
};
