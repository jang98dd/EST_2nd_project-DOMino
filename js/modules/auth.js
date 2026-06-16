const passwordButtons =
document.querySelectorAll(
  ".input-password button"
);

passwordButtons.forEach(button => {

  button.addEventListener("click", () => {

    const input =
    button.previousElementSibling;

    input.type =
      input.type === "password"
      ? "text"
      : "password";

  });

});