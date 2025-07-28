import { createRoot } from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import Home from './pages/home';

const root = createRoot(document.body);
root.render(
    <AppProvider>
        <Home />
    </AppProvider>
);