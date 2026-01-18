// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Health Check
const checkHealthBtn = document.getElementById('checkHealth');
const statusDiv = document.getElementById('status');

async function checkHealth() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    
    statusDiv.style.display = 'block';
    statusDiv.className = 'status';
    statusDiv.innerHTML = `
      <strong>Server Status:</strong> ${data.status === 'ok' ? '✓ Online' : '✗ Error'}<br>
      <small>Response: ${JSON.stringify(data)}</small>
    `;
  } catch (error) {
    statusDiv.style.display = 'block';
    statusDiv.className = 'status error';
    statusDiv.innerHTML = `
      <strong>Server Status:</strong> ✗ Offline<br>
      <small>Error: ${error.message}</small>
    `;
  }
}

checkHealthBtn.addEventListener('click', checkHealth);

// Auto-check on load
checkHealth();
