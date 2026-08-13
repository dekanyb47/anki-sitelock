async function setupStorageValues() {
  const {decks} = await browser.storage.local.get("decks");
  if (!decks) {   // indicates that storage values have not yet been set.
    await browser.storage.local.set({
      "decks": ["Japanese", "System design"],
      "lockedWebsites" : ["registrations.start-discover.eu", "youtube.com", "old.reddit.com"],
      "credits": 0,
      "unlockPrice": 20,
      "unlockTimeMs": 3600000
    });
    console.info("debugContentScript: storage values have been set up.");
  };
}

setupStorageValues();