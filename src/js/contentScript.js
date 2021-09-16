(() => {
  if (window.hasRunContentScriptOnce === true) return;
  window.hasRunContentScriptOnce = true;

  var targetElements = [];

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== "portFilterPopup") return;

    port.onMessage.addListener((msg) => {
      if (msg.action === "getTargetElements") {
        let elem = browser.menus.getTargetElement(msg.elemId);
        targetElements = [];
        while (elem) {
          targetElements.push(elem);
          elem = elem.parentElement;
        }

        let elemsSlicedHTML = targetElements.map((e) => {
          return e.outerHTML.slice(0, 150);
        });

        let elemsClassLists = targetElements.map((e) => {
          return [...e.classList];
        });

        port.postMessage({
          action: "returnTargetElements",
          elemsSlicedHTML,
          elemsClassLists,
        });
      }
    });

    var highlightedAreas = [];
    port.onMessage.addListener((msg) => {
      if (msg.action === "highlightElement") {
        highlightElement(targetElements[msg.index]);
      } else if (msg.action === "highlightElementsFromClass") {
        var elems = document.getElementsByClassName(msg.cName);
        for (var i = 0; i < elems.length; i++) {
          highlightElement(elems[i]);
        }
      } else if (msg.action === "unhighlightElement") {
        for (var i = 0; i < highlightedAreas.length; i++) {
          highlightedAreas[i].remove();
        }
        highlightedAreas = [];
      } else if (msg.action === "unhighlightElementsFromClass") {
        for (var i = 0; i < highlightedAreas.length; i++) {
          highlightedAreas[i].remove();
        }
        highlightedAreas = [];
      }
    });

    function highlightElement(domElem) {
      let boundingRect = domElem.getBoundingClientRect();
      var highlightedArea = document.createElement("div");
      highlightedArea.style.top = boundingRect.top + "px";
      highlightedArea.style.left = boundingRect.left + "px";
      highlightedArea.style.width = boundingRect.width + "px";
      highlightedArea.style.height = boundingRect.height + "px";
      highlightedArea.style.zIndex = "2147483647";
      highlightedArea.style.position = "fixed";

      highlightedArea.style.outline = "2px dotted red";
      highlightedArea.style.backgroundColor = "rgba(100, 0, 0, 0.3)";
      highlightedArea.style.pointerEvents = "none";

      (document.body || document.documentElement).appendChild(highlightedArea);

      highlightedAreas.push(highlightedArea);
    }
  });
})();
