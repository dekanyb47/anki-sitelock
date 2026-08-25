// TODO: move constants
// TODO: add an advanced settings tab where stuff like AnkiConnect port can be changed.

// add values in storage to input fields
const FILL_INPUT_TIMEOUT = 100; 

const settingsForm = document.getElementById("settingsForm");

const decksInput = document.getElementById("decksInput");
const websitesInput = document.getElementById("websitesInput");
const unlockPriceInput = document.getElementById("unlockPriceInput");
const unlockTimeInput = document.getElementById("unlockTimeInput");

// TODO: it may be pointless to validate during reads when writes are validated too.
async function fillInputValues() {
  const {decks, lockedWebsites, unlockPrice, unlockTimeMs: unlockTimeMs} = await browser.storage.local.get(["decks", "lockedWebsites", "unlockPrice", "unlockTimeMs"]);

  let decksStr = "";
  if (validationUtils.isValidArray(decks) && decks.length !== 0) decksStr = decks.join(';');
  else console.warn(`fillInputValues: incorrect value in storage for decks: ${decks}`);

  let lockedWebsitesStr = "";
  if (validationUtils.isValidArray(lockedWebsites) && lockedWebsites.length !== 0) lockedWebsitesStr = lockedWebsites.join(';');
  else console.warn(`fillInputValues: incorrect value in storage for lockedWebsites: ${lockedWebsites}`);

  if (!validationUtils.isValidNumber(unlockPrice)) console.warn(`fillInputValues: incorrect value in storage for unlockPrice: ${unlockPrice}`);
  if (!validationUtils.isValidNumber(unlockTimeMs)) console.warn(`fillInputValues: incorrect value in storage for unlockTime: ${unlockTime}`);
  const unlockTimeMin = unlockTimeMs / 60000;

  decksInput.value = decksStr;
  websitesInput.value = lockedWebsitesStr;
  unlockPriceInput.value = unlockPrice;
  unlockTimeInput.value = unlockTimeMin;
}

fillInputValues();

// TODO: send a message to lockPage to redirect if the locked website has been removed.
settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const decksStr = decksInput.value;
  const websitesStr = websitesInput.value;
  const unlockPriceStr = unlockPriceInput.value;
  const unlockTimeStr = unlockTimeInput.value;

  if (decksStr !== "") {
    const decks = getDeckArray(decksStr);
    await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateDecks", "value": decks});
  }

  if (websitesStr !== "") {
    const websiteHostnames = getHostnameArray(websitesStr);
    await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateLockedWebsites", "value": websiteHostnames});
  }

  if (unlockPriceStr !== "") {
    const unlockPrice = getUnlockPrice(unlockPriceStr);
    await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateUnlockPrice", "value": unlockPrice});
  }

  if (unlockTimeStr !== "") {
    const unlockTimeMs = getUnlockTimeMs(unlockTimeStr);
    if (isFinite(unlockTimeMs)) await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateUnlockTime", "value": unlockTimeMs});
  }
});

function getDeckArray(decksInputStr) {
  let result = [];
  const decks = decksInputStr.split(";");
  
  for (let i = 0; i < decks.length; i++) {
    const trimmed = decks[i].trim();
    if (trimmed !== "") result.push(trimmed);
  }

  return result;
}

function getHostnameArray(websitesInputStr) {
  const websites = websitesInputStr.split(";");
  let result = [];

  for (let i = 0; i < websites.length; i++) {
    if (websites[i] !== "") {
      const trimmed = websites[i].trim()
      result.push(URLUtils.getURLHostname(trimmed));
    }
  }

  return result;
}

function getUnlockPrice(unlockPriceStr) {
  const unlockPrice = Number(unlockPriceStr);
  if (isFinite(unlockPrice) && unlockPrice > 0) return unlockPrice;
  else {
    console.warn(`settingsForm listener: invalid input: ${unlockPrice}`);
    return NaN;
  }
}

function getUnlockTimeMs(unlockTimeMinStr) {
  const unlockTimeMs = Math.floor(Number(unlockTimeMinStr) * 60000);
  if (isFinite(unlockTimeMs) && unlockTimeMs > 0) return unlockTimeMs;
  else {
    console.warn(`getUnlockTimeMs: invalid input: ${unlockTimeMinStr}`);
    return NaN;
  }
}