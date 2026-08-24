const settingsPageURL = browser.runtime.getURL("/app/src/settingsPage/settings.html");
document.getElementById("settingsButton").addEventListener("click", () => {
  window.open(settingsPageURL);
})

const infoPageURL = browser.runtime.getURL("/app/src/infoPage/infoPage.html");
document.getElementById("infoButton").addEventListener("click", () => {
  window.open(infoPageURL);
})

async function updateCreditsField() {
  const creditBalanceField = document.getElementById("creditBalance");

  const {credits: creditBalance} = await browser.storage.local.get("credits");
  if (!validationUtils.isValidNumber(creditBalance)) console.warn(`updateValuesFromStorage: Invalid value for credits in storage: ${creditBalance}`);

  creditBalanceField.innerText = `${creditBalance}`;
}

document.addEventListener("DOMContentLoaded", async (e) => {
  updateCreditsField();
});