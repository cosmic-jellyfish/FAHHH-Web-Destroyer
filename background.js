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
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId !== MENU_ID) return;

  chrome.tabs.sendMessage(tab.id, {
    type: "FAHHH_TARGET_LAST_RIGHT_CLICKED"
  }).catch(() => {});
});
