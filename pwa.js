(() => {
  const installButton = document.getElementById('install-app-button');
  let installPrompt = null;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (installButton) {
    if (isStandalone()) {
      installButton.hidden = true;
    }
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      installButton.hidden = false;
    });
    installButton.addEventListener('click', async () => {
      if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        installButton.hidden = true;
      } else {
        alert('To install JKSmartNest, open your browser menu and choose Install app or Add to Home screen.');
      }
    });
    window.addEventListener('appinstalled', () => {
      installButton.hidden = true;
      installPrompt = null;
    });
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('JKSmartNest offline support could not be enabled:', error);
      });
    });
  }
})();
