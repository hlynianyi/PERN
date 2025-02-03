// frontend/src/App.jsx
import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import AdminMenu from "./ui-custom/admin-menu-button";
import ProductList from "./products/ProductList";
import ProductCreate from "./products/ProductCreate";
import ProductEdit from "./products/ProductEdit";
import ProductDetails from "./products/ProductDetails";
import Navbar from "./Navbar";

function AdminLayout() {
  return (
    <>
      <AdminMenu /> <Outlet /> {/* Rendering inner routes */}
    </>
  );
}

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/edit/:id" element={<ProductEdit />} />
          </Route>
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
