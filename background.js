








class Messaging {
    // Send a message to a specific tab's content script
    static sendToTab(tabId, message) {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            console.log(`Response from tab ${tabId}:`, response);
        });
    }

    // Listen for messages from content scripts or other extension parts
    static onMessage(handler) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            handler(message, sender, sendResponse);
            // Return true if you want to use sendResponse asynchronously
            // return true;
            return true
        });
    }

    // Send a message to another extension (by extensionId)
    static sendToExtension(extensionId, message) {
        chrome.runtime.sendMessage(extensionId, message, (response) => {
            console.log('Response from extension:', response);
        });
    }

    // Listen for messages from other extensions
    static onExtensionMessage(handler) {
        chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
            handler(message, sender, sendResponse);
            // Return true if you want to use sendResponse asynchronously
            // return true;
            return true
        });
    }

    // Listen for messages from a specific tab
    static onTabMessage(handler) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (sender.tab) {
                handler(message, sender, sendResponse);
            }
            // Return true if you want to use sendResponse asynchronously
            // return true;
            return true
        });
    }
}




Messaging.onMessage((message, sender, sendResponse) => {
    console.log('Received message in content script:', message);
    if (message.action === "jobData") {
        console.log("Job data received in background script:", message.data);
        sendResponse({ status: "Job data received" });
    }
});