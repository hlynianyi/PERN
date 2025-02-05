// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import AdminMenu from "./components/ui-custom/AdminMenuButton";
import AdminProductList from "./components/products/AdminProductList";
import ProductCreate from "./components/products/ProductCreate";
import ProductEdit from "./components/products/ProductEdit";
import ProductDetails from "./components/products/ProductDetails";
import Navbar from "./components/Navbar";
import CompanyEdit from "./components/company/CompanyEdit";
import CompanyDetails from "./components/company/CompanyDetails";
import { Toaster } from "./components/ui/toaster";

function AdminLayout() {
  return (
    <div className="min-h-screen">
      <AdminMenu />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Toaster />
        <Navbar />
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/edit/:id" element={<ProductEdit />} />
            <Route path="products/details/:id" element={<ProductDetails />} />
            <Route path="company/edit" element={<CompanyEdit />} />
          </Route>
          <Route path="company" element={<CompanyDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
