window.RevealChatBubbles = function () {
  return {
    id: "RevealChatBubbles",
    init: function (deck) {

      const bubbleClasses = ['bubble-right', 'bubble-left', 'bubble-left-2', 'bubble-left-3'];

      function isBubble(el) {
        return bubbleClasses.some(cls => el.classList.contains(cls));
      }

      const buffer = 150;

      deck.on('ready', () => {
        document.querySelectorAll('.chat').forEach(chat => {
          chat.addEventListener('scroll', () => {
            chat.classList.toggle('is-scrolled', chat.scrollTop > 0);
          });
        });
      });

      deck.on('fragmentshown', (event) => {
        const fragment = event.fragment;
        if (!isBubble(fragment)) return;
        const chat = fragment.closest('.chat');
        if (!chat) return;
        const fragBottom = fragment.offsetTop + fragment.offsetHeight;
        const visibleBottom = chat.scrollTop + chat.clientHeight - buffer;
        if (fragBottom > visibleBottom) {
          chat.scrollTo({ top: fragBottom - chat.clientHeight + buffer, behavior: 'smooth' });
        }
      });

      deck.on('fragmenthidden', (event) => {
        const fragment = event.fragment;
        if (!isBubble(fragment)) return;
        const chat = fragment.closest('.chat');
        if (!chat) return;
        const targetTop = Math.max(0, fragment.offsetTop - chat.clientHeight);
        if (chat.scrollTop > targetTop) {
          chat.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });

    }
  };
};
