import { createRoot } from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import * as HomeModule from './pages/home';

const Home = HomeModule.default;

const root = createRoot(document.body);
root.render(
    <AppProvider>
        <Home />
    </AppProvider>
);