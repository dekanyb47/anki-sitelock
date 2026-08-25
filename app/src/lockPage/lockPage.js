// TODO: upon opening the site, check if website is unlocked or not, redirect if it is.

const params = new URLSearchParams(window.location.search);
const targetURL = params.get("target");
if (!targetURL) console.error("lockPage.js: No target URL was found in lockPage.html query string.");

const hostname = URLUtils.getURLHostname(targetURL);
if (!hostname) console.error("lockPage.js: Couldn't get URL hostname from targetURL.");

const unlockButton = document.getElementById("unlockButton");
const emergencyUnlock = document.getElementById("emergencyUnlock");

const settingsDialog = document.getElementById("settingsDialog");

async function redirectToTarget() {
  window.location.href = targetURL;
}

unlockButton.addEventListener("click", async () => {
  const result = await browser.storage.local.get(["credits", "unlockPrice"]);

  let creditBalance = 0;
  let price = 1;
  if (validationUtils.isValidNumber(result.credits) && result.credits >= 0) creditBalance = result.credits;
  else {
    console.warn(`unlockButton listener: invalid value in storage for credits: ${result.credits}`);
  }
  if (validationUtils.isValidNumber(result.unlockPrice) && result.unlockPrice > 0) price = result.unlockPrice;
  else {
    console.warn(`unlockButton listener: invalid value in storage for credits: ${result.credits}`);
  }

  // take credits away if successful
  if (creditBalance < price) {
    showToast("Insufficient credits!", "error", 3000);
    return;
  }

  // TODO: implement value restore/backup once storage is reworked to use update functions.
  const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "subtractCredits", "value": price}) &&
                  await browser.runtime.sendMessage({"type": "storageWrite", "function": "unlockWebsite", "value": hostname});
  if (!success) {
    console.error("unlockButton listener: Changing variables was unsuccessful.");
    return;
  }

  console.log(`website has been unlocked.`);
  unlockButton.style.display = "none";
  redirectToTarget();
})

emergencyUnlock.addEventListener("click", async () => {
  const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "unlockWebsite", "value": hostname});
  if (!success) {
    console.error("Emergency unlock failed.");
  }

  console.log("Emergency unlock successful, redirecting...");
  redirectToTarget();
})

function msToHRF(timeMs) {
  let resultComponents = []
  let remaining = timeMs;

  const days = Math.floor(remaining / 86400000);
  remaining -= days * 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining -= hours * 3600000;
  const minutes = Math.floor(remaining / 60000);
  remaining -= minutes * 60000;
  const seconds = Math.floor(remaining / 1000);

  if (days) resultComponents.push(`${days} day${(days >= 2) ? 's' : ''}`);
  if (hours) resultComponents.push(`${hours} hour${(hours >= 2) ? 's' : ''}`);
  if (minutes) resultComponents.push(`${minutes} minute${(minutes >= 2) ? 's' : ''}`);
  if (seconds) resultComponents.push(`${seconds} second${(seconds >= 2) ? 's' : ''}`);
  
  const noOfComponents = resultComponents.length;
  if (noOfComponents === 0) {
    console.warn("msToHRF: Unlock time under 1 second.");
    return "";
  }
  if (noOfComponents === 1) return resultComponents[0]; 
  else if (noOfComponents >= 2) {
    let result = resultComponents.slice(0, noOfComponents - 1).join(", ");
    result += ` and ${resultComponents[noOfComponents - 1]}`;
    return result;
  }
}

async function updateValuesFromStorage() {
  const unlockTimeField = document.getElementById("unlockTimeField");
  const priceField = document.getElementById("priceField");
  const creditBalanceField = document.getElementById("creditBalance");

  const {unlockTimeMs, unlockPrice: price, credits: creditBalance} = await browser.storage.local.get(["unlockTimeMs", "unlockPrice", "credits"]);

  if (!validationUtils.isValidNumber(unlockTimeMs)) console.warn(`updateValuesFromStorage: Invalid value for unlockTimeMs in storage: ${unlockTimeMs}`);
  if (!validationUtils.isValidNumber(price)) console.warn(`updateValuesFromStorage: Invalid value for unlockPrice in storage: ${price}`);
  if (!validationUtils.isValidNumber(creditBalance)) console.warn(`updateValuesFromStorage: Invalid value for credits in storage: ${creditBalance}`);

  unlockTimeField.innerText = msToHRF(unlockTimeMs);
  priceField.innerText = `${price}`;
  creditBalanceField.innerText = `${creditBalance}`;
}

document.addEventListener("DOMContentLoaded", async (e) => {
  updateValuesFromStorage();

  const pingSuccess = await browser.runtime.sendMessage({"type": "ankiRequest", "function": "pingAnkiConnect"});
  if (!pingSuccess) {
    showToast("AnkiConnect could not be reached, so your credit balance may not be up to date! (Is Anki open?)", "warning", 10000);
    return;
  }

  const syncSuccess = await browser.runtime.sendMessage({"type": "syncStudiedCount"});
  if (!syncSuccess) showToast("AnkiConnect could not be reached, so your credit balance may not be up to date! (Is Anki open?)", "warning", 10000);
  else {
    showToast("Syncing data to storage has been completed.", "info");
    updateValuesFromStorage();
  }
});
