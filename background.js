chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "autofill") {
        console.log("📌 Autofill request received in background.js:", message);

        // Open a new IRCTC tab every time the "Book" button is clicked
        chrome.tabs.create({ url: "https://www.irctc.co.in/nget/train-search" }, function (tab) {
            console.log(`🚀 Opened new IRCTC tab: ${tab.id}`);

            // Inject content script after a short delay to ensure the page loads
            setTimeout(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content.js"]
                }, () => {
                    console.log("✅ content.js manually injected!");
                    chrome.tabs.sendMessage(tab.id, message);
                });
            }, 3000); // Wait 3 seconds before injecting script
        });
    }
});
