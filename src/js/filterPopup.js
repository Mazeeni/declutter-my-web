(async () => {
  // wait for response
  const filterParams = await browser.runtime.sendMessage("getFilterParams");
  let { tabId, frameId, targetElementId } = filterParams;
  const elemOuterHTML = document.getElementById("elemOuterHTML");
  const elemClassList = document.getElementById("elemClassList");

  // inject content script into current tab
  await browser.tabs.executeScript(tabId, {
    runAt: "document_start",
    frameId,
    file: "js/contentScript.js",
  });

  // connect to content script
  let port = browser.tabs.connect(tabId, {
    name: "portFilterPopup",
    frameId,
  });

  port.onMessage.addListener((msg) => {
    if (msg.action === "returnTargetElement") {
      elemOuterHTML.innerText = msg.elemOuterHTML;
      elemClassList.innerText = msg.elemClassList;
    }
  });

  port.postMessage({
    action: "getTargetElement",
    elemId: targetElementId,
  });

  port.postMessage({
    action: "highlightElement",
    elemId: targetElementId,
  });
})();
