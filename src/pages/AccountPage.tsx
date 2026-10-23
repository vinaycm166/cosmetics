import React, { useState } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { store } from '../lib/store';
import { ProductCard } from '../components/common/ProductCard';

interface AccountPageProps {
  initialTab?: 'orders' | 'addresses' | 'wishlist' | 'profile';
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const { user, role, addresses, deleteAddress, setDefaultAddress, logout, login } = useAuth();
  const { wishlistProducts } = useWishlist();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<'customer' | 'super_admin' | 'delivery_person'>('customer');

  const orders = store.getOrders(user?.id);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF0F5] border border-[#E84F87]/20 text-[#721C46] flex items-center justify-center mx-auto shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-heading font-extrabold text-2xl text-[#29242A]">Your Account</h1>
          <p className="text-xs text-[#756D77] max-w-sm mx-auto">
            Please sign in or create an account to view your past orders, manage delivery addresses, and track active deliveries.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/login?redirect=/account')}
            className="w-full sm:w-auto dew-btn-berry !py-2.5 !px-6 text-xs font-extrabold"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('/signup?redirect=/account')}
            className="w-full sm:w-auto dew-btn-secondary !py-2.5 !px-6 text-xs font-bold"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header Profile */}
      <div className="p-6 rounded-2xl border border-[#EFE7E1] bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF0F5] border-2 border-[#E84F87]/20 text-[#721C46] flex items-center justify-center font-heading font-bold text-xl">
            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#29242A]">
                {user.fullName}
              </h1>
              <span className="text-[10px] font-bold text-[#267653] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Customer
              </span>
            </div>
            <p className="text-xs text-[#756D77] mt-0.5">{user.email} {user.phone ? `• ${user.phone}` : ''}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="dew-btn-secondary text-xs font-semibold !px-4 !py-2 flex items-center gap-1.5 self-start sm:self-auto text-rose-700 border-rose-200 hover:bg-rose-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-[#EFE7E1] gap-6 text-xs font-bold">
        <button
          onClick={() => { setActiveTab('orders'); onNavigate('/account/orders'); }}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'orders' ? 'border-b-2 border-[#721C46] text-[#721C46] font-extrabold' : 'text-[#756D77] hover:text-[#29242A]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('profile'); onNavigate('/account/profile'); }}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'profile' ? 'border-b-2 border-[#721C46] text-[#721C46] font-extrabold' : 'text-[#756D77] hover:text-[#29242A]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>
        <button
          onClick={() => { setActiveTab('addresses'); onNavigate('/account/addresses'); }}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'addresses' ? 'border-b-2 border-[#721C46] text-[#721C46] font-extrabold' : 'text-[#756D77] hover:text-[#29242A]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('wishlist'); onNavigate('/account/wishlist'); }}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'wishlist' ? 'border-b-2 border-[#721C46] text-[#721C46] font-extrabold' : 'text-[#756D77] hover:text-[#29242A]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistProducts.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="p-12 rounded-md border border-neutral-border bg-white text-center space-y-3 shadow-card">
              <Package className="w-10 h-10 text-muted mx-auto" />
              <h3 className="font-heading font-bold text-base text-charcoal-900">No Orders Placed Yet</h3>
              <p className="text-xs text-muted">When you place an order, live delivery tracking will appear here.</p>
              <button onClick={() => onNavigate('/shop')} className="dew-btn-primary text-xs mt-2">
                Explore Best-Sellers
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-md border border-neutral-border bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-charcoal-900 font-mono">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-100">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {order.items.length} items • ₹{order.totalAmount} • {order.paymentMethod.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-muted">
                    Delivering to: {order.shippingAddress.addressLine}, {order.shippingAddress.area}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate(`/track-order/${order.orderNumber}`)}
                    className="dew-btn-primary text-xs font-semibold flex items-center gap-1.5 !py-2 !px-4"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className="p-5 rounded-md border border-neutral-border bg-white shadow-card flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs text-charcoal-900">
                    {addr.recipientName}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-semibold text-mint-500 bg-mint-50 px-2 py-0.5 rounded border border-mint-200">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  {addr.addressLine}, {addr.apartmentBuilding && `${addr.apartmentBuilding}, `}
                  {addr.area}, {addr.city} — <strong className="text-charcoal-900 font-semibold">{addr.pinCode}</strong>
                </p>
                <p className="text-[11px] text-muted mt-1">Phone: {addr.phoneNumber}</p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Set as Default
                  </button>
                ) : <span />}
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="text-xs text-sale hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 rounded-md border border-neutral-border bg-white text-center space-y-3 shadow-card">
              <Heart className="w-10 h-10 text-muted mx-auto" />
              <h3 className="font-heading font-bold text-base text-charcoal-900">Your Wishlist is Empty</h3>
              <p className="text-xs text-muted">Click the heart icon on any product to save it for later.</p>
              <button onClick={() => onNavigate('/shop')} className="dew-btn-primary text-xs mt-2">
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map(p => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
