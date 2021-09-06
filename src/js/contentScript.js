(() => {
  if (window.hasRunContentScriptOnce === true) return;
  window.hasRunContentScriptOnce = true;

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== "portFilterPopup") return;

    port.onMessage.addListener((msg) => {
      if (msg.action === "getTargetElement") {
        let elem = browser.menus.getTargetElement(msg.elemId);
        console.log(elem.outerHTML);
      }
    });
  });
})();
