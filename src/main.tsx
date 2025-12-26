import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Provider } from '@/components/ui/provider';
import { ColorModeProvider } from './components/ui/color-mode';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </Provider>
  </StrictMode>
);
