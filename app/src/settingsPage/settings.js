// TODO: config page can't be accessed when there are no websites to lock
// TODO: clean up this and lockPage.js
// TODO: move constants, think about website script file structure (modules or not)

// add values in storage to input fields
const FILL_INPUT_TIMEOUT = 100; 

const settingsForm = document.getElementById("settingsForm");

const decksInput = document.getElementById("decksInput");
const websitesInput = document.getElementById("websitesInput");
const unlockPriceInput = document.getElementById("unlockPriceInput");
const unlockTimeInput = document.getElementById("unlockTimeInput");


async function fillInputValues() {
  const {decks, lockedWebsites, unlockPrice, unlockTimeMs: unlockTime} = await browser.storage.local.get(["decks", "lockedWebsites", "unlockPrice", "unlockTimeMs"]);

  let decksStr = "";
  if (validationUtils.isValidArray(decks) && decks.length !== 0) decksStr = decks.join(';');
  else console.warn(`fillInputValues: incorrect value in storage for decks: ${decks}`);

  let lockedWebsitesStr = "";
  if (validationUtils.isValidArray(lockedWebsites) && lockedWebsites.length !== 0) lockedWebsitesStr = lockedWebsites.join(';');
  else console.warn(`fillInputValues: incorrect value in storage for lockedWebsites: ${lockedWebsites}`);

  if (!validationUtils.isValidNumber(unlockPrice)) console.warn(`fillInputValues: incorrect value in storage for unlockPrice: ${unlockPrice}`);
  if (!validationUtils.isValidNumber(unlockTime)) console.warn(`fillInputValues: incorrect value in storage for unlockTime: ${unlockTime}`);

  decksInput.value = decksStr;
  websitesInput.value = lockedWebsitesStr;
  unlockPriceInput.value = unlockPrice;
  unlockTimeInput.value = unlockTime;
}

// TODO: set timeout
fillInputValues();

// TODO: redirect maybe?
// TODO: strip whitespace
// TODO: remove console.log
// TODO: validate?
settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const decksStr = decksInput.value;
  const websitesStr = websitesInput.value;
  const unlockPriceStr = unlockPriceInput.value;
  const unlockTimeStr = unlockTimeInput.value;

  if (decksStr !== "") {
    const decks = decksStr.split(";");    
    const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateDecks", "value": decks});
    if (success) console.log("successfully updated decks");
  }

  if (websitesStr !== "") {
    const websites = websitesStr.split(";");
    let websiteHostnames = [];
    for (let i = 0; i < websites.length; i++) {
      if (websites[i] !== "") {
        websiteHostnames.push(URLUtils.getURLHostname(websites[i]));
      }
    }
    const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateLockedWebsites", "value": websiteHostnames});
    if (success) console.log("successfully updated locked websites!")
  }

  if (unlockPriceStr !== "") {
    const unlockPrice = Number(unlockPriceStr);
    if (isFinite(unlockPrice)) {
      const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateUnlockPrice", "value": unlockPrice});
      if (success) console.log("successfully updated unlockPrice!");
    }
    else console.warn(`settingsForm listener: invalid input: ${unlockPrice}`);
  }

  if (unlockTimeStr !== "") {
    const unlockTime = Number(unlockTimeStr);
    if (isFinite(unlockTime)) {
      const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateUnlockTime", "value": unlockTime});
      if (success) console.log("successfully updated unlockTime!");
    }
    else console.warn(`settingsForm listener: invalid input: ${unlockPrice}`);
  }
});
