console.log("Script declutterer.js ran");

function hideElemByClassCSS(cclass) {
  return (
    `.` +
    cclass +
    `{
      display: none;
    }`
  );
}

const elemClassesToHide = [
  "c-global-header",
  "l-col__sidebar",
  "c-social-buttons",
  "m-ad",
  "connatix-article-desktop",
  "ob-widget-section",
  "c-tab-bar",
  "c-footer",
  "c-nextclick",
  "tab-bar-fixed",
  "connatix-feature-desktop-packaged-content",
  "c-comments",
  "p-comment-notification",
];

/**
 * Triggered on storage change.
 */
function updateAfterStorageChange(changes) {
  let changedItems = Object.keys(changes);

  for (let item of changedItems) {
    if (item == "isFocus") {
      console.log("Focus changed detected by background.js");
      updateFocus();
    }
  }
  // then updateFocus()
}

/**
 * Updates all relevant tabs currently active.
 */
function updateFocus() {
  const isFocus = browser.storage.sync.get("isFocus");

  const allTabs = browser.tabs.query({});
  allTabs.then((allTabs) =>
    allTabs.forEach((tab) => {
      if (tab.url.includes("theverge.com/2")) {
        isFocus.then((f) => {
          if (f.isFocus) {
            focusOn(tab);
          } else {
            focusOff(tab);
          }
        });
      }
    })
  );
}

// removes unnecessary elements
function focusOn(tab) {
  elemClassesToHide.forEach((c) => {
    browser.tabs.insertCSS(tab.id, { code: hideElemByClassCSS(c) });
  });
}

// shows previously removed elements
function focusOff(tab) {
  elemClassesToHide.forEach((c) => {
    browser.tabs.removeCSS(tab.id, { code: hideElemByClassCSS(c) });
  });
}

browser.storage.onChanged.addListener(updateAfterStorageChange);
