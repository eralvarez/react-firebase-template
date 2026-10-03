import { storeRepository } from '../../libs/db';

export default function StoreHome() {
  const handleCreateStore = async () => {
    try {
      const store = await storeRepository.create({ name: 'Oxxo2' });
      const productRepo = store.products;

      if (productRepo) {
        // You can now use the product repository to create products
        await productRepo.create({ name: 'Sample Product', price: 10 });
      }
      console.log('Store created:', store);
    } catch (error) {
      console.error('Error creating store:', error);
    }
  };

  return (
    <>
      <h1>Store</h1>
      <p>Welcome to the store page!</p>

      <button type="button" onClick={handleCreateStore}>
        Click me
      </button>
    </>
  );
}
