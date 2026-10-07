/**
 * Base Repository Class for CRUD Operations
 * Handles all Firestore interactions for a model
 */

import {
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type CollectionReference,
  type Query,
  Timestamp,
} from 'firebase/firestore';
import { getModelFields, getCollectionPath, getModelSubCollections } from './metadata';
import { validateObject } from './validators';
import type { CreateInput, UpdateInput, CrudOptions, QueryOptions } from './types';

/**
 * Standard result type for all CRUD operations
 */
export type Result<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Generic Repository for Firestore collections
 */
export class Repository<T> {
  private db: Firestore;
  private modelClass: new () => T;
  private collectionRef: CollectionReference;
  private parentPath: string | undefined;
  private isFullPath: boolean;

  /**
   * Constructor for creating a repository
   * @param db Firestore instance
   * @param modelClass The model class to use
   * @param parentPath Parent path (document or full collection path)
   * @param isFullPath If true, parentPath is the full collection path; if false, collection name is appended
   */
  constructor(
    db: Firestore,
    modelClass: new () => T,
    parentPath?: string,
    isFullPath: boolean = false,
  ) {
    this.db = db;
    this.modelClass = modelClass;
    this.parentPath = parentPath;
    this.isFullPath = isFullPath;

    // Get collection path from model metadata
    const collectionPath = isFullPath ? parentPath : getCollectionPath(modelClass, parentPath);
    this.collectionRef = collection(db, collectionPath!);
  }

  /**
   * Convert Firestore Timestamp objects to JavaScript Date objects
   */
  private convertTimestamps(data: any): any {
    const fields = getModelFields(this.modelClass);
    const result = { ...data };

    for (const [fieldName, metadata] of fields) {
      if (metadata.type === 'timestamp' && result[fieldName]) {
        // Convert Firestore Timestamp to Date
        if (result[fieldName] instanceof Timestamp) {
          result[fieldName] = result[fieldName].toDate();
        }
      }
    }

    return result;
  }

  /**
   * Apply default values for missing fields
   * Sources for defaults (in priority order):
   * 1. Class attribute defaults (name: string = '') - highest priority
   * 2. @Field({ default: ... }) metadata - fallback
   * 3. null for optional fields without defaults
   * Note: Only fields with @Field decorator are processed
   */
  private applyDefaults(data: any): any {
    const fields = getModelFields(this.modelClass);
    const result = { ...data };

    // Get class attribute defaults by instantiating the model
    let classDefaults: any = {};
    try {
      const instance = new this.modelClass();
      classDefaults = instance as any;
      // console.log('classDefaults after instantiation:', classDefaults);
    } catch {
      // If instantiation fails, we'll just use field metadata defaults
      // This can happen if the class requires constructor parameters
    }

    for (const [fieldName, metadata] of fields) {
      // Skip if field already has a value
      if (result[fieldName] !== undefined) {
        continue;
      }

      // Priority 1: Use class attribute default if available (highest priority)
      if (classDefaults[fieldName] !== undefined) {
        // For objects and arrays, we need to be careful about references
        // If it's an object/array, create a new instance to avoid shared state
        const defaultValue = classDefaults[fieldName];
        if (Array.isArray(defaultValue)) {
          result[fieldName] = [...defaultValue];
        } else if (defaultValue !== null && typeof defaultValue === 'object') {
          result[fieldName] = { ...defaultValue };
        } else {
          result[fieldName] = defaultValue;
        }
      }
      // Priority 2: Use @Field({ default: ... }) if specified (fallback)
      else if (metadata.default !== undefined) {
        result[fieldName] =
          typeof metadata.default === 'function' ? metadata.default() : metadata.default;
      }
      // Priority 3: Set null for optional fields without defaults
      else if (!metadata.required) {
        result[fieldName] = null;
      }
    }

    return result;
  }

  /**
   * Create a new document
   */
  async create(data: CreateInput<T>, options?: CrudOptions): Promise<Result<T & { id: string }>> {
    try {
      // Validate the data
      const fields = getModelFields(this.modelClass);
      validateObject(data, fields, options?.skipValidation);

      // Add auto-fields (createdAt, updatedAt)
      const now = new Date();
      const processedData = this.processAutoFields(data as any, true, now);

      // Apply defaults before saving
      const dataWithDefaults = this.applyDefaults(processedData);

      // Add to Firestore
      const docRef = await addDoc(this.collectionRef, dataWithDefaults);

      // Return with ID and initialized sub-collections
      const result = {
        ...dataWithDefaults,
        id: docRef.id,
      } as T & { id: string };

      return {
        data: this.initializeSubCollections(result),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Read a document by ID
   */
  async get(id: string): Promise<Result<T & { id: string }>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          data: null,
          error: null,
        };
      }

      const data = this.convertTimestamps(docSnap.data());
      const dataWithDefaults = this.applyDefaults(data);
      const result = {
        ...dataWithDefaults,
        id: docSnap.id,
      } as T & { id: string };

      return {
        data: this.initializeSubCollections(result),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Get all documents in the collection with optional filtering, ordering, and pagination
   */
  async getAll(options?: QueryOptions<T>): Promise<Result<(T & { id: string })[]>> {
    try {
      const q = options ? this.buildQuery(options) : this.collectionRef;
      const querySnapshot = await getDocs(q);
      const results: (T & { id: string })[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = this.convertTimestamps(docSnap.data());
        const dataWithDefaults = this.applyDefaults(data);
        const result = {
          ...dataWithDefaults,
          id: docSnap.id,
        } as T & { id: string };

        results.push(this.initializeSubCollections(result));
      }

      return {
        data: results,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Build a Firestore Query from QueryOptions
   */
  private buildQuery(options: QueryOptions<T>): Query {
    const constraints: any[] = [];

    // Add where conditions
    if (options.where) {
      const conditions = Array.isArray(options.where) ? options.where : [options.where];

      for (const condition of conditions) {
        const fieldName = String(condition.field);
        // ponytail: Firebase doesn't support OR in constraints directly; all are AND'd by Firestore
        constraints.push(where(fieldName, condition.operator as any, condition.value));
      }
    }

    // Add ordering
    if (options.orderBy) {
      for (const order of options.orderBy) {
        const fieldName = String(order.field);
        constraints.push(orderBy(fieldName, order.direction));
      }
    }

    // Add pagination
    if (options.limit !== undefined) {
      constraints.push(limit(options.limit));
    }

    return query(this.collectionRef, ...constraints);
  }

  /**
   * Update a document
   */
  async update(
    id: string,
    data: UpdateInput<T>,
    options?: CrudOptions,
  ): Promise<Result<T & { id: string }>> {
    try {
      // Get existing document to merge
      const getResult = await this.get(id);
      if (getResult.error || !getResult.data) {
        return {
          data: null,
          error: getResult.error || new Error(`Document with id ${id} not found`),
        };
      }

      const existing = getResult.data;

      // Validate the update data
      const fields = getModelFields(this.modelClass);
      validateObject(data, fields, options?.skipValidation);

      // Prevent updating read-only fields
      const processedData = this.preventReadOnlyUpdates(data as any, fields);

      // Add updated timestamp
      const now = new Date();
      processedData.updatedAt = now;

      // Update in Firestore
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, processedData);

      // Return merged result
      const result = {
        ...existing,
        ...processedData,
      } as T & { id: string };

      return {
        data: this.initializeSubCollections(result),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return {
        data: undefined as any,
        error: null,
      };
    } catch (error) {
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Get a sub-collection repository
   */
  getSubCollection<U>(
    documentId: string,
    collectionName: string,
    subModelClass: new () => U,
  ): Repository<U> {
    // Build the full path: parent/collection/documentId/subCollectionName
    const basePath = this.isFullPath
      ? this.parentPath
      : getCollectionPath(this.modelClass, this.parentPath);
    const fullPath = `${basePath}/${documentId}/${collectionName}`;

    // Create repository with full path flag set to true so it uses the path as-is
    return new Repository<U>(this.db, subModelClass, fullPath, true);
  }

  /**
   * Process automatic fields (timestamps)
   */
  private processAutoFields(data: any, isCreate: boolean, timestamp: Date): any {
    const fields = getModelFields(this.modelClass);
    const result = { ...data };

    for (const [fieldName, metadata] of fields) {
      if (metadata.auto && metadata.type === 'timestamp') {
        if (isCreate) {
          // Set both createdAt and updatedAt on create
          result[fieldName] = timestamp;
        } else if (fieldName === 'updatedAt') {
          // Only update updatedAt on subsequent updates
          result[fieldName] = timestamp;
        }
      }
    }

    return result;
  }

  /**
   * Prevent updating read-only fields
   */
  private preventReadOnlyUpdates(data: any, fields: Map<string, any>): any {
    const result = { ...data };

    for (const [fieldName, metadata] of fields) {
      if (metadata.readonly && fieldName !== 'updatedAt') {
        delete result[fieldName];
      }
    }

    return result;
  }

  /**
   * Initialize sub-collection repositories on model instances
   */
  private initializeSubCollections(instance: T & { id: string }): T & { id: string } {
    const subCollections = getModelSubCollections(this.modelClass);

    for (const [propertyName, subCollectionMetadata] of subCollections) {
      const subModelClass = subCollectionMetadata.modelClass || this.modelClass;
      const subRepo = this.getSubCollection(
        instance.id,
        subCollectionMetadata.collectionName,
        subModelClass,
      );

      // Attach the repository to the instance
      (instance as any)[propertyName] = subRepo;
    }

    return instance;
  }
}

/**
 * Helper to create a new Repository instance
 */
export function createRepository<T>(db: Firestore, modelClass: new () => T): Repository<T> {
  return new Repository<T>(db, modelClass);
}
