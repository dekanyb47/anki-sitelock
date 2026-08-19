// TODO: config page can't be accessed when there are no websites to lock

const settingsForm = document.getElementById("settingsForm");

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const decksStr = document.getElementById("decksInput").value;
  const websitesStr = document.getElementById("websitesInput").value;
  const unlockPriceStr = document.getElementById("unlockPriceInput").value;
  const unlockTimeStr = document.getElementById("unlockTimeInput").value;

  const reloadWebsite = [decksStr, websitesStr, unlockPriceStr, unlockTimeStr].some(
    (value) => {value !== ""}
  );

  if (decksStr !== "") {
    const decks = decksStr.split(" ");    
    const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateDecks", "value": decks});
    if (success) console.log("successfully updated decks");
  }

  if (websitesStr !== "") {
    // TODO: URLUtils can't be accessed from this file
    // TODO: strip everything from hostname before updating (reuse getURLHostname function)
    console.log(URLUtils);
    const websites = websitesStr.split(" ");
    console.log(websites);
    const websiteHostnames = websites.map((website) => URLUtils.getURLHostname(website));
    console.log(websiteHostnames);
    // // console.log(URLUtils.getURLHostname(websites[0]));
    // console.log(validationUtils.isValidString(websites[0]));
    // console.log(URLUtils);
    const success = await browser.runtime.sendMessage({"type": "storageWrite", "function": "updateLockedWebsites", "value": websites});
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

  if (reloadWebsite) {
    window.location.reload();
  }
});
