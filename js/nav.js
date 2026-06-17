document
.querySelectorAll(".has-sub button")
.forEach(btn => {

  btn.addEventListener("click", () => {

    const menu =
      btn.nextElementSibling;

    menu.classList.toggle("open");

    menu.style.display =
      menu.classList.contains("open")
        ? "block"
        : "none";

  });

});