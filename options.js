let currentEditingUrl = null;
let currentJsUrl = null;
function loadList() {
    chrome.storage.local.get(["savedUrls", "customCSS", "customJS"], ({ savedUrls, customCSS, customJS }) => {
        const list = document.getElementById("urlList");
        list.innerHTML = "";
        (savedUrls || []).forEach((url, index) => {
            const row = document.createElement("div");
            row.innerHTML = `
                <span>${url}</span>
                <div style="display:flex; gap:10px;">
                    <button class="cssBtn" data-url="${url}">CSS</button>
                    <button class="jsBtn" data-url="${url}">JS</button>
                    <button class="removeBtn" data-index="${index}">Remove</button>
                </div>
            `;
            list.appendChild(row);
        });
        document.querySelectorAll(".removeBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const idx = e.target.getAttribute("data-index");
                const data = await chrome.storage.local.get(["savedUrls"]);
                const saved = data.savedUrls || [];
                saved.splice(idx, 1);
                await chrome.storage.local.set({ savedUrls: saved });
                loadList();
            });
        });
        document.querySelectorAll(".cssBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const url = e.target.getAttribute("data-url");
                currentEditingUrl = url;
                const data = await chrome.storage.local.get(["customCSS"]);
                const cssData = data.customCSS || {};
                document.getElementById("cssUrlLabel").textContent = url;
                document.getElementById("cssEditor").value = cssData[url] || "";
                document.getElementById("cssModal").style.display = "flex";
            });
        });
        document.querySelectorAll(".jsBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const url = e.target.getAttribute("data-url");
                currentJsUrl = url;
                const data = await chrome.storage.local.get(["customJS"]);
                const jsData = data.customJS || {};
                document.getElementById("jsUrlLabel").textContent = url;
                document.getElementById("jsEditor").value = jsData[url] || "";
                document.getElementById("jsModal").style.display = "flex";
            });
        });
    });
}
document.getElementById("addBtn").addEventListener("click", async () => {
    const input = document.getElementById("newUrl");
    const url = input.value.trim();
    if (!url) return;
    const data = await chrome.storage.local.get(["savedUrls"]);
    const saved = data.savedUrls || [];
    if (!saved.includes(url)) {
        saved.push(url);
        await chrome.storage.local.set({ savedUrls: saved });
    }
    input.value = "";
    loadList();
});
document.getElementById("saveCssBtn").addEventListener("click", async () => {
    const css = document.getElementById("cssEditor").value;
    const data = await chrome.storage.local.get(["customCSS"]);
    const customCSS = data.customCSS || {};
    customCSS[currentEditingUrl] = css;
    await chrome.storage.local.set({ customCSS });
    document.getElementById("cssModal").style.display = "none";
});
document.getElementById("closeCssBtn").addEventListener("click", () => {
    document.getElementById("cssModal").style.display = "none";
});
document.getElementById("saveJsBtn").addEventListener("click", async () => {
    const js = document.getElementById("jsEditor").value;
    const data = await chrome.storage.local.get(["customJS"]);
    const customJS = data.customJS || {};
    customJS[currentJsUrl] = js;
    await chrome.storage.local.set({ customJS });
    document.getElementById("jsModal").style.display = "none";
});
document.getElementById("closeJsBtn").addEventListener("click", () => {
    document.getElementById("jsModal").style.display = "none";
});
loadList();