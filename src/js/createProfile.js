function openTab(tabName) {
  // Declare all variables
  var i, tabContent, tabButton;

  // Get all elements with class="tabContent" and hide them
  tabContent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Get all elements with class="tabButton" and remove the class "active"
  tabButton = document.getElementsByClassName("tabButton");
  for (i = 0; i < tabButton.length; i++) {
    tabButton[i].className = tabButton[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  // console.log(document.getElementsByName(tabName)[0].className);
  document.getElementsByName(tabName)[0].className += " active";
}

const allTabButtons = document.getElementsByClassName("tabButton");
for (i = 0; i < allTabButtons.length; i++) {
  const name = allTabButtons[i].name;
  allTabButtons[i].addEventListener("click", function () {
    openTab(name);
  });
}
document.getElementById("defaultTab").click();
