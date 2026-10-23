import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dew-and-go-api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) {
            return next();
          }

          // Read request body helper
          const readJsonBody = async (): Promise<any> => {
            return new Promise((resolve) => {
              let data = '';
              req.on('data', chunk => { data += chunk; });
              req.on('end', () => {
                try {
                  resolve(data ? JSON.parse(data) : {});
                } catch {
                  resolve({});
                }
              });
            });
          };

          const sendJson = (status: number, data: any) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          const url = new URL(req.url, `http://${req.headers.host}`);

          try {
            // Health check
            if (url.pathname === '/api/health') {
              return sendJson(200, { status: 'ok', service: 'Dew & Go API', timestamp: new Date().toISOString() });
            }

            // Razorpay Create Order Endpoint
            if (url.pathname === '/api/razorpay/create-order' && req.method === 'POST') {
              const body = await readJsonBody();
              const { amount, currency = 'INR', receipt, notes } = body;

              if (!amount || amount <= 0) {
                return sendJson(400, { error: 'Invalid order amount' });
              }

              const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_DewAndGoTestId';
              const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_mock_mode';

              // If real credentials are provided or in test mode:
              if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                try {
                  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
                  const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Basic ${auth}`
                    },
                    body: JSON.stringify({
                      amount: Math.round(amount * 100), // convert to paise
                      currency,
                      receipt: receipt || `rcpt_${Date.now()}`,
                      notes: notes || {}
                    })
                  });
                  const rzpData = await rzpRes.json();
                  return sendJson(rzpRes.status, rzpData);
                } catch (err: any) {
                  console.error('Razorpay API error:', err);
                  // Fallback to deterministic test order ID
                }
              }

              // Controlled Test Mode Fallback for local sandbox testing
              const testOrderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
              return sendJson(200, {
                id: testOrderId,
                entity: 'order',
                amount: Math.round(amount * 100),
                amount_paid: 0,
                amount_due: Math.round(amount * 100),
                currency,
                receipt: receipt || `rcpt_${Date.now()}`,
                status: 'created',
                attempts: 0,
                notes: notes || {},
                created_at: Math.floor(Date.now() / 1000),
                is_sandbox: true
              });
            }

            // Razorpay Payment Signature Verification
            if (url.pathname === '/api/razorpay/verify-payment' && req.method === 'POST') {
              const body = await readJsonBody();
              const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

              if (!razorpay_order_id || !razorpay_payment_id) {
                return sendJson(400, { verified: false, error: 'Missing payment parameters' });
              }

              const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_mock_mode';

              // If running with actual Razorpay credentials:
              if (process.env.RAZORPAY_KEY_SECRET) {
                const expectedSignature = crypto
                  .createHmac('sha256', keySecret)
                  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                  .digest('hex');

                const isValid = expectedSignature === razorpay_signature;
                return sendJson(200, {
                  verified: isValid,
                  payment_id: razorpay_payment_id,
                  order_id: razorpay_order_id,
                  method: 'razorpay'
                });
              }

              // Test mode verification
              return sendJson(200, {
                verified: true,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                method: 'razorpay_test',
                note: 'Verified in local test mode'
              });
            }

            // Webhook handler for Razorpay asynchronous fulfillment
            if (url.pathname === '/api/razorpay/webhook' && req.method === 'POST') {
              const rawBody = await new Promise<string>((resolve) => {
                let data = '';
                req.on('data', chunk => { data += chunk; });
                req.on('end', () => resolve(data));
              });

              const webhookSignature = req.headers['x-razorpay-signature'] as string;
              const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';

              let isValid = true;
              if (process.env.RAZORPAY_WEBHOOK_SECRET && webhookSignature) {
                const expectedSignature = crypto
                  .createHmac('sha256', webhookSecret)
                  .update(rawBody)
                  .digest('hex');
                isValid = expectedSignature === webhookSignature;
              }

              if (!isValid) {
                return sendJson(400, { error: 'Invalid webhook signature' });
              }

              const event = JSON.parse(rawBody || '{}');
              console.log('[Webhook] Event received:', event.event, 'id:', event.id);

              return sendJson(200, { received: true, event: event.event, processed_at: new Date().toISOString() });
            }

            // Server-side Checkout Validation & Total Calculation
            if (url.pathname === '/api/checkout/validate' && req.method === 'POST') {
              const body = await readJsonBody();
              const { items = [], couponCode, pinCode } = body;

              // Validate delivery zone & PIN code
              const supportedPincodes = ['560001', '560002', '560025', '560034', '560038', '560095', '110001', '400001'];
              const isServiceable = pinCode ? supportedPincodes.includes(pinCode.trim()) : true;

              // Calculate subtotal
              let subtotal = 0;
              for (const item of items) {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                subtotal += price * qty;
              }

              // Delivery fee calculation
              // Free delivery over ₹499
              const freeDeliveryThreshold = 499;
              const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 49;

              // Taxes: 5% GST included or calculated
              const tax = Math.round(subtotal * 0.05);

              // Coupon discount calculation
              let discount = 0;
              let couponApplied = null;

              if (couponCode) {
                const code = couponCode.toUpperCase().trim();
                if (code === 'DEWGLOW20' && subtotal >= 399) {
                  discount = Math.min(Math.round(subtotal * 0.2), 200);
                  couponApplied = { code: 'DEWGLOW20', discount, description: '20% off up to ₹200' };
                } else if (code === 'FIRSTDEW' && subtotal >= 299) {
                  discount = 100;
                  couponApplied = { code: 'FIRSTDEW', discount, description: '₹100 off on first order' };
                } else if (code === 'FREESHIP') {
                  discount = deliveryFee;
                  couponApplied = { code: 'FREESHIP', discount: deliveryFee, description: 'Free Delivery' };
                }
              }

              const total = Math.max(0, subtotal - discount + deliveryFee);

              return sendJson(200, {
                serviceable: isServiceable,
                estimatedDeliveryMinutes: isServiceable ? 15 : null,
                zoneName: isServiceable ? 'Express Hyperlocal Zone' : 'Outside Service Area',
                subtotal,
                discount,
                couponApplied,
                deliveryFee,
                freeDeliveryThreshold,
                amountNeededForFreeDelivery: Math.max(0, freeDeliveryThreshold - subtotal),
                tax,
                total
              });
            }

            // Secure Admin Provisioning Endpoint
            if (url.pathname === '/api/admin/provision' && req.method === 'POST') {
              const body = await readJsonBody();
              const { email, password } = body;
              const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'admin@dewandgo.com').toLowerCase().trim();

              if (!email || email.toLowerCase().trim() !== configuredAdminEmail) {
                return sendJson(403, { error: 'Forbidden: Email does not match configured administrator identity.' });
              }

              if (!password || password.length < 8) {
                return sendJson(400, { error: 'Password must be at least 8 characters long.' });
              }

              const salt = crypto.randomBytes(16).toString('hex');
              const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');

              return sendJson(200, {
                success: true,
                email: configuredAdminEmail,
                role: 'super_admin',
                passwordHash,
                salt,
                message: 'Administrator provisioned successfully.'
              });
            }

            return sendJson(404, { error: 'API route not found' });
          } catch (err: any) {
            console.error('Server middleware error:', err);
            return sendJson(500, { error: 'Internal server error', message: err.message });
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
