async function setupStorageValues() {
  const {decks} = await browser.storage.local.get("decks");
  if (!decks) {   // indicates that storage values have not yet been set.
    await browser.storage.local.set({
      "decks": ["Japanese", "System design"],
      "lockedWebsites" : ["youtube.com", "old.reddit.com", "instagram.com", "facebook.com", "google.com"],
      "credits": 100,
      "unlockPrice": 20,
      "unlockTimeMs": 6000000
    });
    console.info("debugContentScript: storage values have been set up.");
  };
}

setupStorageValues();
