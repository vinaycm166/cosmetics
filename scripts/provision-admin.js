#!/usr/bin/env node

/**
 * DEW & GO - SECURE ADMINISTRATOR PROVISIONING SCRIPT
 * 
 * Securely creates or promotes an administrator account using trusted server-side credentials.
 * This script MUST be executed on a trusted server or local CLI environment.
 * NEVER execute this from client-side code or expose service role keys.
 * 
 * Usage:
 *   node scripts/provision-admin.js --email admin@dewandgo.com --password YourSecurePassword123!
 *   node scripts/provision-admin.js --email admin@dewandgo.com --generate-password
 */

import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Helper: parse CLI arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const emailArg = getArg('--email') || process.env.ADMIN_EMAIL || 'admin@dewandgo.com';
let passwordArg = getArg('--password');
const generatePassword = args.includes('--generate-password') || (!passwordArg && !process.env.ADMIN_INITIAL_PASSWORD);

if (generatePassword) {
  passwordArg = 'DewAdmin$' + crypto.randomBytes(6).toString('hex') + '!2026';
} else if (!passwordArg) {
  passwordArg = process.env.ADMIN_INITIAL_PASSWORD || 'DewAdmin#Secure2026!';
}

// Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailArg)) {
  console.error('❌ Error: Invalid email address provided:', emailArg);
  process.exit(1);
}

if (passwordArg.length < 8) {
  console.error('❌ Error: Password must be at least 8 characters with high entropy.');
  process.exit(1);
}

console.log('====================================================');
console.log('⚡ DEW & GO — SECURE ADMINISTRATOR PROVISIONING');
console.log('====================================================');
console.log(`Target Admin Email: ${emailArg}`);
console.log('Role Assigned: super_admin');

async function provision() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isRealSupabase = supabaseUrl && serviceRoleKey && !supabaseUrl.includes('mock-dewandgo');

  if (isRealSupabase) {
    console.log(`Connecting to Supabase at: ${supabaseUrl}`);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    try {
      // 1. Check if user already exists
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const existingUser = usersData.users.find(u => u.email?.toLowerCase() === emailArg.toLowerCase());

      let userId;
      if (existingUser) {
        console.log(`User already exists (ID: ${existingUser.id}). Promoting to super_admin...`);
        userId = existingUser.id;

        // Update password and metadata
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: passwordArg,
          user_metadata: { role: 'super_admin', full_name: 'Store Administrator' },
          email_confirm: true
        });
        if (updateError) throw updateError;
      } else {
        console.log(`Creating new administrator account for ${emailArg}...`);
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: emailArg,
          password: passwordArg,
          email_confirm: true,
          user_metadata: { role: 'super_admin', full_name: 'Store Administrator' }
        });
        if (createError) throw createError;
        userId = newUser.user.id;
      }

      // 2. Upsert into public.profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: emailArg,
          full_name: 'Store Administrator',
          role: 'super_admin',
          updated_at: new Date().toISOString()
        });
      if (profileError) console.warn('Note: profiles table upsert:', profileError.message);

      // 3. Upsert into public.user_roles
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'super_admin'
        }, { onConflict: 'user_id,role' });
      if (roleError) console.warn('Note: user_roles table upsert:', roleError.message);

      console.log('✅ Supabase administrator account provisioned successfully!');
    } catch (err) {
      console.error('❌ Failed to provision via Supabase Admin API:', err.message);
    }
  } else {
    console.log('Running in local/sandbox mode (no external Supabase service role key active).');
  }

  // Generate SHA-256 local salt + hash for local persistence
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(passwordArg + salt).digest('hex');

  const adminCredentialsSnapshot = {
    email: emailArg.toLowerCase(),
    role: 'super_admin',
    fullName: 'Store Administrator',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  };

  console.log('\n----------------------------------------------------');
  console.log('🔑 CREDENTIALS FOR ADMIN LOGIN:');
  console.log(`• Portal Route: /admin/login`);
  console.log(`• Email:        ${emailArg}`);
  console.log(`• Password:     ${passwordArg}`);
  console.log('----------------------------------------------------');
  console.log('IMPORTANT: Store this password securely or reset it immediately.');
  console.log('Never commit plaintext credentials to version control.\n');

  return adminCredentialsSnapshot;
}

provision().catch(console.error);
