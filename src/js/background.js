var filterParams;

browser.menus.create({
  id: "filter_element",
  title: "Add Element to Filter",
  documentUrlPatterns: ["https://*/*", "http://*/*"],
  contexts: [
    "audio",
    "editable",
    "frame",
    "image",
    "link",
    "page",
    "password",
    "video",
  ],
});

browser.menus.onClicked.addListener(async (info, tab) => {
  filterParams = {
    tabId: tab.id,
    frameId: info.frameId,
    targetElementId: info.targetElementId,
  };
  browser.pageAction.show(tab.id);
  await browser.pageAction.openPopup();
  await browser.pageAction.hide(tab.id);
});

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg === "getFilterParams") {
    return filterParams;
  }
});
