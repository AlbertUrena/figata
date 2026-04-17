const { normalizeText } = require('./pathing.js');

function randomId(prefix) {
  var base = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return normalizeText(prefix, 'evt') + '_' + base.slice(0, 20);
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendRestaurantReservationNotification(env, reservation) {
  const toEmail = normalizeText(env && env.RESERVATIONS_NOTIFY_TO);
  const apiKey = normalizeText(env && env.RESEND_API_KEY);
  const fromEmail = normalizeText(env && env.RESEND_FROM_EMAIL, 'Figata <reservas@trattoriafigata.com>');

  if (!toEmail || !apiKey || typeof fetch !== 'function') {
    return {
      channel: 'email',
      target: toEmail || '',
      template_id: 'restaurant_new_reservation',
      delivery_status: 'skipped',
      provider_message_id: '',
      detail: 'RESEND_API_KEY o RESERVATIONS_NOTIFY_TO no configurados',
    };
  }

  const html = [
    '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#191919">',
    '<h1 style="font-size:20px;margin:0 0 12px">Nueva reserva pendiente</h1>',
    '<p style="margin:0 0 18px">Entró una nueva reserva desde la web y está esperando revisión.</p>',
    '<table style="width:100%;border-collapse:collapse">',
    '<tbody>',
    '<tr><td style="padding:6px 0;color:#666">Código</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.reservation_code) + '</strong></td></tr>',
    '<tr><td style="padding:6px 0;color:#666">Fecha</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.reservation_date) + '</strong></td></tr>',
    '<tr><td style="padding:6px 0;color:#666">Hora</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.reservation_time) + '</strong></td></tr>',
    '<tr><td style="padding:6px 0;color:#666">Comensales</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.party_size) + '</strong></td></tr>',
    '<tr><td style="padding:6px 0;color:#666">Zona</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.zone_label || reservation.zone_id) + '</strong></td></tr>',
    '<tr><td style="padding:6px 0;color:#666">Cliente</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.customer_name) + '</strong></td></tr>',
    '<tr><td style="padding:6px 0;color:#666">Whatsapp</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.whatsapp_display) + '</strong></td></tr>',
    (normalizeText(reservation.notes)
      ? '<tr><td style="padding:6px 0;color:#666">Notas</td><td style="padding:6px 0;text-align:right"><strong>' + escapeHtml(reservation.notes) + '</strong></td></tr>'
      : ''),
    '</tbody>',
    '</table>',
    '</div>',
  ].join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: 'Nueva reserva pendiente · ' + reservation.reservation_date + ' ' + reservation.reservation_time,
      html: html,
    }),
  });

  const payload = await response.json().catch(function () { return {}; });
  if (!response.ok) {
    return {
      channel: 'email',
      target: toEmail,
      template_id: 'restaurant_new_reservation',
      delivery_status: 'failed',
      provider_message_id: '',
      detail: normalizeText(payload && payload.message, 'Resend rechazó la notificación'),
    };
  }

  return {
    channel: 'email',
    target: toEmail,
    template_id: 'restaurant_new_reservation',
    delivery_status: 'sent',
    provider_message_id: normalizeText(payload && payload.id),
    detail: 'Notificación enviada a operación',
  };
}

function buildNotificationLog(reservationId, result, nowIso) {
  const source = result && typeof result === 'object' ? result : {};
  return {
    id: randomId('notify'),
    reservation_id: normalizeText(reservationId),
    channel: normalizeText(source.channel, 'email'),
    target: normalizeText(source.target),
    template_id: normalizeText(source.template_id),
    delivery_status: normalizeText(source.delivery_status, 'skipped'),
    provider_message_id: normalizeText(source.provider_message_id),
    detail: normalizeText(source.detail),
    created_at: normalizeText(nowIso),
  };
}

module.exports = {
  buildNotificationLog,
  sendRestaurantReservationNotification,
};
