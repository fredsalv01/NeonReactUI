import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, QueryLoader } from './components/ui';
import { ComponentShowcase } from './components/ComponentShowcase';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <QueryLoader />
        <ComponentShowcase />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
