








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

class Storage{

    static clear(callback) {
        chrome.storage.local.clear(() => {
            if (callback) callback();
        });
    }
    // Retrieve data from chrome.storage.local
    static get(key, callback) {
        chrome.storage.local.get([key], (result) => {
            if (callback) callback(result[key]);
        });
    }
    // Save data to chrome.storage.local
    static save(key, value, callback) {
        const data = {};
        data[key] = value;
        chrome.storage.local.set(data, () => {
            if (callback) callback();
        });
    }
}




Messaging.onMessage((message, sender, sendResponse) => {
    console.log('Received message in content script:', message);
    if (message.action === "jobData") {
        console.log("Job data received in background script:", message.data);
        // Overwrite the 'que' key with the latest job data
        Storage.save('que', message.data, () => {
            console.log("Queue in storage overwritten with:", message.data);
            sendResponse({ status: "Job data received and stored" });
        });
        return true; // For async sendResponse
    }
    
});