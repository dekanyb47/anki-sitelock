// TODO: move constants
// Note: Studied count is synced to storage every time a page is locked. On top of that, there is this syncing process that happens periodically
const SYNC_INTERVAL = 600000

function isDifferentDay(timestamp1, timestamp2) {
  const d1 = new Date(timestamp1);
  const d2 = new Date(timestamp2);

  if (d1.getFullYear() == d2.getFullYear() &&
      d1.getMonth() == d2.getMonth() &&
      d1.getDate() == d2.getDate()) {
        return false;
      }
  return true;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "syncStudiedCount") return;
  syncStudiedCount()
    .then((result) => sendResponse(result))
    .catch((err) => {
      console.error("syncStudiedCount failed:", err);
      sendResponse(null);
    });
    
  return true;
});

async function syncStudiedCount() {
  // TODO: sync anki before requesting data (if studying was on a diffrent device)
  const {decks} = await browser.storage.local.get("decks");
  if (!validationUtils.isValidArray(decks) || decks.length === 0) {
    console.error(`invalid value in storage for decks: ${decks}`);
    return;
  };

  const {lastSyncedStudiedToday = 0} = await browser.storage.local.get("lastSyncedStudiedToday");
  const {lastSyncedTimestamp = 0} = await browser.storage.local.get("lastSyncedTimestamp");

  const studiedToday = await getCardsStudiedToday(decks);
  if (studiedToday === null) {
    return;
  }

  // TODO: cards studied after a sync and before midnight are lost
  const currentTimestamp = Date.now();
  if (isDifferentDay(currentTimestamp, lastSyncedTimestamp)) {
    if (currentTimestamp < lastSyncedTimestamp) {
      console.warning("syncStudiedCount: current timestamp is before the last sync's timestamp");
    }

    await syncStudiedToday(studiedToday);
    await addCredits(studiedToday);
  }
  else {
    if (studiedToday < lastSyncedStudiedToday) {
      console.error("syncStudiedCount: last synced studied count is smaller than current studied count (day didn't change)");
      return;
    }

    await syncStudiedToday(studiedToday);
    const newCredits = studiedToday - lastSyncedStudiedToday;
    await addCredits(newCredits);

  }

  console.log("syncStudiedCount: sync completed");
  return true;
}

// TODO: implement smart sync scheduling for optimization)
setInterval(syncStudiedCount, SYNC_INTERVAL);


