# FAHHH Boom

**FAHHH Boom** is a Chrome extension for when a page deserves a little… *dramatic restructuring*. Remove what you choose: use the **right-click** context menu on one element, or **Pick on page** from the toolbar popup to select targets and FAHHH them with sound, flash, and flying debris (until reload).

**Chrome Web Store:** https://chromewebstore.google.com/detail/fahhh-boom/mpmhcnaphidffpmjghicnijeghnamhil

---

## Targeted removal (right-click)

Right-click almost anything on a page and choose the FAHHH context-menu action to remove **that element only** — no need to nuke the whole tab.

<p align="center">
  <img src="fahhh.gif" alt="Demo: right-click menu — FAHHH this element" width="720" />
</p>

Incase you want an audio demo?
<p align="center">
  
https://github.com/user-attachments/assets/8e3fb148-7ae2-43cd-b4a2-d4c308ed9176
</p>

Menu labels rotate for variety (for example: *“FAHHH this element (it's gone)”*).

---

## Pick on page (toolbar popup)
<p align="center">
  <img src="elementpicker.gif" alt="Demo: Click the extension - Pick Element" width="720" />
</p>
Open the popup and choose **Pick on page…**. The tab gets a crosshair: click elements to toggle them in the selection, then **Enter** to FAHHH those nodes (or **Esc** to cancel).

---

## Install from source

1. Clone or download this repository.
2. Open Chrome → **Extensions** → enable **Developer mode**.
3. Click **Load unpacked** and select this folder (the one containing `manifest.json`).

---

## Permissions (summary)

Declared in `manifest.json`: **activeTab** (toolbar popup talks to the current tab), **contextMenus** (right-click entry). Content scripts use `<all_urls>` so effects can run on sites you use — there is no separate `host_permissions` or `scripting` permission; nothing is sent to a server.

---

## Version

Current version in `manifest.json`: **2.4.0**.
