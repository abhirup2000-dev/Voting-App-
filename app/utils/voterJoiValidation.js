const Joi = require("joi");

// ===========================
// Voter Register Validation
// ===========================
const voterRegisterSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Name is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "any.required": "Phone is required",
      "string.pattern.base": "Phone must be 10 digits",
    }),

  epicNumber: Joi.string().trim().uppercase().required().messages({
    "any.required": "EPIC number is required",
  }),

  constituency: Joi.string().trim().required().messages({
    "any.required": "Constituency is required",
  }),

  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

// ===========================
// Voter Login Validation
// ===========================
const voterLoginSchema = Joi.object({
  epicNumber: Joi.string().trim().uppercase().required().messages({
    "any.required": "EPIC number is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// ===========================
// Update Password Validation
// ===========================
const voterUpdatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),

  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.min": "New password must be at least 6 characters",
  }),
});

// ===========================
// Vote Validation
// ===========================
const voterVoteSchema = Joi.object({
  candidateId: Joi.string().hex().length(24).required().messages({
    "any.required": "Candidate ID is required",
    "string.length": "Invalid candidate ID",
  }),
});

module.exports = {
  voterRegisterSchema,
  voterLoginSchema,
  voterUpdatePasswordSchema,
  voterVoteSchema,
};