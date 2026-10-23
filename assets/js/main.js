/* Dipstick Data landing page. No dependencies. */
(function () {
  "use strict";
  var C = window.DD_CONFIG || {};
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var params = new URLSearchParams(location.search);
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  /* ---------------- Headline variants ---------------- */
  var variant = "A";
  (function () {
    var h = C.headlines;
    if (!h || !h.variants) return;
    var keys = Object.keys(h.variants);
    var forced = (params.get("h") || "").toUpperCase();
    if (forced && h.variants[forced]) {
      variant = forced;
    } else if (h.active === "random") {
      var saved = LS.get("dd_variant");
      variant = saved && h.variants[saved] ? saved : keys[Math.floor(Math.random() * keys.length)];
      LS.set("dd_variant", variant);
    } else if (h.variants[h.active]) {
      variant = h.active;
    }
    var v = h.variants[variant];
    var hl = document.getElementById("hero-headline");
    var sub = document.getElementById("hero-sub");
    if (hl && v.headline) hl.textContent = v.headline;
    if (sub && v.sub) sub.textContent = v.sub;
    document.documentElement.setAttribute("data-variant", variant);
  })();

  /* ---------------- Analytics ---------------- */
  var A = C.analytics || {};
  function loadScript(src, attrs) {
    var s = document.createElement("script");
    s.src = src; s.async = true;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
  }
  (function () {
    if (A.provider === "goatcounter" && A.goatcounter && A.goatcounter.code) {
      loadScript("https://gc.zgo.at/count.js", { "data-goatcounter": "https://" + A.goatcounter.code + ".goatcounter.com/count" });
    } else if (A.provider === "plausible" && A.plausible && A.plausible.domain) {
      window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
      loadScript(A.plausible.src || "https://plausible.io/js/script.js", { "data-domain": A.plausible.domain, defer: "" });
    } else if (A.provider === "cloudflare" && A.cloudflare && A.cloudflare.token) {
      loadScript("https://static.cloudflareinsights.com/beacon.min.js", { "data-cf-beacon": JSON.stringify({ token: A.cloudflare.token }), defer: "" });
    }
  })();

  var gcQueue = [];
  function track(name, props) {
    props = props || {};
    props.variant = variant;
    if (A.debug || isLocal) console.info("[dd event]", name, props);
    window.ddEvents = window.ddEvents || [];
    window.ddEvents.push({ name: name, props: props, t: Date.now() });
    if (A.provider === "goatcounter") {
      // GoatCounter events are paths; encode the key property into the path.
      var path = name + (props.tier ? "/" + props.tier : "") + (props.bucket ? "/" + props.bucket : "") + "/v-" + variant;
      var send = function () { window.goatcounter.count({ path: path, title: name, event: true }); };
      if (window.goatcounter && window.goatcounter.count) send(); else gcQueue.push(send);
    } else if (A.provider === "plausible" && window.plausible) {
      window.plausible(name, { props: props });
    }
    // Cloudflare Web Analytics has no custom events; page views only.
  }
  // Flush GoatCounter events once its script is ready.
  var gcTimer = setInterval(function () {
    if (window.goatcounter && window.goatcounter.count) {
      gcQueue.splice(0).forEach(function (f) { f(); });
      clearInterval(gcTimer);
    }
  }, 500);
  setTimeout(function () { clearInterval(gcTimer); }, 15000);
  window.ddTrack = track;

  /* ---------------- "I'd pay" buttons ---------------- */
  var form = document.getElementById("waitlist-form");
  var tierInput = document.getElementById("tier");
  var tierNote = document.getElementById("tier-note");
  var tierNoteText = document.getElementById("tier-note-text");
  var tiers = C.tiers || {};

  function setTier(tier, announce) {
    if (!tierInput) return;
    tierInput.value = tier || "";
    if (tier) {
      LS.set("dd_tier", tier);
      tierNoteText.textContent = "You picked: " + (tiers[tier] || tier) + ". It'll be sent with your sign-up.";
      tierNote.hidden = false;
    } else {
      LS.set("dd_tier", "");
      tierNote.hidden = true;
    }
    document.querySelectorAll("[data-tier]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-tier") === tier ? "true" : "false");
    });
    if (announce) {
      var live = document.getElementById("form-status");
      if (live) live.textContent = tier ? "Plan noted: " + (tiers[tier] || tier) + "." : "";
    }
  }

  document.querySelectorAll("[data-tier]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var tier = btn.getAttribute("data-tier");
      track("i_would_pay", { tier: tier });
      setTier(tier, true);
      var target = document.getElementById("waitlist");
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      var email = document.getElementById("email");
      setTimeout(function () { email && email.focus({ preventScroll: true }); }, reduce ? 0 : 450);
    });
  });
  var clearBtn = document.getElementById("tier-clear");
  if (clearBtn) clearBtn.addEventListener("click", function () { setTier("", true); });
  // Restore a tier picked earlier in this browser, or ?tier= from a link.
  var startTier = params.get("tier") || LS.get("dd_tier");
  if (startTier && tiers[startTier]) setTier(startTier, false);

  /* ---------------- Source (UTM) ---------------- */
  var src = params.get("utm_source") || params.get("ref") || "";
  if (src) {
    var camp = params.get("utm_campaign");
    src = src + (camp ? "/" + camp : "");
    LS.set("dd_source", src.slice(0, 80));
  }
  var sourceVal = (LS.get("dd_source") || (document.referrer ? new URL(document.referrer).hostname : "direct")).slice(0, 80);
  var srcInput = document.getElementById("source");
  var varInput = document.getElementById("variant");
  if (srcInput) srcInput.value = sourceVal;
  if (varInput) varInput.value = variant;

  /* ---------------- Waitlist form ---------------- */
  if (!form) return;
  var status = document.getElementById("form-status");
  var submitBtn = form.querySelector("button[type=submit]");

  function collect() {
    var types = Array.prototype.map.call(form.querySelectorAll('input[name="machine_type[]"]:checked'), function (c) { return c.value; });
    return {
      email: form.email.value.trim(),
      machines: form.machines.value,
      machine_types: types.join(", "),
      tier: tierInput.value,
      variant: variant,
      source: sourceVal
    };
  }

  function configured(p) {
    var f = C.form || {};
    if (p === "kit") return !!(f.kit && f.kit.formId);
    if (p === "mailerlite") return !!(f.mailerlite && f.mailerlite.accountId && f.mailerlite.formId);
    if (p === "formspree") return !!(f.formspree && f.formspree.formId);
    if (p === "googleforms") return !!(f.googleforms && f.googleforms.actionUrl && f.googleforms.entries && f.googleforms.entries.email);
    return false;
  }

  function fd(obj) {
    var d = new FormData();
    Object.keys(obj).forEach(function (k) { if (obj[k] !== "" && obj[k] != null) d.append(k, obj[k]); });
    return d;
  }

  var adapters = {
    kit: function (d) {
      var k = C.form.kit, fk = k.fieldKeys || {}, body = { email_address: d.email };
      body["fields[" + fk.machines + "]"] = d.machines;
      body["fields[" + fk.machine_types + "]"] = d.machine_types;
      body["fields[" + fk.tier + "]"] = d.tier;
      body["fields[" + fk.variant + "]"] = d.variant;
      body["fields[" + fk.source + "]"] = d.source;
      return fetch("https://app.kit.com/forms/" + encodeURIComponent(k.formId) + "/subscriptions", {
        method: "POST", headers: { Accept: "application/json" }, body: fd(body)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && (j.status === "success" || j.status === "quarantined")) return true;
        var msg = j && j.errors && j.errors.messages ? j.errors.messages.join(" ") : "";
        throw new Error(msg || "Sign-up failed");
      });
    },
    mailerlite: function (d) {
      var m = C.form.mailerlite, fk = m.fieldKeys || {}, body = { "fields[email]": d.email, "ml-submit": "1", anticsrf: "true" };
      body["fields[" + fk.machines + "]"] = d.machines;
      body["fields[" + fk.machine_types + "]"] = d.machine_types;
      body["fields[" + fk.tier + "]"] = d.tier;
      body["fields[" + fk.variant + "]"] = d.variant;
      body["fields[" + fk.source + "]"] = d.source;
      return fetch("https://assets.mailerlite.com/jsonp/" + encodeURIComponent(m.accountId) + "/forms/" + encodeURIComponent(m.formId) + "/subscribe", {
        method: "POST", headers: { Accept: "application/json" }, body: fd(body)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.success) return true;
        throw new Error("Sign-up failed");
      });
    },
    formspree: function (d) {
      return fetch("https://formspree.io/f/" + encodeURIComponent(C.form.formspree.formId), {
        method: "POST", headers: { Accept: "application/json" }, body: fd(d)
      }).then(function (r) { if (!r.ok) throw new Error("Sign-up failed"); return true; });
    },
    googleforms: function (d) {
      var g = C.form.googleforms, e = g.entries, body = {};
      Object.keys(e).forEach(function (k) { if (e[k]) body[e[k]] = d[k]; });
      // Google Forms does not send CORS headers; the response is opaque.
      return fetch(g.actionUrl, { method: "POST", mode: "no-cors", body: fd(body) }).then(function () { return true; });
    }
  };

  function show(kind, html) {
    status.className = "form-status " + kind;
    status.innerHTML = html;
    status.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.website && form.website.value) return; // honeypot
    if (!form.email.checkValidity()) {
      form.email.setAttribute("aria-invalid", "true");
      show("error", "Please enter a valid email address.");
      form.email.focus();
      return;
    }
    form.email.removeAttribute("aria-invalid");
    var d = collect();
    track("signup_submit", { tier: d.tier || "none" });
    if (d.machines) track("machines", { bucket: d.machines });

    var p = (C.form && C.form.provider) || "none";
    if (!configured(p)) {
      if (isLocal) {
        var saved = JSON.parse(LS.get("dd_local_signups") || "[]");
        saved.push(d); LS.set("dd_local_signups", JSON.stringify(saved));
        show("ok", "<strong>Local test only.</strong> The form backend isn't connected yet, so nothing was sent. Saved in this browser for testing.");
        return;
      }
      show("error", "Sign-ups aren't open yet. Please email <a href=\"mailto:" + C.contact.hello + "?subject=Waitlist\">" + C.contact.hello + "</a> and we'll add you by hand.");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    adapters[p](d).then(function () {
      form.reset();
      setTier("", false);
      var dbl = p === "kit" || p === "mailerlite";
      show("ok", dbl
        ? "<strong>Almost done: check your inbox.</strong> We've sent a confirmation email. Click the link inside to finish joining. If it isn't there in a few minutes, check spam or promotions."
        : "<strong>Thanks, you're on the list.</strong> We'll email you when we launch.");
    }).catch(function (err) {
      show("error", "Something went wrong (" + String(err.message || err).replace(/[<>&]/g, "") + "). Please try again, or email <a href=\"mailto:" + C.contact.hello + "?subject=Waitlist\">" + C.contact.hello + "</a>.");
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
    });
  });
})();
