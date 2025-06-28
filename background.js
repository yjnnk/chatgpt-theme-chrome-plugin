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
  html, body, #__next, main, #stage-sidebar-tiny-bar {
    background-color: #303446 !important;
    color: #c6d0f5 !important;
  }

  form { border: 1px solid #94e2d5 !important; border-radius: 25px !important }


  .dark\\:bg-gray-900, .dark\\:bg-gray-800 {
    background-color: #292c3c !important;
    border-color: #414559 !important;
  }

  .markdown, .prose, .group.w-full, .rounded-xl {
    background-color: #303446 !important;
    color: #c6d0f5 !important;
    border: none !important;
    box-shadow: none !important;
  }

  textarea, input {
    background-color: #292c3c !important;
    color: #c6d0f5 !important;
    border-color: #81c8be66 !important;
  }

  button, .btn {
    background-color: #414559 !important;
    color: #c6d0f5 !important;
    border-color: #94e2d5 !important;
  }

  form {
    border: 1px solid #94e2d5 !important;
    border-radius: 25px !important;
  }

  a { color: #94e2d5 !important; }

  code, pre, .text-xs, .text-sm {
    color: #b5bfe2 !important;
  }

  .text-green-500, .text-red-500, .text-blue-500 {
    color: #f4b8e4 !important;
  }

  .bg-token-bg-primary {
    background-color: #303446 !important;
  }
`;

  document.querySelectorAll('*').forEach(el => {
  el.style.fontFamily = 'Menlo, monospace';
  el.style.fontSize = '15px';
});
  document.head.appendChild(style);
}

function removeStyle() {
  const styleElement = document.getElementById('chatgpt-styler-theme');
  if (styleElement) {
    styleElement.remove();
  }
}