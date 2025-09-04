const { requireAdmin } = require("./_utils/auth");
const { store } = require("./_utils/store");
exports.handler = async (event) => {
  try { requireAdmin(event); return { statusCode: 200, body: JSON.stringify({ items: store.list() }) }; }
  catch (e) { return { statusCode: e.statusCode || 500, body: JSON.stringify({ error: String(e.message || e) }) }; }
};
