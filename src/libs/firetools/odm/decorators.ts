/**
 * Decorators for Model and Field Definitions
 * These are used to define Firestore models with validation and metadata
 */

import type { FieldMetadata, SubCollectionMetadata, FieldType } from './types';
import {
  setModelMetadata,
  setFieldMetadata,
  setCollectionName,
  setSubCollectionMetadata,
  getModelMetadata,
  getFieldMetadata,
} from './metadata';

/**
 * @Model
 * Marks a class as a Firestore model
 *
 * Usage:
 *   @Model
 *   class Store { ... }
 */
export function Model(target: any): void {
  // Ensure metadata is initialized for this model
  let metadata = getModelMetadata(target);

  if (!metadata) {
    setModelMetadata(target, {
      target,
      fields: new Map(),
    });
  }
}

/**
 * @Collection(name)
 * Specifies the Firestore collection name
 * If not provided, defaults to pluralized class name
 *
 * Usage:
 *   @Collection('stores')
 *   class Store { ... }
 */
export function Collection(name: string) {
  return function (target: any): void {
    setCollectionName(target, name);
  };
}

/**
 * @Field(options)
 * Marks a property as a Firestore field and defines its metadata
 *
 * Usage:
 *   @Field({ required: true, type: 'string' })
 *   name: string;
 *
 *   @Field({
 *     required: true,
 *     type: 'number',
 *     validate: (value) => value > 0 ? null : 'Must be positive'
 *   })
 *   price: number;
 *
 *   @Field({ type: 'timestamp', readonly: true, auto: true })
 *   createdAt?: Date;
 */
export function Field(options: FieldMetadata = {}) {
  return function (target: any, propertyKey: string): void {
    // Ensure model metadata exists
    let metadata = getModelMetadata(target.constructor);
    if (!metadata) {
      setModelMetadata(target.constructor, {
        target: target.constructor,
        fields: new Map(),
      });
    }

    // Set field metadata
    setFieldMetadata(target.constructor, propertyKey, {
      ...options,
      name: propertyKey,
    });
  };
}

/**
 * @SubCollection(collectionName, modelClass?)
 * Marks a property as a reference to a sub-collection
 *
 * Usage:
 *   @SubCollection('products')
 *   products?: ProductRepository;
 */
export function SubCollection(collectionName: string, modelClass?: any) {
  return function (target: any, propertyKey: string): void {
    const subCollectionMetadata: SubCollectionMetadata = {
      propertyName: propertyKey,
      collectionName,
      modelClass,
    };

    setSubCollectionMetadata(target.constructor, propertyKey, subCollectionMetadata);
  };
}

/**
 * @Required
 * Shorthand for marking a field as required
 *
 * Usage:
 *   @Required
 *   @Field()
 *   name: string;
 *
 * Or use directly:
 *   @Field({ required: true })
 *   name: string;
 */
export function Required(target: any, propertyKey: string): void {
  const metadata = getFieldMetadata(target.constructor, propertyKey) || {};
  setFieldMetadata(target.constructor, propertyKey, {
    ...metadata,
    required: true,
  });
}

/**
 * @ReadOnly
 * Shorthand for marking a field as read-only (cannot be updated after creation)
 *
 * Usage:
 *   @ReadOnly
 *   @Field({ type: 'timestamp' })
 *   createdAt?: Date;
 *
 * Or use directly:
 *   @Field({ readonly: true })
 *   createdAt?: Date;
 */
export function ReadOnly(target: any, propertyKey: string): void {
  const metadata = getFieldMetadata(target.constructor, propertyKey) || {};
  setFieldMetadata(target.constructor, propertyKey, {
    ...metadata,
    readonly: true,
  });
}

/**
 * Helper function for Firestore field imports and re-exports
 * Allows automatic type inference for common field types
 */
export const FieldBuilder = {
  /**
   * Create a required string field
   */
  string: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'string' as FieldType,
    required: true,
    ...options,
  }),

  /**
   * Create an optional string field
   */
  optionalString: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'string' as FieldType,
    required: false,
    ...options,
  }),

  /**
   * Create a required number field
   */
  number: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'number' as FieldType,
    required: true,
    ...options,
  }),

  /**
   * Create an optional number field
   */
  optionalNumber: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'number' as FieldType,
    required: false,
    ...options,
  }),

  /**
   * Create a required boolean field
   */
  boolean: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'boolean' as FieldType,
    required: true,
    ...options,
  }),

  /**
   * Create an optional boolean field
   */
  optionalBoolean: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'boolean' as FieldType,
    required: false,
    ...options,
  }),

  /**
   * Create an automatic timestamp field (createdAt)
   */
  createdAt: () => ({
    type: 'timestamp' as FieldType,
    readonly: true,
    auto: true,
  }),

  /**
   * Create an automatic timestamp field (updatedAt)
   */
  updatedAt: () => ({
    type: 'timestamp' as FieldType,
    readonly: true,
    auto: true,
  }),

  /**
   * Create an optional timestamp field
   */
  timestamp: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'timestamp' as FieldType,
    required: false,
    ...options,
  }),

  /**
   * Create an object field
   */
  object: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'object' as FieldType,
    required: false,
    ...options,
  }),

  /**
   * Create an array field
   */
  array: (options?: Omit<FieldMetadata, 'type'>) => ({
    type: 'array' as FieldType,
    required: false,
    ...options,
  }),
};
