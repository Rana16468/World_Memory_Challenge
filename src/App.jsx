import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import router from "./components/router/router";
import { Provider } from "react-redux";
import { persistor, store } from "./components/redux/store";
import { PersistGate } from "redux-persist/integration/react";  // <-- missing import

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster position="top-center" toastOptions={{ duration: 1500 }} />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
