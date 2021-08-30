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
  const allPages = browser.storage.local.get("pageSettings" + tab.url);
  allPages.then((pgs) => {
    const curPage = pgs.allPagesSettings[tab.url];
    if (curPage === undefined) {
      console.log("memory initialised");
      browser.storage.local.set({
        allPagesSettings: { [tab.url]: { isModeOn: false } },
      });
    }
  });
}

function updateButtonColor(tab) {
  const allPages = browser.storage.local.get("allPagesSettings");
  allPages.then((pgs) => {
    const isModeOn = pgs.allPagesSettings[tab.url].isModeOn;
    if (isModeOn) {
      document.getElementById("power-button").src = "../icons/power-on.svg";
    } else {
      document.getElementById("power-button").src = "../icons/power-off.svg";
    }
  });
}

function listenForClicks(tab) {
  document.addEventListener("click", (e) => {
    function switchFocus() {
      const allPages = browser.storage.local.get("allPagesSettings");

      allPages.then((pgs) => {
        const isModeOn = pgs.allPagesSettings[tab.url].isModeOn;
        if (isModeOn) {
          console.log("Switching focus off");
          browser.storage.local.set({
            allPagesSettings: { [tab.url]: { isModeOn: false } },
          });
          unfocusCSS();
        } else {
          console.log("Switching focus on");
          browser.storage.local.set({
            allPagesSettings: { [tab.url]: { isModeOn: true } },
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
