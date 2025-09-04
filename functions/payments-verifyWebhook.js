const crypto = require("crypto");
const { store } = require("./_utils/store");
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return { statusCode: 400, body: JSON.stringify({ error: "Webhook not configured" }) };
    const sig = event.headers["x-razorpay-signature"] || event.headers["X-Razorpay-Signature"];
    const body = event.body || "";
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== sig) return { statusCode: 401, body: JSON.stringify({ error: "Invalid signature" }) };
    const payload = JSON.parse(body);
    const orderId = (payload && payload.payload && payload.payload.payment && payload.payload.payment.entity && payload.payload.payment.entity.notes && payload.payload.payment.entity.notes.orderId) || null;
    if (orderId) store.updateStatus(orderId, "paid");
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
