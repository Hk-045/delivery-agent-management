import validator from 'validator';
import { AppError } from './AppError.js';

const ALLOWED_FIELDS = ['fullName', 'phone', 'email', 'serviceArea', 'status'];
const ALLOWED_STATUS = ['active', 'inactive'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const isValidPhone = (phone) =>
  isNonEmptyString(phone) && validator.isMobilePhone(phone.replace(/[\s-]/g, ''), 'en-IN');

export const validateCreateAgentData = (req) => {
  if (!req.body) {
    throw new AppError('Request body is required', 400);
  }

  const isAllowed = Object.keys(req.body).every((field) => ALLOWED_FIELDS.includes(field));
  if (!isAllowed) {
    throw new AppError('Invalid fields in request', 400);
  }

  const { fullName, phone, email, serviceArea, status } = req.body;

  if (!isNonEmptyString(fullName)) {
    throw new AppError('Full name is required', 400);
  } else if (fullName.trim().length > 100) {
    throw new AppError('Full name must be at most 100 characters', 400);
  } else if (!isValidPhone(phone)) {
    throw new AppError('Phone number is not valid', 400);
  } else if (!isNonEmptyString(email) || !validator.isEmail(email.trim())) {
    throw new AppError('Email is not valid', 400);
  } else if (!isNonEmptyString(serviceArea)) {
    throw new AppError('Service area is required', 400);
  } else if (serviceArea.trim().length > 100) {
    throw new AppError('Service area must be at most 100 characters', 400);
  } else if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
    throw new AppError('Status must be active or inactive', 400);
  }
};

export const validateUpdateAgentData = (req) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('At least one field is required', 400);
  }

  const isAllowed = Object.keys(req.body).every((field) => ALLOWED_FIELDS.includes(field));
  if (!isAllowed) {
    throw new AppError('Invalid fields in request', 400);
  }

  const { fullName, phone, email, serviceArea, status } = req.body;

  if (fullName !== undefined && (!isNonEmptyString(fullName) || fullName.trim().length > 100)) {
    throw new AppError('Full name is not valid', 400);
  } else if (phone !== undefined && !isValidPhone(phone)) {
    throw new AppError('Phone number is not valid', 400);
  } else if (email !== undefined && (!isNonEmptyString(email) || !validator.isEmail(email.trim()))) {
    throw new AppError('Email is not valid', 400);
  } else if (serviceArea !== undefined && (!isNonEmptyString(serviceArea) || serviceArea.trim().length > 100)) {
    throw new AppError('Service area is not valid', 400);
  } else if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
    throw new AppError('Status must be active or inactive', 400);
  }
};

export const sanitizeAgentData = (body) => {
  const data = {};
  if (body.fullName !== undefined) data.fullName = body.fullName.trim();
  if (body.phone !== undefined) data.phone = '+91' + body.phone.replace(/\D/g, '').slice(-10);
  if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
  if (body.serviceArea !== undefined) data.serviceArea = body.serviceArea.trim();
  if (body.status !== undefined) data.status = body.status;
  return data;
};

export const validateAgentId = (id) => {
  if (!validator.isUUID(id)) {
    throw new AppError('Invalid agent id', 400);
  }
};