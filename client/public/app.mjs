import './ui/user-manager.component.mjs';

const appRoot = document.querySelector('#app');

if (appRoot) {
  appRoot.innerHTML = `
    <user-manager></user-manager>
  `;
}
