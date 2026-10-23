import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { LocationModal } from './components/common/LocationModal';
import { useAuth } from './context/AuthContext';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { OffersPage } from './pages/OffersPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AccountPage } from './pages/AccountPage';
import { BeautyAdvisorPage } from './pages/BeautyAdvisorPage';
import { DeliveryPortalPage } from './pages/DeliveryPortalPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AboutPage, ContactPage, FAQPage, PolicyPage } from './pages/StaticPages';

export const App: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Parser
  const url = new URL(currentPath, window.location.origin);
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  const renderRoute = () => {
    // 1. Home
    if (pathname === '/' || pathname === '') {
      return <HomePage onNavigate={navigate} />;
    }

    // 2. Authentication & Account
    if (pathname === '/login') {
      return <LoginPage onNavigate={navigate} redirectUrl={searchParams.get('redirect') || '/account'} />;
    }

    if (pathname === '/signup') {
      return <SignupPage onNavigate={navigate} redirectUrl={searchParams.get('redirect') || '/account'} />;
    }

    if (pathname === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }

    // 3. Shop & Categories
    if (pathname === '/shop' || pathname === '/products') {
      return <ShopPage onNavigate={navigate} />;
    }

    if (pathname.startsWith('/category/') || pathname.startsWith('/categories/')) {
      const slug = pathname.replace(/^\/(category|categories)\//, '');
      return <CategoryPage slug={slug} onNavigate={navigate} />;
    }

    // 4. Product Details
    if (pathname.startsWith('/product/') || pathname.startsWith('/products/')) {
      const slug = pathname.replace(/^\/(product|products)\//, '');
      return <ProductDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 5. Search
    if (pathname === '/search') {
      const q = searchParams.get('q') || '';
      return <SearchPage initialQuery={q} onNavigate={navigate} />;
    }

    // 6. Offers
    if (pathname === '/offers') {
      return <OffersPage onNavigate={navigate} />;
    }

    // 7. Cart & Checkout
    if (pathname === '/cart') {
      return <CartPage onNavigate={navigate} />;
    }

    if (pathname === '/checkout') {
      return <CheckoutPage onNavigate={navigate} />;
    }

    if (pathname === '/payment/success') {
      const orderNumber = searchParams.get('orderNumber') || undefined;
      return <PaymentSuccessPage orderNumber={orderNumber} onNavigate={navigate} />;
    }

    if (pathname === '/payment/failed') {
      const reason = searchParams.get('reason') || undefined;
      return <PaymentFailedPage reason={reason} onNavigate={navigate} />;
    }

    // 8. Order Tracking
    if (pathname.startsWith('/track-order')) {
      const orderNumber = pathname.replace('/track-order/', '').replace('/track-order', '') || undefined;
      return <TrackOrderPage orderNumber={orderNumber} onNavigate={navigate} />;
    }

    // 9. Customer Account Subroutes
    if (pathname === '/account' || pathname === '/account/profile') {
      return <AccountPage initialTab="profile" onNavigate={navigate} />;
    }

    if (pathname === '/account/orders') {
      return <AccountPage initialTab="orders" onNavigate={navigate} />;
    }

    if (pathname === '/account/addresses') {
      return <AccountPage initialTab="addresses" onNavigate={navigate} />;
    }

    if (pathname === '/account/wishlist' || pathname === '/wishlist') {
      return <AccountPage initialTab="wishlist" onNavigate={navigate} />;
    }

    // 10. AI Beauty Advisor
    if (pathname === '/beauty-advisor') {
      return <BeautyAdvisorPage onNavigate={navigate} />;
    }

    // 11. Hyperlocal Delivery Portal (Restricted to delivery partners)
    if (pathname === '/delivery') {
      return <DeliveryPortalPage onNavigate={navigate} />;
    }

    // 12. Separate Dedicated Admin Portal with Route Guard
    if (pathname === '/admin/login') {
      if (isAdmin) {
        return <AdminPage onNavigate={navigate} />;
      }
      return <AdminLoginPage onNavigate={navigate} />;
    }

    if (pathname === '/admin' || pathname === '/admin/dashboard' || pathname.startsWith('/admin/')) {
      if (isAdmin) {
        return <AdminPage onNavigate={navigate} />;
      }
      // Unauthenticated or customer attempting to access admin is redirected to /admin/login
      return <AdminLoginPage onNavigate={navigate} />;
    }

    // 11. Company & Policies
    if (pathname === '/about') {
      return <AboutPage />;
    }

    if (pathname === '/contact') {
      return <ContactPage />;
    }

    if (pathname === '/faq') {
      return <FAQPage />;
    }

    if (pathname === '/shipping-policy') {
      return (
        <PolicyPage
          title="15-Minute Hyperlocal Delivery Policy"
          content={[
            "Dew & Go operates dark-store micro-hubs within active city clusters. Orders placed within active service PIN codes are dispatched within 3 minutes and delivered within 15 minutes.",
            "Free delivery is automatically applied to all orders above ₹499. For smaller orders, a standard fee of ₹49 applies.",
            "All cosmetic items are transported in insulated, temperature-controlled bags to prevent heat degradation of sensitive active formulations."
          ]}
        />
      );
    }

    if (pathname === '/refund-policy') {
      return (
        <PolicyPage
          title="Returns & Refund Policy"
          content={[
            "Due to cosmetic hygiene standards, products with opened or tampered safety seals cannot be returned.",
            "If an item arrives damaged, leaking, or incorrect, please submit a claim via your Orders page within 24 hours of delivery.",
            "Verified refunds are initiated immediately to the original payment method and typically reflect within 24-48 business hours via Razorpay."
          ]}
        />
      );
    }

    if (pathname === '/privacy-policy') {
      return (
        <PolicyPage
          title="Privacy Policy"
          content={[
            "Dew & Go is committed to protecting your personal information. We collect contact and delivery address details solely to fulfill and track your hyperlocal beauty orders.",
            "We never store raw credit card numbers or banking passwords. All online payments are handled securely through Razorpay's PCI-DSS compliant infrastructure.",
            "Your phone number is shared with assigned delivery riders solely for active transit communications and is not sold to third parties."
          ]}
        />
      );
    }

    if (pathname === '/terms') {
      return (
        <PolicyPage
          title="Terms of Service"
          content={[
            "By accessing and placing an order on Dew & Go, you agree to these operational terms and conditions.",
            "All listed prices are in Indian Rupees (INR) and include applicable Goods and Services Tax (GST).",
            "We reserve the right to limit order quantities during high-demand promotional events to ensure fair customer access."
          ]}
        />
      );
    }

    // 404 Fallback
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading font-extrabold text-2xl text-charcoal-900">Page Not Found</h2>
        <p className="text-xs text-charcoal-50">The page you requested does not exist or has been moved.</p>
        <button onClick={() => navigate('/')} className="dew-btn-primary text-xs">
          Return to Homepage
        </button>
      </div>
    );
  };

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] text-charcoal-900 selection:bg-brand-100 selection:text-brand-900">
        {renderRoute()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-100 selection:text-brand-900">
      <Header onNavigate={navigate} currentRoute={pathname} />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer onNavigate={navigate} />
      <CartDrawer onNavigate={navigate} />
      <LocationModal />
    </div>
  );
};
