// Messaging class tailored for Chrome Extension context
class Messaging {
  // Send a message to the active tab's content script
  static sendToActiveTab(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
      }
    });
  }

  // Listen for messages from content scripts or other extension parts
  static onMessage(handler) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handler(message, sender, sendResponse);
      // Return true if you want to use sendResponse asynchronously
      // return true;
    });
  }
}






const btn = document.getElementById('start-btn');



//  start 
btn.addEventListener('click', () => {
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Get the active tab
  const tab = tabs[0];
  // Only send message if URL matches Indeed
  if (tab && tab.url && tab.url.includes("indeed.")) {
   Messaging.sendToActiveTab({action: "start"},function(response){
    console.log('Response from active tab:', response);
  });

  } else {
    alert("Please open an Indeed job page to use this feature.");
  }






});

})
