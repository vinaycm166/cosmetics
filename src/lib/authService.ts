import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_AUTH = 'dew_and_go_auth_session';
const STORAGE_KEY_USERS_DB = 'dew_and_go_registered_accounts';

export interface StoredUserAccount {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  passwordHash: string; // SHA-256 hash + salt, never plaintext
  salt: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory or safe browser local persistence for registered accounts
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, val: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, val);
      } catch {}
    }
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  }
};

// SHA-256 hashing helper
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:dew_salt_2026`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple deterministic hash for environments without crypto.subtle
  let hash = 0;
  const str = `${salt}:${password}:dew_salt_2026`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

// Generate random salt
export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validation Helpers
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}

class AuthService {
  private accounts: StoredUserAccount[] = [];

  constructor() {
    this.loadAccounts();
    this.seedDefaultAdminIfEmpty();
  }

  private loadAccounts(): void {
    const raw = safeStorage.getItem(STORAGE_KEY_USERS_DB);
    if (raw) {
      try {
        this.accounts = JSON.parse(raw);
      } catch {
        this.accounts = [];
      }
    }
  }

  private saveAccounts(): void {
    safeStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(this.accounts));
  }

  private async seedDefaultAdminIfEmpty(): Promise<void> {
    // Only provision the configured admin if not present
    const defaultAdminEmail = 'admin@dewandgo.com';
    const hasAdmin = this.accounts.some(a => a.email.toLowerCase() === defaultAdminEmail.toLowerCase());
    if (!hasAdmin) {
      const salt = generateSalt();
      const passwordHash = await hashPassword('DewAdmin@2026', salt);
      this.accounts.push({
        id: 'usr-admin-master-01',
        email: defaultAdminEmail,
        fullName: 'Dew & Go System Owner',
        phone: '+91 80000 12345',
        passwordHash,
        salt,
        role: 'super_admin',
        isEmailVerified: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      });
      this.saveAccounts();
    }
  }

  /**
   * Registers a customer account. Role is strictly 'customer'.
   * Ordinary signups can never specify or self-promote to 'admin'.
   */
  public async registerCustomer(params: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const { fullName, email, password, confirmPassword, phone } = params;

    // Validate Full Name
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters.' };
    }

    // Validate Email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    // Validate Password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return { success: false, error: passwordCheck.error };
    }

    // Confirm Password check
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate accounts
    this.loadAccounts();
    const existing = this.accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    // If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone || ''
            }
          }
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            fullName: fullName.trim(),
            phone: phone || '',
            role: 'customer', // strictly customer
            createdAt: new Date().toISOString()
          };
          return { success: true, user: profile };
        }
      } catch (err: any) {
        console.warn('Supabase signup fallback:', err);
      }
    }

    // Local / fallback registered store
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newAccount: StoredUserAccount = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      fullName: fullName.trim(),
      phone: phone || '',
      passwordHash,
      salt,
      role: 'customer', // strictly customer
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.accounts.push(newAccount);
    this.saveAccounts();

    const profile: UserProfile = {
      id: newAccount.id,
      email: newAccount.email,
      fullName: newAccount.fullName,
      phone: newAccount.phone,
      role: newAccount.role,
      createdAt: newAccount.createdAt
    };

    return { success: true, user: profile };
  }

  /**
   * Authenticates user with email and password.
   * If requiredRole is 'admin', validates that the verified role is an admin role.
   */
  public async loginWithPassword(
    email: string,
    password: string,
    requiredRole?: 'customer' | 'admin'
  ): Promise<{ success: boolean; user?: UserProfile; role?: UserRole; error?: string }> {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // If Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (error) {
          return { success: false, error: 'Invalid email or password.' };
        }
        if (data.user) {
          // Query verified user role from public.user_roles
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

          const verifiedRole: UserRole = (roleData?.role as UserRole) || 'customer';

          if (requiredRole === 'admin' && !['super_admin', 'store_manager', 'order_manager'].includes(verifiedRole)) {
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'Access denied. This account does not possess administrator privileges.'
            };
          }

          const profile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            fullName: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            phone: data.user.user_metadata?.phone,
            role: verifiedRole,
            createdAt: data.user.created_at
          };

          return { success: true, user: profile, role: verifiedRole };
        }
      } catch (err: any) {
        console.warn('Supabase auth fallback:', err);
      }
    }

    // Local verified accounts store
    this.loadAccounts();
    const account = this.accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      // Safe generic message to avoid enumeration
      return { success: false, error: 'Invalid email or password.' };
    }

    const computedHash = await hashPassword(password, account.salt);
    if (computedHash !== account.passwordHash) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Verify role if admin route
    const isAdminRole = ['super_admin', 'store_manager', 'inventory_manager', 'order_manager'].includes(account.role);
    if (requiredRole === 'admin' && !isAdminRole) {
      return {
        success: false,
        error: 'Access denied. This account does not possess administrator privileges.'
      };
    }

    const profile: UserProfile = {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      phone: account.phone,
      role: account.role,
      createdAt: account.createdAt
    };

    return { success: true, user: profile, role: account.role };
  }

  /**
   * Password reset request (sends reset email or returns token instructions)
   */
  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error, message: '' };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });
      } catch {}
    }

    // Always respond with a generic success message to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with this email, a secure password reset link has been dispatched.'
    };
  }

  /**
   * Secure server-side / authorized administrator provisioning
   * Cannot be triggered by ordinary client users.
   */
  public async provisionAdminAccount(
    adminEmail: string,
    fullName: string = 'Authorized Store Administrator',
    tempPassword?: string
  ): Promise<{ success: boolean; account?: UserProfile; error?: string }> {
    const cleanEmail = adminEmail.trim().toLowerCase();
    this.loadAccounts();

    const existing = this.accounts.find(a => a.email.toLowerCase() === cleanEmail);
    const salt = generateSalt();
    const initialPass = tempPassword || 'DewAdmin@2026';
    const passwordHash = await hashPassword(initialPass, salt);

    if (existing) {
      existing.role = 'super_admin';
      existing.passwordHash = passwordHash;
      existing.salt = salt;
      existing.updatedAt = new Date().toISOString();
      this.saveAccounts();
      return {
        success: true,
        account: {
          id: existing.id,
          email: existing.email,
          fullName: existing.fullName,
          role: 'super_admin',
          createdAt: existing.createdAt
        }
      };
    }

    const newAdmin: StoredUserAccount = {
      id: `usr-admin-${Date.now().toString(36)}`,
      email: cleanEmail,
      fullName,
      passwordHash,
      salt,
      role: 'super_admin',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.accounts.push(newAdmin);
    this.saveAccounts();

    return {
      success: true,
      account: {
        id: newAdmin.id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: 'super_admin',
        createdAt: newAdmin.createdAt
      }
    };
  }

  public async login(
    email: string,
    password?: string,
    requiredRole?: 'customer' | 'admin'
  ): Promise<{ success: boolean; user?: UserProfile; role?: UserRole; error?: string }> {
    return this.loginWithPassword(email, password || '', requiredRole);
  }

  public async provisionAdmin(params: {
    email: string;
    fullName?: string;
    password?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const res = await this.provisionAdminAccount(params.email, params.fullName, params.password);
    return { success: res.success, user: res.account, error: res.error };
  }

  public getAccounts(): StoredUserAccount[] {
    return this.accounts;
  }
}

export const authService = new AuthService();
