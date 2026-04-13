async function getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  const TAGLINES = [
    "The polite page destructor.",
    "HR-approved catharsis.",
    "Like Ctrl+A Delete, but with vibes.",
    "Your tabs were already judging you.",
    "Finally, a use for the internet.",
    "As seen on absolutely no roadmap.",
    "Cheaper than therapy. Louder, too.",
    "Works best on emails you already sent.",
    "May void your warranty, friendship, or both.",
    "The meeting could have been this extension.",
    "Your scroll position will never forgive you.",
    "SEO experts hate this one trick.",
    "Rated E for Excessive.",
    "Not a bug. It's a lifestyle.",
    "Minimalism, but loud.",
  ];

  const BUTTON_LABELS = [
    "FAHHH THE PAGE",
    "UNLEASH FAHHH",
    "EVERYTHING MUST GO",
    "YES, ALL OF IT",
    "COMMIT TO THE BIT",
    "SEND IT",
    "DO THE THING",
    "BIG RED BUTTON ENERGY",
    "OKAY FINE",
    "LET'S GO",
    "ABSOLUTELY NOT CALM",
    "OPEN THE FLOODGATES",
    "FOR SCIENCE",
  ];

  const pageBoom = document.getElementById("pageBoom");
  const taglineEl = document.getElementById("tagline");

  if (taglineEl) {
    taglineEl.textContent =
      TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  }
  pageBoom.textContent =
    BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)];

  pageBoom.addEventListener("click", async () => {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
  
    chrome.tabs.sendMessage(tab.id, {
      type: "FAHHH_PAGE"
    }).catch(() => {});
  
    window.close();
  });

  const pickElements = document.getElementById("pickElements");
  if (pickElements) {
    pickElements.addEventListener("click", async () => {
      const tab = await getCurrentTab();
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, { type: "START_ELEMENT_PICKER" }).catch(() => {});

      window.close();
    });
  }