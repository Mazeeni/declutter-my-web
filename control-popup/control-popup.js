/**
 * Script running in the toolbar popup.
 */

function hideElemByClassCSS(cclass) {
  return (
    `.` +
    cclass +
    `{
      display: none;
    }`
  );
}

const elemClassesToHide = [
  "c-global-header",
  "l-col__sidebar",
  "c-social-buttons",
  "m-ad",
  "connatix-article-desktop",
  "connatix-feature-desktop",
  "c-recirc-module",
  "ob-widget-section",
  "c-tab-bar",
  "c-footer",
  "c-nextclick",
  "tab-bar-fixed",
  "connatix-feature-desktop-packaged-content",
  "c-comments",
  "p-comment-notification",
];

// debug print all storage
const allStorage = browser.storage.local.get();
allStorage.then((s) => console.log(s));

/**
 * Creates new profile for tab in storage.
 */
function initialiseStorageIfEmpty(tab) {
  const isModeOn = browser.storage.local.get(tab.url);
  isModeOn.then((m) => {
    if (Object.keys(m).length === 0) {
      browser.storage.local.set({
        [tab.url]: false,
      });
    }
  });
}

function updateButtonColor(tab) {
  const isModeOn = browser.storage.local.get(tab.url);
  isModeOn.then((m) => {
    if (m[tab.url]) {
      document.getElementById("power-button").src = "../icons/power-on.svg";
    } else {
      document.getElementById("power-button").src = "../icons/power-off.svg";
    }
  });
}

function listenForClicks(tab) {
  document.addEventListener("click", (e) => {
    function switchFocus() {
      const isModeOn = browser.storage.local.get(tab.url);

      isModeOn.then((m) => {
        // safe access as f will be an empty object if not defined
        // and f.isFocus will return undefined.
        console.log("mode currently:");
        console.log(m);

        if (m[tab.url]) {
          console.log("Switching focus off");
          browser.storage.local.set({
            [tab.url]: false,
          });
          unfocusCSS();
        } else {
          console.log("Switching focus on");
          browser.storage.local.set({
            [tab.url]: true,
          });
          focusCSS();
        }
        updateButtonColor(tab);
      });
    }

    // removes unnecessary elements
    function focusCSS() {
      elemClassesToHide.forEach((c) => {
        browser.tabs.insertCSS(tab.id, { code: hideElemByClassCSS(c) });
      });
    }

    // shows previously removed elements
    function unfocusCSS() {
      elemClassesToHide.forEach((c) => {
        browser.tabs.removeCSS(tab.id, { code: hideElemByClassCSS(c) });
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
  const curTab = tabInfo[0];
  if (curTab.url.includes("theverge.com/")) {
    initialiseStorageIfEmpty(curTab);
    updateButtonColor(curTab);
    listenForClicks(curTab);
  } else {
    disableAddonOptions();
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

const currentTab = browser.tabs.query({
  currentWindow: true,
  active: true,
});
currentTab.then(onGot, onError);
