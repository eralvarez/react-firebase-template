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
  type CollectionReference,
} from 'firebase/firestore';
import {
  getModelFields,
  getCollectionPath,
  getModelSubCollections,
} from './metadata';
import { validateObject } from './validators';
import type { CreateInput, UpdateInput, CrudOptions } from './types';

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
    isFullPath: boolean = false
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
   * Create a new document
   */
  async create(data: CreateInput<T>, options?: CrudOptions): Promise<T & { id: string }> {
    // Validate the data
    const fields = getModelFields(this.modelClass);
    validateObject(data, fields, options?.skipValidation);

    // Add auto-fields (createdAt, updatedAt)
    const now = new Date();
    const processedData = this.processAutoFields(data as any, true, now);

    // Add to Firestore
    const docRef = await addDoc(this.collectionRef, processedData);

    // Return with ID and initialized sub-collections
    const result = {
      ...(data as any),
      ...processedData,
      id: docRef.id,
    } as T & { id: string };

    return this.initializeSubCollections(result);
  }

  /**
   * Read a document by ID
   */
  async get(id: string): Promise<(T & { id: string }) | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const result = {
        ...docSnap.data(),
        id: docSnap.id,
      } as T & { id: string };

      return this.initializeSubCollections(result);
    } catch (error) {
      console.error(`Error getting document ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all documents in the collection
   */
  async getAll(): Promise<(T & { id: string })[]> {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      const results: (T & { id: string })[] = [];

      for (const docSnap of querySnapshot.docs) {
        const result = {
          ...docSnap.data(),
          id: docSnap.id,
        } as T & { id: string };

        results.push(this.initializeSubCollections(result));
      }

      return results;
    } catch (error) {
      console.error('Error getting all documents:', error);
      return [];
    }
  }

  /**
   * Update a document
   */
  async update(
    id: string,
    data: UpdateInput<T>,
    options?: CrudOptions
  ): Promise<T & { id: string }> {
    // Get existing document to merge
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Document with id ${id} not found`);
    }

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

    return this.initializeSubCollections(result);
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a sub-collection repository
   */
  getSubCollection<U>(
    documentId: string,
    collectionName: string,
    subModelClass: new () => U
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
      const subRepo = this.getSubCollection(instance.id, subCollectionMetadata.collectionName, subModelClass);

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
