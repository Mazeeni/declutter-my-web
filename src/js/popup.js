import { URL_REGEXP } from "./constants.js";

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

function onLoad() {
  const addProfileButton = document.getElementById("createProfileButton");
  addProfileButton.addEventListener("click", function () {
    browser.tabs.create({
      url: "options.html",
    });
  });

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (!URL_REGEXP.test(tabs[0].url)) {
      popupShowInvalidPage();
    } else {
      var url = tabs[0].url;
      url = url.replace(/^https?\:\/\//i, "");
      url = url.replace("www.", "");
      console.log("Current url: " + url);
      const prof = findActiveProfile(url);
      prof.then((p) => {
        if (!!p) {
          popupShowProfile(p.name);
        } else {
          popupShowNoProfiles();
        }
      });
    }
  });

  // updateButtonColor(curTab);
  // listenForClicks(curTab);
}

async function findActiveProfile(url) {
  const allProfiles = await browser.storage.local.get();

  for (const key in allProfiles) {
    console.log("Key");
    console.log(allProfiles[key]);
    if (url.includes(allProfiles[key].url)) {
      console.log("hmmm");
      console.log(allProfiles[key]);
      return allProfiles[key];
    }
  }
  return null;
}

// debug print all storage
console.log("Current storage:");
const allStorage = browser.storage.local.get();
allStorage.then((s) => console.log(s));

// clear storage
// browser.storage.local.clear();

function updateButtonColor(tab) {
  return;
  const allPages = browser.storage.local.get();
  allPages.then((pgs) => {
    const isModeOn = pgs.allPagesSettings[tab.url].isModeOn;
    if (isModeOn) {
      document.getElementById("power-button").src = "icons/power-on.svg";
    } else {
      document.getElementById("power-button").src = "icons/power-off.svg";
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

function popupShowProfile(name) {
  document.querySelector("#popup-profile-valid").classList.remove("hidden");
  document.getElementById("activeProfileName").innerText = name;
}

function popupShowInvalidPage() {
  document.querySelector("#popup-page-invalid").classList.remove("hidden");
}

function popupShowNoProfiles() {
  document.querySelector("#popup-profile-invalid").classList.remove("hidden");
}

function reportExecuteScriptError(error) {
  disableAddonOptions();
  console.error(`Failed to execute content script: ${error.message}`);
}

document.addEventListener("DOMContentLoaded", onLoad);

// const currentTab = browser.tabs.query({
//   currentWindow: true,
//   active: true,
// });
// currentTab.then(onGot, onError);
