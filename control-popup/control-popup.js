const hidePage = `body > :not(.l-col__main) {
  display: none;
}`;

const hideAll = `* {
  visibility: hidden;
} `;

const classesToShow = ["c-entry-hero"];

console.log("We begin");

function checkIsFocus() {
  const isFocus = browser.storage.sync.get("isFocus");
  isFocus.then((f) => {
    if (!f) {
      console.log("No current focus found, proof: " + false);
      console.log("Initialising isFocus");
      browser.storage.sync.set({
        isFocus: false,
      });
    } else {
      console.log("Focus found: ");
      console.log(f.isFocus);
    }
  });
}

function listenForClicks() {
  document.addEventListener("click", (e) => {
    function switchFocus() {
      const isFocus = browser.storage.sync.get("isFocus");
      isFocus.then((f) => {
        if (f.isFocus) {
          console.log("Switching focus off");
          focusOff();
        } else {
          console.log("Switching focus on");
          focusOn();
        }
      });
    }

    // removes unnecessary elements
    function focusOn() {
      browser.tabs.insertCSS({ code: hideAll });
      browser.storage.sync.set({
        isFocus: true,
      });
    }

    // shows previously removed elements
    function focusOff() {
      browser.tabs.removeCSS({ code: hideAll });
      browser.storage.sync.set({
        isFocus: false,
      });
    }

    function reportError() {
      console.error(
        `Could not switch focus ` + !isFocus`successfully: ${error}`
      );
    }

    if (e.target.classList.contains("power-button")) {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(switchFocus)
        .catch(reportError);
    } else {
      console.log("Button didn't trigger correctly");
    }
  });
}

/**
 * Displays message to user that addon is unsupported on current
 * page.
 */
function disableAddonOptions() {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
}

function reportExecuteScriptError(error) {
  disableAddonOptions();
  console.error(
    `Failed to execute declutterer content script: ${error.message}`
  );
}

/**
 * Checks if current tab is a supported page for addon.
 */
function onGot(tabInfo) {
  if (tabInfo[0].url.includes("theverge.com/20")) {
    checkIsFocus();

    browser.tabs
      .executeScript({ file: "../declutterer/declutterer.js" })
      .then(listenForClicks)
      .catch(reportExecuteScriptError);
  } else {
    disableAddonOptions();
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

const gettingCurrent = browser.tabs.query({
  currentWindow: true,
  active: true,
});
gettingCurrent.then(onGot, onError);
