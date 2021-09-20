/*
 * Script running in the toolbar popup.
 */

import { URL_REGEXP } from "./constants.js";

function hideElemByClassCSS(cclass) {
  return (
    `.` +
    cclass +
    `{
      display: none;
    }`
  );
}

var matchingProfiles = [];

/*
 * Runs at first load of page.
 * Finds and displays all profiles applicable to current page.
 */
async function onLoad() {
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
      const profs = findMatchingProfiles(url);
      profs.then((ps) => {
        if (ps.length > 0) {
          for (var i = 0; i < ps.length; i++) {
            matchingProfiles.push(ps[i]);
            if (ps[i].isModeOn === true) {
              popupShowProfile(ps[i].name);
              matchingProfiles.push([...ps.slice(i + 1)]);
              break;
            } else if (i === ps.length - 1) {
              popupShowProfile(ps[0].name);
            }
          }
          updateProfilesList();
        } else {
          popupShowNoProfiles();
        }
      });
    }
  });

  // updateButtonColor(curTab);

  // listenForClicks(curTab);
}

/*
 * Returns an array of all profiles that can be used for the argument URL.
 */
async function findMatchingProfiles(url) {
  const tabHostname = new URL(url).hostname.replace(/^(www\.)/, "");
  const profileGroupName = "profilesFor" + tabHostname;

  const allProfiles = await browser.storage.local.get(profileGroupName);
  const profilesMatchingHostname = allProfiles[Object.keys(allProfiles)[0]];
  const res = [];

  for (const key in profilesMatchingHostname) {
    if (url.includes(profilesMatchingHostname[key].url)) {
      res.push(profilesMatchingHostname[key]);
    }
  }
  return res;
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

/*
 * Adds buttons for all applicable profiles for current page.
 */
function updateProfilesList() {
  const list = document.getElementById("profList");
  list.innerHTML = "";
  for (var i = 0; i < matchingProfiles.length; i++) {
    const profBtn = document.createElement("button");
    profBtn.innerText = matchingProfiles[i].name;
    if (matchingProfiles[i].isModeOn) {
      profBtn.classList = "profileActiveBtn";
    } else {
      profBtn.classList = "profileInactiveBtn";
    }
    list.appendChild(profBtn);
  }
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
