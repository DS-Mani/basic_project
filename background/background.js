chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggle" });
});

chrome.commands?.onCommand?.addListener((command) => {
  if (command === "toggle-readfocus") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
      }
    });
  }
});
