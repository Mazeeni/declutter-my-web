/**
 * Script running in the toolbar popup.
 */

function listenForClicks() {
  document.addEventListener("click", (e) => {
    function reportError() {
      console.error(
        `Could not switch focus ` + !isFocus`successfully: ${error}`
      );
    }

    function switchFocus() {
      const isFocus = browser.storage.sync.get("isFocus");
      isFocus.then((f) => {
        // safe access as f will be an empty object if not defined
        // and f.isFocus will return undefined.
        if (f.isFocus) {
          console.log("Switching focus off");
          browser.storage.sync.set({
            isFocus: false,
          });
        } else {
          console.log("Switching focus on");
          browser.storage.sync.set({
            isFocus: true,
          });
        }
      });
    }

    if (e.target.classList.contains("power-button")) {
      switchFocus();
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
  console.error(`Failed to execute content script: ${error.message}`);
}

/**
 * Checks if current tab is a supported page for addon.
 */
function onGot(tabInfo) {
  if (tabInfo[0].url.includes("theverge.com/2")) {
    // browser.tabs.
    // .executeScript({ file: "../declutterer/declutterer.js" })
    // .then(listenForClicks)
    // .catch(reportExecuteScriptError);
    listenForClicks();
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
