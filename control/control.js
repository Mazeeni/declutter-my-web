function listenForClicks() {
  document.addEventListener("click", (e) => {});
}
var txt = document.createTextNode("asdf.");
var parent = document.getElementById("main-content");
parent.insertBefore(txt, parent.firstChild);
// browser.tabs
//   .executeScript({ file: "/declutterer/declutter.js" })
//   .then(listenForClicks)
//   .catch(reportExecuteScriptError);
