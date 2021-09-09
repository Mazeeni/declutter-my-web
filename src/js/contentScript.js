(() => {
  if (window.hasRunContentScriptOnce === true) return;
  window.hasRunContentScriptOnce = true;

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== "portFilterPopup") return;

    port.onMessage.addListener((msg) => {
      if (msg.action === "getTargetElement") {
        let elem = browser.menus.getTargetElement(msg.elemId);
        const elemOuterHTML = elem.outerHTML;
        const elemClassList = elem.classList.toString();
        port.postMessage({
          action: "returnTargetElement",
          elemOuterHTML,
          elemClassList,
        });
      }
    });

    var highlightedArea;
    port.onMessage.addListener((msg) => {
      if (msg.action === "highlightElement") {
        let boundingRect = browser.menus
          .getTargetElement(msg.elemId)
          .getBoundingClientRect();
        highlightedArea = document.createElement("div");
        highlightedArea.style.top = boundingRect.top + "px";
        highlightedArea.style.left = boundingRect.left + "px";
        highlightedArea.style.width = boundingRect.width + "px";
        highlightedArea.style.height = boundingRect.height + "px";
        highlightedArea.style.zIndex = "2147483647";
        highlightedArea.style.position = "fixed";

        highlightedArea.style.outline = "2px dotted red";
        highlightedArea.style.backgroundColor = "rgba(100, 0, 0, 0.3)";
        highlightedArea.style.pointerEvents = "none";

        (document.body || document.documentElement).appendChild(
          highlightedArea
        );
      }
    });
  });
})();
