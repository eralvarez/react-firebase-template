import { createRoot } from 'react-dom/client';
import 'normalize.css';
import { Routes } from '@generouted/react-router/lazy'

createRoot(document.getElementById('root')!).render(<Routes />)