import { QueryClientProvider } from '@tanstack/react-query';
import { routes } from './routes/routes';
import { queryClient } from './lib/react-query';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {' '}
      <AuthProvider>{routes}</AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
