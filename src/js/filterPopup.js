(async () => {
  const filterParams = await browser.runtime.sendMessage("getFilterParams");
  let { tabId, frameId, targetElementId } = filterParams;
  const elemOuterHTML = document.getElementById("elemOuterHTML");
  const elemClassList = document.getElementById("elemClassList");
  var currParent = -1;
  var parentElems = [];
  var parentElemsClasses = [];

  await browser.tabs.executeScript(tabId, {
    frameId,
    file: "js/contentScript.js",
  });

  let port = browser.tabs.connect(tabId, {
    name: "portFilterPopup",
    frameId,
  });

  // listen for selected element html and classes
  port.onMessage.addListener((msg) => {
    if (msg.action === "returnTargetElements") {
      currParent = 0;
      parentElems = msg.elemsSlicedHTML;
      console.log(parentElems.join("\n"));
      // parentElemsClasses = msg.elemsClassLists;
      elemOuterHTML.innerText = parentElems[0];
      // elemOuterHTML.innerText = parentElems.join("\n");

      // msg.elemClassList.split(" ").forEach((c) => {
      //   const classBtn = document.createElement("button");
      //   classBtn.innerText = c;

      //   classBtn.addEventListener("mouseover", () =>
      //     highlightElementsFromClass(c)
      //   );

      //   classBtn.addEventListener("mouseout", () =>
      //     unhighlightElementsFromClass(c)
      //   );

      //   elemClassList.appendChild(classBtn);
      // });

      // elemOuterHTML.addEventListener("mouseover", function () {
      //   highlightElement(targetElementId);
      // });
      // elemOuterHTML.addEventListener("mouseout", function () {
      //   unhighlightElement(targetElementId);
      // });
    }
  });

  port.postMessage({
    action: "getTargetElements",
    elemId: targetElementId,
  });

  function highlightElement(id) {
    console.log("highlightingElement");
    port.postMessage({
      action: "highlightElement",
      elemId: id,
    });
  }

  function highlightElementsFromClass(className) {
    console.log("BANG");
    port.postMessage({
      action: "highlightElementsFromClass",
      cName: className,
    });
  }

  function unhighlightElementsFromClass(className) {
    console.log("unhighlighting");
    port.postMessage({
      action: "unhighlightElementsFromClass",
      cName: className,
    });
  }

  function unhighlightElement(id) {
    port.postMessage({
      action: "unhighlightElement",
      elemId: id,
    });
  }

  function goUpParent() {
    if (currParent + 1 >= parentElems.length) {
      return;
    }
    currParent++;
    elemOuterHTML.innerText = parentElems[currParent];
  }

  function goDownParent() {
    if (currParent - 1 < 0) {
      return;
    }
    currParent--;
    elemOuterHTML.innerText = parentElems[currParent];
  }

  document
    .getElementById("upParentBtn")
    .addEventListener("click", () => goUpParent());
  document
    .getElementById("downParentBtn")
    .addEventListener("click", () => goDownParent());
})();
