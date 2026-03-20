(() => {
  "use strict";

  const DEFAULT_SETTINGS = {
    enabled: false,
    highlightColor: "#4f46e5",
    dimOpacity: 0.45,
    autoScroll: true,
    scrollSpeed: 3,
    scrollBehavior: "smooth",
    showControls: true,
    showProgress: true,
    keyNext: "ArrowDown",
    keyPrev: "ArrowUp",
    keyToggle: "KeyR",
    highlightStyle: "glow",
  };

  let settings = { ...DEFAULT_SETTINGS };
  let isActive = false;
  let paragraphs = [];
  let currentIndex = -1;
  let autoScrollInterval = null;
  let isPaused = false;

  let overlayTop = null;
  let overlayBottom = null;
  let progressBar = null;
  let counterEl = null;
  let controlsEl = null;

  function collectParagraphs() {
    const selectors = [
      "p",
      "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote",
      "pre",
      "td",
      "[class*='message']",
      "[class*='response']",
      "[class*='answer']",
      "[class*='markdown'] > *",
    ];

    const candidates = document.querySelectorAll(selectors.join(", "));
    const seen = new Set();
    const results = [];

    for (const el of candidates) {
      if (seen.has(el)) continue;

      const text = (el.textContent || "").trim();
      if (text.length < 10) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;

      seen.add(el);

      let dominated = false;
      for (const other of results) {
        if (other.el.contains(el) && other.el !== el) {
          dominated = true;
          break;
        }
      }
      if (dominated) continue;

      results.push({ el, rect, text });
    }

    results.sort((a, b) => {
      const aTop = a.rect.top + window.scrollY;
      const bTop = b.rect.top + window.scrollY;
      return aTop - bTop;
    });

    return results.map((r) => r.el);
  }

  function createOverlays() {
    overlayTop = document.createElement("div");
    overlayTop.className = "readfocus-overlay--top";
    document.body.appendChild(overlayTop);

    overlayBottom = document.createElement("div");
    overlayBottom.className = "readfocus-overlay--bottom";
    document.body.appendChild(overlayBottom);

    progressBar = document.createElement("div");
    progressBar.className = "readfocus-progress";
    document.body.appendChild(progressBar);

    counterEl = document.createElement("div");
    counterEl.className = "readfocus-counter";
    document.body.appendChild(counterEl);
  }

  function createControls() {
    controlsEl = document.createElement("div");
    controlsEl.className = "readfocus-controls";

    const btnUp = document.createElement("button");
    btnUp.innerHTML = "&#9650;";
    btnUp.title = "Previous paragraph (Up Arrow)";
    btnUp.addEventListener("click", () => moveTo(currentIndex - 1));

    const btnPause = document.createElement("button");
    btnPause.innerHTML = isPaused ? "&#9654;" : "&#9646;&#9646;";
    btnPause.title = "Pause/Resume auto-scroll";
    btnPause.className = "readfocus-btn-pause";
    btnPause.addEventListener("click", () => {
      isPaused = !isPaused;
      btnPause.innerHTML = isPaused ? "&#9654;" : "&#9646;&#9646;";
      if (isPaused) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    });

    const btnDown = document.createElement("button");
    btnDown.innerHTML = "&#9660;";
    btnDown.title = "Next paragraph (Down Arrow)";
    btnDown.addEventListener("click", () => moveTo(currentIndex + 1));

    const btnStop = document.createElement("button");
    btnStop.innerHTML = "&#10005;";
    btnStop.title = "Stop ReadFocus";
    btnStop.className = "readfocus-btn-stop";
    btnStop.addEventListener("click", deactivate);

    controlsEl.appendChild(btnUp);
    controlsEl.appendChild(btnPause);
    controlsEl.appendChild(btnDown);
    controlsEl.appendChild(btnStop);

    document.body.appendChild(controlsEl);
  }

  function removeUI() {
    [overlayTop, overlayBottom, progressBar, counterEl, controlsEl].forEach(
      (el) => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }
    );
    overlayTop = overlayBottom = progressBar = counterEl = controlsEl = null;
  }

  function applyHighlight(el) {
    const color = settings.highlightColor;

    el.classList.add("readfocus-paragraph-highlight");

    if (settings.highlightStyle === "glow") {
      el.style.background = hexToRgba(color, 0.1);
      el.style.boxShadow = `0 0 0 6px ${hexToRgba(color, 0.08)}, inset 4px 0 0 ${color}`;
      el.style.padding = "8px 12px";
      el.style.margin = "0 -12px";
    } else if (settings.highlightStyle === "underline") {
      el.style.borderBottom = `3px solid ${color}`;
      el.style.paddingBottom = "4px";
    } else {
      el.style.background = hexToRgba(color, 0.15);
      el.style.padding = "8px 12px";
      el.style.margin = "0 -12px";
    }
  }

  function removeHighlight(el) {
    el.classList.remove("readfocus-paragraph-highlight");
    el.style.background = "";
    el.style.boxShadow = "";
    el.style.padding = "";
    el.style.margin = "";
    el.style.borderBottom = "";
    el.style.paddingBottom = "";
  }

  function updateOverlays(el) {
    const rect = el.getBoundingClientRect();
    const padding = 8;

    overlayTop.style.top = "0";
    overlayTop.style.height = Math.max(0, rect.top - padding) + "px";
    overlayTop.style.background = `rgba(0,0,0,${settings.dimOpacity})`;

    overlayBottom.style.top = rect.bottom + padding + "px";
    overlayBottom.style.height =
      Math.max(0, window.innerHeight - rect.bottom - padding) + "px";
    overlayBottom.style.background = `rgba(0,0,0,${settings.dimOpacity})`;
  }

  function updateProgress() {
    if (!progressBar || !counterEl) return;
    const total = paragraphs.length;
    const pct = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
    progressBar.style.width = pct + "%";
    counterEl.textContent = `${currentIndex + 1} / ${total}`;
  }

  function scrollToElement(el) {
    if (!settings.autoScroll) return;

    const rect = el.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const offset = elementCenter - viewportCenter;

    window.scrollBy({
      top: offset,
      behavior: settings.scrollBehavior,
    });
  }

  function moveTo(index) {
    if (index < 0 || index >= paragraphs.length) return;

    if (currentIndex >= 0 && currentIndex < paragraphs.length) {
      removeHighlight(paragraphs[currentIndex]);
    }

    currentIndex = index;
    const el = paragraphs[currentIndex];

    applyHighlight(el);
    scrollToElement(el);

    requestAnimationFrame(() => {
      updateOverlays(el);
    });

    updateProgress();
  }

  function findNearestParagraph() {
    const viewportCenter = window.innerHeight / 2;
    let closest = 0;
    let minDist = Infinity;

    paragraphs.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    return closest;
  }

  function startAutoScroll() {
    stopAutoScroll();
    if (!settings.autoScroll || isPaused) return;

    const intervalMs = Math.max(500, 5000 - settings.scrollSpeed * 500);

    autoScrollInterval = setInterval(() => {
      if (currentIndex < paragraphs.length - 1) {
        moveTo(currentIndex + 1);
      } else {
        stopAutoScroll();
      }
    }, intervalMs);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function handleKeyDown(e) {
    if (!isActive) return;

    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
      return;
    }

    if (e.code === settings.keyNext) {
      e.preventDefault();
      stopAutoScroll();
      isPaused = true;
      moveTo(currentIndex + 1);
    } else if (e.code === settings.keyPrev) {
      e.preventDefault();
      stopAutoScroll();
      isPaused = true;
      moveTo(currentIndex - 1);
    } else if (e.code === "Space") {
      e.preventDefault();
      isPaused = !isPaused;
      if (isPaused) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    } else if (e.code === "Escape") {
      deactivate();
    }
  }

  function handleScroll() {
    if (!isActive || !paragraphs.length) return;

    if (isPaused || !autoScrollInterval) {
      const nearest = findNearestParagraph();
      if (nearest !== currentIndex) {
        if (currentIndex >= 0 && currentIndex < paragraphs.length) {
          removeHighlight(paragraphs[currentIndex]);
        }
        currentIndex = nearest;
        applyHighlight(paragraphs[currentIndex]);
        updateOverlays(paragraphs[currentIndex]);
        updateProgress();
      } else if (currentIndex >= 0 && currentIndex < paragraphs.length) {
        updateOverlays(paragraphs[currentIndex]);
      }
    }
  }

  let scrollTimeout = null;
  function throttledScroll() {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      handleScroll();
    }, 100);
  }

  function activate() {
    if (isActive) return;

    paragraphs = collectParagraphs();
    if (paragraphs.length === 0) return;

    isActive = true;
    createOverlays();

    if (settings.showControls) {
      createControls();
    }

    const startIndex = findNearestParagraph();
    moveTo(startIndex);

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", throttledScroll, { passive: true });
    window.addEventListener("resize", () => {
      if (isActive && currentIndex >= 0 && currentIndex < paragraphs.length) {
        updateOverlays(paragraphs[currentIndex]);
      }
    });

    if (settings.autoScroll && !isPaused) {
      startAutoScroll();
    }

    chrome.storage.local.set({ enabled: true });
  }

  function deactivate() {
    if (!isActive) return;

    stopAutoScroll();

    if (currentIndex >= 0 && currentIndex < paragraphs.length) {
      removeHighlight(paragraphs[currentIndex]);
    }

    removeUI();

    document.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("scroll", throttledScroll);

    paragraphs = [];
    currentIndex = -1;
    isActive = false;
    isPaused = false;

    chrome.storage.local.set({ enabled: false });
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function loadSettings() {
    chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
      settings = { ...DEFAULT_SETTINGS, ...stored };
      if (settings.enabled) {
        activate();
      }
    });
  }

  chrome.storage.onChanged.addListener((changes) => {
    for (const key of Object.keys(changes)) {
      settings[key] = changes[key].newValue;
    }

    if (changes.enabled) {
      if (changes.enabled.newValue) {
        activate();
      } else {
        deactivate();
      }
    }

    if (isActive && !changes.enabled) {
      if (currentIndex >= 0 && currentIndex < paragraphs.length) {
        removeHighlight(paragraphs[currentIndex]);
        applyHighlight(paragraphs[currentIndex]);
        updateOverlays(paragraphs[currentIndex]);
      }
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "toggle") {
      if (isActive) {
        deactivate();
      } else {
        activate();
      }
    } else if (msg.action === "refresh") {
      if (isActive) {
        const wasIndex = currentIndex;
        if (currentIndex >= 0 && currentIndex < paragraphs.length) {
          removeHighlight(paragraphs[currentIndex]);
        }
        paragraphs = collectParagraphs();
        moveTo(Math.min(wasIndex, paragraphs.length - 1));
      }
    }
  });

  loadSettings();
})();
