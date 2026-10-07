/**
 * Built-in Validators for Field Validation
 */

import type { FieldMetadata } from './types';
import { ValidationError } from './types';

export { ValidationError };

/**
 * Validate a value against field metadata
 */
export function validateField<T>(fieldName: string, value: T, metadata: FieldMetadata): void {
  // Skip validation for undefined optional fields
  if (value === undefined && !metadata.required) {
    return;
  }

  // Check required
  if (metadata.required && (value === undefined || value === null)) {
    throw new ValidationError(fieldName, `is required`);
  }

  // Check type
  if (value !== undefined && value !== null && metadata.type) {
    validateType(fieldName, value, metadata.type);
  }

  // Run custom validator
  if (metadata.validate && value !== undefined && value !== null) {
    const error = metadata.validate(value);
    if (error) {
      throw new ValidationError(fieldName, error);
    }
  }
}

/**
 * Validate a value's type
 */
function validateType(fieldName: string, value: any, type: string): void {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new ValidationError(fieldName, `must be a string, got ${typeof value}`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        throw new ValidationError(fieldName, `must be a number, got ${typeof value}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new ValidationError(fieldName, `must be a boolean, got ${typeof value}`);
      }
      break;

    case 'timestamp':
      if (!(value instanceof Date)) {
        throw new ValidationError(fieldName, `must be a Date, got ${typeof value}`);
      }
      break;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new ValidationError(fieldName, `must be an object, got ${typeof value}`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        throw new ValidationError(fieldName, `must be an array, got ${typeof value}`);
      }
      break;

    default:
      // Unknown type, skip validation
      break;
  }
}

/**
 * Validate all fields of an object
 */
export function validateObject(
  object: any,
  fieldsMetadata: Map<string, FieldMetadata>,
  skipValidation = false,
): void {
  if (skipValidation) return;

  for (const [fieldName, metadata] of fieldsMetadata) {
    const value = object[fieldName];
    validateField(fieldName, value, metadata);
  }
}

/**
 * Common validator functions that can be used in @Field decorators
 */

export const Validators = {
  /**
   * Validates that a number is greater than a minimum value
   */
  min: (minValue: number) => (value: number) => {
    return value >= minValue ? null : `must be at least ${minValue}`;
  },

  /**
   * Validates that a number is less than a maximum value
   */
  max: (maxValue: number) => (value: number) => {
    return value <= maxValue ? null : `must be at most ${maxValue}`;
  },

  /**
   * Validates that a string matches a pattern
   */
  pattern: (pattern: RegExp, message?: string) => (value: string) => {
    return pattern.test(value) ? null : message || `must match pattern ${pattern}`;
  },

  /**
   * Validates that a string is not empty
   */
  nonEmpty: (value: string) => {
    return value.trim().length > 0 ? null : `cannot be empty`;
  },

  /**
   * Validates that a string has minimum length
   */
  minLength: (length: number) => (value: string) => {
    return value.length >= length ? null : `must be at least ${length} characters`;
  },

  /**
   * Validates that a string has maximum length
   */
  maxLength: (length: number) => (value: string) => {
    return value.length <= length ? null : `must be at most ${length} characters`;
  },

  /**
   * Validates that a value is one of the allowed values
   */
  oneOf: (allowed: any[]) => (value: any) => {
    return allowed.includes(value) ? null : `must be one of: ${allowed.join(', ')}`;
  },

  /**
   * Validates email format
   */
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : `must be a valid email`;
  },

  /**
   * Validates URL format
   */
  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return `must be a valid URL`;
    }
  },

  /**
   * Combine multiple validators (all must pass)
   */
  all:
    (...validators: Array<(value: any) => string | null>) =>
    (value: any) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    },
};
