(async () => {
  const filterParams = await browser.runtime.sendMessage("getFilterParams");
  let { tabId, frameId, targetElementId } = filterParams;
  const elemOuterHTML = document.getElementById("elemOuterHTML");
  const elemClassList = document.getElementById("elemClassList");

  await browser.tabs.executeScript(tabId, {
    runAt: "document_start",
    frameId,
    file: "js/contentScript.js",
  });

  let port = browser.tabs.connect(tabId, {
    name: "portFilterPopup",
    frameId,
  });

  // listen for selected element html and classes
  port.onMessage.addListener((msg) => {
    if (msg.action === "returnTargetElement") {
      elemOuterHTML.innerText = msg.elemOuterHTML;
      elemClassList.innerText = msg.elemClassList;
      elemOuterHTML.addEventListener("mouseover", function () {
        highlightElement();
      });
      elemOuterHTML.addEventListener("mouseout", function () {
        unhighlightElement();
      });
    }
  });

  port.postMessage({
    action: "getTargetElement",
    elemId: targetElementId,
  });

  function highlightElement() {
    port.postMessage({
      action: "highlightElement",
      elemId: targetElementId,
    });
  }

  function unhighlightElement() {
    port.postMessage({
      action: "unhighlightElement",
      elemId: targetElementId,
    });
  }
})();
