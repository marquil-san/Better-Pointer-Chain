import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Visualizer from "@/pages/Visualizer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Visualizer />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
