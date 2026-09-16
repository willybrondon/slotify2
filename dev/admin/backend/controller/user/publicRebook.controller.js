const { getRebookContextByToken } = require("../../services/rebooking.service");

/**
 * GET /api/public/rebook/:token
 * Opaque token from SMS / push — returns prefill context for salon booking UI.
 */
exports.publicGetRebookContext = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;
    const result = await getRebookContextByToken(token);
    if (!result.status) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("[publicGetRebookContext]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
