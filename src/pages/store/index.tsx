import { storeRepository } from 'libs/db';

export default function StoreHome() {
  const handleCreateStore = async () => {
    try {
      const store = await storeRepository.create({ name: 'Oxxo' });
      const productRepo = store.productsRepo;

      if (productRepo) {
        // You can now use the product repository to create products
        await productRepo.create({ name: 'Sample Product', price: 10 });
      }
      console.log('Store created:', store);
    } catch (error) {
      console.error('Error creating store:', error);
    }
  };

  const getStores = async () => {
    try {
      const stores = await storeRepository.getAll();
      console.log('Stores:', stores);

      for (const store of stores) {
        const storeProductRepo = store.productsRepo;
        if (storeProductRepo) {
          const products = await storeProductRepo.getAll();
          console.log(`Products for store ${store.id}:`, products);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const getStoresQuery = async () => {
    try {
      const stores = await storeRepository.getAll({
        where: { field: 'rating', operator: '>=', value: 9 },
      });
      console.log('Stores:', stores);

      // for (const store of stores) {
      //   const storeProductRepo = store.productsRepo;
      //   if (storeProductRepo) {
      //     const products = await storeProductRepo.getAll();
      //     console.log(`Products for store ${store.id}:`, products);
      //   }
      // }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
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
