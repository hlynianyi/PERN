// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./navigation/Navbar";
import Catalog from "../pages/Catalog";
import AdminLogin from "../pages/AdminLogin";
import AdminMenu from "../subcomponents/AdminMenuButton";
import AdminProductList from "./products/AdminProductList";
import AdminProductCreate from "./products/AdminProductCreate";
import AdminProductEdit from "./products/AdminProductEdit";
import AdminProductDetails from "./products/ProductDetails";
import AdminCompanyEdit from "./company/AdminCompanyEdit";
import CompanyDetails from "../pages/CompanyDetails";
import AdminFaqEdit from "./faq/AdminFaqEdit";
import Faq from "@/pages/Faq";
import AdminPartnershipEdit from "./partnership/AdminPartnershipEdit";
import Partnership from "@/pages/Partnership";
import Reviews from "@/pages/Reviews";
import AdminReviewsEdit from "./reviews/AdminReviewsEdit";
import Contacts from "@/pages/Contacts";
import AdminContactsEdit from "./contacts/AdminContactsEdit";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "./ui/toaster";
import { useAuth } from "../context/AuthContext";
import store from "../store";
import { fetchContacts } from "../store/slices/contactsSlice";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";

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
  useEffect(() => {
    store.dispatch(fetchContacts());
    // Периодическое обновление каждые X минут
    const interval = setInterval(() => {
      store.dispatch(fetchContacts());
    }, 20 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background font-mono">
            <Navbar />
            <Separator />
            {/* Public Pages */}
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/products" element={<Catalog />} />
              <Route path="/company" element={<CompanyDetails />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/partnership" element={<Partnership />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contacts" element={<Contacts />} />

              <Route
                path="products/details/:id"
                element={<AdminProductDetails />}
              />
              {/* PROTECTED ROUTES FOR ADMINISTARTOR */}
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

                <Route path="faq/edit" element={<AdminFaqEdit />} />
                <Route path="company/edit" element={<AdminCompanyEdit />} />
                <Route
                  path="partnership/edit"
                  element={<AdminPartnershipEdit />}
                />
                <Route path="contacts/edit" element={<AdminContactsEdit />} />

                <Route path="reviews/edit" element={<AdminReviewsEdit />} />
              </Route>
            </Routes>
            {/* PROTECTED ROUTES FOR ADMINISTARTOR BOTTOM */}
            <Toaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
