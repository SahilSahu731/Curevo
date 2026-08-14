export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (result.data.body !== undefined) {
    req.body = result.data.body;
  }
  if (result.data.query !== undefined) {
    Object.defineProperty(req, "query", {
      value: result.data.query,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }
  if (result.data.params !== undefined) {
    req.params = result.data.params;
  }
  next();
};
