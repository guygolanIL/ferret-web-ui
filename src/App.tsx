import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Main } from './components/Main';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Main />
      <div>{JSON.stringify(import.meta.env)}</div>
    </QueryClientProvider>
  )
}

export default App
