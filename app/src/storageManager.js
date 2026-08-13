// TODO: write generalized updateNumberField, updateArrayField functions if there are too many functions
// TODO: keep function behavior consistant (add/remove or update)

const storageWriteFunctions = {
  "addCredits": addCredits,
  "subtractCredits": subtractCredits,
  "syncStudiedToday": syncStudiedToday,
  "updateDecks": updateDecks,
  "unlockWebsite": unlockWebsite,
  "removeUnlockedWebsite": removeUnlockedWebsite
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message?.type !== "storageWrite") return;
  if (!message || !(typeof message.function === "string" || message.function instanceof String)) { 
    console.warn("storageWrite: incorrect message specification.");  
    return;
  }
  if (!(message.function in storageWriteFunctions)) {
    console.warn(`storageWrite: ${message.function} is not a predefined function.`);
    return;
  }

  storageWriteFunctions[message.function](message.value)
  .then((result) => {sendResponse(result)})
  .catch((err) => {
    console.error(`storageWrite: ${message.function} failed.`, err);
    sendResponse(null);
  });

  return true;
})

async function addCredits(value) {
  if (!validationUtils.isValidNumber(value) || value < 0) {
    console.warn(`addCredits: invalid input: ${value}`);
    return false;
  }

  const {credits = 0} = await browser.storage.local.get("credits");
  const updated = credits + value;
  await browser.storage.local.set({"credits": updated});
  return true;
}

async function subtractCredits(value) {
  if (!validationUtils.isValidNumber(value) || value < 0) {
    console.warn(`subtractCredits: invalid input: ${value}`);
    return false;
  }

  const {credits = 0} = await browser.storage.local.get("credits");

  const updated = credits - value;
  if (updated < 0) {
    console.warn("subtractCredits: tried to subtract more than current amount.");
    return false;
  }

  await browser.storage.local.set({"credits": updated});
  return true;
}

async function syncStudiedToday(value) {
  if (!validationUtils.isValidNumber(value) || value < 0) {
    console.warn(`syncStudiedToday: invalid input: ${value}`);
    return false;
  }

  const lastSyncedTimestamp = Date.now();

  await browser.storage.local.set({"lastSyncedStudiedToday": value,
                                   "lastSyncedTimestamp": lastSyncedTimestamp});
  return true;
}

async function updateDecks(decks) {
  if (!validationUtils.isValidArray(decks)) {
    console.warn(`updateDecks: invalid input: ${decks}`);
    return false;
  }

  await browser.storage.local.set({"decks": decks});
  return true;
}

async function unlockWebsite(website) {
  if (!validationUtils.isValidString(website) || website.length === 0) {
    console.warn(`unlockWebsite: invalid input: ${website}`);
    return false;
  }

  let {unlockedWebsites: unlocked = {}} = await browser.storage.local.get("unlockedWebsites");
  if (website in unlocked) console.warn(`unlockWebsite: website '${website}' already unlocked.`)

  unlocked[website] = Date.now();
  await browser.storage.local.set({"unlockedWebsites": unlocked});
  
  return true;
}

async function removeUnlockedWebsite(website) {
  if (!validationUtils.isValidString(website) || website.length === 0) {
    console.warn(`removeUnlockedWebsite: invalid input: ${website}`);
    return false;
  }

  let {unlockedWebsites: unlocked = {}} = await browser.storage.local.get("unlockedWebsites");
  if (!(website in unlocked)) {
    console.warn(`removeUnlockedWebsite: function callen on a website that is not unlocked: ${website}`);
    return false;
  }

  delete unlocked[website];
  await browser.storage.local.set({"unlockedWebsites": unlocked});

  return true;
}

