/**
 * Core Type Definitions for ODM/ORM
 */

/**
 * Field type options
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'object' | 'array';

/**
 * Validator function that returns error message or null if valid
 */
export type ValidatorFn<T = any> = (value: T) => string | null;

/**
 * Field metadata configuration
 */
export interface FieldMetadata {
  /** Field name */
  name?: string;

  /** Field type */
  type?: FieldType;

  /** Whether field is required */
  required?: boolean;

  /** Whether field is read-only (cannot be updated) */
  readonly?: boolean;

  /** Whether field should be automatically managed (timestamps) */
  auto?: boolean;

  /** Custom validator function */
  validate?: ValidatorFn;

  /** Field description/documentation */
  description?: string;

  /** Default value for the field */
  default?: any;
}

/**
 * Model metadata configuration
 */
export interface ModelMetadata {
  /** Class constructor */
  target: any;

  /** Collection name in Firestore */
  collectionName?: string;

  /** All fields metadata */
  fields: Map<string, FieldMetadata>;

  /** Whether this is a sub-collection model */
  isSubCollection?: boolean;

  /** Parent collection path (for sub-collections) */
  parentPath?: string;
}

/**
 * Sub-collection metadata
 */
export interface SubCollectionMetadata {
  /** Property name on the model */
  propertyName: string;

  /** Firestore collection name */
  collectionName: string;

  /** Related model class */
  modelClass?: any;
}

/**
 * Validation error with field context
 */
export class ValidationError extends Error {
  field: string;
  message: string;

  constructor(field: string, message: string) {
    super(`Validation failed: field '${field}' - ${message}`);
    this.field = field;
    this.message = message;
    this.name = 'ValidationError';
  }
}

/**
 * Repository operation result
 */
export interface RepositoryResult<T> {
  /** The data */
  data: T;

  /** Document ID */
  id: string;

  /** Creation timestamp */
  createdAt?: Date;

  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * CRUD operation options
 */
export interface CrudOptions {
  /** Skip validation (use with caution) */
  skipValidation?: boolean;

  /** Custom metadata to merge */
  metadata?: Record<string, any>;
}

/**
 * Partial type for updates (all fields optional)
 */
export type Partial<T> = {
  [P in keyof T]?: T[P] | undefined;
};

/**
 * Omit type for excluding properties
 */
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Create input type (excludes timestamps and id)
 */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update input type (all fields optional except constraints)
 */
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
