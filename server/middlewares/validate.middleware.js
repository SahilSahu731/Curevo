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

  req.body = result.data.body ?? req.body;
  req.query = result.data.query ?? req.query;
  req.params = result.data.params ?? req.params;
  next();
};
