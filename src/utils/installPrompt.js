// installPrompt.js

function createInstallPromptElement() {

    // todo: design install prompt !!
    const installPromptElement = document.createElement('div');
    installPromptElement.innerHTML = `
      <div class="install-prompt">
        <button id="installButton">Install App</button>
      </div>
    `;
    installPromptElement.style.display = 'none'; // Initially hide the prompt
    document.body.appendChild(installPromptElement);
    return installPromptElement;
  }
  
  function handleInstallClick(deferredPrompt) {
    deferredPrompt.prompt();
  
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome === 'accepted' ? 'User accepted the install prompt' : 'User dismissed the install prompt');
      deferredPrompt = null; // Reset the prompt
      const installPromptElement = document.getElementById('installButton');
      installPromptElement.style.display = 'none'; // Hide the prompt UI
    });
  }
  
  function installPrompt() {
    let deferredPrompt;
    const installPromptElement = createInstallPromptElement();
  
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
  
      // Store the event so it can be triggered later
      deferredPrompt = e;
  
      // Show the install button
      installPromptElement.style.display = 'block';
  
      const installButton = document.getElementById('installButton');
      // Remove any previous event listeners to prevent multiple attachments
      installButton.removeEventListener('click', handleInstallClick);
      installButton.addEventListener('click', () => handleInstallClick(deferredPrompt)); // Pass deferredPrompt as an argument
    });
  
    window.addEventListener('appinstalled', (event) => {
      console.log('', 'appinstalled', event);
    });
  }
  
  export { installPrompt }; // Export the function