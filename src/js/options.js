import { URL_REGEXP, PROF_NAME_REGEXP } from "./constants.js";

// Values: manageProfiles, createProfile, about.
const DEFAULT_PAGE = "manageProfiles";

/**
 * Creates event listeners for tabs and buttons.
 * Opens default page.
 */
function onLoad() {
  // tab buttons events
  const allTabButtons = document.getElementsByClassName("tabButton");
  var i;
  for (i = 0; i < allTabButtons.length; i++) {
    const name = allTabButtons[i].name;
    allTabButtons[i].addEventListener("click", function () {
      openTab(name);
    });
  }

  // submit button event
  const submitButton = document.getElementById("submitProfile");
  submitButton.addEventListener("click", function () {
    if (validateProfileCreate()) {
      submitNewProfile();
    }
  });

  document
    .getElementById("submitProfileUpdate")
    .addEventListener("click", () => {
      validateProfileUpdate();
    });

  // open default page
  document.getElementById(DEFAULT_PAGE + "Btn").click();
}

/**
 * Tab switching functionality.
 */
function openTab(tabName) {
  if (tabName === "manageProfiles") {
    createProfilesTable();
  }

  let i;
  let tabContent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }
  let tabButton = document.getElementsByClassName("tabButton");
  for (i = 0; i < tabButton.length; i++) {
    tabButton[i].className = tabButton[i].className.replace(" active", "");
  }

  document.getElementById([tabName + "Tab"]).style.display = "block";
  document.getElementById([tabName + "Btn"]).className += " active";
}

/**
 * Validate the "Create a Profile" form, writing error messages
 * to page if invalid.
 */
function validateProfileCreate() {
  const profileName = document.getElementById("pname").value;

  if (profileName === "" || !!PROF_NAME_REGEXP.test(profileName)) {
    document.getElementById("invalidCreate").innerText =
      "Invalid profile name, must only contain alphanumerical characters and underscores (no spaces).";
    return false;
  }
  const profileURL = document.getElementById("url").value;
  if (!URL_REGEXP.test(profileURL)) {
    document.getElementById("invalidCreate").innerText =
      "Invalid url, try again.";
    return false;
  }

  return true;
}

async function validateProfileUpdate() {
  const profileName = document.getElementById("profileUpdateName").value;
  const allProfiles = await browser.storage.local.get();
  let groupName = "";
  let found = false;
  for (const groupKey in allProfiles) {
    for (const profileKey in allProfiles[groupKey]) {
      if (profileName === profileKey) {
        found = true;
        groupName = groupKey;
      }
    }
    if (found) {
      break;
    }
  }
  if (!found) {
    if (profileName === "" || !!PROF_NAME_REGEXP.test(profileName)) {
      document.getElementById("invalidUpdate").innerText =
        "Invalid profile name, must only contain alphanumerical characters and underscores (no spaces).";
      return false;
    } else {
      document.getElementById("invalidUpdate").innerText =
        "Profile with that name not found.";
    }
  } else {
    document.getElementById("invalidUpdate").innerText = "";
    document.getElementById("validUpdate").innerText =
      "Profile updated, refreshing...";

    var profileGroup = await browser.storage.local.get(groupName);
    profileGroup = profileGroup[Object.keys(profileGroup)[0]];
    const newURL = document.getElementById("profileUpdateURL").value;
    var newClasses = document
      .getElementById("profileUpdateClasses")
      .value.split(" ");
    if (newClasses[0] === "") {
      newClasses = [];
    }
    console.log(newClasses.length);
    profileGroup[profileName] = {
      name: profileName,
      url: newURL === "" ? profileGroup[profileName].url : newURL,
      isModeOn: profileGroup[profileName].isModeOn,
      blockedClasses:
        newClasses === [""]
          ? profileGroup[profileName].blockedClasses
          : newClasses,
    };

    await browser.storage.local.set({
      [groupName]: profileGroup,
    });
    document.getElementById("manageProfilesBtn").click();
  }

  return;
}

/*
 * Submit new profile.
 * Add to storage.
 */
function submitNewProfile() {
  const profileName = document.getElementById("pname").value;
  const profileURL = document.getElementById("url").value;
  var profileStrippedProtocol = profileURL;
  if (profileURL.search(/^http[s]?\:\/\//) == -1) {
    profileStrippedProtocol = "http://" + profileURL;
  }
  const profileURLDomain = new URL(profileStrippedProtocol).hostname;
  console.log(profileURLDomain);

  const storageName = "profilesFor" + profileURLDomain;
  const storage = browser.storage.local.get(storageName);
  storage.then((s) => {
    if (Object.entries(s).length === 0) {
      const newProfilesGroup = {
        [profileName]: {
          name: profileName,
          url: profileURL,
          isModeOn: false,
          blockedClasses: [],
        },
      };
      browser.storage.local.set({
        [storageName]: newProfilesGroup,
      });
    } else {
      const justProfileGroup = s[Object.keys(s)[0]];
      justProfileGroup[profileName] = {
        name: profileName,
        url: profileURL,
        isModeOn: false,
        blockedClasses: [],
      };

      browser.storage.local.set({ [storageName]: justProfileGroup });
    }
  });

  // clear form after submission complete
  document.getElementById("pname").value = "";
  document.getElementById("url").value = "";
  document.getElementById("invalidCreate").innerText = "";
  document.getElementById("validCreate").innerText =
    "Success, profile " + profileName + " created.";
}

/*
 * Creates table under "Manage Profiles Tab".
 * Adds row for each profile defined.
 */
function createProfilesTable() {
  var myTable = document.getElementById("profilesTable");
  var rowCount = myTable.rows.length;
  for (var x = rowCount - 1; x > 0; x--) {
    myTable.deleteRow(x);
  }

  const allProfiles = browser.storage.local.get();
  allProfiles.then((profGroup) => {
    for (const groupKey in profGroup) {
      for (const profileKey in profGroup[groupKey]) {
        const profile = profGroup[groupKey][profileKey];
        appendProfile(
          profile.name,
          profile.url,
          profile.isModeOn,
          profile.blockedClasses,
          groupKey
        );
      }
    }
  });
}

/*
 * Used when creating Profiles Table under "Manage Profiles Tab".
 * Appends a profile to the table.
 */
function appendProfile(name, url, isModeOn, blockedClasses, groupName) {
  const profilesTable = document.getElementById("profilesTable");

  let newRow = document.createElement("tr");
  newRow.className = "profilesTableBodyRow";

  let profileName = document.createElement("td");
  profileName.innerText = name;

  let profileURL = document.createElement("td");
  profileURL.innerText = url;

  let profileMode = document.createElement("td");
  profileMode.innerText = isModeOn;

  let profileBlocked = document.createElement("td");
  profileBlocked.innerText = blockedClasses.join(" ");

  let profileRemove = document.createElement("td");
  // let deleteBtn = document.createElement("button");

  let deleteImg = document.createElement("img");
  deleteImg.src = "icons/delete.svg";
  deleteImg.alt = "Delete";
  deleteImg.classList += "deleteProfile";
  deleteImg.addEventListener("click", function () {
    deleteProfile(name, groupName);
  });

  profileRemove.append(deleteImg);
  newRow.append(profileName);
  newRow.append(profileURL);
  newRow.append(profileMode);
  newRow.append(profileBlocked);
  newRow.append(profileRemove);
  profilesTable.append(newRow);
}

/*
 * Remove a profile from storage and reloads table.
 */
async function deleteProfile(name, groupName) {
  var profileGroup = await browser.storage.local.get(groupName);
  profileGroup = profileGroup[Object.keys(profileGroup)[0]];
  delete profileGroup[name];
  await browser.storage.local.set({
    [groupName]: profileGroup,
  });
  document.getElementById("manageProfilesBtn").click();
}

document.addEventListener("DOMContentLoaded", onLoad);

/************ DEBUGGING STORAGE ************/

function printStorage() {
  console.log("Current storage:");
  const allStorage = browser.storage.local.get();
  allStorage.then((s) => console.log(s));
}

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
