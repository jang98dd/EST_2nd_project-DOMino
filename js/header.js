const searchBtn =
document.querySelectorAll(".icon-btn")[0];

const cartBtn =
document.querySelectorAll(".icon-btn")[1];

const menuBtn =
document.querySelector(".menu-btn");


menuBtn?.addEventListener("click", () => {

  console.log("메뉴 열기");

});


searchBtn?.addEventListener("click", () => {

  console.log("검색");

});


cartBtn?.addEventListener("click", () => {

  console.log("장바구니");

});