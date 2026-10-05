# Firebase ODM/ORM

A lightweight, type-safe Object Document Mapper (ODM) for Firebase Firestore built with TypeScript decorators.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Model Definition](#model-definition)
- [CRUD Operations](#crud-operations)
- [Validation](#validation)
- [Sub-Collections](#sub-collections)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)

## Features

✨ **Decorator-Based Models** - Clean, declarative syntax using TypeScript decorators
🔍 **Built-in Validation** - Type checking and custom validators
⏰ **Automatic Timestamps** - `createdAt` and `updatedAt` managed automatically
📦 **Sub-Collections** - Native support for nested Firestore collections
🔐 **Type Safe** - Full TypeScript support with IntelliSense
🚀 **Simple CRUD** - Intuitive API for create, read, update, delete operations

## Quick Start

### 1. Define a Model

```typescript
import { Model, Collection, Field } from '@/libs/odm';

@Model
@Collection('users')
export class User {
  id?: string;

  @Field({ required: true })
  name: string = '';

  @Field({ required: true })
  email: string = '';

  @Field()
  age?: number;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  createdAt?: Date;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  updatedAt?: Date;
}
```

### 2. Create a Repository

```typescript
import { Repository } from '@/libs/odm';
import { db } from '@/libs/firebase';

export const userRepository = new Repository<User>(db, User);
```

### 3. Use in Your Component

```typescript
// Create
const user = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Read
const fetchedUser = await userRepository.get(user.id);

// Update
const updated = await userRepository.update(user.id, {
  age: 31
});

// Delete
await userRepository.delete(user.id);
```

## Model Definition

### @Model Decorator

Marks a class as a Firestore model. Must be used with `@Collection`.

```typescript
@Model
class Product {
  // ... fields
}
```

### @Collection Decorator

Specifies the Firestore collection name. If omitted, defaults to pluralized class name.

```typescript
@Model
@Collection('my-products')
class Product {
  // Stored in 'my-products' collection
}

@Model
class Store {
  // Stored in 'stores' collection (automatic pluralization)
}
```

### @Field Decorator

Marks a property as a Firestore field with optional metadata.

```typescript
@Field()
name: string;

@Field({ required: true })
email: string;

@Field({ required: false })
phone?: string;

@Field({ type: 'timestamp', readonly: true, auto: true })
createdAt?: Date;
```

#### Field Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `FieldType` | Field type: 'string', 'number', 'boolean', 'timestamp', 'object', 'array' |
| `required` | `boolean` | Whether field is required (default: false) |
| `readonly` | `boolean` | Cannot be updated after creation (except auto: true fields) |
| `auto` | `boolean` | Automatically managed (timestamps only) |
| `validate` | `ValidatorFn` | Custom validation function |
| `default` | `any` | Default value |
| `description` | `string` | Field documentation |

### Field Types

```typescript
// String
@Field({ type: 'string' })
name: string;

// Number
@Field({ type: 'number' })
price: number;

// Boolean
@Field({ type: 'boolean' })
isActive: boolean;

// Date/Timestamp
@Field({ type: 'timestamp' })
date: Date;

// Object
@Field({ type: 'object' })
metadata: Record<string, any>;

// Array
@Field({ type: 'array' })
tags: string[];
```

### Automatic Timestamps

Every model automatically gets `createdAt` and `updatedAt` timestamps:

```typescript
@Model
class Product {
  @Field({ type: 'timestamp', readonly: true, auto: true })
  createdAt?: Date; // Set on creation, never changes

  @Field({ type: 'timestamp', readonly: true, auto: true })
  updatedAt?: Date; // Set on creation, updated on every write
}
```

## CRUD Operations

### Create

Create a new document with automatic validation.

```typescript
const product = await productRepository.create({
  name: 'Laptop',
  price: 999.99,
  stock: 5
});

console.log(product.id); // Auto-generated Firestore document ID
console.log(product.createdAt); // Auto-set timestamp
```

**Validation runs automatically** - will throw `ValidationError` if data is invalid.

### Read

Retrieve documents from Firestore.

```typescript
// Get single document by ID
const product = await productRepository.get('product-id');

// Get all documents in collection
const products = await productRepository.getAll();

// Iterate over results
products.forEach(p => {
  console.log(p.name, p.price);
});
```

**Automatic Timestamp Conversion** - All timestamp fields are automatically converted from Firestore Timestamp objects to JavaScript Date objects:

```typescript
const product = await productRepository.get('product-id');

// createdAt and updatedAt are JavaScript Date objects
console.log(product.createdAt instanceof Date); // true
console.log(product.createdAt.toISOString()); // "2024-01-15T10:30:00.000Z"

// Works with getAll() too
const products = await productRepository.getAll();
products.forEach(p => {
  console.log(p.updatedAt instanceof Date); // true
});
```

### Update

Update specific fields in a document.

```typescript
const updated = await productRepository.update('product-id', {
  price: 799.99,
  stock: 3
});

console.log(updated.updatedAt); // New timestamp
console.log(updated.createdAt); // Unchanged, original timestamp
```

**Only provided fields are updated** - omitted fields remain unchanged.

**Read-only fields cannot be updated** - attempting to update `createdAt` is silently ignored.

### Delete

Remove a document from Firestore.

```typescript
await productRepository.delete('product-id');

// Verify deletion
const deleted = await productRepository.get('product-id');
console.log(deleted); // null
```

## Validation

### Built-in Validators

Field validation happens automatically on `create()` and `update()` operations.

#### Type Validation

```typescript
@Field({ type: 'string' })
name: string; // Must be string

@Field({ type: 'number' })
age: number; // Must be number

@Field({ type: 'boolean' })
isActive: boolean; // Must be boolean
```

#### Required Validation

```typescript
@Field({ required: true })
email: string; // Must be provided

@Field({ required: false })
phone?: string; // Optional
```

#### Custom Validators

Provide a validation function that returns `null` on success or an error message on failure.

```typescript
@Field({
  type: 'number',
  validate: (value: number) => {
    if (value <= 0) return 'Price must be positive';
    if (value > 1000000) return 'Price seems too high';
    return null; // Validation passed
  }
})
price: number;
```

### Pre-built Validator Functions

The `Validators` export provides common validation functions:

```typescript
import { Validators } from '@/libs/odm';

@Field({
  type: 'number',
  validate: Validators.min(0)
})
age: number;

@Field({
  type: 'number',
  validate: Validators.max(150)
})
maxAge: number;

@Field({
  type: 'string',
  validate: Validators.minLength(3)
})
username: string;

@Field({
  type: 'string',
  validate: Validators.email
})
email: string;

@Field({
  type: 'string',
  validate: Validators.url
})
website: string;

@Field({
  type: 'string',
  validate: Validators.pattern(/^[A-Z]{2}$/, 'Must be 2 uppercase letters')
})
countryCode: string;

@Field({
  type: 'string',
  validate: Validators.oneOf(['active', 'inactive', 'pending'])
})
status: string;

// Combine multiple validators
@Field({
  type: 'string',
  validate: Validators.all(
    Validators.minLength(3),
    Validators.maxLength(20),
    Validators.pattern(/^[a-zA-Z0-9_]+$/)
  )
})
username: string;
```

### Handling Validation Errors

```typescript
import { ValidationError } from '@/libs/odm';

try {
  await productRepository.create({
    name: 'Invalid Product',
    price: -100 // Invalid!
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Field: ${error.field}`);
    console.error(`Message: ${error.message}`);
    // Output:
    // Field: price
    // Message: Price must be positive
  }
}
```

## Sub-Collections

### Define Sub-Collections

Use `@SubCollection` decorator to declare nested collections.

```typescript
import { Repository } from '@/libs/odm';

@Model
@Collection('stores')
export class Store {
  id?: string;

  @Field({ required: true })
  name: string = '';

  @SubCollection('products')
  products?: Repository<Product>;
}

@Model
class Product {
  id?: string;

  @Field({ required: true })
  name: string = '';

  @Field({ required: true })
  price: number = 0;
}
```

### Access Sub-Collections

Sub-collection repositories are automatically initialized when you fetch a parent document:

```typescript
import { storeRepository } from '@/libs/db';

// Get a store
const store = await storeRepository.get('store-id');

// Access the products sub-collection repository
const productsRepo = store.products;

if (productsRepo) {
  // All CRUD operations work on sub-collections
  const product = await productsRepo.create({
    name: 'Widget',
    price: 19.99
  });

  const allProducts = await productsRepo.getAll();

  const updated = await productsRepo.update(product.id, {
    price: 29.99
  });

  await productsRepo.delete(product.id);
}
```

### Real-World Example: E-Commerce

```typescript
// 1. Create a store
const store = await storeRepository.create({
  name: 'Electronics Hub'
});

// 2. Add products to the store
const productsRepo = store.products;
if (productsRepo) {
  const laptop = await productsRepo.create({
    name: 'MacBook Pro',
    price: 1999.99
  });

  const mouse = await productsRepo.create({
    name: 'Magic Mouse',
    price: 79.99
  });

  // 3. Get all products for this store
  const storeProducts = await productsRepo.getAll();
  console.log(`Store has ${storeProducts.length} products`);

  // 4. Update a product
  const updated = await productsRepo.update(laptop.id, {
    price: 1899.99
  });

  // 5. Delete a product
  await productsRepo.delete(mouse.id);

  // 6. Verify deletion
  const remaining = await productsRepo.getAll();
  console.log(`Remaining products: ${remaining.length}`);
}

// 7. Update the store
const updatedStore = await storeRepository.update(store.id!, {
  description: 'Premium electronics only'
});

// 8. Delete the store (sub-collections must be deleted separately in Firestore)
await storeRepository.delete(store.id!);
```

## Advanced Usage

### Chaining Operations

```typescript
// Create and immediately update
const product = await productRepository.create({
  name: 'New Product',
  price: 0
});

const updated = await productRepository.update(product.id, {
  price: 99.99,
  stock: 10
});

// Fetch and verify
const verified = await productRepository.get(product.id);
console.log(verified.price); // 99.99
```

### Batch Operations

Process multiple documents:

```typescript
const allProducts = await productRepository.getAll();

// Filter
const expensive = allProducts.filter(p => p.price > 1000);

// Map
const names = allProducts.map(p => p.name);

// Update multiple (sequential)
for (const product of allProducts) {
  if (product.price > 1000) {
    await productRepository.update(product.id, {
      discounted: true
    });
  }
}
```

### Conditional Creation

```typescript
async function createOrUpdate(id: string | undefined, data: any) {
  if (id) {
    return await productRepository.update(id, data);
  } else {
    return await productRepository.create(data);
  }
}
```

### Error Handling

```typescript
async function safeDelete(id: string): Promise<boolean> {
  try {
    await productRepository.delete(id);
    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
```

### Using in React Components

```typescript
import { useEffect, useState } from 'react';
import { storeRepository } from '@/libs/db';
import type { Store } from '@/libs/db';

export function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await storeRepository.getAll();
        setStores(data);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const handleCreate = async (name: string) => {
    try {
      const newStore = await storeRepository.create({ name });
      setStores([...stores, newStore]);
    } catch (error) {
      console.error('Failed to create store:', error);
    }
  };

  const handleDelete = async (storeId: string) => {
    try {
      await storeRepository.delete(storeId);
      setStores(stores.filter(s => s.id !== storeId));
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Stores</h1>
      <ul>
        {stores.map(store => (
          <li key={store.id}>
            {store.name}
            <button onClick={() => handleDelete(store.id!)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleCreate('New Store')}>Add Store</button>
    </div>
  );
}
```

## API Reference

### Repository<T>

Generic repository for Firestore collections.

#### Constructor

```typescript
new Repository<T>(db: Firestore, modelClass: new () => T, parentPath?: string)
```

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `create(data, options?)` | `Promise<T & { id }>` | Create new document |
| `get(id)` | `Promise<T & { id } \| null>` | Fetch single document |
| `getAll()` | `Promise<(T & { id })[]>` | Fetch all documents |
| `update(id, data, options?)` | `Promise<T & { id }>` | Update document fields |
| `delete(id)` | `Promise<void>` | Delete document |
| `getSubCollection<U>(id, name, modelClass)` | `Repository<U>` | Access sub-collection |

### Decorators

| Decorator | Parameters | Usage |
|-----------|-----------|-------|
| `@Model` | - | Mark class as model |
| `@Collection(name)` | `name: string` | Set collection name |
| `@Field(options)` | `options: FieldMetadata` | Mark and configure field |
| `@SubCollection(name, modelClass?)` | `name: string` | Declare sub-collection |
| `@Required` | - | Mark field as required |
| `@ReadOnly` | - | Mark field as read-only |

### Validators

```typescript
import { Validators } from '@/libs/odm';

Validators.min(n: number)
Validators.max(n: number)
Validators.minLength(n: number)
Validators.maxLength(n: number)
Validators.pattern(regex: RegExp, message?: string)
Validators.email
Validators.url
Validators.oneOf(allowed: any[])
Validators.nonEmpty
Validators.all(...validators)
```

### Types

```typescript
import type {
  FieldType,
  ValidatorFn,
  FieldMetadata,
  ModelMetadata,
  CreateInput<T>,
  UpdateInput<T>,
} from '@/libs/odm';

// Example usage
const storeMetadata = getModelMetadata(Store);
const fields = getModelFields(Store);
const validated = validateObject(data, fields);
```

## Best Practices

1. **Always define fields with types** - Use @Field decorators for all properties
2. **Use required validation** - Mark required fields explicitly
3. **Add custom validators** - Validate business logic, not just types
4. **Handle errors gracefully** - Catch ValidationError in try/catch blocks
5. **Use TypeScript strict mode** - Enable strict checks in tsconfig.json
6. **Test edge cases** - Test validation with invalid data
7. **Document models** - Add JSDoc comments to fields

## Examples

See the full examples in the companion files:
- `odm-examples.md` - Comprehensive usage examples
- `db-example.ts` - Real database schema example
- `db-comparison.md` - Before/after comparison with typesaurus

## Support

For issues or questions about the ODM, check:
- This README
- The example files in the parent directory
- The implementation in the source files
- The TypeScript type definitions

Happy modeling! 🚀
