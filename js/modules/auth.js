document
  .querySelectorAll(".toggle-password")
  .forEach(button => {

    button.addEventListener("click", () => {

      const input =
        button.previousElementSibling;

      input.type =
        input.type === "password"
          ? "text"
          : "password";

    });

  });

if (window.jQuery && document.querySelector("#datepicker")) {

  $(function () {

    $("#datepicker").datepicker({

      dateFormat: "yy.mm.dd",

      changeMonth: true,

      changeYear: true,

      yearRange: "1950:2026"

    });

  });

}

const signupForm =
  document.querySelector("#signupForm");

if (signupForm) {

const email =
  document.querySelector("#email");

const password =
  document.querySelector("#password");

const passwordCheck =
  document.querySelector("#passwordCheck");


const emailError =
  email.parentElement.querySelector(".error-message");

const passwordError =
  password.closest(".form-group")
          .querySelector(".error-message");

const passwordCheckError =
  passwordCheck.closest(".form-group")
               .querySelector(".error-message");


/* 이메일 */

email.addEventListener("blur", () => {

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (regex.test(email.value)) {

    emailError.style.display = "none";

  } else {

    emailError.textContent =
      "이메일 형식에 맞게 작성해주세요";

    emailError.style.display = "block";

  }

});

email.addEventListener("input", () => {

  emailError.style.display = "none";

});


/* 비밀번호 */

password.addEventListener("blur", () => {

  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (regex.test(password.value)) {

    passwordError.style.display = "none";

  } else {

    passwordError.textContent =
      "사용자 이름을 포함해서 작성하지 마시오";

    passwordError.style.display = "block";

  }

});

password.addEventListener("input", () => {

  passwordError.style.display = "none";

});

/* 비밀번호 확인 */

passwordCheck.addEventListener("blur", () => {

  if (password.value === passwordCheck.value) {

    passwordCheckError.style.display = "none";

  } else {

    passwordCheckError.textContent =
      "비밀번호가 일치하지 않습니다";

    passwordCheckError.style.display = "block";

  }

});

passwordCheck.addEventListener("input", () => {

  passwordCheckError.style.display = "none";

});

signupForm.addEventListener("submit", (e) => {

    e.preventDefault();

    email.dispatchEvent(new Event("blur"));
    password.dispatchEvent(new Event("blur"));
    passwordCheck.dispatchEvent(new Event("blur"));

  });

}

/* 로그인 */

const loginForm =
  document.querySelector(".login-form");

if (loginForm) {

  const loginEmail =
    loginForm.querySelector('input[type="email"]');

  const loginPassword =
    document.querySelector("#loginPw");

  const loginError =
    document.querySelector(".login-error");

  loginForm.addEventListener("submit", (e) => {

    e.preventDefault();

    if (
      loginEmail.value.trim() === "" ||
      loginPassword.value.trim() === ""
    ) {

      loginError.innerHTML =
        "아이디(로그인 전화번호, 로그인 전용 아이디) 또는 비밀번호가 잘못 되었습니다.<br>아이디와 비밀번호를 정확히 입력해 주세요.";

      loginError.style.display = "block";

      return;
    }

    loginError.style.display = "none";

  });

}

if (loginForm) {

  loginEmail.addEventListener("input", () => {

    loginError.style.display = "none";

  });

  loginPassword.addEventListener("input", () => {

    loginError.style.display = "none";

  });

}