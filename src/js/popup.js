/*
 * Script running in the toolbar popup.
 */

import { URL_REGEXP } from "./constants.js";

var matchingProfiles = [];
var matchingProfilesStatuses = [];

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
          matchingProfiles.push(...ps);
          updateProfilesList();
        } else {
          popupShowNoProfiles();
        }
      });
    }
  });
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
    const index = i;
    profBtn.addEventListener("click", () => {
      switchProfileStatus(index);
    });
    list.appendChild(profBtn);
  }
}

async function switchProfileStatus(index) {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  const tabHostname = new URL(tabs[0].url).hostname.replace(/^(www\.)/, "");
  const profileGroupName = "profilesFor" + tabHostname;

  const allProfiles = await browser.storage.local.get(profileGroupName);
  var profilesMatchingHostname = allProfiles[Object.keys(allProfiles)[0]];

  const profile = matchingProfiles[index];
  profile.isModeOn = !profile.isModeOn;

  profilesMatchingHostname[matchingProfiles[index].name] = profile;

  await browser.storage.local.set({
    [profileGroupName]: profilesMatchingHostname,
  });

  updateProfilesList();
  browser.runtime.sendMessage({ action: "refreshCSS", tabId: tabs[0].id });
}

function popupShowInvalidPage() {
  document.querySelector("#popup-page-invalid").classList.remove("hidden");
}

function popupShowNoProfiles() {
  document.querySelector("#popup-profile-invalid").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", onLoad);

function debugStorage() {
  console.log("Current storage:");
  const allStorage = browser.storage.local.get();
  allStorage.then((s) => console.log(s));
}

debugStorage();
// setStorage();

async function setStorage() {
  let profiles = await browser.storage.local.get("profilesForbbc.co.uk");
  profiles = profiles[Object.keys(profiles)[0]];
  delete profiles["undefined"];
  await browser.storage.local.set({
    "profilesForbbc.co.uk": profiles,
  });
}

function clearStorage() {
  browser.storage.local.clear();
}
