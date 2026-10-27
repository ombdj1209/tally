// Apply saved appearance before rendering to avoid a light flash on dark devices.
try {
  const mode = localStorage.getItem('tally-mode');
  const accent = localStorage.getItem('tally-accent');
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.accent = ['lime', 'peach', 'lavender'].includes(accent) ? accent : 'lime';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191e19' : '#f6f7f2');
} catch { /* Browser storage may be disabled; use the default appearance. */ }
