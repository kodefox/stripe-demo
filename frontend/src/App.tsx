import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import SuccessPage from "./pages/SuccessPage";
import ReturnPage from "./pages/ReturnPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProductsPage />,
  },
  {
    path: "/success",
    element: <SuccessPage />,
  },
  {
    path: "/return",
    element: <ReturnPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
