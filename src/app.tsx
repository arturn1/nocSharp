import { createRoot } from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import * as HomeModule from './pages/home';

const Home = HomeModule.default;

const root = createRoot(document.body);
root.render(
    <ThemeProvider>
        <AppProvider>
            <Home />
        </AppProvider>
    </ThemeProvider>
);