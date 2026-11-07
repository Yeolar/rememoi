export function LocaleScript() {
  const script = `(function(){
  try {
    var saved = localStorage.getItem('locale');
    var browser = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    var locale = saved === 'zh' || saved === 'en'
      ? saved
      : (browser.toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');
    document.documentElement.dataset.locale = locale;
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  } catch (e) {
    document.documentElement.dataset.locale = 'en';
  }
})();`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
