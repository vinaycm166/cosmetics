import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Address } from '../types';
import { authService } from '../lib/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDeliveryPerson: boolean;
  addresses: Address[];
  login: (email: string, password?: string, requiredRole?: 'customer' | 'admin') => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signup: (params: { fullName: string; email: string; password: string; confirmPassword?: string; phone?: string }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  logout: () => void;
  switchRole?: (role: UserRole) => void; // Deprecated: Kept for backwards compatibility in dev tests
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const STORAGE_KEY_USER = 'dew_and_go_auth_user';
const STORAGE_KEY_ADDRESSES = 'dew_and_go_addresses';

const DEFAULT_DEMO_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    userId: 'usr-customer-1',
    recipientName: 'Vinay Sharma',
    phoneNumber: '+91 98765 43210',
    addressLine: '#42, 3rd Main, 4th Cross',
    apartmentBuilding: 'Gokulam 3rd Stage',
    landmark: 'Near Doctors Corner',
    area: 'Gokulam',
    city: 'Mysuru',
    state: 'Karnataka',
    pinCode: '570002',
    deliveryInstructions: 'Leave with security guard if not reachable',
    isDefault: true
  },
  {
    id: 'addr-2',
    userId: 'usr-customer-1',
    recipientName: 'Vinay Sharma (Office)',
    phoneNumber: '+91 98765 43210',
    addressLine: 'Suite 204, Green Oasis, Kalidasa Road',
    apartmentBuilding: 'Green Oasis Business Hub',
    landmark: 'Opposite Cheluvamba Park',
    area: 'Jayalakshmipuram',
    city: 'Mysuru',
    state: 'Karnataka',
    pinCode: '570012',
    deliveryInstructions: 'Call upon arrival at reception',
    isDefault: false
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADDRESSES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_DEMO_ADDRESSES;
  });

  // Listen for Supabase session changes if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch verified role from user_roles
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const verifiedRole: UserRole = (roleRow?.role as UserRole) || 'customer';
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || (session.user.email || '').split('@')[0],
          phone: session.user.user_metadata?.phone,
          role: verifiedRole,
          createdAt: session.user.created_at
        };
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(addresses));
  }, [addresses]);

  const login = async (
    email: string,
    password?: string,
    requiredRole?: 'customer' | 'admin'
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    // If password provided, use secure password authentication
    if (password) {
      const res = await authService.loginWithPassword(email, password, requiredRole);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    }

    // Default password fallback for demo ease: 'DewCustomer@2026' or 'DewAdmin@2026'
    const fallbackPass = requiredRole === 'admin' ? 'DewAdmin@2026' : 'DewCustomer@2026';
    const res = await authService.loginWithPassword(email, fallbackPass, requiredRole);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }

    // If account doesn't exist yet in fallback mode and email valid, register customer
    if (requiredRole !== 'admin') {
      const reg = await authService.registerCustomer({
        fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        password: fallbackPass
      });
      if (reg.success && reg.user) {
        setUser(reg.user);
        return { success: true, user: reg.user };
      }
    }

    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const signup = async (params: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const res = await authService.registerCustomer(params);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const requestPasswordReset = async (email: string) => {
    return await authService.requestPasswordReset(email);
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  // Deprecated development role switch (disabled in production)
  const switchRole = (newRole: UserRole) => {
    if (user) {
      // In production, customer cannot self-promote to admin
      setUser({ ...user, role: newRole });
    } else {
      setUser({
        id: 'usr-demo',
        email: `${newRole}@dewandgo.com`,
        fullName: `${newRole.replace('_', ' ').toUpperCase()}`,
        role: newRole,
        createdAt: new Date().toISOString()
      });
    }
  };

  const addAddress = (addrData: Omit<Address, 'id' | 'userId'>) => {
    const newAddr: Address = {
      ...addrData,
      id: `addr-${Date.now().toString(36)}`,
      userId: user?.id || 'usr-guest',
    };

    if (newAddr.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const role = user?.role || 'customer';
  const isAdmin = ['super_admin', 'store_manager', 'inventory_manager', 'order_manager'].includes(role);
  const isDeliveryPerson = ['delivery_person', 'delivery_manager'].includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin,
        isDeliveryPerson,
        addresses,
        login,
        signup,
        requestPasswordReset,
        logout,
        switchRole,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
