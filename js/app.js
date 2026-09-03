/* Engineering Core v2 bootstrap: safe modern deferred loader fallback. */
if (!window.__appCoreLoaded) {
  const s1 = document.createElement('script');
  s1.src = 'js/app-core.js';
  s1.defer = true;
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.src = 'js/engineering-v2.js';
  s2.defer = true;
  document.head.appendChild(s2);
}
