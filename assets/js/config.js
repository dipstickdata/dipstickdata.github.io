/*
 * Dipstick Data landing page: site configuration.
 * Everything you are likely to change before or during the demand test lives here.
 * No build step: edit, commit, push.
 */
window.DD_CONFIG = {
  /* ---------------------------------------------------------------
   * HEADLINE A/B VARIANTS
   * active: "A" | "B" | "C" | "random"
   *   "random" picks one per visitor and keeps it (localStorage).
   * A visitor can be forced to a variant with ?h=B in the URL.
   * The variant shown is sent with the sign-up (hidden field) and
   * with every analytics event, so results can be split later.
   * ------------------------------------------------------------- */
  headlines: {
    active: "A",
    variants: {
      A: {
        headline: "Your oil analysis report, explained in plain English.",
        sub: "Dipstick Data is a planned, brand-neutral oil and grease reference. Upload the used oil analysis report from your lab and get a free, plain-English explanation of every section, plus a free oil and grease lookup."
      },
      B: {
        headline: "Oil and grease specs, without the brand bias.",
        sub: "A planned free lookup and cross-reference tool that shows what manufacturers publish, side by side, plus free plain-English explanations of your used oil analysis reports."
      },
      C: {
        headline: "Every oil sample. Every machine. One record.",
        sub: "Free plain-English explanations of your used oil analysis reports, with planned tracking for trend charts, fleet comparisons and an exportable history across labs and machines."
      }
    }
  },

  /* ---------------------------------------------------------------
   * WAITLIST FORM BACKEND (swap with ONE value: form.provider)
   * "kit"         Kit (ConvertKit) free plan. RECOMMENDED. Double opt-in list.
   * "mailerlite"  MailerLite free plan (250 subscriber cap).
   * "formspree"   Formspree free (50 submissions/month, no newsletter list).
   * "googleforms" Google Forms (no double opt-in, no newsletter list).
   * "none"        Not connected. Visitors are asked to email instead.
   * If the chosen provider's IDs are blank, the form behaves like "none".
   * ------------------------------------------------------------- */
  form: {
    provider: "kit",

    kit: {
      // From Kit > Grow > Landing Pages & Forms > (form) > Publish > HTML.
      // The number in https://app.kit.com/forms/1234567/subscriptions
      formId: "10089172",
      // Kit custom field keys (create these in Kit > Subscribers > custom fields first).
      fieldKeys: {
        machines: "machines",
        machine_types: "machine_types",
        tier: "tier_interest",
        variant: "headline_variant",
        source: "signup_source"
      }
    },

    mailerlite: {
      // From the embedded form HTML: https://assets.mailerlite.com/jsonp/ACCOUNT/forms/FORM/subscribe
      accountId: "",
      formId: "",
      fieldKeys: {
        machines: "machines",
        machine_types: "machine_types",
        tier: "tier_interest",
        variant: "headline_variant",
        source: "signup_source"
      }
    },

    formspree: {
      // https://formspree.io/f/FORM_ID
      formId: ""
    },

    googleforms: {
      // https://docs.google.com/forms/d/e/FORM_KEY/formResponse
      actionUrl: "",
      // Map each field to its entry.NNNN id (from a prefilled link).
      entries: {
        email: "",
        machines: "",
        machine_types: "",
        tier: "",
        variant: "",
        source: ""
      }
    }
  },

  /* ---------------------------------------------------------------
   * ANALYTICS (enable with ONE value: analytics.provider)
   * "goatcounter"  RECOMMENDED. Free, cookieless, supports custom events.
   * "plausible"    Plausible CE (self-hosted) or Plausible Cloud.
   * "cloudflare"   Cloudflare Web Analytics: page views only, NO custom events.
   * "none"         Off (default until an account exists).
   * Custom events sent: i_would_pay (tier), signup_submit, machines (bucket).
   * ------------------------------------------------------------- */
  analytics: {
    provider: "goatcounter",
    goatcounter: { code: "dipstickdata" },              // e.g. "dipstickdata" -> https://dipstickdata.goatcounter.com
    plausible: { domain: "dipstickdata.com", src: "https://plausible.io/js/script.js" },
    cloudflare: { token: "" },              // beacon token from Cloudflare Web Analytics
    debug: false                            // true = also log events to the console
  },

  /* Planned tiers (labels shown on the hidden field and in the "selected plan" note). */
  tiers: {
    enthusiast: "Enthusiast, $29/yr (planned)",
    farm_pro: "Farm/Pro, $99/yr (planned)",
    fleet: "Fleet, $249/yr (planned)",
    custom: "More than 30 machines, custom quote"
  },

  contact: {
    hello: "hello@dipstickdata.com",
    support: "support@dipstickdata.com"
  }
};
