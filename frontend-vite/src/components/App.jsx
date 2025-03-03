// App.jsx
import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";

// Only import components needed for the core application structure
import Navbar from "./navigation/Navbar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "../context/AuthContext";
import store from "../store";
import { fetchContacts } from "../store/slices/contactsSlice";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";
import Footer from "./navigation/Footer";
import ScrollToTop from "@/subcomponents/ScrollToTop";
import AdminMenu from "../subcomponents/AdminMenuButton";

// Lazy load public pages
const Homepage = lazy(() => import("@/pages/Homepage"));
const Catalog = lazy(() => import("../pages/Catalog"));
const CompanyDetails = lazy(() => import("../pages/CompanyDetails"));
const Faq = lazy(() => import("@/pages/Faq"));
const Partnership = lazy(() => import("@/pages/Partnership"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const Payment = lazy(() => import("@/pages/Payment"));
const Delivery = lazy(() => import("@/pages/Delivery"));
const Cart = lazy(() => import("@/pages/Cart"));
const DataAgreement = lazy(() => import("@/pages/DataAgreement"));
const AdminProductDetails = lazy(() => import("../pages/ProductDetails"));

// Separate lazy loads for admin pages
const AdminLogin = lazy(() => import("../pages/Admin/AdminLogin"));

// We'll only load these if the user is authenticated
const AdminProductList = lazy(() => import("./products/AdminProductList"));
const AdminProductCreate = lazy(() => import("../pages/Admin/AdminProductCreate"));
const AdminProductEdit = lazy(() => import("../pages/Admin/AdminProductEdit"));
const AdminCompanyEdit = lazy(() => import("../pages/Admin/AdminCompanyEdit"));
const AdminFaqEdit = lazy(() => import("../pages/Admin/AdminFaqEdit"));
const AdminPartnershipEdit = lazy(() => import("../pages/Admin/AdminPartnershipEdit"));
const AdminReviewsEdit = lazy(() => import("../pages/Admin/AdminReviewsEdit"));
const AdminContactsEdit = lazy(() => import("../pages/Admin/AdminContactsEdit"));
const AdminPaymentEdit = lazy(() => import("../pages/Admin/AdminPaymentEdit"));
const AdminDeliveryEdit = lazy(() => import("../pages/Admin/AdminDeliveryEdit"));
const AdminHomepageEdit = lazy(() => import("@/pages/Admin/AdminHomepageEdit"));
const AdminOrdersEdit = lazy(() => import("@/pages/Admin/AdminOrdersEdit"));

// Create a loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
  </div>
);

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
    // Periodic update every X minutes
    const interval = setInterval(() => {
      store.dispatch(fetchContacts());
    }, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <Separator />
            {/* Public Pages */}
            <main className="flex flex-col flex-1 container px-4">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* Public routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/products" element={<Catalog />} />
                  <Route path="/company" element={<CompanyDetails />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/partnership" element={<Partnership />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/agreement" element={<DataAgreement />} />
                  <Route path="products/details/:id" element={<AdminProductDetails />} />

                  {/* PROTECTED ROUTES FOR ADMINISTRATOR */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/products" replace />} />
                    <Route path="products" element={<AdminProductList />} />
                    <Route path="products/create" element={<AdminProductCreate />} />
                    <Route path="products/edit/:id" element={<AdminProductEdit />} />
                    <Route path="faq/edit" element={<AdminFaqEdit />} />
                    <Route path="company/edit" element={<AdminCompanyEdit />} />
                    <Route path="partnership/edit" element={<AdminPartnershipEdit />} />
                    <Route path="contacts/edit" element={<AdminContactsEdit />} />
                    <Route path="homepage/edit" element={<AdminHomepageEdit />} />
                    <Route path="reviews/edit" element={<AdminReviewsEdit />} />
                    <Route path="payment/edit" element={<AdminPaymentEdit />} />
                    <Route path="delivery/edit" element={<AdminDeliveryEdit />} />
                    <Route path="orders/edit" element={<AdminOrdersEdit />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <Separator />
            <Footer />
            <Toaster />
            <ScrollToTop />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;