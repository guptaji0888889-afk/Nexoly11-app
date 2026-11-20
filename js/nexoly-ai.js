/* Nexoly11 AI frontend. The OpenAI key is never stored in this file. */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORE = 'nexoly11_ai_chat_v1';
  let busy = false;

  function addBubble(text, who = 'theirs', save = true) {
    const box = $('aiReplies');
    if (!box) return;
    const p = document.createElement('p');
    p.className = `bubble ${who}`;
    p.textContent = text;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
    if (save) {
      try {
        const history = JSON.parse(localStorage.getItem(STORE) || '[]');
        history.push({ text, who, at: Date.now() });
        localStorage.setItem(STORE, JSON.stringify(history.slice(-40)));
      } catch (_) {}
    }
  }

  function restore() {
    const box = $('aiReplies');
    if (!box) return;
    try {
      const history = JSON.parse(localStorage.getItem(STORE) || '[]');
      box.replaceChildren();
      if (!Array.isArray(history) || !history.length) {
        addBubble('Namaste! Main Nexoly11 AI hoon. App use karne, creator growth aur settings mein madad kar sakta hoon.', 'theirs', false);
        return;
      }
      history.forEach(m => addBubble(String(m.text || ''), m.who === 'mine' ? 'mine' : 'theirs', false));
    } catch (_) {
      box.replaceChildren();
      addBubble('Namaste! Main Nexoly11 AI hoon. Aapki kya madad karun?', 'theirs', false);
    }
  }

  async function send() {
    const input = $('aiText');
    const button = $('sendAI');
    const question = input?.value.trim();
    if (!question || busy) return;
    if (question.length > 1500) return addBubble('Ek message 1500 characters se chhota bhejein.');
    busy = true;
    button.disabled = true;
    input.disabled = true;
    const previousHistory = JSON.parse(localStorage.getItem(STORE) || '[]')
      .slice(-12).map(m => ({ role: m.who === 'mine' ? 'user' : 'assistant', content: String(m.text || '') }));
    addBubble(question, 'mine');
    input.value = '';
    const pending = document.createElement('p');
    pending.className = 'bubble theirs ai-pending';
    pending.textContent = 'Nexoly11 AI jawab taiyar kar raha hai…';
    $('aiReplies').appendChild(pending);
    try {
      if (!window.N11) throw new Error('Supabase connect nahi hua. Internet aur config.js check karein.');
      const { data: sessionData, error: sessionError } = await window.N11.auth.getSession();
      if (sessionError || !sessionData?.session) throw new Error('AI use karne ke liye pehle Nexoly11 mein login karein.');
      const { data, error } = await window.N11.functions.invoke('nexoly-ai', { body: { message: question, history: previousHistory } });
      if (error) {
        let detail = error.message || 'AI function se response nahi mila.';
        try {
          const ctx = error.context;
          if (ctx?.clone) {
            const payload = await ctx.clone().json();
            if (payload?.error) detail = payload.error;
          }
        } catch (_) {}
        throw new Error(detail);
      }
      if (!data?.reply) throw new Error(data?.error || 'AI ka jawab nahi mila. Dobara try karein.');
      pending.remove();
      addBubble(data.reply, 'theirs');
    } catch (err) {
      pending.remove();
      addBubble('AI abhi connect nahi ho paya: ' + (err.message || 'Temporary server error') + '\n\nAdmin ko Supabase Edge Function aur OPENAI_API_KEY secret setup karna hoga.');
      console.error('NEXOLY11 AI:', err);
    } finally {
      busy = false;
      button.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  function openChat() {
    const panel = $('aiChat');
    if (!panel) return;
    panel.hidden = false;
    $('openAI').textContent = 'Close AI Chat';
    restore();
    $('aiText')?.focus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const panel = $('aiChat');
    $('openAI')?.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      $('openAI').textContent = panel.hidden ? 'Chat with AI' : 'Close AI Chat';
      if (!panel.hidden) { restore(); $('aiText').focus(); }
    });
    $('sendAI')?.addEventListener('click', send);
    $('aiText')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    $('inboxSearch')?.addEventListener('focus', () => {
      if (!$('aiChat')?.hidden) return;
      openChat();
    });
  });
})();
