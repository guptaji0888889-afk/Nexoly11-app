/* NEXOLY11 AI chat. The OpenAI key stays on the Supabase Edge Function. */
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
    try {
      const history = JSON.parse(localStorage.getItem(STORE) || '[]');
      if (!Array.isArray(history) || !history.length) return;
      $('aiReplies').replaceChildren();
      history.forEach(m => addBubble(String(m.text || ''), m.who === 'mine' ? 'mine' : 'theirs', false));
    } catch (_) {}
  }

  async function send() {
    const input = $('aiText');
    const button = $('sendAI');
    const question = input?.value.trim();
    if (!question || busy) return;
    if (question.length > 1500) return addBubble('Please ek message 1500 characters se chhota bhejein.');
    busy = true;
    button.disabled = true;
    input.disabled = true;
    addBubble(question, 'mine');
    input.value = '';
    const pending = document.createElement('p');
    pending.className = 'bubble theirs ai-pending';
    pending.textContent = 'NEXOLY11 AI soch raha hai…';
    $('aiReplies').appendChild(pending);
    try {
      if (!window.N11) throw new Error('Supabase connection nahi mila. Page refresh karke dobara try karein.');
      const { data: sessionData } = await window.N11.auth.getSession();
      if (!sessionData?.session) throw new Error('AI use karne ke liye pehle NEXOLY11 account mein login karein.');
      const history = JSON.parse(localStorage.getItem(STORE) || '[]')
        .slice(-12).map(m => ({ role: m.who === 'mine' ? 'user' : 'assistant', content: m.text }));
      const { data, error } = await window.N11.functions.invoke('nexoly-ai', {
        body: { message: question, history }
      });
      if (error) {
        let detail = error.message || 'AI server se response nahi mila.';
        try { const ctx = error.context; if (ctx?.json) { const body = await ctx.json(); detail = body.error || detail; } } catch (_) {}
        throw new Error(detail + ' Supabase AI function deploy aur OPENAI_API_KEY secret check karein.');
      }
      if (!data?.reply) throw new Error(data?.error || 'AI ka jawab khaali aaya.');
      pending.remove();
      addBubble(data.reply, 'theirs');
    } catch (err) {
      pending.remove();
      addBubble('AI connect nahi ho paya: ' + (err.message || 'Unknown error') + '\n\nAgar abhi setup nahi hua hai, SETUP_NEXOLY11_AI.md ke steps complete karein.');
      console.error('NEXOLY11 AI:', err);
    } finally {
      busy = false;
      button.disabled = false;
      input.disabled = false;
      input.focus();
    }
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
    $('aiReplies')?.addEventListener('click', () => {});
  });
})();
