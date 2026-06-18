$(function () {
  // jQuery가 로드되지 않은 환경(예: 메인페이지에서 라이브러리 제외 시)을 위한 안전장치
  const isJQueryAvailable = typeof $ !== 'undefined';

  /* ==========================================
   * 1. 비밀번호 보이기 / 숨기기 토글 (👁)
   * ========================================== */
  const toggleButtons = document.querySelectorAll(".toggle-password");
  if (toggleButtons.length > 0) {
    toggleButtons.forEach(button => {
      button.addEventListener("click", () => {
        const input = button.previousElementSibling;
        if (input) {
          input.type = input.type === "password" ? "text" : "password";
        }
      });
    });
  }

  /* ==========================================
   * 2. jQuery UI Datepicker (생년월일 달력)
   * ========================================== */
  if (isJQueryAvailable && $("#datepicker").length > 0) {
    $("#datepicker").datepicker({
      dateFormat: "yy.mm.dd",
      changeMonth: true,
      changeYear: true,
      yearRange: "1950:2026"
    });
  }

  /* ==========================================
   * 3. 유효성 검사 (Validation) 및 요소 선택
   * ========================================== */
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const passwordCheck = document.querySelector("#passwordCheck");

  const emailError = document.querySelectorAll(".error-message")[0];
  const passwordError = document.querySelectorAll(".error-message")[1];
  const passwordCheckError = document.querySelectorAll(".error-message")[2];


  /* --- 이메일 검증 --- */
  if (email && emailError) {
    email.addEventListener("blur", () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (regex.test(email.value)) {
        emailError.style.display = "none";
      } else {
        emailError.textContent = "이메일 형식에 맞게 작성해주세요";
        emailError.style.display = "block";
      }
    });

    email.addEventListener("input", () => {
      emailError.style.display = "none";
    });
  }


  /* --- 비밀번호 검증 --- */
  if (password && passwordError) {
    password.addEventListener("blur", () => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (regex.test(password.value)) {
        passwordError.style.display = "none";
      } else {
        passwordError.textContent = "영문, 숫자, 특수문자를 포함하여 8자 이상 작성해주세요";
        passwordError.style.display = "block";
      }
    });

    password.addEventListener("input", () => {
      passwordError.style.display = "none";
    });
  }


  /* --- 비밀번호 재확인 검증 --- */
  if (passwordCheck && passwordCheckError && password) {
    passwordCheck.addEventListener("blur", () => {
      if (password.value === passwordCheck.value) {
        passwordCheckError.style.display = "none";
      } else {
        passwordCheckError.textContent = "비밀번호가 일치하지 않습니다";
        passwordCheckError.style.display = "block";
      }
    });

    passwordCheck.addEventListener("input", () => {
      passwordCheckError.style.display = "none";
    });
  }


  /* ==========================================
   * 4. 폼 제출 (Submit) 시 전체 재검사
   * ========================================== */
  const signupForm = document.querySelector("#signupForm");
  if (signupForm && email && password && passwordCheck && emailError && passwordError && passwordCheckError) {
    signupForm.addEventListener("submit", (e) => {
      email.dispatchEvent(new Event("blur"));
      password.dispatchEvent(new Event("blur"));
      passwordCheck.dispatchEvent(new Event("blur"));

      const isEmailValid = emailError.style.display !== "block";
      const isPasswordValid = passwordError.style.display !== "block";
      const isPasswordCheckValid = passwordCheckError.style.display !== "block";

      if (!isEmailValid || !isPasswordValid || !isPasswordCheckValid) {
        e.preventDefault();
      }
    });
  }

});