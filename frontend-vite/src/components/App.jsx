// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import AdminMenu from "../subcomponents/AdminMenuButton";
import AdminProductList from "./products/AdminProductList";
import AdminProductCreate from "./products/AdminProductCreate";
import AdminProductEdit from "./products/AdminProductEdit";
import AdminProductDetails from "./products/ProductDetails";
import CompanyEdit from "./company/CompanyEdit";
import CompanyDetails from "../pages/CompanyDetails";
import AdminLogin from "../pages/AdminLogin";
import Navbar from "./navigation/Navbar";
import Catalog from "../pages/Catalog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";
import { Toaster } from "./ui/toaster";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

function AdminLayout() {
  return (
    <div className="h-full">
      <AdminMenu />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background font-mono">
            <Navbar />
            <Separator />
            {/* <Breadcrumbs /> */}
            <Routes>
              <Route path="/products" element={<Catalog />} />
              <Route path="/company" element={<CompanyDetails />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="products/details/:id"
                element={<AdminProductDetails />}
              />
              {/* protected routes for administartor */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/admin/products" replace />}
                />
                <Route path="products" element={<AdminProductList />} />
                <Route
                  path="products/create"
                  element={<AdminProductCreate />}
                />
                <Route
                  path="products/edit/:id"
                  element={<AdminProductEdit />}
                />

                <Route path="company/edit" element={<CompanyEdit />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
