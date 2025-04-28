import { QueryClientProvider } from '@tanstack/react-query';
import { routes } from './routes/routes';
import { queryClient } from './lib/react-query';

const App = () => {
  return <QueryClientProvider client={queryClient}>{routes}</QueryClientProvider>;
};

export default App;
