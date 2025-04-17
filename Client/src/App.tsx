import { RouterProvider } from 'react-router';

import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
