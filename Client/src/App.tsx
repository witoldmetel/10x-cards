import { QueryClientProvider } from '@tanstack/react-query';
import { routes } from './routes/routes';
import { queryClient } from './lib/react-query';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster richColors position="bottom-right" />
          {routes}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
