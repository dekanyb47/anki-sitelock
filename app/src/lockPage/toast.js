const toastSymbolPaths = {
  "info": "/app/assets/info-symbol-dark.svg",
  "warning": "/app/assets/warning-symbol.svg",
  "error": "/app/assets/error-symbol.svg"
};

// TODO: add validation if needed
function showToast(message, type="error", duration=5000) {
  if (!(type in toastSymbolPaths)) console.warn(`toast.js: unrecognized toast type: ${type}`);

  const symbol = document.createElement("img");
  symbol.className = "toastSymbol";
  symbol.setAttribute("src", toastSymbolPaths[type]);

  const text = document.createElement("div");
  text.className = "toastText"
  text.textContent += message;

  const toastNotification = document.createElement("div");
  toastNotification.className = `toastNotificationContainer ${type}Toast`;
  toastNotification.appendChild(symbol);
  toastNotification.appendChild(text);

  const section = document.getElementById("toastSection");
  section.appendChild(toastNotification);
  
  // TODO: add animation
  setTimeout(() => {
    toastNotification.remove()
  }, duration);
}