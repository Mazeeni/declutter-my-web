/**
 * Script running in the toolbar popup.
 */

import { URL_REGEXP } from "./constants.js";

let matchingProfiles = [];
let tab;

/**
 * Finds and displays all profiles applicable to current page.
 */
async function onLoad() {
  const optionsBtn = document.getElementById("optionsBtn");
  optionsBtn.addEventListener("click", function () {
    browser.tabs.create({
      url: "options.html",
    });
  });

  tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];

  if (!URL_REGEXP.test(tab.url)) {
    showPageInvalidURL();
  } else {
    const profs = findMatchingProfiles(tab.url);
    profs.then((ps) => {
      if (ps.length > 0) {
        matchingProfiles.push(...ps);
        updateProfilesList();
        showPageProfilesFound();
      } else {
        showPageNoProfilesFound();
      }
    });
  }

  /**
   * Change popup page contents according to URL validity and if profiles exist.
   */
  function showPageProfilesFound() {
    document.querySelector("#popup-profile-valid").classList.remove("hidden");
  }

  function showPageNoProfilesFound() {
    document.querySelector("#popup-profile-invalid").classList.remove("hidden");
  }

  function showPageInvalidURL() {
    document.querySelector("#popup-page-invalid").classList.remove("hidden");
  }
}

/**
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

/**
 * Add a button for each profile applicable to current page.
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

/**
 * Switches the provided profile's status in storage.
 * Profile is specified by index into the variable "matchingProfiles".
 */
async function switchProfileStatus(index) {
  const tabHostname = new URL(tab.url).hostname.replace(/^(www\.)/, "");
  const profileGroupName = "profilesFor" + tabHostname;

  const allProfiles = await browser.storage.local.get(profileGroupName);
  let profilesMatchingHostname = allProfiles[Object.keys(allProfiles)[0]];

  if (index >= matchingProfiles.length) {
    return;
  }
  const profile = matchingProfiles[index];
  profile.isModeOn = !profile.isModeOn;

  profilesMatchingHostname[matchingProfiles[index].name] = profile;

  await browser.storage.local.set({
    [profileGroupName]: profilesMatchingHostname,
  });

  updateProfilesList();
  browser.runtime.sendMessage({ action: "refreshCSS", tabId: tab.id });
}

document.addEventListener("DOMContentLoaded", onLoad);
