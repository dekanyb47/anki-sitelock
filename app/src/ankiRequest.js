
const ANKICONNECT_URL = "http://127.0.0.1:8765";
const ANKICONNECT_VERSION = 5;

const PING_TIMEOUT = 200;
const REQUEST_TIMEOUT = 10000;

const ankiRequestFunctions = {
  "pingAnkiConnect": pingAnkiConnect,
  "getCardsStudiedToday": getCardsStudiedToday
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "ankiRequest") return;
  if (!message || !(typeof message.function === "string" || message.function instanceof String)) { 
    console.warn("ankiRequest: incorrect message specification.");
    return;
  }
  if (!(message.function in ankiRequestFunctions)) {
    console.warn(`ankiRequest: ${message.function} is not a predefined function.`);
    return;
  }

  ankiRequestFunctions[message.function](message.value)
    .then((result) => sendResponse(result))
    .catch((err) => {
      console.error(`ankiRequest: ${message.function} failed`, err);
      sendResponse(null);
    });

  return true;
});


async function getCardsStudiedToday(decks) {
  return await ankiFindAllCards(decks, "rated:1");
}


// Sends a "multi" action request to ankiconnect, and gets all cards matching with uniqueQueryTerm in decks
async function ankiFindAllCards(decks, uniqueQueryTerm) {
  if (!Array.isArray(decks) || decks.length === 0) {
    console.warn("ankiFindAllCards: Input has to be a non-empty array.");
    return null;
  }

  let requestParams = {
      "actions": []
    }
 
  // resolve case where a child deck's studied count is summed multiple times, because a parent's/grandparent's sum included them

  // sort decks, so that parents are evaluated before their children
  decks = decks.sort(
    (a, b) => (a.split("::").length - 
                b.split("::").length)
  )

  for(let i = 0; i < decks.length; i++) {
    let alreadyIncluded = false;
    let deckFamily = decks[i].split("::");

    // checks each parent if they are included in input array decks or not
    for (let j = deckFamily.length - 1; j > 0; j--) {   // -1 because we don't check the current element itself
      if (decks.includes(deckFamily.slice(0, j).join("::"))) alreadyIncluded = true;
    }

    if (alreadyIncluded) continue;

    requestParams.actions.push({"action": "findCards",
                                "params": {"query": `deck:"${decks[i]}" `.concat(uniqueQueryTerm)}
    });
  }

  let result = await invokeAnkiConnect(
    "multi",
    ANKICONNECT_VERSION,
    requestParams
  );
  if (!result) return null;

  let totalCount = 0;
  for (let i = 0; i < result.length; i++) {
    totalCount += result[i].length;
  }

  return totalCount;
}

async function pingAnkiConnect() {
  try {
    const response = await fetch(ANKICONNECT_URL, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"action": "version", "version": ANKICONNECT_VERSION}),
      signal: AbortSignal.timeout(PING_TIMEOUT)
    });

    if (!response.ok) {
      console.warn('AnkiConnect error status:', response.status);
      return null;
    }

    const result = await response.json();
    if (result.error) {
      console.warn(`AnkiConnect error:`, result.error);
      return;
    }

    return result.result;
  }
  catch(err) {
    console.warn("Could not reach ankiconnect (Anki may not be open, or ankiconnect might not be downloaded)");
    return null;
  }
}


async function invokeAnkiConnect(action, version, params) {
  try {
    const response = await fetch(ANKICONNECT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({action, version, params}),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })

    if (!response.ok) {
      console.warn('AnkiConnect error status:', response.status);
      return null;
    }
    const result = await response.json();

    if (result.error) {
      console.warn(`AnkiConnect error: ${response.error}`);
      return null;
    }
    return result.result;
  }
  catch (err) {
    console.warn("Could not reach ankiconnect (Anki may not be open, or ankiconnect might not be downloaded)");
    return null;
  }
}
