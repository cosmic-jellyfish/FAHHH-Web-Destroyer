const MENU_ID = "faahh-this-element";

const MENU_TITLES = [
  "FAAHH this element (it's gone)",
  "FAAHH this element — RIP",
  "FAAHH: remove one (1) problem",
  "Yeet this element (FAAHH)",
  "This element: cancelled (FAAHH)",
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: MENU_TITLES[Math.floor(Math.random() * MENU_TITLES.length)],
      contexts: ["all"]
    });
  });

  chrome.storage.local.get(["faahhIntensity"], (data) => {
    if (typeof data.faahhIntensity !== "number") {
      chrome.storage.local.set({ faahhIntensity: 6 });
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId !== MENU_ID) return;

  chrome.tabs.sendMessage(tab.id, {
    type: "FAAHH_TARGET_LAST_RIGHT_CLICKED"
  }).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_FAAHH_SETTINGS") {
    chrome.storage.local.get(["faahhIntensity"], (data) => {
      sendResponse({
        intensity: typeof data.faahhIntensity === "number" ? data.faahhIntensity : 6
      });
    });
    return true;
  }

  if (msg.type === "SET_FAAHH_INTENSITY") {
    chrome.storage.local.set({ faahhIntensity: msg.intensity }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});