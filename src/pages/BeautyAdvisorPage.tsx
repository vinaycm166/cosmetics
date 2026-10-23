import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldAlert, RotateCcw } from 'lucide-react';
import { store } from '../lib/store';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';

interface BeautyAdvisorPageProps {
  onNavigate: (route: string) => void;
}

export const BeautyAdvisorPage: React.FC<BeautyAdvisorPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState<string>('Combination');
  const [primaryConcern, setPrimaryConcern] = useState<string>('Enlarged Pores');
  const [productFocus, setProductFocus] = useState<string>('Serums');
  const [recommendations, setRecommendations] = useState<Product[] | null>(null);

  const handleGenerateRoutine = () => {
    const all = store.getProducts();

    // Match products based on real database attributes
    let matches = all.filter(p => {
      let score = 0;
      if (p.skinType?.some(t => t.toLowerCase() === skinType.toLowerCase() || t === 'All Skin Types')) score += 2;
      if (p.skinConcern?.some(c => c.toLowerCase().includes(primaryConcern.toLowerCase()))) score += 3;
      if (p.category.toLowerCase() === productFocus.toLowerCase()) score += 2;
      return score > 0;
    });

    if (matches.length === 0) {
      matches = all.slice(0, 3);
    }

    setRecommendations(matches.slice(0, 3));
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setRecommendations(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Advisor Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
          Formulation Routine Consultant
        </span>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal-900 tracking-tight">
          Skincare & Formulation Advisor
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Targeted recommendations matched against active ingredients, skin types, and routine goals.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-md bg-[#FAF7F4] border border-neutral-border text-muted text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 text-charcoal-900 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-charcoal-900 font-semibold">Formulation Guidance:</strong> Recommendations are matched directly against product ingredients and skin compatibility attributes from our cosmetic database.
        </p>
      </div>

      {/* Interactive Questionnaire */}
      {step < 4 ? (
        <div className="p-6 sm:p-8 rounded-md border border-neutral-border bg-white shadow-card space-y-6">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-semibold text-muted border-b border-neutral-100 pb-3">
            <span>Step {step} of 3</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-8 h-1.5 rounded-full transition-colors ${
                    s <= step ? 'bg-brand-500' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question 1: Skin Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-charcoal-900">
                1. What best describes your skin type?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Oily', 'Combination', 'Dry', 'Sensitive', 'Normal', 'Acne-prone'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSkinType(t)}
                    className={`p-3.5 rounded-md border text-left text-xs transition-colors ${
                      skinType === t
                        ? 'border-brand-500 bg-brand-50/30 text-brand-700 font-bold ring-1 ring-brand-500'
                        : 'border-neutral-border hover:border-neutral-300 text-charcoal-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="dew-btn-primary text-xs !px-5 !py-2 font-semibold flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Question 2: Primary Concern */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-charcoal-900">
                2. What is your primary skin concern?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Enlarged Pores', 'Sun Protection', 'Dullness & Glow', 'Skin Barrier Repair', 'Dryness & Dehydration', 'Uneven Texture'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPrimaryConcern(c)}
                    className={`p-3.5 rounded-md border text-left text-xs transition-colors ${
                      primaryConcern === c
                        ? 'border-brand-500 bg-brand-50/30 text-brand-700 font-bold ring-1 ring-brand-500'
                        : 'border-neutral-border hover:border-neutral-300 text-charcoal-900'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="dew-btn-secondary text-xs !px-4 !py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="dew-btn-primary text-xs !px-5 !py-2 font-semibold flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Question 3: Focus */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-charcoal-900">
                3. What format are you looking for?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Serums', 'Sunscreen', 'Skincare', 'Lip Care', 'Haircare', 'Body Care'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setProductFocus(f)}
                    className={`p-3.5 rounded-md border text-left text-xs transition-colors ${
                      productFocus === f
                        ? 'border-brand-500 bg-brand-50/30 text-brand-700 font-bold ring-1 ring-brand-500'
                        : 'border-neutral-border hover:border-neutral-300 text-charcoal-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="dew-btn-secondary text-xs !px-4 !py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRoutine}
                  className="dew-btn-primary text-xs !px-5 !py-2 font-semibold"
                >
                  Generate Recommendations
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-muted uppercase block">
                Target Profile: {skinType} Skin • {primaryConcern} • {productFocus}
              </span>
              <h2 className="font-heading font-bold text-xl text-charcoal-900 mt-1">
                Your Customized Routine
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="dew-btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5 self-start sm:self-auto font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendations?.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
