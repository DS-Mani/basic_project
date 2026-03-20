document.addEventListener("DOMContentLoaded", () => {
  const toggleEnabled = document.getElementById("toggleEnabled");
  const dimOpacity = document.getElementById("dimOpacity");
  const dimValue = document.getElementById("dimValue");
  const scrollSpeed = document.getElementById("scrollSpeed");
  const speedValue = document.getElementById("speedValue");
  const toggleAutoScroll = document.getElementById("toggleAutoScroll");
  const toggleControls = document.getElementById("toggleControls");
  const toggleProgress = document.getElementById("toggleProgress");
  const colorOptions = document.getElementById("colorOptions");
  const customColor = document.getElementById("customColor");
  const styleOptions = document.getElementById("styleOptions");
  const btnRefresh = document.getElementById("btnRefresh");

  chrome.storage.local.get(
    {
      enabled: false,
      highlightColor: "#4f46e5",
      dimOpacity: 0.45,
      autoScroll: true,
      scrollSpeed: 3,
      showControls: true,
      showProgress: true,
      highlightStyle: "glow",
    },
    (settings) => {
      toggleEnabled.checked = settings.enabled;
      dimOpacity.value = Math.round(settings.dimOpacity * 100);
      dimValue.textContent = Math.round(settings.dimOpacity * 100) + "%";
      scrollSpeed.value = settings.scrollSpeed;
      speedValue.textContent = settings.scrollSpeed;
      toggleAutoScroll.checked = settings.autoScroll;
      toggleControls.checked = settings.showControls;
      toggleProgress.checked = settings.showProgress;
      customColor.value = settings.highlightColor;

      colorOptions.querySelectorAll(".color-btn").forEach((btn) => {
        btn.classList.toggle(
          "active",
          btn.dataset.color === settings.highlightColor
        );
      });

      styleOptions.querySelectorAll(".style-btn").forEach((btn) => {
        btn.classList.toggle(
          "active",
          btn.dataset.style === settings.highlightStyle
        );
      });
    }
  );

  toggleEnabled.addEventListener("change", () => {
    chrome.storage.local.set({ enabled: toggleEnabled.checked });
  });

  dimOpacity.addEventListener("input", () => {
    const val = dimOpacity.value;
    dimValue.textContent = val + "%";
    chrome.storage.local.set({ dimOpacity: val / 100 });
  });

  scrollSpeed.addEventListener("input", () => {
    const val = parseInt(scrollSpeed.value);
    speedValue.textContent = val;
    chrome.storage.local.set({ scrollSpeed: val });
  });

  toggleAutoScroll.addEventListener("change", () => {
    chrome.storage.local.set({ autoScroll: toggleAutoScroll.checked });
  });

  toggleControls.addEventListener("change", () => {
    chrome.storage.local.set({ showControls: toggleControls.checked });
  });

  toggleProgress.addEventListener("change", () => {
    chrome.storage.local.set({ showProgress: toggleProgress.checked });
  });

  colorOptions.addEventListener("click", (e) => {
    const btn = e.target.closest(".color-btn");
    if (!btn) return;

    colorOptions
      .querySelectorAll(".color-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const color = btn.dataset.color;
    customColor.value = color;
    chrome.storage.local.set({ highlightColor: color });
  });

  customColor.addEventListener("input", () => {
    colorOptions
      .querySelectorAll(".color-btn")
      .forEach((b) => b.classList.remove("active"));
    chrome.storage.local.set({ highlightColor: customColor.value });
  });

  styleOptions.addEventListener("click", (e) => {
    const btn = e.target.closest(".style-btn");
    if (!btn) return;

    styleOptions
      .querySelectorAll(".style-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    chrome.storage.local.set({ highlightStyle: btn.dataset.style });
  });

  btnRefresh.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "refresh" });
      }
    });
  });
});
