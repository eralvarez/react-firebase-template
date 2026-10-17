import { db } from './firebase';

// ODM decorators and repository
import { Model, Collection, Field, SubCollection, Repository } from 'libs/firetools/odm';

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
  productsRepository?: Repository<Product>;
}

@Model
@Collection('users')
export class UserProfile {
  id?: string;

  @Field({ required: true })
  uid: string = '';

  @Field({ required: true })
  email: string = '';

  @Field()
  displayName?: string = '';

  @Field({ required: true, type: 'string', default: 'password' })
  provider: string = 'password';

  @Field({ type: 'timestamp', readonly: true, auto: true })
  createdAt?: Date;

  @Field({ type: 'timestamp', readonly: true, auto: true })
  updatedAt?: Date;
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
export const userRepository = new Repository<UserProfile>(db, UserProfile);
