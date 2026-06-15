const menuBtn =
document.querySelector(".menu-btn");

const closeBtn =
document.querySelector(".close-btn");

const mobileMenu =
document.querySelector(".mobile-menu");

const megaMenu =
document.querySelector(".mega-menu");

menuBtn?.addEventListener("click", () => {

  if(window.innerWidth >= 1200){

    megaMenu.classList.toggle("active");

  }else{

    mobileMenu.classList.add("active");

  }

});

closeBtn?.addEventListener("click", () => {

  mobileMenu.classList.remove("active");

});

const accordions =
document.querySelectorAll(".accordion");

accordions.forEach(btn => {

  btn.addEventListener("click", () => {

    const panel =
    btn.nextElementSibling;

    panel.style.display =
      panel.style.display === "block"
      ? "none"
      : "block";

  });

});