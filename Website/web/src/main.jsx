import { AuthProvider } from './context/AuthContext';
import { createRoot } from 'react-dom/client';
import Router from './Router.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Router />
  </AuthProvider>
)