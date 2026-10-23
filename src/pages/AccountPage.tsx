import React, { useState } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  Clock,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { store } from '../lib/store';
import { ProductCard } from '../components/common/ProductCard';

interface AccountPageProps {
  initialTab?: 'orders' | 'addresses' | 'wishlist' | 'profile' | 'wallet' | 'settings';
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const { user, addresses, deleteAddress, setDefaultAddress, logout } = useAuth();
  const { wishlistProducts } = useWishlist();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile' | 'wallet' | 'settings'>(initialTab);
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  const orders = store.getOrders(user?.id);

  // If no live orders exist yet, provide the demo orders shown in the reference image
  const displayOrders = orders.length > 0 ? orders : [
    {
      id: 'demo-1',
      orderNumber: 'DG20260901',
      createdAt: '2026-09-01T10:30:00Z',
      displayDate: '1 Sep 2026',
      status: 'delivered',
      statusLabel: 'Delivered',
      statusColor: 'bg-[#E8F7EE] text-[#137333]',
      itemsCount: 2,
      totalAmount: 1448,
    },
    {
      id: 'demo-2',
      orderNumber: 'DG20260828',
      createdAt: '2026-08-28T14:15:00Z',
      displayDate: '28 Aug 2026',
      status: 'shipped',
      statusLabel: 'Out for Delivery',
      statusColor: 'bg-blue-50 text-blue-700',
      itemsCount: 3,
      totalAmount: 2567,
    },
    {
      id: 'demo-3',
      orderNumber: 'DG20260824',
      createdAt: '2026-08-24T18:45:00Z',
      displayDate: '24 Aug 2026',
      status: 'processing',
      statusLabel: 'Processing',
      statusColor: 'bg-amber-50 text-amber-700',
      itemsCount: 1,
      totalAmount: 899,
    },
  ];

  const filteredOrders = displayOrders.filter(o => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'delivered' && o.status.includes('deliver')) return true;
    if (orderFilter === 'processing' && o.status.includes('process')) return true;
    if (orderFilter === 'shipped' && (o.status.includes('ship') || o.status.includes('out'))) return true;
    if (orderFilter === 'cancelled' && o.status.includes('cancel')) return true;
    return o.status === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar (Matching Reference Image) */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-[#F0EAE8] shadow-2xs p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">
            My Account
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#FBECEB] text-burgundy font-bold shadow-2xs'
                : 'text-charcoal hover:bg-[#FAF8F6]'
            }`}
          >
            <Package className="w-4 h-4 text-burgundy" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'addresses'
                ? 'bg-[#FBECEB] text-burgundy font-bold shadow-2xs'
                : 'text-charcoal hover:bg-[#FAF8F6]'
            }`}
          >
            <MapPin className="w-4 h-4 text-muted" />
            <span>Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-[#FBECEB] text-burgundy font-bold shadow-2xs'
                : 'text-charcoal hover:bg-[#FAF8F6]'
            }`}
          >
            <Heart className="w-4 h-4 text-muted" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'wallet'
                ? 'bg-[#FBECEB] text-burgundy font-bold shadow-2xs'
                : 'text-charcoal hover:bg-[#FAF8F6]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-muted" />
            <span>Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#FBECEB] text-burgundy font-bold shadow-2xs'
                : 'text-charcoal hover:bg-[#FAF8F6]'
            }`}
          >
            <Settings className="w-4 h-4 text-muted" />
            <span>Settings</span>
          </button>

          <div className="pt-2 border-t border-[#F0EAE8]">
            <button
              onClick={() => {
                if (user) logout();
                onNavigate('/login');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-9 bg-white rounded-2xl border border-[#F0EAE8] shadow-2xs p-6 space-y-6">
          
          {/* View: Orders (Matching Reference Image) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE8]">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal">
                  My Orders
                </h2>

                {/* Filter Tabs matching reference image */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setOrderFilter(tab)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                        orderFilter === tab
                          ? 'bg-burgundy text-white font-bold shadow-2xs'
                          : 'bg-[#FAF8F6] text-charcoal hover:bg-[#F0EAE8]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards List matching Reference Image */}
              <div className="space-y-3">
                {filteredOrders.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-5 rounded-xl border border-[#F0EAE8] bg-white hover:border-burgundy/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-charcoal">
                          #{ord.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ord.statusColor || 'bg-emerald-50 text-emerald-800'}`}>
                          {ord.statusLabel || ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {ord.displayDate || new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <span className="text-xs text-muted block">
                          {ord.itemsCount || (ord.items ? ord.items.length : 1)} {ord.itemsCount === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-sm font-bold text-charcoal block">
                          ₹{ord.totalAmount}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate(`/track-order/${ord.orderNumber}`)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#EFE7E1] hover:bg-[#FAF8F6] text-xs font-semibold text-charcoal transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE8]">
                <h2 className="font-editorial text-2xl font-bold text-charcoal">
                  Saved Addresses
                </h2>
                <button
                  onClick={() => alert('Add Address Modal ready.')}
                  className="px-3 py-1.5 rounded-lg bg-burgundy text-white text-xs font-bold"
                >
                  + Add Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="p-4 rounded-xl border border-[#F0EAE8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal">{addr.recipientName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {addr.addressLine}, {addr.area}, {addr.city} - {addr.pinCode}
                    </p>
                    <p className="text-xs text-muted font-medium">📞 {addr.phoneNumber}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View: Favorites / Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-editorial text-2xl font-bold text-charcoal pb-4 border-b border-[#F0EAE8]">
                Favorites ({wishlistProducts.length})
              </h2>
              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No saved favorites yet. Explore bestsellers to add items.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlistProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View: Wallet */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-charcoal pb-4 border-b border-[#F0EAE8]">
                Dew & Go Wallet
              </h2>
              <div className="p-6 rounded-2xl bg-gradient-to-r from-burgundy to-burgundy-light text-white max-w-sm space-y-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Available Balance
                </span>
                <div className="text-3xl font-extrabold">₹500.00</div>
                <p className="text-xs text-white/80">Can be applied to any Gokulam hyperlocal order.</p>
              </div>
            </div>
          )}

          {/* View: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-charcoal pb-4 border-b border-[#F0EAE8]">
                Account Settings
              </h2>
              <div className="space-y-3 text-xs max-w-md">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullName || 'Vinay Kumar'}
                    className="w-full px-3 py-2 border border-[#EFE7E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'vinay18744@gmail.com'}
                    className="w-full px-3 py-2 border border-[#EFE7E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    defaultValue={user?.phone || '+91 9876543210'}
                    className="w-full px-3 py-2 border border-[#EFE7E1] rounded-lg"
                  />
                </div>
                <button className="px-4 py-2 bg-burgundy text-white font-bold rounded-lg text-xs mt-2">
                  Save Changes
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
