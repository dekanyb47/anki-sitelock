async function setupStorageValues() {
  const {decks} = await browser.storage.local.get("decks");
  if (!decks) {   // indicates that storage values have not yet been set.
    await browser.storage.local.set({
      "decks": ["Japanese", "System design"],
      "lockedWebsites" : ["registrations.start-discover.eu", "youtube.com", "old.reddit.com", "instagram.com", "facebook.com", "google.com"],
      "credits": 100,
      "unlockPrice": 20,
      "unlockTimeMs": 6000000
    });
    console.info("debugContentScript: storage values have been set up.");
  };

  // const {decks = []} = await browser.storage.local.get("decks");
  // console.log(`decks: ${decks}`);

  // const studiedToday = await browser.runtime.sendMessage({"type": "getCardsStudiedToday",
  //                                                         "decks": decks})
  // if (studiedToday === null) {
  //   console.log("testContentScript: Could not reach AnkiConnect (may not be open)");
  //   return null;
  // }

  // console.log(`cards studied today: ${studiedToday}`);

  // const {lastSyncedTimestamp = 0} = await browser.storage.local.get("lastSyncedTimestamp");
  // console.log(`last synced: ${lastSyncedTimestamp}`);

  // const {lastSyncedStudiedToday = 0} = await browser.storage.local.get("lastSyncedStudiedToday");
  // console.log(`cards studied today (as of last sync): ${lastSyncedStudiedToday}`);

  // const {credits = 0} = await browser.storage.local.get("credits");
  // console.log(`current credits: ${credits}`);
}

setupStorageValues();