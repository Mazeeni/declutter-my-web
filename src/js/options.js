import { URL_REGEXP, PROF_NAME_REGEXP } from "./constants.js";

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
    if (validate()) {
      submit();
    }
  });

  // open default page
  document.getElementById("manageProfilesBtn").click();
}

/**
 * Tab switching functionality.
 */
function openTab(tabName) {
  if (tabName === "manageProfiles") {
    createProfilesTable();
  }

  var i;
  var tabContent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }
  var tabButton = document.getElementsByClassName("tabButton");
  for (i = 0; i < tabButton.length; i++) {
    tabButton[i].className = tabButton[i].className.replace(" active", "");
  }

  document.getElementById([tabName + "Tab"]).style.display = "block";
  document.getElementById([tabName + "Btn"]).className += " active";
}

function validate() {
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

function submit() {
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
    console.log(s);
    if (Object.entries(s).length === 0) {
      console.log("NADA");
      const newProfilesGroup = {
        [profileName]: {
          name: profileName,
          url: profileURL,
          isModeOn: false,
        },
      };
      browser.storage.local.set({
        [storageName]: newProfilesGroup,
      });
    } else {
      const justProfileGroup = s[Object.keys(s)[0]];
      console.log("FOUND");
      console.log(s);
      justProfileGroup[profileName] = {
        name: profileName,
        url: profileURL,
        isModeOn: false,
      };
      console.log(justProfileGroup);

      // s[profileName] = {
      //   name: profileName,
      //   url: profileURL,
      //   isModeOn: false,
      // };
      browser.storage.local.set({ [storageName]: justProfileGroup });
    }
  });

  document.getElementById("pname").value = "";
  document.getElementById("url").value = "";
  document.getElementById("invalidCreate").innerText = "";
  document.getElementById("validCreate").innerText =
    "Success, profile " + profileName + " created.";

  return;

  // const storageName = "profile" + profileName;
  // browser.storage.local.set({
  //   [storageName]: { name: profileName, url: profileURL, isModeOn: false },
  // });
}

function createProfilesTable() {
  var myTable = document.getElementById("profilesTable");
  var rowCount = myTable.rows.length;
  for (var x = rowCount - 1; x > 0; x--) {
    myTable.deleteRow(x);
  }

  const allProfiles = browser.storage.local.get();
  allProfiles.then((ps) => {
    for (const key in ps) {
      const profile = ps[key];
      appendProfile(profile.name, profile.url, profile.isModeOn);
    }
  });
}

function appendProfile(name, url, isModeOn) {
  const profilesTable = document.getElementById("profilesTable");

  let newRow = document.createElement("tr");
  newRow.className = "profilesTableBodyRow";

  let profileName = document.createElement("td");
  profileName.innerText = name;

  let profileURL = document.createElement("td");
  profileURL.innerText = url;

  let profileMode = document.createElement("td");
  profileMode.innerText = isModeOn;

  let profileRemove = document.createElement("td");
  // let deleteBtn = document.createElement("button");

  let deleteImg = document.createElement("img");
  deleteImg.src = "icons/delete.svg";
  deleteImg.alt = "Delete";
  deleteImg.classList += "deleteProfile";
  // deleteBtn.innerHTML = "<img src='../icons/delete.svg' alt='Delete'/>";
  // console.log(deleteBtn.outerHTML);
  deleteImg.addEventListener("click", function () {
    deleteProfile(name);
  });

  profileRemove.append(deleteImg);
  // deleteBtn.append(deleteImg);
  // removeProfile.innerHTML = newRow.append(profileName);

  newRow.append(profileName);
  newRow.append(profileURL);
  newRow.append(profileMode);
  newRow.append(profileRemove);
  profilesTable.append(newRow);
}

function deleteProfile(name) {
  const deleteProfile = browser.storage.local.remove(["profile" + name]);
  deleteProfile.then(() => {
    document.getElementById("manageProfilesBtn").click();
  });
}

document.addEventListener("DOMContentLoaded", onLoad);
