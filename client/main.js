/**
 * Mini Notes - Main Application Entry Point
 * Handles service worker registration and initializes the UI
 */

import { getCurrentLocale, initI18n, t } from './app/i18n/index.js';

async function bootstrapApp() {
  const activeLocale = initI18n();
  console.log(`✓ Locale initialized: ${activeLocale} (${t('locale.name')})`);

  await import('./ui.js');
}

bootstrapApp().catch((error) => {
  console.error('✗ Failed to bootstrap app:', error);
});

// Service Worker Registration (production only)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.DEV) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const appCaches = cacheNames.filter((cacheName) => cacheName.startsWith('mini-notes-'));
          await Promise.all(appCaches.map((cacheName) => caches.delete(cacheName)));
        }

        console.log('✓ Service Worker disabled and app caches cleared in development');
      } catch (error) {
        console.error('✗ Failed to clean Service Worker state in development:', error);
      }

      return;
    }

    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✓ Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.error('✗ Service Worker registration failed:', error);
      });
  });
}

// PWA Install Handler
let deferredPrompt;

function ensureNetworkStatusBanner() {
  let banner = document.getElementById('networkStatusBanner');

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'networkStatusBanner';
    banner.className = 'network-status-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.hidden = true;
    document.body.prepend(banner);
  }

  return banner;
}

function showNetworkStatus(isOnline) {
  const banner = ensureNetworkStatusBanner();

  if (isOnline) {
    banner.textContent = t('app.onlineNotice');
    banner.classList.remove('offline');
    banner.classList.add('online');
    banner.hidden = false;

    window.setTimeout(() => {
      banner.hidden = true;
    }, 3000);

    return;
  }

  banner.textContent = t('app.offlineNotice');
  banner.classList.remove('online');
  banner.classList.add('offline');
  banner.hidden = false;
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  console.log('✓ PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
  console.log('✓ PWA installed successfully');
  deferredPrompt = null;
});

// Online/Offline Detection
window.addEventListener('online', () => {
  console.log('✓ Back online');
  showNetworkStatus(true);
});

window.addEventListener('offline', () => {
  console.log('✗ Gone offline - PWA will continue to work');
  showNetworkStatus(false);
});

if (!navigator.onLine) {
  showNetworkStatus(false);
}

console.log('✓ Mini Notes initialized');
