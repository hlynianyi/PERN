// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminMenu from "./components/subcomponents/AdminMenuButton";
import AdminProductList from "./components/products/AdminProductList";
import AdminProductCreate from "./components/products/AdminProductCreate";
import AdminProductEdit from "./components/products/AdminProductEdit";
import AdminProductDetails from "./components/products/AdminProductDetails";
import CompanyEdit from "./components/company/CompanyEdit";
import CompanyDetails from "./components/company/CompanyDetails";
import { Toaster } from "./components/ui/toaster";
import Catalog from "./pages/Catalog";

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
            <Route path="products/create" element={<AdminProductCreate />} />
            <Route path="products/edit/:id" element={<AdminProductEdit />} />
            <Route
              path="products/details/:id"
              element={<AdminProductDetails />}
            />
            <Route path="company/edit" element={<CompanyEdit />} />
          </Route>
          <Route path="/products" element={<Catalog />} />
          <Route path="company" element={<CompanyDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
