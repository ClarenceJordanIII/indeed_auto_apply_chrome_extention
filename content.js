class JobApplication {
  constructor(jobtitle, company, location, salary = null, link = null) {
    this.jobtitle = jobtitle;
    this.company = company;
    this.location = location;
    this.salary = salary;
    this.link = link;
  }

  async fillApplication() {
    return window.open(this.link, "_blank");
  }

}

class Scraper {
  static getJobCards() {
    return document.querySelectorAll("ul.css-pygyny li");
  }

  static getJobTitle(card) {
    return card.querySelector("h2.jobTitle span")?.innerText || null;
  }

  static getCompany(card) {
    return (
      card.querySelector('[data-testid="company-name"]')?.innerText || null
    );
  }

  static getLocation(card) {
    return (
      card.querySelector('[data-testid="text-location"]')?.innerText || null
    );
  }

  static getSalary(card) {
    return (
      card.querySelector("h2.mosaic-provider-jobcards-5vqdjd")?.innerText ||
      null
    );
  }

  static getJobLink(card) {
    const a = card.querySelector("h2.jobTitle a");
    return a ? a.href : null;
  }

  static getEasyApplyLink(card) {
    // Looks for a span containing "Easily apply" text
    const easyApplySpan = Array.from(card.querySelectorAll("span")).find(
      (span) => span.textContent.trim() === "Easily apply"
    );
    return !!easyApplySpan; // returns true if found, false otherwise
  }
  static scrollDownToLoadMore() {
    return new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  static async scrapeAllJobs() {
    await Scraper.scrollDownToLoadMore();
    const cards = Scraper.getJobCards();
    const jobs = [];
    cards.forEach((card) => {
      jobs.push({
        title: Scraper.getJobTitle(card),
        company: Scraper.getCompany(card),
        location: Scraper.getLocation(card),
        salary: Scraper.getSalary(card),
        link: Scraper.getJobLink(card),
        easyApply: Scraper.getEasyApplyLink(card),
      });
    });

    const jobsFiltered = jobs.filter(
      (job) =>
        job.title && job.company && job.location && job.link && job.easyApply
    );
    console.log(jobsFiltered);
    return jobsFiltered;
  }
}

class Messaging {
  // Send a message to the background script
  static sendToBackground(message) {
    chrome.runtime.sendMessage(message, (response) => {
      console.log("Response from background:", response);
    });
  }

  // Send a message to the current active tab's content script
  static sendToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          console.log("Response from active tab:", response);
        });
      }
    });
  }

  // Send a message to a specific tab by tabId
  static sendToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      console.log(`Response from tab ${tabId}:`, response);
    });
  }

  // Send a message to an extension (by extensionId)
  static sendToExtension(extensionId, message) {
    chrome.runtime.sendMessage(extensionId, message, (response) => {
      console.log("Response from extension:", response);
    });
  }

  // Receive messages sent to this content script
  static receive(handler) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      handler(request, sender, sendResponse);
      // Optionally return true if handler is async
      return true;
    });
  }
}

(async () => {
  Messaging.receive(async (request, sender, sendResponse) => {
    if (request.action === "start") {
      console.log("Job application process started.");
      const jobData = await Scraper.scrapeAllJobs();
      console.log(jobData);
      Messaging.sendToBackground({ action: "jobData", data: jobData });
      sendResponse({ status: "Process started" });
      return true;
    }
  });
})();

(async () => {
  Messaging.receive(async (request, sender, sendResponse) => {
    if (request.action === "fillJob") {
      console.log("Filling job application for:", request.data);
      const jobApp = new JobApplication(
        request.data.title,
        request.data.company,
        request.data.location,
        request.data.salary,
        request.data.link
      );
      // returns refrence to close window 
     const customWindow = await jobApp.fillApplication();
      // TODO add condition to check if application was successful
      setTimeout(() => {
        Messaging.sendToBackground({
          action: "jobFilled",
          jobId: request.data.id,
        });
        // (add logic)

        
        if (customWindow) {
          customWindow.close();
        }
      }, 1000);
      sendResponse({
        status: "Job application filled",
        jobId: request.data.id,
      });
      return true;
    }
  });
})();
