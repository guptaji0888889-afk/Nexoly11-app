(() => {
  const KEY = 'nexoly11-theme-mode';
  const modes = ['auto', 'light', 'dark'];
  const labels = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  const icons = { auto: '◐', light: '☀', dark: '☾' };
  const apply = mode => {
    const resolved = mode === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeMode = mode;
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.innerHTML = `<span class="theme-icon">${icons[mode]}</span><span>${labels[mode]}</span>`;
      btn.setAttribute('aria-label', `Theme: ${labels[mode]}. Tap to change theme.`);
      btn.title = `Theme: ${labels[mode]} (tap to change)`;
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === 'light' ? '#f4f6f8' : '#0b1020';
  };
  let mode = localStorage.getItem(KEY) || 'auto';
  if (!modes.includes(mode)) mode = 'auto';
  const addButton = () => {
    if (document.querySelector('[data-theme-toggle]')) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'theme-toggle'; btn.dataset.themeToggle = '1';
    btn.addEventListener('click', () => {
      mode = modes[(modes.indexOf(mode) + 1) % modes.length];
      localStorage.setItem(KEY, mode); apply(mode);
    });
    const header = document.querySelector('.home-header, .topbar');
    if (header) header.appendChild(btn); else document.body.appendChild(btn);
    apply(mode);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton); else addButton();
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (mode === 'auto') apply(mode); });
})();
