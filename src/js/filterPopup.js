(async () => {
  // wait for response
  const filterParams = await browser.runtime.sendMessage("getFilterParams");
  let { tabId, frameId, targetElementId } = filterParams;
  document.getElementById("testt").innerText = targetElementId;
})();
