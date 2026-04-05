const MENU_ID = "FAHHH-this-element";

const MENU_TITLES = [
  "FAHHH this element (it's gone)",
  "FAHHH this element — RIP",
  "FAHHH: remove one (1) problem",
  "Yeet this element (FAHHH)",
  "This element: cancelled (FAHHH)",
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: MENU_TITLES[Math.floor(Math.random() * MENU_TITLES.length)],
      contexts: ["all"]
    });
  });

  chrome.storage.local.get(["FAHHHIntensity"], (data) => {
    if (typeof data.FAHHHIntensity !== "number") {
      chrome.storage.local.set({ FAHHHIntensity: 6 });
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId !== MENU_ID) return;

  chrome.tabs.sendMessage(tab.id, {
    type: "FAHHH_TARGET_LAST_RIGHT_CLICKED"
  }).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_FAHHH_SETTINGS") {
    chrome.storage.local.get(["FAHHHIntensity"], (data) => {
      sendResponse({
        intensity: typeof data.FAHHHIntensity === "number" ? data.FAHHHIntensity : 6
      });
    });
    return true;
  }

  if (msg.type === "SET_FAHHH_INTENSITY") {
    chrome.storage.local.set({ FAHHHIntensity: msg.intensity }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});