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
  let resizeHandler = null;

  const PARAGRAPH_SELECTORS = [
    "p",
    "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote",
    "pre",
    "td",
    "article > *",
    "[class*='markdown'] > *",
    "[class*='prose'] > *",
    "[data-message-author-role] [class*='markdown'] > *",
    ".text-base [class*='markdown'] > *",
    "[class*='message-content'] > *",
    "[class*='response-body'] > *",
    "[class*='answer'] > *",
    ".post-content > *",
    ".entry-content > *",
    ".article-body > *",
    "main p",
    "main li",
  ];

  function collectParagraphs() {
    const candidates = document.querySelectorAll(PARAGRAPH_SELECTORS.join(", "));
    const seen = new Set();
    const results = [];

    for (const el of candidates) {
      if (seen.has(el)) continue;
      if (el.closest(".readfocus-controls, .readfocus-counter, .readfocus-progress")) continue;

      const text = (el.textContent || "").trim();
      if (text.length < 10) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;

      seen.add(el);

      let dominated = false;
      for (const other of results) {
        if (other.el.contains(el) && other.el !== el) {
          dominated = true;
          break;
        }
      }
      if (dominated) continue;

      const filteredResults = [];
      for (const other of results) {
        if (el.contains(other.el) && el !== other.el) continue;
        filteredResults.push(other);
      }
      results.length = 0;
      results.push(...filteredResults);

      results.push({ el, top: rect.top + window.scrollY });
    }

    results.sort((a, b) => a.top - b.top);
    return results.map((r) => r.el);
  }

  function createOverlays() {
    if (overlayTop) return;

    overlayTop = document.createElement("div");
    overlayTop.className = "readfocus-overlay--top";
    document.body.appendChild(overlayTop);

    overlayBottom = document.createElement("div");
    overlayBottom.className = "readfocus-overlay--bottom";
    document.body.appendChild(overlayBottom);
  }

  function createProgressUI() {
    if (progressBar) return;

    progressBar = document.createElement("div");
    progressBar.className = "readfocus-progress";
    document.body.appendChild(progressBar);

    counterEl = document.createElement("div");
    counterEl.className = "readfocus-counter";
    document.body.appendChild(counterEl);
  }

  function removeProgressUI() {
    if (progressBar && progressBar.parentNode) progressBar.parentNode.removeChild(progressBar);
    if (counterEl && counterEl.parentNode) counterEl.parentNode.removeChild(counterEl);
    progressBar = null;
    counterEl = null;
  }

  function createControls() {
    if (controlsEl) return;

    controlsEl = document.createElement("div");
    controlsEl.className = "readfocus-controls";

    const btnUp = document.createElement("button");
    btnUp.innerHTML = "&#9650;";
    btnUp.title = "Previous paragraph (Up Arrow)";
    btnUp.addEventListener("click", (e) => { e.stopPropagation(); moveTo(currentIndex - 1); });

    const btnPause = document.createElement("button");
    btnPause.className = "readfocus-btn-pause";
    btnPause.title = "Pause/Resume auto-scroll";
    updatePauseButton(btnPause);
    btnPause.addEventListener("click", (e) => {
      e.stopPropagation();
      isPaused = !isPaused;
      updatePauseButton(btnPause);
      if (isPaused) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    });

    const btnDown = document.createElement("button");
    btnDown.innerHTML = "&#9660;";
    btnDown.title = "Next paragraph (Down Arrow)";
    btnDown.addEventListener("click", (e) => { e.stopPropagation(); moveTo(currentIndex + 1); });

    const btnStop = document.createElement("button");
    btnStop.innerHTML = "&#10005;";
    btnStop.title = "Stop ReadFocus";
    btnStop.className = "readfocus-btn-stop";
    btnStop.addEventListener("click", (e) => { e.stopPropagation(); deactivate(); });

    controlsEl.appendChild(btnUp);
    controlsEl.appendChild(btnPause);
    controlsEl.appendChild(btnDown);
    controlsEl.appendChild(btnStop);

    document.body.appendChild(controlsEl);
  }

  function removeControls() {
    if (controlsEl && controlsEl.parentNode) controlsEl.parentNode.removeChild(controlsEl);
    controlsEl = null;
  }

  function updatePauseButton(btn) {
    if (!btn) return;
    btn.innerHTML = isPaused ? "&#9654;" : "&#9646;&#9646;";
  }

  function removeAllUI() {
    [overlayTop, overlayBottom].forEach((el) => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    overlayTop = null;
    overlayBottom = null;
    removeProgressUI();
    removeControls();
  }

  function applyHighlight(el) {
    const color = settings.highlightColor;
    el.classList.add("readfocus-paragraph-highlight");

    el.dataset.rfOrigPadding = el.style.padding || "";
    el.dataset.rfOrigMargin = el.style.margin || "";
    el.dataset.rfOrigBg = el.style.background || "";
    el.dataset.rfOrigShadow = el.style.boxShadow || "";
    el.dataset.rfOrigBorder = el.style.borderBottom || "";
    el.dataset.rfOrigPaddingBottom = el.style.paddingBottom || "";

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
    el.style.padding = el.dataset.rfOrigPadding || "";
    el.style.margin = el.dataset.rfOrigMargin || "";
    el.style.background = el.dataset.rfOrigBg || "";
    el.style.boxShadow = el.dataset.rfOrigShadow || "";
    el.style.borderBottom = el.dataset.rfOrigBorder || "";
    el.style.paddingBottom = el.dataset.rfOrigPaddingBottom || "";

    delete el.dataset.rfOrigPadding;
    delete el.dataset.rfOrigMargin;
    delete el.dataset.rfOrigBg;
    delete el.dataset.rfOrigShadow;
    delete el.dataset.rfOrigBorder;
    delete el.dataset.rfOrigPaddingBottom;
  }

  function updateOverlays(el) {
    if (!overlayTop || !overlayBottom) return;

    const rect = el.getBoundingClientRect();
    const padding = 8;

    overlayTop.style.top = "0";
    overlayTop.style.height = Math.max(0, rect.top - padding) + "px";
    overlayTop.style.background = `rgba(0,0,0,${settings.dimOpacity})`;

    overlayBottom.style.top = (rect.bottom + padding) + "px";
    overlayBottom.style.height = Math.max(0, window.innerHeight - rect.bottom - padding) + "px";
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
    const rect = el.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const offset = elementCenter - viewportCenter;

    if (Math.abs(offset) > 50) {
      window.scrollBy({
        top: offset,
        behavior: settings.scrollBehavior,
      });
    }
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
      updateProgress();
    });
  }

  function findNearestParagraph() {
    if (!paragraphs.length) return 0;

    const viewportCenter = window.innerHeight / 2;
    let closest = 0;
    let minDist = Infinity;

    for (let i = 0; i < paragraphs.length; i++) {
      const rect = paragraphs[i].getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }

    return closest;
  }

  function startAutoScroll() {
    stopAutoScroll();
    if (!settings.autoScroll || isPaused) return;

    const intervalMs = Math.max(800, 5500 - settings.scrollSpeed * 550);

    autoScrollInterval = setInterval(() => {
      if (currentIndex < paragraphs.length - 1) {
        moveTo(currentIndex + 1);
      } else {
        stopAutoScroll();
        isPaused = true;
        const pauseBtn = controlsEl?.querySelector(".readfocus-btn-pause");
        updatePauseButton(pauseBtn);
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

    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) {
      return;
    }

    if (e.code === settings.keyNext) {
      e.preventDefault();
      stopAutoScroll();
      isPaused = true;
      const pauseBtn = controlsEl?.querySelector(".readfocus-btn-pause");
      updatePauseButton(pauseBtn);
      moveTo(currentIndex + 1);
    } else if (e.code === settings.keyPrev) {
      e.preventDefault();
      stopAutoScroll();
      isPaused = true;
      const pauseBtn = controlsEl?.querySelector(".readfocus-btn-pause");
      updatePauseButton(pauseBtn);
      moveTo(currentIndex - 1);
    } else if (e.code === "Space") {
      e.preventDefault();
      isPaused = !isPaused;
      const pauseBtn = controlsEl?.querySelector(".readfocus-btn-pause");
      updatePauseButton(pauseBtn);
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
    }, 80);
  }

  function activate() {
    if (isActive) return;

    paragraphs = collectParagraphs();
    if (paragraphs.length === 0) {
      console.log("[ReadFocus] No paragraphs found on this page.");
      return;
    }

    console.log(`[ReadFocus] Found ${paragraphs.length} paragraphs.`);

    isActive = true;
    isPaused = false;
    createOverlays();

    if (settings.showProgress) createProgressUI();
    if (settings.showControls) createControls();

    const startIndex = findNearestParagraph();
    moveTo(startIndex);

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", throttledScroll, { passive: true });

    resizeHandler = () => {
      if (isActive && currentIndex >= 0 && currentIndex < paragraphs.length) {
        updateOverlays(paragraphs[currentIndex]);
      }
    };
    window.addEventListener("resize", resizeHandler);

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

    removeAllUI();

    document.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("scroll", throttledScroll);
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }

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
      return;
    }

    if (!isActive) return;

    if (changes.showControls) {
      if (settings.showControls) {
        createControls();
      } else {
        removeControls();
      }
    }

    if (changes.showProgress) {
      if (settings.showProgress) {
        createProgressUI();
        updateProgress();
      } else {
        removeProgressUI();
      }
    }

    if (changes.autoScroll) {
      if (settings.autoScroll && !isPaused) {
        startAutoScroll();
      } else {
        stopAutoScroll();
      }
    }

    if (changes.scrollSpeed) {
      if (autoScrollInterval) {
        startAutoScroll();
      }
    }

    if (changes.highlightColor || changes.highlightStyle || changes.dimOpacity) {
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
        if (paragraphs.length > 0) {
          moveTo(Math.min(wasIndex, paragraphs.length - 1));
        }
      }
    }
  });

  loadSettings();
})();
