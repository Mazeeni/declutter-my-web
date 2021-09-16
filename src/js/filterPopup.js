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
      parentElemsClasses = msg.elemsClassLists;
      elemOuterHTML.innerText = parentElems[0];

      parentElemsClasses[0].forEach((c) => {
        const classBtn = document.createElement("button");
        classBtn.innerText = c;

        classBtn.addEventListener("mouseover", () =>
          highlightElementsFromClass(c)
        );

        classBtn.addEventListener("mouseout", () =>
          unhighlightElementsFromClass(c)
        );

        elemClassList.appendChild(classBtn);
      });

      elemOuterHTML.addEventListener("mouseover", function () {
        highlightElement(currParent);
      });
      elemOuterHTML.addEventListener("mouseout", function () {
        unhighlightElement(currParent);
      });
    }
  });

  port.postMessage({
    action: "getTargetElements",
    elemId: targetElementId,
  });

  function highlightElement(index) {
    port.postMessage({
      action: "highlightElement",
      index,
    });
  }

  function highlightElementsFromClass(className) {
    port.postMessage({
      action: "highlightElementsFromClass",
      cName: className,
    });
  }

  function unhighlightElementsFromClass(className) {
    port.postMessage({
      action: "unhighlightElementsFromClass",
      cName: className,
    });
  }

  function unhighlightElement(index) {
    port.postMessage({
      action: "unhighlightElement",
      index,
    });
  }

  function goUpParent() {
    if (currParent + 1 >= parentElems.length) {
      return;
    }
    currParent++;
    elemOuterHTML.innerText = parentElems[currParent];
    elemClassList.innerHTML = "";
    parentElemsClasses[currParent].forEach((c) => {
      const classBtn = document.createElement("button");
      classBtn.innerText = c;

      classBtn.addEventListener("mouseover", () =>
        highlightElementsFromClass(c)
      );

      classBtn.addEventListener("mouseout", () =>
        unhighlightElementsFromClass(c)
      );

      elemClassList.appendChild(classBtn);
    });
  }

  function goDownParent() {
    if (currParent - 1 < 0) {
      return;
    }
    currParent--;
    elemOuterHTML.innerText = parentElems[currParent];
    elemClassList.innerHTML = "";
    parentElemsClasses[currParent].forEach((c) => {
      const classBtn = document.createElement("button");
      classBtn.innerText = c;

      classBtn.addEventListener("mouseover", () =>
        highlightElementsFromClass(c)
      );

      classBtn.addEventListener("mouseout", () =>
        unhighlightElementsFromClass(c)
      );

      elemClassList.appendChild(classBtn);
    });
  }

  document
    .getElementById("upParentBtn")
    .addEventListener("click", () => goUpParent());
  document
    .getElementById("downParentBtn")
    .addEventListener("click", () => goDownParent());
})();
