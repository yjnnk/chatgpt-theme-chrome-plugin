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
    /* ========== user’s existing theming ========== */
    html, body, #__next, main, #stage-sidebar-tiny-bar {
      background-color: #303446 !important;
      color: #c6d0f5 !important;
    }
    /* … all your other rules … */

    /* ========== content‑fade overrides ========== */
    /* Force it fully visible */
    #thread-bottom-container.content-fade {
      opacity: 1 !important;
      mask-image: none !important;
    }
    /* Also kill any scroll‑fade masks on the inner editor */
    .vertical-scroll-fade-mask {
      mask-image: none !important;
    }
  `;

  function stripContentFade() {
    const el = document.getElementById("thread-bottom-container");
    if (el && el.classList.contains("content-fade")) {
      el.classList.remove("content-fade");
    }
  }
  stripContentFade();

  const observer = new MutationObserver(mutations => {
    stripContentFade();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  document.head.appendChild(style);
}


function removeStyle() {
  const styleElement = document.getElementById('chatgpt-styler-theme');
  if (styleElement) {
    styleElement.remove();
  }
}