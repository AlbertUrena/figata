(function (root, factory) {
  var taxonomy = typeof module === 'object' && module.exports
    ? require('./analytics-taxonomy.js')
    : root.FigataAnalyticsTaxonomy;
  var governance = typeof module === 'object' && module.exports
    ? require('./analytics-governance.js')
    : root.FigataAnalyticsGovernance;

  var exported = factory(taxonomy, governance);

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsContract = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (taxonomy, governance) {
  var VERSION = 'figata.analytics.contract.v1';

  var ENTITY_SCHEMAS = {
    visitor: ['visitor_id', 'is_returning_visitor'],
    session: ['session_id', 'session_sequence', 'entry_source', 'visit_context', 'visit_context_confidence'],
    source: ['entry_source', 'entry_source_detail', 'source_medium', 'source_campaign'],
    event: ['event_id', 'event_name', 'event_version', 'schema_version', 'occurred_at'],
  };

  function isInteger(value) {
    return typeof value === 'number' && Number.isInteger(value);
  }

  function validateType(type, value) {
    if (type === 'string') {
      return typeof value === 'string' && value.trim().length > 0;
    }

    if (type === 'boolean') {
      return typeof value === 'boolean';
    }

    if (type === 'number') {
      return typeof value === 'number' && Number.isFinite(value);
    }

    if (type === 'integer') {
      return isInteger(value);
    }

    if (type === 'array') {
      return Array.isArray(value);
    }

    return value !== undefined && value !== null;
  }

  function sanitizePayload(payload) {
    var result = {};

    Object.keys(payload || {}).forEach(function (key) {
      var value = payload[key];
      if (typeof value === 'undefined') {
        return;
      }

      if (typeof value === 'string') {
        var trimmed = value.trim();
        if (trimmed) {
          result[key] = trimmed;
        }
        return;
      }

      result[key] = value;
    });

    return result;
  }

  function buildIdempotencyKey(payload, definition) {
    if (!definition || !Array.isArray(definition.idempotency) || !definition.idempotency.length) {
      return '';
    }

    return definition.idempotency.map(function (key) {
      return key + ':' + stringifyValue(payload[key]);
    }).join('|');
  }

  function stringifyValue(value) {
    if (Array.isArray(value) || (value && typeof value === 'object')) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  function validateEvent(payload) {
    var sanitized = sanitizePayload(payload || {});
    var eventName = sanitized.event_name;
    var definition = taxonomy.getEventDefinition(eventName);
    var errors = [];

    if (!definition) {
      return {
        ok: false,
        errors: ['Unknown event_name: ' + String(eventName || '')],
        sanitized: sanitized,
        idempotencyKey: '',
      };
    }

    definition.required.forEach(function (property) {
      if (typeof sanitized[property] === 'undefined') {
        errors.push('Missing required property: ' + property);
        return;
      }

      var propertyDefinition = taxonomy.PROPERTY_REGISTRY[property];
      if (!propertyDefinition) {
        errors.push('Unknown property definition: ' + property);
        return;
      }

      if (!validateType(propertyDefinition.type, sanitized[property])) {
        errors.push('Invalid type for property: ' + property + ' expected ' + propertyDefinition.type);
      }
    });

    Object.keys(sanitized).forEach(function (property) {
      var propertyDefinition = taxonomy.PROPERTY_REGISTRY[property];
      if (!propertyDefinition) {
        errors.push('Property not registered in taxonomy: ' + property);
        return;
      }

      if (!validateType(propertyDefinition.type, sanitized[property])) {
        errors.push('Invalid type for property: ' + property + ' expected ' + propertyDefinition.type);
      }
    });

    governance.detectViolations(sanitized).forEach(function (violation) {
      errors.push('Governance violation: ' + JSON.stringify(violation));
    });

    if (
      typeof sanitized.entry_source !== 'undefined' &&
      governance.ENTRY_SOURCES.indexOf(sanitized.entry_source) === -1
    ) {
      errors.push('Invalid entry_source: ' + sanitized.entry_source);
    }

    if (
      typeof sanitized.visit_context !== 'undefined' &&
      governance.VISIT_CONTEXTS.indexOf(sanitized.visit_context) === -1
    ) {
      errors.push('Invalid visit_context: ' + sanitized.visit_context);
    }

    if (
      typeof sanitized.traffic_class !== 'undefined' &&
      governance.TRAFFIC_CLASSES.indexOf(sanitized.traffic_class) === -1
    ) {
      errors.push('Invalid traffic_class: ' + sanitized.traffic_class);
    }

    return {
      ok: errors.length === 0,
      errors: errors,
      sanitized: sanitized,
      idempotencyKey: buildIdempotencyKey(sanitized, definition),
      definition: definition,
    };
  }

  return {
    VERSION: VERSION,
    ENTITY_SCHEMAS: ENTITY_SCHEMAS,
    buildIdempotencyKey: buildIdempotencyKey,
    sanitizePayload: sanitizePayload,
    validateEvent: validateEvent,
  };
});
