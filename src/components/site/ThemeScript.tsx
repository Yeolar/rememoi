export function ThemeScript() {
  const script = `(function(){
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0B0B10' : '#FCFCFD');
  } catch (e) {}
})();`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
