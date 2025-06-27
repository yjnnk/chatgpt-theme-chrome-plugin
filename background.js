chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: false });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || (!tab.url.startsWith('https://chat.openai.com') && !tab.url.startsWith('https://chatgpt.com'))) {
    return;
  }

  const { enabled } = await chrome.storage.local.get('enabled');
  const nextState = !enabled;

  await chrome.storage.local.set({ enabled: nextState });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: nextState ? addStyle : removeStyle,
    });
  } catch (e) {
    console.error("Failed to execute script:", e);
  }
});

function addStyle() {
  const styleId = 'chatgpt-styler-theme';
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    html, body, #__next, main { background-color: #1e1e2e !important; color: #cdd6f4 !important; }
    .dark\\:bg-gray-900, .dark\\:bg-gray-800 { background-color: #1a1b26 !important; border-color: #313244 !important; }
    .markdown, .prose, .group.w-full, .rounded-xl { background-color: #1e1e2e !important; color: #cdd6f4 !important; border: none !important; box-shadow: none !important; }
    textarea, input { background-color: #1a1b26 !important; color: #cdd6f4 !important; border-color: #89dceb44 !important; }
    button, .btn { background-color: #313244 !important; color: #cdd6f4 !important; border-color: #94e2d5 !important; }
    a { color: #94e2d5 !important; }
    code, pre, .text-xs, .text-sm { color: #a6adc8 !important; }
    .text-green-500, .text-red-500, .text-blue-500 { color: #f5c2e7 !important; }
  `;
  document.head.appendChild(style);
}

function removeStyle() {
  const styleElement = document.getElementById('chatgpt-styler-theme');
  if (styleElement) {
    styleElement.remove();
  }
}