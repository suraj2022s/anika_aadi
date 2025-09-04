const crypto = require("crypto");
const { store } = require("./_utils/store");
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    const { amountINR, plan } = JSON.parse(event.body || "{}");
    if (!amountINR || !plan) return { statusCode: 400, body: JSON.stringify({ error: "amountINR and plan required" }) };
    const vpa = process.env.MERCHANT_VPA || "test@upi";
    const orderId = "ord_" + crypto.randomBytes(8).toString("hex");
    const note = `AnikaAadi ${plan} ${orderId}`;
    const upiLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent("AnikaAadi")}&am=${encodeURIComponent(amountINR)}&cu=INR&tn=${encodeURIComponent(note)}`;
    store.put({ orderId, plan, amountINR, upiLink, status: "created", createdAt: Date.now() });
    return { statusCode: 200, body: JSON.stringify({ orderId, upiLink, amountINR, plan }) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
