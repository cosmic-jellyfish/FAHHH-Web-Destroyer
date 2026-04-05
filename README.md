<p align="center">
  <img src="fahh-logo.png" alt="FAHHH!" width="480" />
</p>

# Faahh Boom

**Faahh Boom** is a Chrome extension for when a page deserves a little… *dramatic restructuring*. Trigger a full-page FAAHH (sound, shake, and flying debris), or remove a single element via the right-click menu.

**Chrome Web Store:** _[listing URL when live]_

---

## Targeted removal (right-click)

Right-click almost anything on a page and choose the FAAHH context-menu action to remove **that element only** — no need to nuke the whole tab.

<p align="center">
  <img src="fahhh.gif" alt="Demo: right-click menu — FAAHH this element" width="720" />
</p>

Menu labels rotate for variety (for example: *“FAAHH this element (it's gone)”*).

---

## Full-page FAAHH

Open the extension popup from the toolbar, set the **chaos coefficient**, and hit **FAAHH THE PAGE** for the full experience: FAAHH sound, screen quake, and chunks of the page yeeted until reload (use responsibly).

---

## Install from source

1. Clone or download this repository.
2. Open Chrome → **Extensions** → enable **Developer mode**.
3. Click **Load unpacked** and select this folder (the one containing `manifest.json`).

---

## Permissions (summary)

Declared in `manifest.json`: **activeTab** (toolbar popup talks to the current tab), **storage** (saves your chaos slider locally), **contextMenus** (right-click entry). Content scripts use `<all_urls>` so effects can run on sites you use — there is no separate `host_permissions` or `scripting` permission; nothing is sent to a server.

---

## Version

Current version in `manifest.json`: **2.1.0**.
