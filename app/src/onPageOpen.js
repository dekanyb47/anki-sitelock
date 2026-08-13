
const lockPageURL = browser.runtime.getURL("app/src/lockPage/lockUi.html");

// runs a timestamp comparison, removes url from unlockedWebsites if needed.
// returns true if url is unlocked, false if it isn't
async function updateUnlockedStatus(URLHostname, unlockedWebsites, unlockTimeMs) {
  if (!(URLHostname in unlockedWebsites)) return false;
  
  if (unlockedWebsites[URLHostname] + unlockTimeMs < Date.now()) {
    await removeUnlockedWebsite(URLHostname);
    return false;
  }
  return true;
}

async function isUnlockedUrl(URLHostname) {
  const {unlockedWebsites = {}, unlockTimeMs: unlockTime} = await browser.storage.local.get(["unlockedWebsites", "unlockTimeMs"]);
  if (!validationUtils.isValidNumber(unlockTime) || unlockTime <= 0) {
    console.error(`invalid value in storage for unlockTimeMs: ${unlockTime}`);
    return null;
  }

  const unlocked = await updateUnlockedStatus(URLHostname, unlockedWebsites, unlockTime);

  // const {unlockedWebsites: newUnlockedWebsites = {}} = await browser.storage.local.get("unlockedWebsites");
  // console.log("unlocked websites:");
  // console.log(newUnlockedWebsites);

  return unlocked;
}

async function inLockedWebsites(URLHostname) {
  if (URLHostname.startsWith(lockPageURL)) return false;

  const {lockedWebsites = []} = await browser.storage.local.get("lockedWebsites")

  if (lockedWebsites.includes(URLHostname)) return true;
  return false;
}

// TODO: redirects invoked from a page do not seem to activate the lock (for example, youtube does this)
browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  // console.log(details.url);
  // console.log(details.frameId);

  const targetURL = details.url;
  const hostname = URLUtils.getURLHostname(targetURL);

  if (!await inLockedWebsites(hostname)) return;
  if (await isUnlockedUrl(hostname)) return;

  const redirectURL = `${lockPageURL}?target=${encodeURIComponent(targetURL)}`;

  browser.tabs.update(details.tabId, {url: redirectURL});
});
