import { storeRepository } from 'libs/db';

export default function StoreHome() {
  const handleCreateStore = async () => {
    const { data: store, error } = await storeRepository.create({ name: 'Oxxo' });
    if (error) {
      console.error('Error creating store:', error);
      return;
    }

    if (store) {
      const productRepo = store.productsRepo;

      if (productRepo) {
        // You can now use the product repository to create products
        const { error: createError } = await productRepo.create({
          name: 'Sample Product',
          price: 10,
        });
        if (createError) {
          console.error('Error creating product:', createError);
        }
      }
      console.log('Store created:', store);
    }
  };

  const getStores = async () => {
    const { data: stores, error } = await storeRepository.getAll();
    if (error) {
      console.error('Error fetching stores:', error);
      return;
    }

    console.log('Stores:', stores);

    if (stores) {
      for (const store of stores) {
        const storeProductRepo = store.productsRepo;
        if (storeProductRepo) {
          const { data: products, error: productsError } = await storeProductRepo.getAll();
          if (productsError) {
            console.error(`Error fetching products for store ${store.id}:`, productsError);
          } else {
            console.log(`Products for store ${store.id}:`, products);
          }
        }
      }
    }
  };

  const getStoresQuery = async () => {
    const { data: stores, error } = await storeRepository.getAll({
      where: { field: 'rating', operator: '>=', value: 9 },
    });
    if (error) {
      console.error('Error fetching stores:', error);
      return;
    }

    console.log('Stores:', stores);

    // for (const store of stores) {
    //   const storeProductRepo = store.productsRepo;
    //   if (storeProductRepo) {
    //     const products = await storeProductRepo.getAll();
    //     console.log(`Products for store ${store.id}:`, products);
    //   }
    // }
  };

  return (
    <>
      <h1>Store</h1>
      <p>Welcome to the store page!</p>

      <button type="button" onClick={handleCreateStore}>
        Click me
      </button>
      <button type="button" onClick={getStores}>
        Get Stores
      </button>
      <button type="button" onClick={getStoresQuery}>
        Get Stores query
      </button>
    </>
  );
}
