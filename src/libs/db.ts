import { db } from './firebase';

// ODM decorators and repository
import { Model, Collection, Field, SubCollection, Repository } from './odm';

// ============================================================================
// DATABASE MODELS
// ============================================================================

@Model
@Collection('stores')
export class Store {
  id?: string;

  @Field({ required: true })
  name: string = '';

  @Field()
  description?: string = '';

  @Field({ type: 'boolean', default: false })
  isOpen?: boolean;

  @Field({ type: 'number', default: 0 })
  rating?: number;

  @Field({ type: 'string', default: 'inactive' })
  status?: string;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  createdAt?: Date;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  updatedAt?: Date;

  @SubCollection('products')
  productsRepo?: Repository<Product>;
}

@Model
class Product {
  id?: string;

  @Field({ required: true })
  name: string = '';

  @Field({
    required: true,
    type: 'number',
    validate: (value: number) => (value > 0 ? null : 'Price must be positive'),
  })
  price: number = 0;

  @Field()
  sku?: string;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  createdAt?: Date;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  updatedAt?: Date;
}

// ============================================================================
// REPOSITORIES
// ============================================================================

export const storeRepository = new Repository<Store>(db, Store);
