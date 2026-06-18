const menuBtn =
document.querySelector(".menu-btn");

const mobileNav =
document.querySelector(".nav-mobile");

const tabletNav =
document.querySelector(".tablet-nav");

const closeBtns =
document.querySelectorAll(".nav-close");

const header =
document.querySelector(".header");

const desktopNav =
document.querySelector(".desktop-nav");

/* ==========================
모바일 / 태블릿 메뉴 열기
========================== */

menuBtn?.addEventListener("click", () => {

if (window.innerWidth < 768) {

mobileNav?.classList.add("active");


} else if (window.innerWidth < 1200) {

tabletNav?.classList.add("active");


}

});

/* ==========================
모바일 / 태블릿 메뉴 닫기
========================== */

closeBtns.forEach(btn => {

btn.addEventListener("click", () => {

mobileNav?.classList.remove("active");

tabletNav?.classList.remove("active");


});

});

/* ==========================
모바일 서브메뉴 토글
========================== */

document
.querySelectorAll(".has-sub button")
.forEach(btn => {


btn.addEventListener("click", () => {

  const subMenu =
    btn.nextElementSibling;

  if (!subMenu) return;

  subMenu.style.display =
    subMenu.style.display === "block"
      ? "none"
      : "block";

});


});

/* ==========================
데스크탑 메가메뉴
========================== */

const gnbItems =
document.querySelectorAll(".gnb__list li");

gnbItems.forEach(item => {

item.addEventListener("mouseenter", () => {

if (window.innerWidth >= 1200) {

  desktopNav?.classList.add("active");

}


});

});

header?.addEventListener("mouseenter", () => {

if (window.innerWidth >= 1200) {

desktopNav?.classList.add("active");

}

});

desktopNav?.addEventListener("mouseenter", () => {

desktopNav?.classList.add("active");

});

desktopNav?.addEventListener("mouseleave", () => {

desktopNav?.classList.remove("active");

});

header?.addEventListener("mouseleave", () => {

if (
window.innerWidth >= 1200 &&
desktopNav &&
!desktopNav.matches(":hover")
) {

desktopNav.classList.remove("active");


}

});