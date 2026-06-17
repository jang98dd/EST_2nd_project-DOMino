const toggleButtons =
document.querySelectorAll(
".toggle-password"
);

toggleButtons.forEach(btn => {

btn.addEventListener("click", () => {

const input =
  btn.previousElementSibling;

input.type =
  input.type === "password"
    ? "text"
    : "password";


});

});
