const Joi = require("joi");

const adminSignupSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  password: Joi.string().min(6).required(),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().email().trim().optional(),
  phoneNumber: Joi.string().trim().optional(),
});

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const createCandidateSchema = Joi.object({
  name: Joi.string().required(),
  party: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  adminSignupSchema,
  adminLoginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  createCandidateSchema,
};