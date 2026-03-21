(function (root, factory) {
  var contract = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = contract;
  }
  if (root) {
    root.FigataRestaurantContract = contract;
  }
})(
  typeof globalThis !== 'undefined'
    ? globalThis
    : (typeof window !== 'undefined' ? window : this),
  function () {
    function isObject(value) {
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function isSafeUrl(url) {
      if (!url) return true;
      var str = String(url).trim();
      return /^(https?|mailto|tel):/i.test(str) || str[0] === '/' || str[0] === '#';
    }

    function isValidEmail(email) {
      if (!email) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    }

    function isValidCoordinate(val, min, max) {
      if (val === null || val === undefined || val === '') return true;
      var num = Number(val);
      return !isNaN(num) && num >= min && num <= max;
    }

    function validateRestaurantContract(payload, options) {
      var report = {
        errors: [],
        warnings: [],
        issues: []
      };

      function pushIssue(severity, message) {
        if (severity === 'error') {
          report.errors.push(message);
        } else {
          report.warnings.push(message);
        }
        report.issues.push({
          severity: severity,
          message: message
        });
      }

      if (!isObject(payload)) {
        pushIssue('error', 'Restaurant data must be a JSON object.');
        return report;
      }

      // Check top-level strings
      var name = String(payload.name || '').trim();
      if (!name) pushIssue('warning', 'Restaurant "name" is missing or empty.');
      
      var tagline = String(payload.tagline || '').trim();
      if (!tagline) pushIssue('warning', 'Restaurant "tagline" is missing or empty.');

      // Check contact
      var contact = payload.contact;
      if (!isObject(contact)) {
        pushIssue('error', '"contact" must be an object.');
      } else {
        if (!isValidEmail(contact.email)) {
          pushIssue('error', 'Invalid email format in "contact.email".');
        }
        if (contact.email && !String(contact.email).trim()) {
           pushIssue('warning', '"contact.email" is empty.');
        }
      }

      // Check location
      var loc = payload.location;
      if (!isObject(loc)) {
        pushIssue('error', '"location" must be an object.');
      } else {
        if (!isSafeUrl(loc.mapsUrl)) {
          pushIssue('error', 'Invalid or unsafe URL format in "location.mapsUrl".');
        }
        if (!isValidCoordinate(loc.latitude, -90, 90)) {
          pushIssue('error', 'Invalid latitude in "location.latitude" (-90 to 90 allowed).');
        }
        if (!isValidCoordinate(loc.longitude, -180, 180)) {
          pushIssue('error', 'Invalid longitude in "location.longitude" (-180 to 180 allowed).');
        }
      }

      // Check hours
      if (!isObject(payload.hours)) {
        pushIssue('error', '"hours" must be an object.');
      }

      // Check social
      var social = payload.social;
      if (!isObject(social)) {
        pushIssue('error', '"social" must be an object.');
      } else {
        ['instagram', 'tiktok', 'facebook', 'tripadvisor'].forEach(function (net) {
           if (!isSafeUrl(social[net])) {
             pushIssue('error', 'Invalid or unsafe URL in "social.' + net + '".');
           }
        });
      }

      // Check links
      var links = payload.links;
      if (!isObject(links)) {
        pushIssue('error', '"links" must be an object.');
      } else {
        ['reservationUrl', 'deliveryUrl', 'menuPdf'].forEach(function (lnk) {
           if (!isSafeUrl(links[lnk])) {
             pushIssue('error', 'Invalid or unsafe URL in "links.' + lnk + '".');
           }
        });
      }

      // Check branding
      if (!isObject(payload.branding)) {
        pushIssue('error', '"branding" must be an object.');
      }

      // Check seo
      var seo = payload.seo;
      if (!isObject(seo)) {
        pushIssue('error', '"seo" must be an object.');
      } else {
        if (!isSafeUrl(seo.canonicalUrl)) {
           pushIssue('error', 'Invalid or unsafe URL in "seo.canonicalUrl".');
        }
      }

      // Check meta
      if (!isObject(payload.meta)) {
        pushIssue('error', '"meta" must be an object.');
      }

      return report;
    }

    return {
      validateRestaurantContract: validateRestaurantContract
    };
  }
);
