import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./app/providers/app-providers";
import { router } from "./app/routes/router";
import { AppErrorBoundary } from "./shared/components/feedback/AppErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </AppErrorBoundary>
  );
}
