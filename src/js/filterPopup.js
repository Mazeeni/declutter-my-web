/*
 * Script running in the "Page Action" popup.
 * The page is not manually accessible, it is used only for the browser
 * menus functionlity.
 */

const elemOuterHTML = document.getElementById("elemOuterHTML");
const elemClassList = document.getElementById("elemClassList");
var selectedClasses = new Set();
let port = 0;
let currParentIndex = -1;
let parentElemsHTML = [];
let parentElemsClassLists = [];
let tab;
let profileGroupName;
let allGroupProfiles;

/*
 * Injects content script into page.
 * Creates port and requests selected element and its parents
 * through port.
 */
async function onLoad() {
  const filterParams = await browser.runtime.sendMessage("getFilterParams");
  let { tabId, frameId, targetElementId } = filterParams;

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  tab = tabs[0];
  var url = tab.url;

  const tabHostname = new URL(url).hostname.replace(/^(www\.)/, "");
  profileGroupName = "profilesFor" + tabHostname;

  const allProfiles = await browser.storage.local.get(profileGroupName);
  allGroupProfiles = allProfiles[Object.keys(allProfiles)[0]];

  await browser.tabs.executeScript(tabId, {
    frameId,
    file: "js/contentScript.js",
  });

  port = browser.tabs.connect(tabId, {
    name: "portFilterPopup",
    frameId,
  });

  port.onMessage.addListener((msg) => {
    if (msg.action === "returnTargetElements") {
      initialiseTargetElements(msg.elemsSlicedHTML, msg.elemsClassLists);
    }
  });

  port.postMessage({
    action: "getTargetElems",
    elemId: targetElementId,
  });
}

/*
 * Displays a portion of the selected element's HTML as well as a list
 * of its classes as buttons. Hovering over the buttons highlights all
 */
function initialiseTargetElements(msgParentElems, msgElemsClassLists) {
  currParentIndex = 0;
  parentElemsHTML = msgParentElems;
  parentElemsClassLists = msgElemsClassLists;
  elemOuterHTML.innerText = parentElemsHTML[0];

  parentElemsClassLists[0].forEach((className) => {
    const classCheckLabel = document.createElement("label");
    const text = document.createTextNode(className);
    const classCheckBox = document.createElement("input");

    classCheckLabel.classList = "classCheckbox";
    classCheckBox.type = "checkbox";
    classCheckBox.value = className;

    addListenerHighlightElemsFromClass(classCheckLabel, className);
    classCheckLabel.appendChild(classCheckBox);
    classCheckLabel.appendChild(text);

    classCheckBox.addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedClasses.add(e.target.value);
        updateSelectedClasses();
      } else {
        selectedClasses.delete(e.target.value);
        updateSelectedClasses();
      }
    });

    elemClassList.appendChild(classCheckLabel);
  });

  addListenerHighlightElem(elemOuterHTML);

  initialiseAddToProfileBtns();
}

function initialiseAddToProfileBtns() {
  const res = [];

  for (const key in allGroupProfiles) {
    if (tab.url.includes(allGroupProfiles[key].url)) {
      res.push(allGroupProfiles[key]);
    }
  }

  const div = document.getElementById("addToProfileBtns");
  for (var i = 0; i < res.length; i++) {
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add to profile: " + res[i].name;

    const profName = res[i].name;
    addBtn.addEventListener("click", () => {
      addSelectedClassesToProfile(profName);
      browser.runtime.sendMessage({ action: "refreshCSS", tabId: tab.id });
    });
    div.appendChild(addBtn);
  }
}

async function addSelectedClassesToProfile(profName) {
  const blockedClasses = allGroupProfiles[profName].blockedClasses;
  blockedClasses.push(...Array.from(selectedClasses));
  allGroupProfiles[profName].blockedClasses = blockedClasses;
  browser.storage.local.set({
    [profileGroupName]: allGroupProfiles,
  });
  selectedClasses.clear();
  updateSelectedClasses();

  // display valid message
  document.querySelector("#successMessage").classList.remove("hidden");
}

function addListenerHighlightElem(elem) {
  elem.addEventListener("mouseover", () => highlightElem(currParentIndex));
  elem.addEventListener("mouseout", unhighlightAll);
}

function addListenerHighlightElemsFromClass(elem, className) {
  elem.addEventListener("mouseover", () => highlightElemsFromClass(className));
  elem.addEventListener("mouseout", unhighlightAll);
}

function highlightElem(index) {
  port.postMessage({
    action: "highlightElem",
    index,
  });
}

function highlightElemsFromClass(className) {
  port.postMessage({
    action: "highlightElemsFromClass",
    cName: className,
  });
}

function unhighlightAll() {
  port.postMessage({
    action: "unhighlightAll",
  });
}

/*
 * Display information on either the parent or child of currently
 * selected element.
 */
function switchParent(up) {
  if (
    (up && currParentIndex + 1 >= parentElemsHTML.length) ||
    (!up && currParentIndex - 1 < 0)
  ) {
    return;
  }
  up ? currParentIndex++ : currParentIndex--;
  elemOuterHTML.innerText = parentElemsHTML[currParentIndex];
  elemClassList.innerHTML = "";
  parentElemsClassLists[currParentIndex].forEach((className) => {
    const classCheckLabel = document.createElement("label");
    const text = document.createTextNode(className);
    const classCheckBox = document.createElement("input");

    classCheckBox.type = "checkbox";
    classCheckBox.value = className;

    addListenerHighlightElemsFromClass(classCheckLabel, className);

    classCheckBox.addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedClasses.add(e.target.value);
        updateSelectedClasses();
      } else {
        selectedClasses.delete(e.target.value);
        updateSelectedClasses();
      }
    });

    if (selectedClasses.has(classCheckBox.value)) {
      classCheckBox.checked = true;
    }

    classCheckLabel.appendChild(classCheckBox);
    classCheckLabel.appendChild(text);
    elemClassList.appendChild(classCheckLabel);
  });
}

function updateSelectedClasses() {
  document.getElementById("selectedClasses").innerText =
    Array.from(selectedClasses).join(" ");
}

document
  .getElementById("upParentBtn")
  .addEventListener("click", () => switchParent(true));
document
  .getElementById("downParentBtn")
  .addEventListener("click", () => switchParent(false));

onLoad();
