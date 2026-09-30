// Salnecke Park — progressive enhancement only. Every page works without it.
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
  // ------------------------------------------------------------ mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("huvudmeny");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
  }
  document.querySelectorAll(".sub-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.closest("[data-sub]");
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      li.classList.toggle("is-open", open);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-sub].is-open").forEach(function (li) {
      li.classList.remove("is-open");
      li.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
    });
  });

  // ------------------------------------------------------------ lightbox
  var box = document.querySelector(".lightbox");
  if (box && typeof box.showModal === "function") {
    var img = box.querySelector("img");
    var cap = box.querySelector(".lightbox__cap");
    document.querySelectorAll("[data-lightbox]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        img.src = a.getAttribute("href");
        img.alt = a.getAttribute("data-lightbox");
        cap.textContent = a.getAttribute("data-lightbox");
        box.showModal();
      });
    });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }

  // ------------------------------------------------------------ forms
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var err = form.querySelector(".form__error");
    var btn = form.querySelector('button[type="submit"]');

    function showError(msg) {
      err.textContent = msg;
      err.hidden = false;
      err.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    form.addEventListener("submit", function (e) {
      err.hidden = true;
      err.classList.remove("form__error--info");
      // A required checkbox group cannot be expressed in HTML alone.
      var missing = [];
      form.querySelectorAll("[data-required-group]").forEach(function (g) {
        var ok = g.querySelector("input:checked");
        g.querySelector("legend").classList.toggle("is-invalid", !ok);
        if (!ok) missing.push(g.querySelector("legend").textContent.replace("*", "").trim());
      });
      if (missing.length) {
        e.preventDefault();
        showError("Välj minst ett alternativ: " + missing.join(", ") + ".");
        return;
      }
      // GitHub Pages preview: no PHP there, so show the form but never send it.
      if (form.hasAttribute("data-preview")) {
        e.preventDefault();
        err.classList.add("form__error--info");
        showError("Förhandsvisning: formuläret skickas inte härifrån. På den riktiga webbplatsen går det direkt till oss via e-post.");
        return;
      }
      if (!window.fetch || !window.FormData) return; // plain POST + redirect
      e.preventDefault();
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = "Skickar…";
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res.ok && res.redirect) { window.location.href = res.redirect; return; }
          showError(res.message || "Något gick fel. Försök igen eller ring oss.");
          btn.disabled = false;
          btn.textContent = label;
        })
        .catch(function () {
          showError("Kunde inte nå servern. Kontrollera anslutningen och försök igen.");
          btn.disabled = false;
          btn.textContent = label;
        });
    });
  });
});
