chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-url",
        title: "Add URL",
        contexts: ["action"]
    });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "add-url") return;
    if (!tab || !tab.url) return;
    const urlObj = new URL(tab.url);
    const pattern = `${urlObj.protocol}//${urlObj.hostname}/*`;
    const data = await chrome.storage.local.get(["savedUrls"]);
    const saved = data.savedUrls || [];
    if (!saved.includes(pattern)) {
        saved.push(pattern);
        await chrome.storage.local.set({ savedUrls: saved });
        console.log("Added URL pattern:", pattern);
    }
});
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url) return;
    const data = await chrome.storage.local.get(["invertDisabled", "savedUrls", "customCSS", "customJS"]);
    const newState = !data.invertDisabled;
    await chrome.storage.local.set({ invertDisabled: newState });
    const saved = data.savedUrls || [];
    const url = tab.url;
    const matchedPattern = saved.find(pattern => {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        return regex.test(url);
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (enabled, matchedPattern, customCSS, customJS) => {
            const oldCss = document.getElementById("___ext_custom_css");
            const oldJs = document.getElementById("___ext_custom_js");
            if (oldCss) oldCss.remove();
            if (oldJs) oldJs.remove();
            document.documentElement.style.filter = enabled ? "invert(1)" : "";
            if (enabled && customCSS && customCSS[matchedPattern]) {
                const style = document.createElement("style");
                style.id = "___ext_custom_css";
                style.textContent = customCSS[matchedPattern];
                document.documentElement.appendChild(style);
            }
            if (enabled && customJS && customJS[matchedPattern]) {
                const script = document.createElement("script");
                script.id = "___ext_custom_js";
                script.textContent = customJS[matchedPattern];
                document.documentElement.appendChild(script);
            }
        },
        args: [newState, matchedPattern, data.customCSS, data.customJS]
    });
});
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    if (!tab.url) return;
    const data = await chrome.storage.local.get(["savedUrls", "invertDisabled"]);
    const saved = data.savedUrls || [];
    const matches = saved.some(pattern => {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        return regex.test(tab.url);
    });
    if (matches) {
        chrome.scripting.executeScript({
            target: { tabId },
            func: (disabled) => {
                document.documentElement.style.filter = disabled ? "" : "invert(1)";
            },
            args: [data.invertDisabled]
        });
    }
});