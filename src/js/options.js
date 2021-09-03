function openTab(tabName) {
  var tabContent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }
  var tabButton = document.getElementsByClassName("tabButton");
  for (i = 0; i < tabButton.length; i++) {
    tabButton[i].className = tabButton[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  document.getElementsByName(tabName)[0].className += " active";
}

function validate() {
  const profileName = document.getElementById("pname").value;
  const nameRegex = new RegExp("[^a-zA-Z0-9_]");
  if (profileName === "" || !!nameRegex.test(profileName)) {
    document.getElementById("invalidCreate").innerText =
      "Invalid profile name, must only contain alphanumerical characters and underscores (no spaces).";
    return false;
  }
  const profileURL = document.getElementById("url").value;
  const urlRegex = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i"
  );
  if (urlRegex === "" || !urlRegex.test(profileURL)) {
    document.getElementById("invalidCreate").innerText =
      "Invalid url, try again.";
    return false;
  }

  return true;
}

function submit() {
  const profileName = document.getElementById("pname").value;
  const profileURL = document.getElementById("url").value;
  const storageName = "profile" + profileName;
  browser.storage.local.set({
    [storageName]: { name: profileName, url: profileURL, isModeOn: false },
  });
  document.getElementById("pname").value = "";
  document.getElementById("url").value = "";
  document.getElementById("invalidCreate").innerText = "";
  document.getElementById("validCreate").innerText =
    "Success, profile " + profileName + " created.";
}

function createProfilesTable() {
  const profilesTableBody = document.getElementById("profilesTableBody");
  // remove any children currently loaded
  const oldTableBody = document.getElementById("profilesTableBody");
  const newTableBody = document.createElement("tbody");
  oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody);

  const allProfiles = browser.storage.local.get();
  allProfiles.then((ps) => {
    for (const key in ps) {
      const profile = ps[key];
      appendProfile(profile.name, profile.url, profile.isModeOn);
    }
  });
}

function appendProfile(name, url, isModeOn) {
  console.log(name + url + isModeOn);

  const profilesTable = document.getElementById("profilesTable");

  let newRow = document.createElement("tr");
  newRow.className = "profilesTableBodyRow";

  let profileName = document.createElement("td");
  profileName.innerText = name;

  let profileURL = document.createElement("td");
  profileURL.innerText = url;

  let profileMode = document.createElement("td");
  profileMode.innerText = isModeOn;

  newRow.append(profileName);
  newRow.append(profileURL);
  newRow.append(profileMode);
  profilesTable.append(newRow);
}

const allTabButtons = document.getElementsByClassName("tabButton");
for (i = 0; i < allTabButtons.length; i++) {
  const name = allTabButtons[i].name;
  allTabButtons[i].addEventListener("click", function () {
    openTab(name);
  });
}
document.getElementById("defaultTab").click();

const submitButton = document.getElementById("submitProfile");
submitButton.addEventListener("click", function () {
  if (validate()) {
    submit();
  }
});

const manageProfilesButton = document.getElementsByName("manageProfiles")[0];
manageProfilesButton.addEventListener("click", function () {
  createProfilesTable();
});
