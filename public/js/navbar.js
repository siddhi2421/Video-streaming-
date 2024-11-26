document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("navbarNavAltMarkup");
    const toggler = document.querySelector(".navbar-toggler");
  
    toggler.addEventListener("click", function () {
      sidebar.classList.toggle("show");
    });
  });