exports.requireAdmin = (event) => {
  const ctx = event.clientContext || {};
  const user = (ctx.identity && ctx.identity.user) || ctx.user || null;
  const roles = (user && user.app_metadata && user.app_metadata.roles) || [];
  const isAdmin = roles.includes("admin");
  if (!isAdmin) {
    const err = new Error("Forbidden: admin role required");
    err.statusCode = 403;
    throw err;
  }
  return user;
};
