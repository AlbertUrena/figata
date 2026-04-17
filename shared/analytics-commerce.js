(function (root, factory) {
  var analyticsSdk = typeof module === 'object' && module.exports
    ? require('./analytics-sdk.js')
    : root.FigataAnalyticsSDK;

  var exported = factory(analyticsSdk);

  if (typeof module === 'object' && module.exports) {
    module.exports = exported;
  }

  root.FigataAnalyticsCommerce = exported;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (analyticsSdk) {
  var DEFAULT_CURRENCY = 'DOP';
  var CART_STORAGE_KEY = 'figata:analytics:cart:v1';
  var CART_STORAGE_VERSION = 1;
  var seenKeys = new Set();

  function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : String(value || '').trim();
  }

  function normalizeId(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/\s+/g, '_');
  }

  function normalizeKeySeed(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function roundCurrency(value) {
    var numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    return Math.round((numericValue + Number.EPSILON) * 100) / 100;
  }

  function normalizeQuantity(value, fallback) {
    var numericValue = Math.round(Number(value));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return Math.max(0, Math.round(Number(fallback) || 0));
    }

    return numericValue;
  }

  function createOpaqueId(prefix) {
    return String(prefix || 'id') + '_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getStorage() {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch (_error) {
      return null;
    }
  }

  function readStorageJson(storage, key) {
    if (!storage || !key) {
      return null;
    }

    try {
      var raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function writeStorageJson(storage, key, payload) {
    if (!storage || !key) {
      return false;
    }

    try {
      storage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function ensureCartState() {
    var storage = getStorage();
    var stored = readStorageJson(storage, CART_STORAGE_KEY);
    var storedId = normalizeId(stored && stored.id);

    if (stored && Number(stored.version) === CART_STORAGE_VERSION && storedId) {
      return stored;
    }

    var nextState = {
      version: CART_STORAGE_VERSION,
      id: createOpaqueId('cart'),
      updatedAt: Date.now(),
    };

    writeStorageJson(storage, CART_STORAGE_KEY, nextState);
    return nextState;
  }

  function getCartId() {
    return ensureCartState().id;
  }

  function resetCartId() {
    var storage = getStorage();
    var nextState = {
      version: CART_STORAGE_VERSION,
      id: createOpaqueId('cart'),
      updatedAt: Date.now(),
    };

    writeStorageJson(storage, CART_STORAGE_KEY, nextState);
    return nextState.id;
  }

  function resolveItemPrice(input) {
    var explicitPrice = Number(
      input && (input.price || input.unitPrice || input.unit_price)
    );
    if (Number.isFinite(explicitPrice)) {
      return roundCurrency(explicitPrice);
    }

    var quantity = normalizeQuantity(input && (input.quantity || input.qty), 0);
    var linePrice = Number(input && (input.linePrice || input.line_price || input.value));
    if (quantity > 0 && Number.isFinite(linePrice)) {
      return roundCurrency(linePrice / quantity);
    }

    return NaN;
  }

  function normalizeItem(input, overrides) {
    var source = Object.assign({}, input || {}, overrides || {});
    var itemId = normalizeId(source.item_id || source.id || source.itemId || source.slug);
    var itemName = normalizeText(
      source.item_name || source.name || source.title || source.label || itemId
    );
    var category = normalizeId(
      source.category || source.category_id || source.categoryId || source.groupId || source.sectionId
    );

    if (!itemId || !itemName || !category) {
      return null;
    }

    var payload = {
      item_id: itemId,
      item_name: itemName,
      category: category,
    };

    var price = resolveItemPrice(source);
    if (Number.isFinite(price)) {
      payload.price = price;
    }

    return payload;
  }

  function normalizeCartEntry(input) {
    var quantity = normalizeQuantity(input && (input.quantity || input.qty), 0);
    if (quantity <= 0) {
      return null;
    }

    var itemPayload = normalizeItem(input, {
      price: resolveItemPrice(input),
    });
    if (!itemPayload) {
      return null;
    }

    return {
      item_id: itemPayload.item_id,
      item_name: itemPayload.item_name,
      category: itemPayload.category,
      price: Number.isFinite(itemPayload.price) ? itemPayload.price : 0,
      quantity: quantity,
    };
  }

  function buildSnapshotKey(items, value) {
    return [roundCurrency(value).toFixed(2)].concat(
      items.map(function (item) {
        return [
          item.item_id,
          normalizeQuantity(item.quantity, 0),
          roundCurrency(item.price).toFixed(2),
        ].join(':');
      })
    ).join('|');
  }

  function buildCartSnapshot(entries, options) {
    var items = Array.isArray(entries)
      ? entries.map(normalizeCartEntry).filter(Boolean)
      : [];
    var currency = normalizeText(options && options.currency).toUpperCase() || DEFAULT_CURRENCY;
    var rawValue = Number(options && options.value);
    var value = Number.isFinite(rawValue)
      ? roundCurrency(rawValue)
      : roundCurrency(
          items.reduce(function (sum, item) {
            return sum + roundCurrency(item.price) * normalizeQuantity(item.quantity, 0);
          }, 0)
        );
    var cartId = normalizeText(options && options.cartId) || getCartId();

    return {
      cart_id: cartId,
      currency: currency,
      value: value,
      items: items,
      snapshot_key: buildSnapshotKey(items, value),
    };
  }

  function buildEventItems(snapshot) {
    return snapshot.items.map(function (item) {
      return {
        item_id: item.item_id,
        quantity: item.quantity,
        price: item.price,
      };
    });
  }

  function resolveSnapshot(entries, options) {
    if (options && options.snapshot && options.snapshot.items) {
      return options.snapshot;
    }

    return buildCartSnapshot(entries, options);
  }

  function trackEvent(eventName, payload, options) {
    if (!analyticsSdk || typeof analyticsSdk.track !== 'function') {
      return Promise.resolve({ ok: false, skipped: true, eventName: eventName });
    }

    var dedupeKey = normalizeText(options && options.dedupeKey);
    if (dedupeKey && seenKeys.has(dedupeKey)) {
      return Promise.resolve({ ok: true, deduped: true, eventName: eventName, payload: payload });
    }

    if (dedupeKey) {
      seenKeys.add(dedupeKey);
    }

    return analyticsSdk.track(eventName, payload);
  }

  function trackItemImpression(item, options) {
    var itemPayload = normalizeItem(item);
    var listId = normalizeId(options && (options.listId || options.list_id));
    var listName = normalizeText(options && (options.listName || options.list_name));
    var listPosition = normalizeQuantity(
      options && (options.listPosition || options.list_position),
      0
    );

    if (!itemPayload || !listId || !listName || listPosition <= 0) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'item_impression' });
    }

    return trackEvent('item_impression', Object.assign({}, itemPayload, {
      list_id: listId,
      list_name: listName,
      list_position: listPosition,
    }), {
      dedupeKey:
        normalizeText(options && options.dedupeKey) ||
        ['item_impression', itemPayload.item_id, listId, listPosition].join('|'),
    });
  }

  function trackItemDetailOpen(item, options) {
    var itemPayload = normalizeItem(item);
    var detailOrigin = normalizeText(options && (options.detailOrigin || options.detail_origin));
    var detailDepthIndex = normalizeQuantity(
      options && (options.detailDepthIndex || options.detail_depth_index),
      0
    );

    if (!itemPayload || !detailOrigin) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'item_detail_open' });
    }

    var payload = Object.assign({}, itemPayload, {
      detail_origin: detailOrigin,
    });

    if (detailDepthIndex > 0) {
      payload.detail_depth_index = detailDepthIndex;
    }

    return trackEvent('item_detail_open', payload, {
      dedupeKey:
        normalizeText(options && options.dedupeKey) ||
        ['item_detail_open', itemPayload.item_id, detailOrigin].join('|'),
    });
  }

  function trackItemDetailClose(item, options) {
    var itemPayload = normalizeItem(item);
    var detailOrigin = normalizeText(options && (options.detailOrigin || options.detail_origin));
    var detailDepthIndex = normalizeQuantity(
      options && (options.detailDepthIndex || options.detail_depth_index),
      0
    );

    if (!itemPayload || !detailOrigin) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'item_detail_close' });
    }

    var payload = Object.assign({}, itemPayload, {
      detail_origin: detailOrigin,
    });

    if (detailDepthIndex > 0) {
      payload.detail_depth_index = detailDepthIndex;
    }

    return trackEvent('item_detail_close', payload, {
      dedupeKey:
        normalizeText(options && options.dedupeKey) ||
        ['item_detail_close', itemPayload.item_id, detailOrigin].join('|'),
    });
  }

  function buildCartMutationPayload(item, options) {
    var snapshot = resolveSnapshot(options && options.items, options);
    var quantity = normalizeQuantity(options && options.quantity, 0);
    var price = resolveItemPrice(
      Object.assign({}, item || {}, options || {})
    );
    var itemPayload = normalizeItem(item, { price: price });

    if (!itemPayload || quantity <= 0) {
      return null;
    }

    var payload = {
      item_id: itemPayload.item_id,
      item_name: itemPayload.item_name,
      category: itemPayload.category,
      price: Number.isFinite(itemPayload.price) ? itemPayload.price : 0,
      quantity: quantity,
      currency: snapshot.currency,
      cart_id: snapshot.cart_id,
    };

    var detailOrigin = normalizeText(options && (options.detailOrigin || options.detail_origin));
    if (detailOrigin) {
      payload.detail_origin = detailOrigin;
    }

    return payload;
  }

  function trackAddToCart(item, options) {
    var payload = buildCartMutationPayload(item, options);
    if (!payload) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'add_to_cart' });
    }

    return trackEvent('add_to_cart', payload);
  }

  function trackRemoveFromCart(item, options) {
    var payload = buildCartMutationPayload(item, options);
    if (!payload) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'remove_from_cart' });
    }

    return trackEvent('remove_from_cart', payload);
  }

  function trackCartView(entries, options) {
    var snapshot = resolveSnapshot(entries, options);
    if (!snapshot.items.length) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'cart_view' });
    }

    return trackEvent('cart_view', {
      cart_id: snapshot.cart_id,
      currency: snapshot.currency,
      value: snapshot.value,
      items: buildEventItems(snapshot),
    }, {
      dedupeKey:
        normalizeText(options && options.dedupeKey) ||
        ['cart_view', snapshot.cart_id, snapshot.snapshot_key].join('|'),
    });
  }

  function trackBeginCheckout(entries, options) {
    var snapshot = resolveSnapshot(entries, options);
    if (!snapshot.items.length) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'begin_checkout' });
    }

    return trackEvent('begin_checkout', {
      cart_id: snapshot.cart_id,
      currency: snapshot.currency,
      value: snapshot.value,
      items: buildEventItems(snapshot),
    }, {
      dedupeKey:
        normalizeText(options && options.dedupeKey) ||
        ['begin_checkout', snapshot.cart_id, snapshot.snapshot_key].join('|'),
    });
  }

  function buildOrderId(snapshot, explicitOrderId) {
    var normalizedExplicitOrderId = normalizeId(explicitOrderId);
    if (normalizedExplicitOrderId) {
      return normalizedExplicitOrderId.indexOf('ord_') === 0
        ? normalizedExplicitOrderId
        : 'ord_' + normalizedExplicitOrderId;
    }

    var cartSeed = normalizeKeySeed(snapshot && snapshot.cart_id).replace(/^cart_/, '');
    var snapshotSeed = normalizeKeySeed(snapshot && snapshot.snapshot_key);
    return 'ord_' + (cartSeed || createOpaqueId('ord').slice(4)) + '_' + (snapshotSeed || Date.now().toString(36));
  }

  function trackPurchase(entries, options) {
    var snapshot = resolveSnapshot(entries, options);
    if (!snapshot.items.length) {
      return Promise.resolve({ ok: false, skipped: true, eventName: 'purchase' });
    }

    var orderId = buildOrderId(snapshot, options && options.orderId);
    return trackEvent('purchase', {
      order_id: orderId,
      cart_id: snapshot.cart_id,
      currency: snapshot.currency,
      value: snapshot.value,
      items: buildEventItems(snapshot),
    }, {
      dedupeKey:
        normalizeText(options && options.dedupeKey) ||
        ['purchase', orderId].join('|'),
    });
  }

  function buildObserverThresholds(threshold) {
    return [0, threshold, 1].filter(function (value, index, source) {
      return value >= 0 && value <= 1 && source.indexOf(value) === index;
    }).sort(function (left, right) {
      return left - right;
    });
  }

  function isInViewport(node, threshold) {
    if (!node || typeof node.getBoundingClientRect !== 'function' || typeof window === 'undefined') {
      return false;
    }

    var rect = node.getBoundingClientRect();
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    if (!(rect.width > 0) || !(rect.height > 0) || !(viewportWidth > 0) || !(viewportHeight > 0)) {
      return false;
    }

    var visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
    var visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
    var totalArea = rect.width * rect.height;

    if (!(totalArea > 0)) {
      return false;
    }

    return (visibleWidth * visibleHeight) / totalArea >= threshold;
  }

  function createImpressionObserver(options) {
    var threshold = typeof (options && options.threshold) === 'number'
      ? Math.max(0, Math.min(1, options.threshold))
      : 0.45;
    var root = options && options.root ? options.root : null;
    var rootMargin = normalizeText(options && options.rootMargin) || '0px 0px -12% 0px';
    var nodeResolvers = new WeakMap();
    var observer = null;

    function unobserve(node) {
      if (observer && node) {
        observer.unobserve(node);
      }
      if (node) {
        nodeResolvers.delete(node);
      }
    }

    function handleResolvedEntry(node, entry) {
      var resolver = nodeResolvers.get(node);
      if (typeof resolver !== 'function') {
        unobserve(node);
        return;
      }

      var payload = resolver(node, entry);
      if (payload && payload.item && payload.context) {
        trackItemImpression(payload.item, payload.context);
      }

      unobserve(node);
    }

    function handleEntries(entries) {
      entries.forEach(function (entry) {
        if (!entry || !entry.target || !entry.isIntersecting) {
          return;
        }

        if (typeof entry.intersectionRatio === 'number' && entry.intersectionRatio < threshold) {
          return;
        }

        handleResolvedEntry(entry.target, entry);
      });
    }

    function ensureObserver() {
      if (observer || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
        return;
      }

      observer = new window.IntersectionObserver(handleEntries, {
        root: root,
        rootMargin: rootMargin,
        threshold: buildObserverThresholds(threshold),
      });
    }

    function observe(node, resolver) {
      if (!node || typeof resolver !== 'function') {
        return;
      }

      nodeResolvers.set(node, resolver);
      ensureObserver();

      if (observer) {
        observer.observe(node);
        return;
      }

      if (isInViewport(node, threshold)) {
        handleResolvedEntry(node, {
          target: node,
          isIntersecting: true,
          intersectionRatio: 1,
        });
      }
    }

    function disconnect() {
      if (observer) {
        observer.disconnect();
      }
      observer = null;
    }

    return {
      disconnect: disconnect,
      observe: observe,
      unobserve: unobserve,
    };
  }

  return {
    buildCartSnapshot: buildCartSnapshot,
    createImpressionObserver: createImpressionObserver,
    getCartId: getCartId,
    normalizeItem: normalizeItem,
    resetCartId: resetCartId,
    trackAddToCart: trackAddToCart,
    trackBeginCheckout: trackBeginCheckout,
    trackCartView: trackCartView,
    trackItemDetailClose: trackItemDetailClose,
    trackItemDetailOpen: trackItemDetailOpen,
    trackItemImpression: trackItemImpression,
    trackPurchase: trackPurchase,
    trackRemoveFromCart: trackRemoveFromCart,
  };
});
