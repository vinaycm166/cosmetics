import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  HelpCircle, 
  Send 
} from 'lucide-react';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <div className="text-center space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
        Our Story
      </span>
      <h1 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal-900 tracking-tight">
        Beauty Essentials, Delivered Without the Wait.
      </h1>
      <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
        Dew & Go was founded on a simple conviction: you should never have to compromise your daily skincare routine or wait days for essentials when life gets busy.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-2 text-center">
        <div className="w-10 h-10 rounded-full bg-mint-50 border border-mint-200 text-mint-500 flex items-center justify-center mx-auto">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="font-heading font-bold text-sm text-charcoal-900">Hyperlocal Speed</h3>
        <p className="text-xs text-muted leading-relaxed">
          Strategically located city micro-fulfillment hubs deliver verified beauty products within 15 minutes.
        </p>
      </div>

      <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-2 text-center">
        <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-heading font-bold text-sm text-charcoal-900">100% Authentic</h3>
        <p className="text-xs text-muted leading-relaxed">
          Direct partnerships with leading botanical and clinical cosmetic brands with full traceability.
        </p>
      </div>

      <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-2 text-center">
        <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 text-charcoal-900 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="font-heading font-bold text-sm text-charcoal-900">Temperature Controlled</h3>
        <p className="text-xs text-muted leading-relaxed">
          Sensitive active ingredients (Vitamin C, Retinoids, Peptides) are stored in climate-controlled micro-zones.
        </p>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal-900">Contact Dew & Go Support</h1>
        <p className="text-xs text-muted">Our beauty care squad is available daily from 7:00 AM to 11:30 PM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-4">
          <h3 className="font-heading font-bold text-sm text-charcoal-900 border-b border-neutral-100 pb-2">Direct Inquiries</h3>
          <div className="space-y-3 text-xs text-muted">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-500 shrink-0" />
              <span>care@dewandgo.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-mint-500 shrink-0" />
              <span>+91 80000 12345 (Toll-Free)</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-charcoal-900 shrink-0" />
              <span>Indiranagar Central Fulfillment Center, Bengaluru, Karnataka 560038</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-4">
          <h3 className="font-heading font-bold text-sm text-charcoal-900 border-b border-neutral-100 pb-2">Send Support Message</h3>
          {sent ? (
            <div className="p-4 rounded-md bg-mint-50 border border-mint-200 text-mint-500 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ticket received! Our care team will respond within 30 minutes.</span>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal-900 mb-1">Your Name</label>
                <input required type="text" className="w-full px-3 py-2 rounded-md border border-neutral-border bg-white" placeholder="Ananya Sharma" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal-900 mb-1">Email or Phone</label>
                <input required type="text" className="w-full px-3 py-2 rounded-md border border-neutral-border bg-white" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal-900 mb-1">Message</label>
                <textarea required rows={3} className="w-full px-3 py-2 rounded-md border border-neutral-border bg-white" placeholder="How can we assist with your delivery or order?" />
              </div>
              <button type="submit" className="w-full dew-btn-primary text-xs font-bold !py-2.5 flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    { q: "How does 15-minute delivery work?", a: "We maintain temperature-controlled dark-store hubs within city clusters. When you order, items are picked and packed within 3 minutes and dispatched immediately with dedicated couriers." },
    { q: "Are all cosmetic products authentic?", a: "Yes, 100%. All inventory is procured directly from brands or authorized national distributors with tamper-evident seals and traceable lot numbers." },
    { q: "What is the return policy?", a: "Due to cosmetic hygiene standards, products with opened safety seals cannot be returned. If an item arrives damaged or incorrect, submit a photo claim via Orders within 24 hours for instant refund." },
    { q: "How are sensitive active ingredients handled?", a: "Vitamin C, retinol, and live probiotics are stored in cold-chain micro-refrigerators and transported in insulated thermal bags." }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal-900">Frequently Asked Questions</h1>
        <p className="text-xs text-muted">Answers regarding express dispatch, authentication, and order handling.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-5 rounded-md border border-neutral-border bg-white shadow-card space-y-1.5">
            <h3 className="font-heading font-bold text-xs text-charcoal-900">{faq.q}</h3>
            <p className="text-xs text-muted leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PolicyPage: React.FC<{ title: string; content: string[] }> = ({ title, content }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
    <div className="border-b border-neutral-border pb-4">
      <h1 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal-900">{title}</h1>
      <p className="text-xs text-muted mt-1">Official terms of service and operational commitments</p>
    </div>

    <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-4 text-xs text-muted leading-relaxed">
      {content.map((paragraph, idx) => (
        <p key={idx}>{paragraph}</p>
      ))}
    </div>
  </div>
);
