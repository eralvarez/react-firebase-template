/**
 * Metadata Storage and Retrieval System
 * Stores decorator metadata at runtime for validation and serialization
 */

import type { FieldMetadata, ModelMetadata, SubCollectionMetadata } from './types';

/**
 * Global metadata store
 * Key: Class constructor (target)
 * Value: ModelMetadata
 */
const modelMetadataMap = new WeakMap<any, ModelMetadata>();

/**
 * Global sub-collection metadata store
 * Key: Class constructor (target)
 * Value: Map of property names to sub-collection metadata
 */
const subCollectionMetadataMap = new WeakMap<any, Map<string, SubCollectionMetadata>>();

/**
 * Store model metadata
 */
export function setModelMetadata(target: any, metadata: ModelMetadata): void {
  modelMetadataMap.set(target, metadata);
}

/**
 * Retrieve model metadata
 */
export function getModelMetadata(target: any): ModelMetadata | undefined {
  return modelMetadataMap.get(target);
}

/**
 * Check if a class has model metadata (is a model)
 */
export function isModel(target: any): boolean {
  return modelMetadataMap.has(target);
}

/**
 * Set field metadata on a model
 */
export function setFieldMetadata(target: any, fieldName: string, metadata: FieldMetadata): void {
  let modelMetadata = modelMetadataMap.get(target);

  if (!modelMetadata) {
    modelMetadata = {
      target,
      fields: new Map(),
    };
    modelMetadataMap.set(target, modelMetadata);
  }

  // Merge field metadata
  const existing = modelMetadata.fields.get(fieldName) || {};
  modelMetadata.fields.set(fieldName, { ...existing, ...metadata, name: fieldName });
}

/**
 * Get field metadata for a model
 */
export function getFieldMetadata(target: any, fieldName: string): FieldMetadata | undefined {
  const modelMetadata = modelMetadataMap.get(target);
  return modelMetadata?.fields.get(fieldName);
}

/**
 * Get all fields for a model
 */
export function getModelFields(target: any): Map<string, FieldMetadata> {
  const modelMetadata = modelMetadataMap.get(target);
  return modelMetadata?.fields || new Map();
}

/**
 * Set collection name for a model
 */
export function setCollectionName(target: any, collectionName: string): void {
  let modelMetadata = modelMetadataMap.get(target);

  if (!modelMetadata) {
    modelMetadata = {
      target,
      fields: new Map(),
    };
    modelMetadataMap.set(target, modelMetadata);
  }

  modelMetadata.collectionName = collectionName;
}

/**
 * Get collection name for a model
 */
export function getCollectionName(target: any): string | undefined {
  const modelMetadata = modelMetadataMap.get(target);
  return modelMetadata?.collectionName;
}

/**
 * Set sub-collection metadata
 */
export function setSubCollectionMetadata(
  target: any,
  propertyName: string,
  metadata: SubCollectionMetadata,
): void {
  let subCollections = subCollectionMetadataMap.get(target);

  if (!subCollections) {
    subCollections = new Map();
    subCollectionMetadataMap.set(target, subCollections);
  }

  subCollections.set(propertyName, metadata);
}

/**
 * Get sub-collection metadata
 */
export function getSubCollectionMetadata(
  target: any,
  propertyName: string,
): SubCollectionMetadata | undefined {
  const subCollections = subCollectionMetadataMap.get(target);
  return subCollections?.get(propertyName);
}

/**
 * Get all sub-collections for a model
 */
export function getModelSubCollections(target: any): Map<string, SubCollectionMetadata> {
  return subCollectionMetadataMap.get(target) || new Map();
}

/**
 * Get model name (constructor name)
 */
export function getModelName(target: any): string {
  return target.name || 'Unknown';
}

/**
 * Default pluralization (simple rule: add 's')
 * Can be enhanced for special cases
 */
export function pluralize(name: string): string {
  if (name.endsWith('y')) {
    return name.slice(0, -1) + 'ies';
  }
  if (name.endsWith('s') || name.endsWith('x') || name.endsWith('z')) {
    return name + 'es';
  }
  return name + 's';
}

/**
 * Get collection path for a model instance
 * If parent path provided, constructs nested path
 */
export function getCollectionPath(target: any, parentPath?: string): string {
  let collectionName = getCollectionName(target);

  if (!collectionName) {
    // Default: pluralized class name
    collectionName = pluralize(getModelName(target).toLowerCase());
  }

  if (parentPath) {
    return `${parentPath}/${collectionName}`;
  }

  return collectionName;
}
