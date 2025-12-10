chrome.storage.local.get(["savedUrls", "invertDisabled", "customCSS", "customJS"], 
({ savedUrls, invertDisabled, customCSS, customJS }) => {
    if (!savedUrls || savedUrls.length === 0) return;
    const url = window.location.href;
    const matchedPattern = savedUrls.find(pattern => {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        return regex.test(url);
    });
    if (!matchedPattern) return;
    const oldCss = document.getElementById("___ext_custom_css");
    const oldJs = document.getElementById("___ext_custom_js");
    if (oldCss) oldCss.remove();
    if (oldJs) oldJs.remove();
    document.documentElement.style.filter = "";
    if (customCSS && customCSS[matchedPattern]) {
        const style = document.createElement("style");
        style.id = "___ext_custom_css";
        style.textContent = customCSS[matchedPattern];
        document.documentElement.appendChild(style);
    }
    if (customJS && customJS[matchedPattern]) {
        const script = document.createElement("script");
        script.id = "___ext_custom_js";
        script.textContent = customJS[matchedPattern];
        document.documentElement.appendChild(script);
    }
});