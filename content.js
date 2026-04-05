(() => {
    let pageRunning = false;
    let lastRightClickedElement = null;
    let lastContextMenuPoint = null;
    let overlayCounter = 0;
    let lastFAHHHAt = 0;
    const FAHHH_DEBOUNCE_MS = 480;

    function tryBeginFAHHH() {
      const t = Date.now();
      if (t - lastFAHHHAt < FAHHH_DEBOUNCE_MS) return false;
      lastFAHHHAt = t;
      return true;
    }

    function applyFAHHHShake(intensity) {
      const host = document.body;
      if (!host) return;
      host.classList.add("FAHHH-shake");
      if (intensity >= 15) {
        host.classList.add("FAHHH-shake--wild");
      }
    }

    function clearFAHHHShake() {
      const a = document.body;
      const b = document.documentElement;
      if (a) {
        a.classList.remove("FAHHH-shake", "FAHHH-shake--wild");
      }
      if (b && b !== a) {
        b.classList.remove("FAHHH-shake", "FAHHH-shake--wild");
      }
    }
  
    document.addEventListener("contextmenu", (event) => {
      lastContextMenuPoint = {
        x: event.clientX,
        y: event.clientY
      };
      lastRightClickedElement = findBlastableForContextMenu(event);
    }, true);
  
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "FAHHH_PAGE") {
        FAHHHPage();
      }
  
      if (msg.type === "FAHHH_TARGET_LAST_RIGHT_CLICKED") {
        FAHHHSpecificElement(lastRightClickedElement);
      }
    });
  
    function getIntensity() {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "GET_FAHHH_SETTINGS" }, (resp) => {
          resolve(resp?.intensity ?? 6);
        });
      });
    }
  
    function getOverlayAnchorRect(el) {
      if (!el || !el.isConnected) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      return r;
    }

    function rectAroundPoint(px, py, w = 56, h = 56) {
      return {
        left: px - w / 2,
        top: py - h / 2,
        width: w,
        height: h,
        right: px + w / 2,
        bottom: py + h / 2
      };
    }

    function pointInViewportRect(px, py, r) {
      return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
    }

    // Context-menu runs can nudge scroll when we touch overflow/layout; put it back.
    function preserveScrollForContextMenuYeet() {
      const sx = window.scrollX;
      const sy = window.scrollY;
      const restore = () => {
        window.scrollTo({ left: sx, top: sy, behavior: "instant" });
      };
      requestAnimationFrame(restore);
      requestAnimationFrame(() => requestAnimationFrame(restore));
      setTimeout(restore, 0);
      setTimeout(restore, 16);
      setTimeout(restore, 50);
      setTimeout(restore, 120);
      setTimeout(restore, 400);
    }

    async function FAHHHPage() {
      if (pageRunning || !tryBeginFAHHH()) return;
      pageRunning = true;

      const intensity = await getIntensity();

      doGlobalEffects(intensity, null, false);

      const targets = getPageTargets(intensity);
      blastElements(targets, intensity);

      setTimeout(() => {
        clearFAHHHShake();
        document.documentElement.classList.remove("FAHHH-lock-x");
        pageRunning = false;
      }, 1800);
    }

    async function FAHHHSpecificElement(el) {
      if (!tryBeginFAHHH()) return;

      const intensity = await getIntensity();
      let overlayAnchor = getOverlayAnchorRect(el);
      if (!overlayAnchor && lastContextMenuPoint) {
        overlayAnchor = rectAroundPoint(lastContextMenuPoint.x, lastContextMenuPoint.y);
      }

      if (!el || !document.contains(el)) {
        const fallback = getPageTargets(1)[0];
        if (fallback && !overlayAnchor) {
          overlayAnchor = getOverlayAnchorRect(fallback);
        }
        doGlobalEffects(
          Math.max(3, Math.floor(intensity / 2)),
          overlayAnchor,
          true
        );
        if (fallback) blastElements([fallback], intensity, true);
      } else {
        doGlobalEffects(
          Math.max(3, Math.floor(intensity / 2)),
          overlayAnchor,
          true
        );
        blastElements([el], intensity, true);
      }

      setTimeout(() => {
        clearFAHHHShake();
        document.documentElement.classList.remove("FAHHH-lock-x");
      }, 1800);
    }

    function doGlobalEffects(intensity, overlayAnchorRect, fromContextMenu) {
      const jackpot = Math.random() < 0.06;
      playSound(jackpot, fromContextMenu);
      showOverlay(overlayAnchorRect);
      spawnFlash(overlayAnchorRect, fromContextMenu);
      spawnRipples(jackpot ? 5 : 3, overlayAnchorRect, fromContextMenu);
      const baseParticles = Math.max(16, intensity * 8);
      spawnParticles(
        jackpot ? Math.floor(baseParticles * 1.35) : baseParticles,
        overlayAnchorRect,
        fromContextMenu
      );

      if (!fromContextMenu) {
        document.documentElement.classList.add("FAHHH-lock-x");
        applyFAHHHShake(intensity);
      }
      if (fromContextMenu) {
        preserveScrollForContextMenuYeet();
      }
    }
  
    function playSound(jackpot, fromContextMenu) {
      try {
        const audio = new Audio(chrome.runtime.getURL("FAHHH.mp3"));
        audio.volume = jackpot ? 1 : 0.95;
        audio.playbackRate = rand(88, 112) / 100;
        audio.play().catch(() => {});
        if (jackpot && !fromContextMenu) {
          setTimeout(() => {
            try {
              const echo = new Audio(chrome.runtime.getURL("FAHHH.mp3"));
              echo.volume = 0.35;
              echo.playbackRate = rand(92, 108) / 100;
              echo.play().catch(() => {});
            } catch (_) {}
          }, 110);
        }
      } catch (e) {
        console.warn("Audio failed", e);
      }
    }
  
    function showOverlay(anchorRect) {
      overlayCounter += 1;
      const overlay = document.createElement("div");
      overlay.className = "FAHHH-overlay";
      overlay.textContent = "FAHHH";
      overlay.style.setProperty("--FAHHH-overlay-rot", `${rand(-12, 12)}deg`);

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let leftPx;
      let topPx;
      if (anchorRect) {
        const cx = anchorRect.left + anchorRect.width / 2;
        const cy = anchorRect.top + anchorRect.height * 0.3;
        leftPx = Math.max(vw * 0.06, Math.min(vw * 0.94, cx));
        topPx = Math.max(vh * 0.05, Math.min(vh * 0.88, cy));
      } else {
        leftPx = rand(Math.floor(vw * 0.08), Math.floor(vw * 0.92));
        topPx = rand(Math.floor(vh * 0.08), Math.floor(vh * 0.82));
      }
      overlay.style.setProperty("--FAHHH-anchor-x", `${leftPx}px`);
      overlay.style.setProperty("--FAHHH-anchor-y", `${topPx}px`);

      overlay.dataset.FAHHHOverlayId = String(overlayCounter);

      document.documentElement.appendChild(overlay);
      setTimeout(() => overlay.remove(), 1200);
    }
  
    function getPageTargets(intensity) {
      const desired = Math.min(60, Math.max(1, intensity * 3));
  
      const all = [...document.querySelectorAll(
        "img, video, picture, button, a, p, h1, h2, h3, h4, li, article, section, div, span, aside, nav"
      )];
  
      return all
        .filter((el) => isBlastableElement(el))
        .sort(scoreTargets)
        .slice(0, desired);
    }
  
    function scoreTargets(a, b) {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const as = ar.width * ar.height;
      const bs = br.width * br.height;
  
      if (Math.random() > 0.65) return Math.random() - 0.5;
      return bs - as;
    }
  
    function isBlastableElement(el, opts = {}) {
      const forContextMenu = Boolean(opts.forContextMenu);
      if (!el || !el.isConnected) return false;
      if (el === document.body || el === document.documentElement) return false;
      if (
        el.closest(
          ".FAHHH-overlay, .FAHHH-flash, .FAHHH-particle, .FAHHH-ripple, .FAHHH-ghost"
        )
      ) {
        return false;
      }
      if (el.dataset.FAHHHDestroyed === "1") return false;

      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const viewportArea = vw * vh;

      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;

      if (style.position === "fixed") {
        if (!forContextMenu) return false;
        const area = rect.width * rect.height;
        if (area >= viewportArea * 0.82) return false;
      }

      const minW = forContextMenu ? 16 : 35;
      const minH = forContextMenu ? 10 : 18;
      if (rect.width < minW || rect.height < minH) return false;
      if (rect.bottom < 0 || rect.right < 0 || rect.top > vh || rect.left > vw) return false;

      return true;
    }

    // Deepest element under the cursor (shadow-aware), excluding near-fullscreen nodes.
    function findBlastableForContextMenu(event) {
      const px = event.clientX;
      const py = event.clientY;

      let chain = [];
      if (typeof event.composedPath === "function") {
        const path = event.composedPath();
        chain = path.filter(
          (n) =>
            n &&
            n.nodeType === Node.ELEMENT_NODE &&
            n !== document.documentElement &&
            n !== document.body
        );
      }

      let topAtPoint = null;
      try {
        topAtPoint = document.elementFromPoint(px, py);
      } catch (_) {}
      if (topAtPoint) {
        if (topAtPoint.nodeType === Node.TEXT_NODE) {
          topAtPoint = topAtPoint.parentElement;
        }
        if (topAtPoint && topAtPoint.nodeType === Node.ELEMENT_NODE) {
          const prefix = [];
          let el = topAtPoint;
          while (el && el !== document.body && el !== document.documentElement) {
            prefix.push(el);
            el = el.parentElement;
          }
          // Walk from elementFromPoint first so innermost wins; don't seed `seen` from composedPath alone.
          const merged = [];
          const seen = new Set();
          for (const e of prefix) {
            if (e && !seen.has(e)) {
              seen.add(e);
              merged.push(e);
            }
          }
          for (const e of chain) {
            if (e && !seen.has(e)) {
              seen.add(e);
              merged.push(e);
            }
          }
          chain = merged;
        }
      } else if (chain.length === 0) {
        const rawTarget = event.target;
        const startEl =
          rawTarget && rawTarget.nodeType === Node.ELEMENT_NODE
            ? rawTarget
            : rawTarget && rawTarget.parentElement
              ? rawTarget.parentElement
              : null;
        if (startEl) {
          let el = startEl;
          while (el && el !== document.body) {
            chain.push(el);
            el = el.parentElement;
          }
        }
      }

      const opts = { forContextMenu: true };
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const viewportArea = vw * vh;
      const maxArea = viewportArea * 0.72;

      const blastable = [];
      for (const el of chain) {
        if (!isBlastableElement(el, opts)) continue;
        const r = el.getBoundingClientRect();
        const area = r.width * r.height;
        blastable.push({
          el,
          area,
          rect: r,
          contains: pointInViewportRect(px, py, r)
        });
      }

      if (blastable.length === 0) return null;

      for (const row of blastable) {
        if (row.contains && row.area <= maxArea) return row.el;
      }

      const containing = blastable.filter((b) => b.contains);
      if (containing.length) {
        containing.sort((a, b) => a.area - b.area);
        return containing[0].el;
      }

      for (const row of blastable) {
        if (row.area <= maxArea) return row.el;
      }

      blastable.sort((a, b) => a.area - b.area);
      return blastable[0].el;
    }
  
    function blastElements(targets, intensity, focused = false) {
      targets.forEach((el, i) => {
        if (!el || !el.isConnected) return;
        if (el.dataset.FAHHHDestroyed === "1") return;
  
        const rect = el.getBoundingClientRect();
  
        const clone = el.cloneNode(true);
        clone.classList.add("FAHHH-ghost");
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.left = `${rect.left + window.scrollX}px`;
        clone.style.top = `${rect.top + window.scrollY}px`;
        clone.style.setProperty("--FAHHH-x", `${rand(-700, 700)}px`);
        clone.style.setProperty("--FAHHH-y", `${rand(-500, -80)}px`);
        clone.style.setProperty("--FAHHH-rot", `${rand(-80, 80)}deg`);
        clone.style.setProperty("--FAHHH-delay", `${i * 35}ms`);
  
        document.body.appendChild(clone);
  
        destroyElement(el, focused ? 0 : 120 + i * 30, intensity);
        spawnImpactAt(rect, Math.max(6, Math.floor(intensity * 1.5)));
  
        setTimeout(() => clone.remove(), 1800);
      });
    }
  
    function destroyElement(el, delay, intensity) {
      setTimeout(() => {
        if (!el.isConnected) return;
  
        el.dataset.FAHHHDestroyed = "1";
        el.classList.add("FAHHH-destroyed");
  
        const parent = el.parentElement;
        if (!parent) return;
  
        // Collapse in place (smoother than removeChild); gone until reload.
        el.style.setProperty("transition", "all 220ms ease-out", "important");
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("transform", `scale(0.2) rotate(${rand(-12, 12)}deg)`, "important");
        el.style.setProperty("filter", "blur(5px)", "important");
        el.style.setProperty("pointer-events", "none", "important");
        el.style.setProperty("overflow", "hidden", "important");
  
        setTimeout(() => {
          if (!el.isConnected) return;
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("width", "0px", "important");
          el.style.setProperty("height", "0px", "important");
          el.style.setProperty("min-width", "0px", "important");
          el.style.setProperty("min-height", "0px", "important");
          el.style.setProperty("margin", "0", "important");
          el.style.setProperty("padding", "0", "important");
          el.style.setProperty("border", "0", "important");
        }, 220 + Math.min(300, intensity * 10));
      }, delay);
    }
  
    function spawnImpactAt(rect, count) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
  
      const bits = [
        "💥",
        "🔥",
        "✨",
        "💨",
        "🧨",
        "⭐",
        "🦆",
        "🍕",
        "🤡",
        "💀",
        "🎺",
        "🧀",
        "🎉",
        "👀",
        "🗿",
        "🥴",
        "🐔",
        "📎",
        "🍌",
        "🥔",
        "🧃",
        "🪿",
        "🦞",
        "🫠",
        "🤠",
        "🧅",
        "🎪",
        "👻",
        "🦴",
        "⚡",
        "🌭",
        "💣",
        "🪤",
        "🫎",
        "🦖",
        "🐸",
        "🍉",
        "🧊",
        "🎲",
        "🧻",
        "📉",
        "🚧",
      ];
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "FAHHH-particle";
        if (Math.random() < 0.12) {
          p.classList.add("FAHHH-particle--lg");
        }
        p.textContent = bits[Math.floor(Math.random() * bits.length)];
        p.style.left = `${cx + rand(-20, 20)}px`;
        p.style.top = `${cy + rand(-20, 20)}px`;
        p.style.setProperty("--dx", `${rand(-260, 260)}px`);
        p.style.setProperty("--dy", `${rand(-260, 120)}px`);
        p.style.setProperty("--dr", `${rand(-280, 280)}deg`);
        p.style.animationDuration = `${rand(800, 1500)}ms`;
        document.documentElement.appendChild(p);
        setTimeout(() => p.remove(), 1700);
      }
    }
  
    function spawnFlash(anchorRect, fromContextMenu) {
      const flash = document.createElement("div");
      flash.className = "FAHHH-flash";
      const hue = rand(0, 360);
      const hue2 = (hue + rand(35, 95)) % 360;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let cx;
      let cy;
      if (fromContextMenu && anchorRect && vw > 0 && vh > 0) {
        const ax = anchorRect.left + anchorRect.width / 2;
        const ay = anchorRect.top + anchorRect.height / 2;
        cx = Math.max(8, Math.min(92, (ax / vw) * 100 + rand(-6, 6)));
        cy = Math.max(8, Math.min(92, (ay / vh) * 100 + rand(-6, 6)));
      } else {
        cx = rand(25, 75);
        cy = rand(25, 75);
      }
      flash.style.background = [
        "radial-gradient(circle at " +
          cx +
          "% " +
          cy +
          "%, rgba(255,255,255,0.94) 0%, hsla(" +
          hue +
          ",100%,72%,0.55) 18%, hsla(" +
          hue2 +
          ",95%,52%,0.28) 40%, transparent 72%)",
        "radial-gradient(ellipse at " +
          (100 - cx) +
          "% " +
          (100 - cy) +
          "%, hsla(" +
          hue2 +
          ",90%,60%,0.35) 0%, transparent 55%)",
      ].join(",");
      document.documentElement.appendChild(flash);
      setTimeout(() => flash.remove(), 450);
    }

    function spawnRipples(count, anchorRect, fromContextMenu) {
      const n = Math.max(2, Math.min(6, count));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let baseLeftPct = 50;
      let baseTopPct = 50;
      if (fromContextMenu && anchorRect && vw > 0 && vh > 0) {
        const ax = anchorRect.left + anchorRect.width / 2;
        const ay = anchorRect.top + anchorRect.height / 2;
        baseLeftPct = (ax / vw) * 100;
        baseTopPct = (ay / vh) * 100;
      }
      for (let i = 0; i < n; i++) {
        const ring = document.createElement("div");
        ring.className = "FAHHH-ripple";
        ring.style.left = `${Math.max(4, Math.min(96, baseLeftPct + rand(-8, 8)))}%`;
        ring.style.top = `${Math.max(4, Math.min(96, baseTopPct + rand(-8, 8)))}%`;
        ring.style.animationDelay = `${i * 90}ms`;
        ring.style.setProperty("--FAHHH-ring-hue", String(rand(0, 360)));
        document.documentElement.appendChild(ring);
        setTimeout(() => ring.remove(), 1100);
      }
    }
  
    function spawnParticles(count, anchorRect, fromContextMenu) {
      const emojis = [
        "💥",
        "✨",
        "🔥",
        "💨",
        "🧨",
        "🦆",
        "🍕",
        "🤡",
        "🎉",
        "🗿",
        "🍌",
        "🫠",
        "🎪",
        "🦞",
        "🪿",
        "🥔",
        "🧃",
        "👻",
        "⚡",
        "🌭",
        "🐸",
        "🍉",
        "🎲",
        "🧻",
        "📉",
        "🚧",
        "🧅",
        "🦖",
      ];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "FAHHH-particle";
        if (Math.random() < 0.1) {
          p.classList.add("FAHHH-particle--lg");
        }
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        let lx;
        let ly;
        if (fromContextMenu && anchorRect) {
          const cx = anchorRect.left + anchorRect.width / 2;
          const cy = anchorRect.top + anchorRect.height / 2;
          const spreadX = Math.max(80, anchorRect.width * 0.85, vw * 0.12);
          const spreadY = Math.max(80, anchorRect.height * 0.85, vh * 0.12);
          lx = cx + rand(Math.round(-spreadX), Math.round(spreadX));
          ly = cy + rand(Math.round(-spreadY), Math.round(spreadY));
          lx = Math.max(0, Math.min(vw - 1, lx));
          ly = Math.max(0, Math.min(vh - 1, ly));
        } else {
          lx = rand(0, vw);
          ly = rand(0, vh);
        }
        p.style.left = `${lx}px`;
        p.style.top = `${ly}px`;
        p.style.setProperty("--dx", `${rand(-220, 220)}px`);
        p.style.setProperty("--dy", `${rand(-220, 220)}px`);
        p.style.setProperty("--dr", `${rand(-240, 240)}deg`);
        p.style.animationDuration = `${rand(900, 1800)}ms`;
        document.documentElement.appendChild(p);
        setTimeout(() => p.remove(), 2000);
      }
    }
  
    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  })();