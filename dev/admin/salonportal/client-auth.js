/**
 * Connexion / inscription web client — reprise réservation (sessionStorage).
 */
(function () {
  const cfg = window.SKEDISY_CLIENT_AUTH;
  if (!cfg) return;

  const form = document.getElementById("authForm");
  const notice = document.getElementById("authNotice");
  const submitBtn = document.getElementById("authSubmit");

  function showNotice(type, message) {
    if (!notice) return;
    notice.textContent = message;
    notice.className = `sq-auth-notice sq-auth-notice--${type}`;
    notice.classList.remove("sq-auth-notice--hidden");
  }

  function setWebUser(user) {
    if (!user) return;
    sessionStorage.setItem(
      "skedisy_web_user",
      JSON.stringify({
        id: String(user._id || user.id),
        fname: user.fname || "",
        lname: user.lname || "",
        email: user.email || "",
        mobile: user.mobile || "",
      })
    );
  }

  function onSuccess(user, message) {
    setWebUser(user);
    sessionStorage.setItem("skedisy_resume_booking", "1");
    showNotice("success", message);
    submitBtn.disabled = true;
    setTimeout(() => {
      window.location.href = cfg.returnPath || "/";
    }, 600);
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("authEmail")?.value.trim();
    const mobile = document.getElementById("authMobile")?.value.trim();
    const password = document.getElementById("authPassword")?.value || "";

    if (!email || !password) {
      showNotice("error", cfg.copy.genericError);
      return;
    }

    submitBtn.disabled = true;
    const prevLabel = submitBtn.textContent;
    submitBtn.textContent =
      cfg.mode === "login" ? cfg.copy.signingIn : cfg.copy.creatingAccount;

    try {
      if (cfg.mode === "login") {
        const res = await fetch("/api/public/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.status || !data.user) {
          showNotice("error", data.message || cfg.copy.genericError);
          submitBtn.disabled = false;
          submitBtn.textContent = prevLabel;
          return;
        }
        onSuccess(data.user, data.message || cfg.copy.successLogin);
      } else {
        const fname = document.getElementById("authFname")?.value.trim();
        const lname = document.getElementById("authLname")?.value.trim();
        if (!mobile) {
          showNotice("error", cfg.copy.genericError);
          submitBtn.disabled = false;
          submitBtn.textContent = prevLabel;
          return;
        }
        const res = await fetch("/api/public/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fname, lname, email, mobile, password }),
        });
        const data = await res.json();
        if (!data.status || !data.user) {
          showNotice("error", data.message || cfg.copy.genericError);
          submitBtn.disabled = false;
          submitBtn.textContent = prevLabel;
          return;
        }
        onSuccess(data.user, data.message || cfg.copy.successSignup);
      }
    } catch (err) {
      showNotice("error", cfg.copy.genericError);
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
    }
  });
})();
