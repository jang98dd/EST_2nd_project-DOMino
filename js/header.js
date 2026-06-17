const searchBtn =
document.querySelectorAll(".icon-btn")[0];

const cartBtn =
document.querySelectorAll(".icon-btn")[1];

const menuBtn =
document.querySelector(".menu-btn");

const mobileNav =
document.querySelector(".nav-mobile");

const tabletNav =
document.querySelector(".tablet-nav");


menuBtn?.addEventListener("click", () => {

  console.log("메뉴 열기");

});


searchBtn?.addEventListener("click", () => {

  console.log("검색");

});


cartBtn?.addEventListener("click", () => {

  console.log("장바구니");

});

menuBtn.addEventListener("click",()=>{

  if(window.innerWidth < 768){

    mobileNav.classList.add("active");

  }else if(window.innerWidth < 1200){

    tabletNav.classList.add("active");

  }

});

document
.querySelectorAll(".nav-close")
.forEach(btn=>{

  btn.addEventListener("click",()=>{

    mobileNav?.classList.remove("active");
    tabletNav?.classList.remove("active");

  });

});

const desktopNav =
document.querySelector(".desktop-nav");

const gnbItems =
document.querySelectorAll(".gnb__list li");

gnbItems.forEach(item=>{

  item.addEventListener("mouseenter",()=>{

    if(window.innerWidth >= 1200){

      desktopNav.classList.add("active");

    }

  });

});

desktopNav.addEventListener("mouseleave",()=>{

  desktopNav.classList.remove("active");

});