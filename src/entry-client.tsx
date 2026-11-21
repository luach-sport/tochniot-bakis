import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import '@fontsource-variable/heebo';
import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import './styles/site.css';
import './print/print.css';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
const root = document.getElementById('root')!;

const app = (
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// בעמודים שנבנו מראש יש כבר HTML, ורק "מחברים" אליו את הקוד. בפיתוח בונים מאפס.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
