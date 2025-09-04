const { requireAdmin } = require("./_utils/auth");
const { store } = require("./_utils/store");
exports.handler = async (event) => {
  try {
    requireAdmin(event);
    if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    const { orderId } = JSON.parse(event.body || "{}");
    if (!orderId) return { statusCode: 400, body: JSON.stringify({ error: "orderId required" }) };
    const rec = store.updateStatus(orderId, "paid");
    if (!rec) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: e.statusCode || 500, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
