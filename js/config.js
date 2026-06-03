/* =========================================================
   config.js — runtime configuration
   Lets the app find its backend API when hosted on Azure
   Static Web Apps, while still working as plain static files.
   ========================================================= */
(function () {
  "use strict";

  // When deployed to Azure Static Web Apps, the managed Functions API is
  // served from the same origin under "/api", so the default below "just works".
  // For local development against a separate Functions host, override this by
  // defining window.APP_CONFIG before this script loads, e.g.:
  //   <script>window.APP_CONFIG = { apiBase: "http://localhost:7071/api" };</script>
  const defaults = {
    apiBase: "/api"
  };

  const cfg = Object.assign({}, defaults, window.APP_CONFIG || {});
  window.APP_CONFIG = cfg;
})();
