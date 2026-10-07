/**
 * Firebase ODM/ORM - Main Entry Point
 * Exports all public APIs for building Firestore models
 */

// Core decorators
export { Model, Collection, Field, SubCollection, Required, ReadOnly, FieldBuilder } from './decorators';

// Core Repository
export { Repository, createRepository } from './repository';

// Type definitions
export type {
  FieldType,
  ValidatorFn,
  FieldMetadata,
  ModelMetadata,
  SubCollectionMetadata,
  CrudOptions,
  CreateInput,
  UpdateInput,
  Partial,
  Omit,
  RepositoryResult,
  FirestoreOperator,
  WhereCondition,
  QueryOptions,
} from './types';

// Validation
export { ValidationError, validateField, validateObject, Validators } from './validators';

// Metadata utilities (for advanced use)
export {
  getModelMetadata,
  getFieldMetadata,
  getModelFields,
  getCollectionName,
  getSubCollectionMetadata,
  getModelSubCollections,
  getCollectionPath,
  isModel,
} from './metadata';
