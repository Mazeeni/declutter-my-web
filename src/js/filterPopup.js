/*
 * Script running in the "Page Action" popup.
 * The page is not manually accessible, it is used only for the browser
 * menus functionlity.
 */

const elemOuterHTML = document.getElementById("elemOuterHTML");
const elemClassList = document.getElementById("elemClassList");
var port = 0;
var checked = 0;
var currParentIndex = -1;
var parentElemsHTML = [];
var parentElemsClassLists = [];

/*
 * Injects content script into page.
 * Creates port and requests selected element and its parents
 * through port.
 */
async function onLoad() {
  const filterParams = await browser.runtime.sendMessage("getFilterParams");
  let { tabId, frameId, targetElementId } = filterParams;

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
      console.log(msg.elemClassLists);
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
  console.log("initialiseTargetElements");
  currParentIndex = 0;
  parentElemsHTML = msgParentElems;
  parentElemsClassLists = msgElemsClassLists;
  elemOuterHTML.innerText = parentElemsHTML[0];

  parentElemsClassLists[0].forEach((className) => {
    const classCheckLabel = document.createElement("label");
    const text = document.createTextNode(className);
    const classCheckBox = document.createElement("input");

    classCheckBox.type = "checkbox";
    classCheckBox.value = className;

    addListenerHighlightElemsFromClass(classCheckLabel, className);
    classCheckLabel.appendChild(classCheckBox);
    classCheckLabel.appendChild(text);

    classCheckBox.addEventListener("change", (e) => {
      if (e.target.checked) {
        checked++;
        if (checked === 1) {
          disableParentNav();
        }
      } else {
        checked--;
        if (checked === 0) {
          enableParentNav();
        }
      }
    });

    elemClassList.appendChild(classCheckLabel);
  });

  addListenerHighlightElem(elemOuterHTML);
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

function enableParentNav() {
  document.getElementById("upParentBtn").disabled = false;
  document.getElementById("downParentBtn").disabled = false;
}

function disableParentNav() {
  document.getElementById("upParentBtn").disabled = true;
  document.getElementById("downParentBtn").disabled = true;
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
        checked++;
        if (checked === 1) {
          disableParentNav();
        }
      } else {
        checked--;
        if (checked === 0) {
          enableParentNav();
        }
      }
    });

    classCheckLabel.appendChild(classCheckBox);
    classCheckLabel.appendChild(text);
    elemClassList.appendChild(classCheckLabel);
  });
  checked = 0;
}

document
  .getElementById("upParentBtn")
  .addEventListener("click", () => switchParent(true));
document
  .getElementById("downParentBtn")
  .addEventListener("click", () => switchParent(false));

onLoad();
