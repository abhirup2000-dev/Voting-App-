const Joi = require("joi");

// ===========================
// Candidate Login Validation
// ===========================
const candidateLoginSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone is required",
      "string.pattern.base": "Phone must be a valid 10-digit number"
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters"
    })
});




module.exports = {
  candidateLoginSchema
 
};