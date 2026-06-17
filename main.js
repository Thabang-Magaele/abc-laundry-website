/* =========================================================
   Mbombela Laundry — main.js
   Handles: mobile nav, footer year, booking estimate & validation
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    // Close the menu when a link is tapped
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Booking page logic ---------- */
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const WHATSAPP_NUMBER = "27615871600"; // 061 587 1600 in international format
  const currency = function (n) {
    return "R" + n.toFixed(2);
  };

  const serviceOptions = Array.from(document.querySelectorAll(".service-option"));
  const summaryLines = document.getElementById("summaryLines");
  const summaryTotal = document.getElementById("summaryTotal");

  // Decode HTML entities in data-label (e.g. "Wash &amp; Fold")
  function decode(str) {
    const el = document.createElement("textarea");
    el.innerHTML = str;
    return el.value;
  }

  /* ----- Gather the current order ----- */
  function getOrder() {
    let servicesTotal = 0;
    const lines = [];

    serviceOptions.forEach(function (opt) {
      const check = opt.querySelector(".svc-check");
      const qtyInput = opt.querySelector(".svc-qty");
      const price = parseFloat(check.dataset.price);
      const unit = check.dataset.unit;
      const label = decode(check.dataset.label);
      let qty = parseInt(qtyInput.value, 10);
      if (isNaN(qty) || qty < 0) qty = 0;

      // Keep checkbox and quantity in sync visually
      if (check.checked && qty === 0) {
        qtyInput.value = 1;
        qty = 1;
      }
      if (!check.checked) {
        qty = 0;
      }

      if (qty > 0) {
        const lineTotal = price * qty;
        servicesTotal += lineTotal;
        lines.push({
          text: label + " — " + qty + " " + unit + (qty > 1 ? "s" : ""),
          amount: lineTotal,
        });
      }
    });

    return { lines: lines, total: servicesTotal };
  }

  /* ----- Live estimate ----- */
  function updateSummary() {
    const order = getOrder();
    const lines = order.lines;

    // Render lines
    summaryLines.innerHTML = "";
    if (lines.length === 0) {
      const li = document.createElement("li");
      li.className = "summary-empty";
      li.textContent = "No service selected yet.";
      summaryLines.appendChild(li);
    } else {
      lines.forEach(function (line) {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = line.text;
        const amt = document.createElement("span");
        amt.textContent = currency(line.amount);
        li.appendChild(name);
        li.appendChild(amt);
        summaryLines.appendChild(li);
      });
    }

    summaryTotal.textContent = currency(order.total);
  }

  // Wire up service inputs
  serviceOptions.forEach(function (opt) {
    const check = opt.querySelector(".svc-check");
    const qtyInput = opt.querySelector(".svc-qty");

    check.addEventListener("change", function () {
      if (check.checked && (parseInt(qtyInput.value, 10) || 0) === 0) {
        qtyInput.value = 1;
      }
      if (!check.checked) {
        qtyInput.value = 0;
      }
      updateSummary();
    });

    qtyInput.addEventListener("input", function () {
      const qty = parseInt(qtyInput.value, 10) || 0;
      check.checked = qty > 0;
      updateSummary();
    });
  });

  /* ----- Set min date to today ----- */
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  /* ----- Validation ----- */
  function setError(field, message) {
    const input = document.getElementById(field);
    const errorEl = document.querySelector('.error[data-for="' + field + '"]');
    if (input) input.classList.toggle("invalid", Boolean(message));
    if (errorEl) errorEl.textContent = message || "";
  }

  function validate() {
    let valid = true;

    const required = {
      name: "Please enter your name.",
      phone: "Please enter a contact number.",
      address: "Where should we collect from?",
      date: "Pick a collection date.",
    };

    Object.keys(required).forEach(function (field) {
      const value = (document.getElementById(field).value || "").trim();
      if (!value) {
        setError(field, required[field]);
        valid = false;
      } else {
        setError(field, "");
      }
    });

    // We're closed on Sundays — don't allow a Sunday collection
    const dateVal = document.getElementById("date").value;
    if (dateVal) {
      // Parse as local date to avoid timezone shifting the day
      const parts = dateVal.split("-");
      const picked = new Date(parts[0], parts[1] - 1, parts[2]);
      if (picked.getDay() === 0) {
        setError("date", "We're closed on Sundays — please pick another day.");
        valid = false;
      }
    }

    // Phone sanity check (digits, spaces, +, -, at least 9 digits)
    const phone = document.getElementById("phone").value.trim();
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 9) {
        setError("phone", "Enter a valid phone number.");
        valid = false;
      }
    }

    // At least one service with a quantity
    const hasService = serviceOptions.some(function (opt) {
      const check = opt.querySelector(".svc-check");
      const qty = parseInt(opt.querySelector(".svc-qty").value, 10) || 0;
      return check.checked && qty > 0;
    });
    const svcError = document.querySelector('.error[data-for="services"]');
    if (!hasService) {
      if (svcError) svcError.textContent = "Please choose at least one service.";
      valid = false;
    } else if (svcError) {
      svcError.textContent = "";
    }

    return valid;
  }

  // Clear errors as the user types
  ["name", "phone", "address", "date"].forEach(function (field) {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener("input", function () {
        setError(field, "");
      });
    }
  });

  /* ----- Submit ----- */
  const successBox = document.getElementById("bookingSuccess");
  const successText = document.getElementById("successText");

  // Build a tidy, receipt-style message for WhatsApp
  function buildWhatsappMessage() {
    const order = getOrder();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const notes = document.getElementById("notes").value.trim();

    const area = (document.getElementById("area") || {}).value || "";

    const L = []; // message lines
    L.push("*MBOMBELA LAUNDRY*");
    L.push("*New Booking Request*");
    L.push("--------------------------------");
    L.push("*Customer:* " + name);
    L.push("*Phone:* " + phone);
    L.push("*Collect from:* " + address);
    if (area) L.push("*Area:* " + area);
    L.push("*Date:* " + date);
    L.push("*Time:* " + time);
    L.push("--------------------------------");
    L.push("*Items*");
    order.lines.forEach(function (line) {
      L.push("• " + line.text + " ......... " + currency(line.amount));
    });
    L.push("--------------------------------");
    L.push("*ESTIMATED TOTAL: " + currency(order.total) + "*");
    L.push("_(Collection & delivery free. Final price confirmed on collection.)_");
    if (notes) {
      L.push("--------------------------------");
      L.push("*Notes:* " + notes);
    }

    return L.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      // Focus the first invalid field
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const name = document.getElementById("name").value.trim();
    const total = summaryTotal.textContent;

    // Open WhatsApp with a ready-to-send, receipt-style booking message
    const message = buildWhatsappMessage();
    const waUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    window.open(waUrl, "_blank", "noopener");

    // Confirm on-screen as well
    form.hidden = true;
    if (successText) {
      successText.textContent =
        "Thanks " + name.split(" ")[0] +
        "! Your booking (estimated total " + total +
        ") is ready in WhatsApp — just press send to reach our team. " +
        "If WhatsApp didn't open, message us on 061 587 1600.";
    }
    if (successBox) {
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  /* ----- Make another booking ----- */
  const newBooking = document.getElementById("newBooking");
  if (newBooking) {
    newBooking.addEventListener("click", function () {
      form.reset();
      serviceOptions.forEach(function (opt) {
        opt.querySelector(".svc-qty").value = 0;
        opt.querySelector(".svc-check").checked = false;
      });
      updateSummary();
      form.hidden = false;
      if (successBox) successBox.hidden = true;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Initial render
  updateSummary();
})();
