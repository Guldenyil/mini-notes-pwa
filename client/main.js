/**
 * Mini Notes - Main Application Entry Point
 * Handles service worker registration and initializes the UI
 */

import './ui.js';

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
  // You could show a notification to the user
});

window.addEventListener('offline', () => {
  console.log('✗ Gone offline - PWA will continue to work');
  // You could show a notification to the user
});

console.log('✓ Mini Notes initialized');
