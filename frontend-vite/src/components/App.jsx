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
import Payment from "@/pages/Payment";
import AdminPaymentEdit from "./payment/AdminPaymentEdit";
import Delivery from "@/pages/Delivery";
import AdminDeliveryEdit from "./delivery/AdminDeliveryEdit";
import Homepage from "@/pages/Homepage";
import AdminHomepageEdit from "@/components/homepage/AdminHomepageEdit";
import DataAgreement from "@/pages/DataAgreement";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "../context/AuthContext";
import store from "../store";
import { fetchContacts } from "../store/slices/contactsSlice";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";
import Footer from "./navigation/Footer";
import ScrollToTop from "@/subcomponents/ScrollToTop";
import Cart from "@/pages/Cart";
import AdminOrdersEdit from "@/pages/Admin/AdminOrdersEdit";

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
          <div className="flex flex-col min-h-screen bg-background ">
            <Navbar />
            <Separator />
            {/* Public Pages */}
            <main className="flex flex-col flex-1 container px-4">
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/products" element={<Catalog />} />
                <Route path="/company" element={<CompanyDetails />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/partnership" element={<Partnership />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/" element={<Homepage />} />
                <Route path="/agreement" element={<DataAgreement />} />
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
                  <Route path="homepage/edit" element={<AdminHomepageEdit />} />
                  <Route path="reviews/edit" element={<AdminReviewsEdit />} />
                  <Route path="payment/edit" element={<AdminPaymentEdit />} />
                  <Route path="delivery/edit" element={<AdminDeliveryEdit />} />
                  <Route path="orders/edit" element={<AdminOrdersEdit />} />
                </Route>
              </Routes>
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
