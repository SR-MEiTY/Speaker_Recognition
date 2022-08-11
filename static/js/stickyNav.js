/*
* This script has been generated for the "Speaker Recognition System"
* The original author of the script is
* Swapnil S Sontakke, Project Associate, IIIT, Dharwad
* Year: May, 2022
*/
document.addEventListener('DOMContentLoaded', function()
{
  // When the event DOMContentLoaded occurs, it is safe to access the DOM
  // When the user scrolls the page, execute myFunction 
  window.addEventListener('scroll', myFunctionForSticky);

  // Get the navbar
  var navbar = document.getElementById("navbar");

  // Get the offset position of the navbar
  var sticky = navbar.offsetTop;

  // Add the sticky class to the navbar when you reach its scroll position. 
  // Remove "sticky" when you leave the scroll position
  function myFunctionForSticky()
  {
    if (window.pageYOffset >= sticky) {
      navbar.classList.add("stickyNav");
    } else {
      navbar.classList.remove("stickyNav");
    }
  }
})