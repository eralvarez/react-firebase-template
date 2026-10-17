import { storeRepository } from 'libs/db';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function StoreHome() {
  const handleCreateStore = async () => {
    const { data: store, error } = await storeRepository.create({ name: 'Oxxo' });
    if (error) {
      console.error('Error creating store:', error);
      return;
    }

    if (store) {
      const productRepo = store.productsRepository;

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
        const storeProductRepo = store.productsRepository;
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
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Store</Typography>
          <Typography variant="body1">Welcome to the store page!</Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button type="button" variant="contained" onClick={handleCreateStore}>
              Create store
            </Button>
            <Button type="button" variant="outlined" onClick={getStores}>
              Get stores
            </Button>
            <Button type="button" variant="outlined" onClick={getStoresQuery}>
              Query stores
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
