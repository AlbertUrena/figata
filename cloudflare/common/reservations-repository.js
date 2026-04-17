const { normalizeText } = require('./pathing.js');

const ACTIVE_OCCUPANCY_STATUSES = ['pending', 'confirmed'];

const schemaReady = new WeakMap();

function requireDatabase(db) {
  if (!db || typeof db.prepare !== 'function') {
    throw new Error('RESERVATIONS_DB binding is required');
  }
  return db;
}

async function ensureSchema(db) {
  const database = requireDatabase(db);
  if (schemaReady.has(database)) {
    return schemaReady.get(database);
  }

  const statements = [
    [
      'CREATE TABLE IF NOT EXISTS reservations (',
      '  id TEXT PRIMARY KEY,',
      '  reservation_code TEXT NOT NULL,',
      '  customer_name TEXT NOT NULL,',
      '  whatsapp_country_code TEXT NOT NULL,',
      '  whatsapp_number TEXT NOT NULL,',
      '  whatsapp_display TEXT NOT NULL,',
      '  party_size INTEGER NOT NULL,',
      '  reservation_date TEXT NOT NULL,',
      '  reservation_time TEXT NOT NULL,',
      '  zone_id TEXT NOT NULL,',
      '  notes TEXT NOT NULL DEFAULT \'\',',
      '  status TEXT NOT NULL,',
      '  source TEXT NOT NULL DEFAULT \'web\',',
      '  confirmation_mode TEXT NOT NULL DEFAULT \'manual\',',
      '  internal_note TEXT NOT NULL DEFAULT \'\',',
      '  request_snapshot_json TEXT NOT NULL DEFAULT \'{}\',',
      '  created_at TEXT NOT NULL,',
      '  updated_at TEXT NOT NULL,',
      '  status_updated_at TEXT NOT NULL,',
      '  status_updated_by TEXT NOT NULL DEFAULT \'\'',
      ');',
    ].join('\n'),
    'CREATE INDEX IF NOT EXISTS idx_reservations_slot ON reservations (reservation_date, reservation_time, zone_id);',
    'CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status);',
    'CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations (created_at DESC);',
    [
      'CREATE TABLE IF NOT EXISTS reservation_blocks (',
      '  id TEXT PRIMARY KEY,',
      '  reservation_date TEXT NOT NULL,',
      '  reservation_time TEXT NOT NULL,',
      '  zone_id TEXT NOT NULL,',
      '  note TEXT NOT NULL DEFAULT \'\',',
      '  created_at TEXT NOT NULL,',
      '  created_by TEXT NOT NULL DEFAULT \'\',',
      '  updated_at TEXT NOT NULL,',
      '  UNIQUE (reservation_date, reservation_time, zone_id)',
      ');',
    ].join('\n'),
    'CREATE INDEX IF NOT EXISTS idx_reservation_blocks_slot ON reservation_blocks (reservation_date, reservation_time, zone_id);',
    [
      'CREATE TABLE IF NOT EXISTS notification_log (',
      '  id TEXT PRIMARY KEY,',
      '  reservation_id TEXT NOT NULL,',
      '  channel TEXT NOT NULL,',
      '  target TEXT NOT NULL,',
      '  template_id TEXT NOT NULL DEFAULT \'\',',
      '  delivery_status TEXT NOT NULL,',
      '  provider_message_id TEXT NOT NULL DEFAULT \'\',',
      '  detail TEXT NOT NULL DEFAULT \'\',',
      '  created_at TEXT NOT NULL',
      ');',
    ].join('\n'),
    'CREATE INDEX IF NOT EXISTS idx_notification_log_reservation ON notification_log (reservation_id, created_at DESC);',
  ];

  const promise = (async function () {
    for (const statement of statements) {
      await database.prepare(statement).run();
    }
  })();

  schemaReady.set(database, promise);
  return promise;
}

async function runAll(statement) {
  const result = await statement.all();
  return Array.isArray(result && result.results) ? result.results : [];
}

async function runFirst(statement) {
  return statement.first() || null;
}

function parseJson(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function mapReservationRow(row) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  return {
    id: normalizeText(row.id),
    reservation_code: normalizeText(row.reservation_code),
    customer_name: normalizeText(row.customer_name),
    whatsapp_country_code: normalizeText(row.whatsapp_country_code),
    whatsapp_number: normalizeText(row.whatsapp_number),
    whatsapp_display: normalizeText(row.whatsapp_display),
    party_size: Number(row.party_size || 0),
    reservation_date: normalizeText(row.reservation_date),
    reservation_time: normalizeText(row.reservation_time),
    zone_id: normalizeText(row.zone_id),
    notes: normalizeText(row.notes),
    status: normalizeText(row.status),
    source: normalizeText(row.source, 'web'),
    confirmation_mode: normalizeText(row.confirmation_mode, 'manual'),
    internal_note: normalizeText(row.internal_note),
    request_snapshot: parseJson(row.request_snapshot_json, {}),
    created_at: normalizeText(row.created_at),
    updated_at: normalizeText(row.updated_at),
    status_updated_at: normalizeText(row.status_updated_at),
    status_updated_by: normalizeText(row.status_updated_by),
  };
}

function mapBlockRow(row) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  return {
    id: normalizeText(row.id),
    reservation_date: normalizeText(row.reservation_date),
    reservation_time: normalizeText(row.reservation_time),
    zone_id: normalizeText(row.zone_id),
    note: normalizeText(row.note),
    created_at: normalizeText(row.created_at),
    created_by: normalizeText(row.created_by),
    updated_at: normalizeText(row.updated_at),
  };
}

async function getOccupancyForSlot(db, slot) {
  await ensureSchema(db);
  const row = await runFirst(
    db.prepare([
      'SELECT COUNT(*) AS reservations_count,',
      'COALESCE(SUM(party_size), 0) AS covers_count',
      'FROM reservations',
      'WHERE reservation_date = ?1',
      '  AND reservation_time = ?2',
      '  AND zone_id = ?3',
      '  AND status IN (?4, ?5)',
    ].join('\n')).bind(
      normalizeText(slot && slot.date),
      normalizeText(slot && slot.time),
      normalizeText(slot && slot.zone_id),
      ACTIVE_OCCUPANCY_STATUSES[0],
      ACTIVE_OCCUPANCY_STATUSES[1]
    )
  );

  return {
    reservations_count: Number(row && row.reservations_count || 0),
    covers_count: Number(row && row.covers_count || 0),
  };
}

async function getBlockForSlot(db, slot) {
  await ensureSchema(db);
  const row = await runFirst(
    db.prepare([
      'SELECT id, reservation_date, reservation_time, zone_id, note, created_at, created_by, updated_at',
      'FROM reservation_blocks',
      'WHERE reservation_date = ?1',
      '  AND reservation_time = ?2',
      '  AND zone_id = ?3',
      'LIMIT 1',
    ].join('\n')).bind(
      normalizeText(slot && slot.date),
      normalizeText(slot && slot.time),
      normalizeText(slot && slot.zone_id)
    )
  );

  return mapBlockRow(row);
}

async function createReservation(db, payload) {
  await ensureSchema(db);
  await db.prepare([
    'INSERT INTO reservations (',
    '  id, reservation_code, customer_name, whatsapp_country_code, whatsapp_number, whatsapp_display,',
    '  party_size, reservation_date, reservation_time, zone_id, notes, status, source, confirmation_mode,',
    '  internal_note, request_snapshot_json, created_at, updated_at, status_updated_at, status_updated_by',
    ') VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)',
  ].join('\n')).bind(
    normalizeText(payload.id),
    normalizeText(payload.reservation_code),
    normalizeText(payload.customer_name),
    normalizeText(payload.whatsapp_country_code, '+1'),
    normalizeText(payload.whatsapp_number),
    normalizeText(payload.whatsapp_display),
    Number(payload.party_size || 0),
    normalizeText(payload.reservation_date),
    normalizeText(payload.reservation_time),
    normalizeText(payload.zone_id),
    normalizeText(payload.notes),
    normalizeText(payload.status, 'pending'),
    normalizeText(payload.source, 'web'),
    normalizeText(payload.confirmation_mode, 'manual'),
    normalizeText(payload.internal_note),
    JSON.stringify(payload.request_snapshot || {}),
    normalizeText(payload.created_at),
    normalizeText(payload.updated_at),
    normalizeText(payload.status_updated_at),
    normalizeText(payload.status_updated_by)
  ).run();

  return getReservationById(db, payload.id);
}

async function getReservationById(db, reservationId) {
  await ensureSchema(db);
  const row = await runFirst(
    db.prepare([
      'SELECT * FROM reservations',
      'WHERE id = ?1',
      'LIMIT 1',
    ].join('\n')).bind(normalizeText(reservationId))
  );
  return mapReservationRow(row);
}

async function listReservations(db, filters) {
  await ensureSchema(db);
  const source = filters && typeof filters === 'object' ? filters : {};
  const clauses = ['1 = 1'];
  const bindings = [];

  function addClause(sql, value) {
    bindings.push(value);
    clauses.push(sql.replace(/\?/g, '?' + bindings.length));
  }

  if (normalizeText(source.status)) {
    addClause('status = ?', normalizeText(source.status));
  }
  if (normalizeText(source.zone_id)) {
    addClause('zone_id = ?', normalizeText(source.zone_id));
  }
  if (normalizeText(source.date)) {
    addClause('reservation_date = ?', normalizeText(source.date));
  }

  var limit = Number(source.limit || 50);
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = 50;
  }
  limit = Math.min(200, Math.round(limit));

  const statement = db.prepare([
    'SELECT * FROM reservations',
    'WHERE ' + clauses.join(' AND '),
    'ORDER BY reservation_date DESC, reservation_time DESC, created_at DESC',
    'LIMIT ' + limit,
  ].join('\n'));

  const rows = await runAll(statement.bind.apply(statement, bindings));

  return rows.map(mapReservationRow).filter(Boolean);
}

async function updateReservationStatus(db, reservationId, payload) {
  await ensureSchema(db);
  await db.prepare([
    'UPDATE reservations',
    'SET status = ?2, internal_note = ?3, updated_at = ?4, status_updated_at = ?5, status_updated_by = ?6',
    'WHERE id = ?1',
  ].join('\n')).bind(
    normalizeText(reservationId),
    normalizeText(payload && payload.status),
    normalizeText(payload && payload.internal_note),
    normalizeText(payload && payload.updated_at),
    normalizeText(payload && payload.status_updated_at),
    normalizeText(payload && payload.status_updated_by)
  ).run();

  return getReservationById(db, reservationId);
}

async function listBlocks(db, filters) {
  await ensureSchema(db);
  const source = filters && typeof filters === 'object' ? filters : {};
  const clauses = ['1 = 1'];
  const bindings = [];

  function addClause(sql, value) {
    bindings.push(value);
    clauses.push(sql.replace(/\?/g, '?' + bindings.length));
  }

  if (normalizeText(source.zone_id)) {
    addClause('zone_id = ?', normalizeText(source.zone_id));
  }
  if (normalizeText(source.date)) {
    addClause('reservation_date = ?', normalizeText(source.date));
  }

  var limit = Number(source.limit || 100);
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = 100;
  }
  limit = Math.min(200, Math.round(limit));

  const statement = db.prepare([
    'SELECT * FROM reservation_blocks',
    'WHERE ' + clauses.join(' AND '),
    'ORDER BY reservation_date DESC, reservation_time DESC, created_at DESC',
    'LIMIT ' + limit,
  ].join('\n'));

  const rows = await runAll(statement.bind.apply(statement, bindings));
  return rows.map(mapBlockRow).filter(Boolean);
}

async function upsertBlock(db, payload) {
  await ensureSchema(db);
  await db.prepare([
    'INSERT INTO reservation_blocks (id, reservation_date, reservation_time, zone_id, note, created_at, created_by, updated_at)',
    'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)',
    'ON CONFLICT(reservation_date, reservation_time, zone_id) DO UPDATE SET',
    '  note = excluded.note,',
    '  created_by = excluded.created_by,',
    '  updated_at = excluded.updated_at',
  ].join('\n')).bind(
    normalizeText(payload.id),
    normalizeText(payload.reservation_date),
    normalizeText(payload.reservation_time),
    normalizeText(payload.zone_id),
    normalizeText(payload.note),
    normalizeText(payload.created_at),
    normalizeText(payload.created_by),
    normalizeText(payload.updated_at)
  ).run();

  return getBlockForSlot(db, {
    date: payload.reservation_date,
    time: payload.reservation_time,
    zone_id: payload.zone_id,
  });
}

async function deleteBlock(db, blockId) {
  await ensureSchema(db);
  const existing = await runFirst(
    db.prepare('SELECT * FROM reservation_blocks WHERE id = ?1 LIMIT 1').bind(normalizeText(blockId))
  );
  if (!existing) {
    return null;
  }
  await db.prepare('DELETE FROM reservation_blocks WHERE id = ?1').bind(normalizeText(blockId)).run();
  return mapBlockRow(existing);
}

async function insertNotificationLog(db, payload) {
  await ensureSchema(db);
  await db.prepare([
    'INSERT INTO notification_log (id, reservation_id, channel, target, template_id, delivery_status, provider_message_id, detail, created_at)',
    'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)',
  ].join('\n')).bind(
    normalizeText(payload.id),
    normalizeText(payload.reservation_id),
    normalizeText(payload.channel),
    normalizeText(payload.target),
    normalizeText(payload.template_id),
    normalizeText(payload.delivery_status),
    normalizeText(payload.provider_message_id),
    normalizeText(payload.detail),
    normalizeText(payload.created_at)
  ).run();
}

module.exports = {
  ACTIVE_OCCUPANCY_STATUSES,
  createReservation,
  deleteBlock,
  ensureSchema,
  getBlockForSlot,
  getOccupancyForSlot,
  getReservationById,
  insertNotificationLog,
  listBlocks,
  listReservations,
  upsertBlock,
  updateReservationStatus,
};
