module.exports = (request, options) => {
  const { defaultResolver } = options;

  try {
    return defaultResolver(request, options);
  } catch (error) {
    if (!request.endsWith(".js")) {
      throw error;
    }

    const tsRequest = request.replace(/\.js$/, ".ts");
    const tsxRequest = request.replace(/\.js$/, ".tsx");

    try {
      return defaultResolver(tsRequest, options);
    } catch {}

    try {
      return defaultResolver(tsxRequest, options);
    } catch {}

    throw error;
  }
};