
// pwa.js — registers service worker & handles updates
(function(){
  if (!('serviceWorker' in navigator)) return;
  const swUrl = './service-worker.js';
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(swUrl, { scope: './' });
      // Listen for updates
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Auto-reload to pick the fresh cache (no naggy dialogs in service)
            location.reload();
          }
        });
      });
      // iOS standalone fix: avoid opening in Safari
      window.addEventListener('click', (e)=>{
        const a = e.target.closest('a[target=_blank]');
        if (a && window.navigator.standalone) {
          e.preventDefault(); window.open(a.href, '_blank');
        }
      }, {capture:true});
    } catch (err){ console.error('SW registration failed', err); }
  });
})();
