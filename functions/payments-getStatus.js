const { store } = require("./_utils/store");
exports.handler = async (event) => {
  try {
    const orderId = (event.queryStringParameters && event.queryStringParameters.orderId) || "";
    if (!orderId) return { statusCode: 400, body: JSON.stringify({ error: "orderId required" }) };
    const rec = store.get(orderId);
    if (!rec) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    return { statusCode: 200, body: JSON.stringify({ orderId: rec.orderId, status: rec.status, plan: rec.plan, amountINR: rec.amountINR }) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
