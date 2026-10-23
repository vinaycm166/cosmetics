import { Category, Product, DeliveryZone, Coupon, DeliveryPartner, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-skincare',
    name: 'Skincare',
    slug: 'skincare',
    description: 'Nourishing cleansers, targeted treatments, and barrier-repair creams for radiant skin.',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    isActive: true,
    productCount: 14
  },
  {
    id: 'cat-makeup',
    name: 'Makeup',
    slug: 'makeup',
    description: 'Effortless complexion tints, dewy liquid blushes, and peptide lip formulas.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    isActive: true,
    productCount: 10
  },
  {
    id: 'cat-sunscreen',
    name: 'Sunscreen',
    slug: 'sunscreen',
    description: 'Weightless SPF 50+ PA++++ light fluid gels with zero white cast.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    displayOrder: 3,
    isActive: true,
    productCount: 8
  },
  {
    id: 'cat-serums',
    name: 'Serums',
    slug: 'serums',
    description: 'Potent active formulations featuring Niacinamide, Vitamin C, and Hyaluronic Acid.',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    displayOrder: 4,
    isActive: true,
    productCount: 9
  },
  {
    id: 'cat-lip-care',
    name: 'Lip Care',
    slug: 'lip-care',
    description: 'Peptide glaze treatments, overnight lip butter masks, and tinted lip oils.',
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    displayOrder: 5,
    isActive: true,
    productCount: 7
  },
  {
    id: 'cat-haircare',
    name: 'Haircare',
    slug: 'haircare',
    description: 'Rosemary scalp stimulating oils, bond-repair treatments, and clarifying washes.',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    displayOrder: 6,
    isActive: true,
    productCount: 6
  },
  {
    id: 'cat-body-care',
    name: 'Body Care',
    slug: 'body-care',
    description: 'AHA smoothing body lotions, whipped shea butters, and invigorating scrubs.',
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
    displayOrder: 7,
    isActive: true,
    productCount: 6
  },
  {
    id: 'cat-fragrance',
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'Artisanal Eau de Parfums blending Mediterranean Neroli, Bergamot, and Solar Amber.',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    displayOrder: 8,
    isActive: true,
    productCount: 5
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Dew Glow Niacinamide 10% + Zinc 1% Clarifying Serum',
    slug: 'dew-glow-niacinamide-serum',
    brand: 'Dew & Go Skincare',
    brandId: 'brand-dew',
    category: 'Serums',
    categoryId: 'cat-serums',
    shortDescription: 'High-strength vitamin and mineral blemish formula with Zinc PCA for refined texture.',
    description: 'An ultra-lightweight, fast-absorbing daily serum that visibly diminishes enlarged pores, calms redness, and balances excessive sebum production. Formulated with 10% pure Niacinamide and 1% Zinc PCA in a soothing hyaluronic acid base.',
    benefits: [
      'Visibly tightens enlarged pores within 14 days',
      'Controls excess sebum and prevents midday shine',
      'Fades post-acne dark marks and uneven tone',
      'Non-sticky satin finish suitable under daily makeup'
    ],
    ingredients: 'Aqua (Water), Niacinamide (10%), Zinc PCA (1%), Pentylene Glycol, Sodium Hyaluronate, Tamarindus Indica Seed Gum, Xanthan Gum, Phenoxyethanol, Chlorphenesin.',
    howToUse: 'Apply 3-4 drops morning and evening to cleansed face before heavier creams. Follow with sunscreen in the AM.',
    safetyInformation: 'For external use only. Patch test recommended. Discontinue if persistent irritation occurs.',
    skinType: ['Oily', 'Combination', 'Normal', 'Acne-prone'],
    skinConcern: ['Enlarged Pores', 'Uneven Texture', 'Excess Sebum', 'Acne Marks'],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597358-1f547c11f62c?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-001-30ml',
        productId: 'prod-001',
        variantName: '30 ml Bottle',
        sku: 'DWG-SRM-NIA-30',
        price: 549,
        originalPrice: 699,
        discountPercentage: 21,
        stockQuantity: 45,
        reservedQuantity: 2,
        isDefault: true,
        isActive: true
      },
      {
        id: 'var-001-60ml',
        productId: 'prod-001',
        variantName: '60 ml Value Size',
        sku: 'DWG-SRM-NIA-60',
        price: 899,
        originalPrice: 1199,
        discountPercentage: 25,
        stockQuantity: 28,
        reservedQuantity: 0,
        isDefault: false,
        isActive: true
      }
    ],
    defaultPrice: 549,
    defaultOriginalPrice: 699,
    defaultDiscount: 21,
    rating: 4.8,
    reviewCount: 342,
    isFeatured: true,
    isTrending: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'prod-002',
    name: 'Cloud Barrier Ceramide + Peptide Recovery Cream',
    slug: 'cloud-barrier-ceramide-cream',
    brand: 'Dew & Go Skincare',
    brandId: 'brand-dew',
    category: 'Skincare',
    categoryId: 'cat-skincare',
    shortDescription: 'Cushiony barrier-repair moisturizer with 5 essential ceramides and multi-peptides.',
    description: 'A velvet-touch recovery cream engineered to restore compromised skin barriers. Formulated with a biomimetic complex of 5 Ceramides (EOP, NS, NP, AS, AP), Oat Beta-Glucan, and soothing Centella Asiatica.',
    benefits: [
      'Clinically boosts moisture retention for up to 72 hours',
      'Repairs compromised barrier from exfoliation or weather',
      'Sinks in instantly without greasy residue',
      'Zero synthetic fragrance, essential oils, or clogging waxes'
    ],
    ingredients: 'Water, Caprylic/Capric Triglyceride, Glycerin, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Oat Beta-Glucan, Centella Asiatica Extract, Sodium Hyaluronate.',
    howToUse: 'Smooth a dime-sized amount over face and neck as the final step in your routine, morning and evening.',
    safetyInformation: 'Dermatologist tested on sensitive skin. Non-comedogenic.',
    skinType: ['Dry', 'Normal', 'Sensitive', 'Dehydrated'],
    skinConcern: ['Barrier Damage', 'Dryness', 'Flakiness', 'Redness'],
    images: [
      'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-002-50g',
        productId: 'prod-002',
        variantName: '50 g Glass Jar',
        sku: 'DWG-CRM-CER-50',
        price: 649,
        originalPrice: 799,
        discountPercentage: 19,
        stockQuantity: 36,
        reservedQuantity: 1,
        isDefault: true,
        isActive: true
      },
      {
        id: 'var-002-100g',
        productId: 'prod-002',
        variantName: '100 g Value Jar',
        sku: 'DWG-CRM-CER-100',
        price: 1099,
        originalPrice: 1399,
        discountPercentage: 21,
        stockQuantity: 15,
        reservedQuantity: 0,
        isDefault: false,
        isActive: true
      }
    ],
    defaultPrice: 649,
    defaultOriginalPrice: 799,
    defaultDiscount: 19,
    rating: 4.9,
    reviewCount: 284,
    isFeatured: true,
    isTrending: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'prod-003',
    name: 'Invisible Water Gel Sunscreen SPF 50+ PA++++',
    slug: 'invisible-water-gel-sunscreen-spf50',
    brand: 'Sol Shield Lab',
    brandId: 'brand-sol',
    category: 'Sunscreen',
    categoryId: 'cat-sunscreen',
    shortDescription: 'Ultra-light water gel with zero white cast, broad spectrum UV filters, and Vitamin E.',
    description: 'A revolutionary aqueous UV protector that feels like a splash of fresh water. Formulated with new-generation photostable filters (Tinosorb S, Uvinul A Plus) and Cica water to guard against UVA, UVB, and digital blue light.',
    benefits: [
      'SPF 50+ PA++++ certified broad spectrum defense',
      '100% invisible on all Indian skin tones with 0% white cast',
      'Dewy, non-greasy satin finish that does not sting eyes',
      'Sweat and humidity resistant for up to 80 minutes'
    ],
    ingredients: 'Water, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (Tinosorb S), Diethylamino Hydroxybenzoyl Hexyl Benzoate, Centella Asiatica Leaf Extract, Niacinamide, Tocopherol.',
    howToUse: 'Apply 2 finger lengths evenly over face and neck 15 minutes before sun exposure. Reapply every 2-3 hours.',
    safetyInformation: 'Ophthalmologically tested. Safe for sensitive skin.',
    skinType: ['All Skin Types', 'Oily', 'Combination'],
    skinConcern: ['Sun Protection', 'Tanning', 'Hyperpigmentation', 'Photoaging'],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-003-50ml',
        productId: 'prod-003',
        variantName: '50 ml Tube',
        sku: 'SOL-SUN-GEL-50',
        price: 499,
        originalPrice: 599,
        discountPercentage: 17,
        stockQuantity: 55,
        reservedQuantity: 3,
        isDefault: true,
        isActive: true
      }
    ],
    defaultPrice: 499,
    defaultOriginalPrice: 599,
    defaultDiscount: 17,
    rating: 4.9,
    reviewCount: 512,
    isFeatured: true,
    isTrending: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'prod-004',
    name: 'Glaze Peptide Hydrating Lip Tint Oil',
    slug: 'glaze-peptide-hydrating-lip-tint-oil',
    brand: 'Rose Petal Beauty',
    brandId: 'brand-rose',
    category: 'Lip Care',
    categoryId: 'cat-lip-care',
    shortDescription: 'Cushioning peptide lip oil offering glassy shine, sheer wash of rose color, and hydration.',
    description: 'An addictive hybrid of a nourishing lip mask and a mirror-shine gloss. Powered by Palmitoyl Tripeptide-1, Shea Butter unsaponifiables, and Jojoba Oil to visibly plump and cushion dry lips.',
    benefits: [
      'Plumps fine lip lines and prevents flaking',
      'Non-sticky glass gloss with high-comfort slip',
      'Subtle juicy tint tailored for warm undertones',
      'Large doe-foot applicator for one-swipe glaze'
    ],
    ingredients: 'Polybutene, Hydrogenated Polyisobutene, Simmondsia Chinensis (Jojoba) Seed Oil, Palmitoyl Tripeptide-1, Butyrospermum Parkii (Shea) Butter, Tocopheryl Acetate, CI 77491.',
    howToUse: 'Glide generously over bare lips or layer over lip liner for an editorial glazed pout.',
    safetyInformation: 'Store in a cool place away from direct sunlight.',
    skinType: ['All Skin Types'],
    skinConcern: ['Chapped Lips', 'Dryness', 'Fine Lines'],
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-004-blush',
        productId: 'prod-004',
        variantName: 'Petal Dew (Soft Rose)',
        sku: 'RPB-LIP-GLZ-01',
        price: 399,
        originalPrice: 499,
        discountPercentage: 20,
        stockQuantity: 40,
        reservedQuantity: 2,
        isDefault: true,
        isActive: true
      },
      {
        id: 'var-004-berry',
        productId: 'prod-004',
        variantName: 'Berry Glaze (Muted Wine)',
        sku: 'RPB-LIP-GLZ-02',
        price: 399,
        originalPrice: 499,
        discountPercentage: 20,
        stockQuantity: 32,
        reservedQuantity: 0,
        isDefault: false,
        isActive: true
      }
    ],
    defaultPrice: 399,
    defaultOriginalPrice: 499,
    defaultDiscount: 20,
    rating: 4.8,
    reviewCount: 198,
    isFeatured: true,
    isTrending: true,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'prod-005',
    name: 'Gentle Melt Oat & Green Tea Cleansing Balm',
    slug: 'gentle-melt-oat-green-tea-cleansing-balm',
    brand: 'Dew & Go Skincare',
    brandId: 'brand-dew',
    category: 'Skincare',
    categoryId: 'cat-skincare',
    shortDescription: 'Sorbet-soft balm that melts stubborn waterproof makeup and SPF effortlessly without clouding eyes.',
    description: 'Transformative oil-balm that melts on contact from a lush sorbet to a silky oil, then rinses into a milky emulsion. Enriched with Colloidal Oatmeal, Camellia Sinensis (Green Tea) Leaf Oil, and Vitamin E.',
    benefits: [
      'Dissolves waterproof mascara and long-wear foundation in seconds',
      'Leaves zero residue or filmy residue on skin or eyes',
      'Colloidal oat calms redness while cleansing',
      'Free of PEG, mineral oils, and synthetic fragrance'
    ],
    ingredients: 'Cetyl Ethylhexanoate, Caprylic/Capric Triglyceride, PEG-20 Glyceryl Triisostearate, Synthetic Wax, Avena Sativa (Oat) Kernel Flour, Camellia Sinensis Leaf Extract, Tocopherol.',
    howToUse: 'Scoop a dime-sized amount with spatula onto dry skin. Massage gently in circular motions, then splash with lukewarm water to emulsify and rinse.',
    safetyInformation: 'Keep water out of jar. Safe for contact lens wearers.',
    skinType: ['All Skin Types', 'Sensitive', 'Dry'],
    skinConcern: ['Makeup Removal', 'Clogged Pores', 'Redness'],
    images: [
      'https://images.unsplash.com/photo-1556228724-4da0d3b66804?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-005-100g',
        productId: 'prod-005',
        variantName: '100 g Jar + Spatula',
        sku: 'DWG-CLN-BLM-100',
        price: 599,
        originalPrice: 750,
        discountPercentage: 20,
        stockQuantity: 30,
        reservedQuantity: 1,
        isDefault: true,
        isActive: true
      }
    ],
    defaultPrice: 599,
    defaultOriginalPrice: 750,
    defaultDiscount: 20,
    rating: 4.9,
    reviewCount: 165,
    isFeatured: false,
    isTrending: false,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod-006',
    name: 'Dew Drop Seamless Liquid Blush',
    slug: 'dew-drop-seamless-liquid-blush',
    brand: 'Rose Petal Beauty',
    brandId: 'brand-rose',
    category: 'Makeup',
    categoryId: 'cat-makeup',
    shortDescription: 'Weightless serum-infused liquid blush that melts into cheekbones for a natural flush.',
    description: 'A buildable liquid cheek color that mimics the natural flush of healthy skin. Infused with Hyaluronic Acid and Mulberry Extract to keep cheeks hydrated while delivering 12-hour fade-resistant tint.',
    benefits: [
      'Second-skin natural finish with zero cakeyness',
      'Effortlessly blendable with fingertips, sponge, or brush',
      'Long-wearing pigment that stays fresh all day',
      'Skin-loving botanical actives for plump cheeks'
    ],
    ingredients: 'Isododecane, Dimethicone, Polyglyceryl-2 Triisostearate, Silica, Morus Alba (Mulberry) Root Extract, Sodium Hyaluronate, Iron Oxides (CI 77491, CI 77492, CI 77499).',
    howToUse: 'Dab 1-2 dots onto cheekbones. Tap quickly with fingers or a damp sponge upward toward temples.',
    safetyInformation: 'Non-comedogenic. Shake well before each use.',
    skinType: ['All Skin Types'],
    skinConcern: ['Dull Skin', 'Natural Makeup'],
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-006-peach',
        productId: 'prod-006',
        variantName: 'Warm Nectar (Peach)',
        sku: 'RPB-BLS-LIQ-01',
        price: 449,
        originalPrice: 549,
        discountPercentage: 18,
        stockQuantity: 25,
        reservedQuantity: 0,
        isDefault: true,
        isActive: true
      },
      {
        id: 'var-006-rose',
        productId: 'prod-006',
        variantName: 'Rose Quartz (Soft Pink)',
        sku: 'RPB-BLS-LIQ-02',
        price: 449,
        originalPrice: 549,
        discountPercentage: 18,
        stockQuantity: 30,
        reservedQuantity: 1,
        isDefault: false,
        isActive: true
      }
    ],
    defaultPrice: 449,
    defaultOriginalPrice: 549,
    defaultDiscount: 18,
    rating: 4.8,
    reviewCount: 220,
    isFeatured: true,
    isTrending: true,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-03-05T10:00:00Z'
  },
  {
    id: 'prod-007',
    name: 'Rosemary & Biotin Scalp Stimulating Density Oil',
    slug: 'rosemary-biotin-density-scalp-oil',
    brand: 'Botanica Roots',
    brandId: 'brand-botanica',
    category: 'Haircare',
    categoryId: 'cat-haircare',
    shortDescription: 'Pure steam-distilled Rosemary leaf extract with Biotin and cold-pressed Castor Oil.',
    description: 'A nutrient-dense botanical elixir crafted to invigorate hair follicles, strengthen weak roots, and soothe dry scalp discomfort. Non-greasy lightweight oil blend.',
    benefits: [
      'Supports healthy hair cycle and reduced shedding',
      'Clinically proven botanical alternative to harsh treatments',
      'Soothes itchy scalp and flakiness',
      'Leaves hair glossy without weigh-down'
    ],
    ingredients: 'Rosmarinus Officinalis (Rosemary) Leaf Oil, Ricinus Communis (Castor) Seed Oil, Biotin, Simmondsia Chinensis (Jojoba) Oil, Tocopherol, Mentha Piperita (Peppermint) Oil.',
    howToUse: 'Part hair into sections and massage 1-2 pipettes directly into scalp. Leave on for at least 1 hour or overnight before washing.',
    safetyInformation: 'Contains pure essential oils. Perform patch test behind ear.',
    skinType: ['All Hair Types'],
    skinConcern: ['Hair Thinning', 'Scalp Care', 'Breakage'],
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-007-50ml',
        productId: 'prod-007',
        variantName: '50 ml Glass Dropper',
        sku: 'BOT-HAR-OIL-50',
        price: 499,
        originalPrice: 650,
        discountPercentage: 23,
        stockQuantity: 42,
        reservedQuantity: 0,
        isDefault: true,
        isActive: true
      }
    ],
    defaultPrice: 499,
    defaultOriginalPrice: 650,
    defaultDiscount: 23,
    rating: 4.8,
    reviewCount: 140,
    isFeatured: false,
    isTrending: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-02-12T10:00:00Z'
  },
  {
    id: 'prod-008',
    name: 'Santorini Sunset Eau de Parfum',
    slug: 'santorini-sunset-eau-de-parfum',
    brand: 'Atelier Dew',
    brandId: 'brand-atelier',
    category: 'Fragrance',
    categoryId: 'cat-fragrance',
    shortDescription: 'Luminous solar floral with Mediterranean Neroli, creamy Coconut Milk, and Amber.',
    description: 'An evocative olfactory journey to sun-drenched Greek terraces. Opens with sparkling Italian Bergamot and Orange Blossom, melting into warm Coconut Nectar and anchored by Golden Amber.',
    benefits: [
      'Eau de Parfum concentration with 18% fragrance oil',
      'Long-lasting sillage lasting 8+ hours on skin and clothes',
      'Hypoallergenic denatured sugarcane alcohol base',
      'Cruelty-free, IFRA certified fine fragrance formulation'
    ],
    ingredients: 'Alcohol Denat., Fragrance (Parfum), Aqua/Water, Benzyl Salicylate, Limonene, Linalool, Hydroxycitronellal, Geraniol.',
    howToUse: 'Mist directly over pulse points: wrists, inner elbows, base of throat, and behind ears.',
    safetyInformation: 'Flammable. Keep away from heat and open flame.',
    skinType: ['All Skin Types'],
    skinConcern: ['Fine Fragrance', 'Long Lasting'],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-008-50ml',
        productId: 'prod-008',
        variantName: '50 ml Glass Spray',
        sku: 'ATL-FRG-SAN-50',
        price: 1299,
        originalPrice: 1599,
        discountPercentage: 19,
        stockQuantity: 18,
        reservedQuantity: 0,
        isDefault: true,
        isActive: true
      },
      {
        id: 'var-008-10ml',
        productId: 'prod-008',
        variantName: '10 ml Travel Atomizer',
        sku: 'ATL-FRG-SAN-10',
        price: 499,
        originalPrice: 599,
        discountPercentage: 17,
        stockQuantity: 35,
        reservedQuantity: 1,
        isDefault: false,
        isActive: true
      }
    ],
    defaultPrice: 1299,
    defaultOriginalPrice: 1599,
    defaultDiscount: 19,
    rating: 4.9,
    reviewCount: 94,
    isFeatured: true,
    isTrending: false,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'prod-009',
    name: 'Silk Lash Definition & Length Peptide Mascara',
    slug: 'silk-lash-definition-peptide-mascara',
    brand: 'Rose Petal Beauty',
    brandId: 'brand-rose',
    category: 'Makeup',
    categoryId: 'cat-makeup',
    shortDescription: 'Clean smudge-proof tubing mascara infused with Biotinoyl Tripeptide for fluttery lashes.',
    description: 'A breakthrough tubing mascara that coats every lash in weightless, smudge-proof micro-tubes. Rinses effortlessly with warm water without tugging or raccoon eyes.',
    benefits: [
      'Zero flaking or under-eye smudging for 16 hours',
      'Conditions lashes with Biotinoyl Tripeptide-1',
      'Ultra-precise custom tapered silicone wand',
      'Gentle warm-water tube removal without eye makeup remover'
    ],
    ingredients: 'Aqua, Acrylates Copolymer, Iron Oxides (CI 77499), Cera Alba, Copernicia Cerifera Cera, Biotinoyl Tripeptide-1, Panthenol, Glycerin.',
    howToUse: 'Wiggle brush from base to lash tips in gentle upward strokes. Build while wet for dramatic volume.',
    safetyInformation: 'Ophthalmologist tested. Safe for sensitive eyes and contact lens wearers.',
    skinType: ['All Skin Types'],
    skinConcern: ['Smudge-Proof', 'Sensitive Eyes'],
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-009-black',
        productId: 'prod-009',
        variantName: 'Deep Onyx Black (8 ml)',
        sku: 'RPB-MSC-SLK-01',
        price: 499,
        originalPrice: 650,
        discountPercentage: 23,
        stockQuantity: 38,
        reservedQuantity: 0,
        isDefault: true,
        isActive: true
      }
    ],
    defaultPrice: 499,
    defaultOriginalPrice: 650,
    defaultDiscount: 23,
    rating: 4.8,
    reviewCount: 112,
    isFeatured: false,
    isTrending: true,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    createdAt: '2026-03-12T10:00:00Z'
  },
  {
    id: 'prod-010',
    name: 'AHA 10% Smoothing & Resurfacing Body Lotion',
    slug: 'aha-smoothing-resurfacing-body-lotion',
    brand: 'Dew & Go Skincare',
    brandId: 'brand-dew',
    category: 'Body Care',
    categoryId: 'cat-body-care',
    shortDescription: 'Gentle Lactic & Glycolic acid body treatment for strawberry legs and keratosis pilaris.',
    description: 'An exfoliating body moisturizer that gently buffs away dry bumps and roughness while replenishing hydration with Shea Butter and Squalane.',
    benefits: [
      'Visibly smoothens rough texture and keratosis pilaris',
      'Brightens uneven skin tone and post-sun discoloration',
      'Fast-absorbing velvet finish with zero stickiness',
      'Formulated at optimal pH 3.8 for maximum gentle exfoliation'
    ],
    ingredients: 'Aqua, Lactic Acid (7%), Glycolic Acid (3%), Butyrospermum Parkii (Shea) Butter, Squalane, Glycerin, Sodium Hydroxide, Ceramide NP.',
    howToUse: 'Apply once daily over body, focusing on arms, elbows, knees, and legs. Follow with sunscreen on exposed areas.',
    safetyInformation: 'Contains Alpha Hydroxy Acids. Use sunscreen and limit sun exposure while using.',
    skinType: ['All Body Types', 'Dry', 'Rough Texture'],
    skinConcern: ['Strawberry Legs', 'Keratosis Pilaris', 'Dryness'],
    images: [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      {
        id: 'var-010-200ml',
        productId: 'prod-010',
        variantName: '200 ml Pump Bottle',
        sku: 'DWG-BDY-AHA-200',
        price: 699,
        originalPrice: 899,
        discountPercentage: 22,
        stockQuantity: 24,
        reservedQuantity: 0,
        isDefault: true,
        isActive: true
      }
    ],
    defaultPrice: 699,
    defaultOriginalPrice: 899,
    defaultDiscount: 22,
    rating: 4.9,
    reviewCount: 88,
    isFeatured: false,
    isTrending: false,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    createdAt: '2026-02-18T10:00:00Z'
  }
];

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-mysuru-gokulam',
    zoneName: 'Gokulam Express Hub (Mysuru)',
    supportedPincodes: ['570002'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 15,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:00:00',
    isActive: true
  },
  {
    id: 'zone-mysuru-jayalakshmipuram',
    zoneName: 'Jayalakshmipuram & Saraswathipuram Hub (Mysuru)',
    supportedPincodes: ['570012', '570009'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 20,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:00:00',
    isActive: true
  },
  {
    id: 'zone-mysuru-vijayanagar',
    zoneName: 'Vijayanagar Express Hub (Mysuru)',
    supportedPincodes: ['570017'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 25,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:00:00',
    isActive: true
  },
  {
    id: 'zone-blr-central',
    zoneName: 'Central Bengaluru & CBD (Express)',
    supportedPincodes: ['560001', '560002', '560025'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 12,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:30:00',
    isActive: true
  },
  {
    id: 'zone-blr-south',
    zoneName: 'Koramangala & HSR Hyperlocal Hub',
    supportedPincodes: ['560034', '560095'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 15,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:30:00',
    isActive: true
  },
  {
    id: 'zone-blr-east',
    zoneName: 'Indiranagar & Domlur Express Hub',
    supportedPincodes: ['560038', '560008'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 14,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:30:00',
    isActive: true
  },
  {
    id: 'zone-delhi-central',
    zoneName: 'Central Delhi Connaught Place Hub',
    supportedPincodes: ['110001', '110002'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 15,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:00:00',
    isActive: true
  },
  {
    id: 'zone-mumbai-south',
    zoneName: 'South Mumbai & Fort Express',
    supportedPincodes: ['400001', '400005'],
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minOrderValue: 99,
    prepTimeMinutes: 5,
    estimatedDeliveryMinutes: 15,
    operatingHoursStart: '07:00:00',
    operatingHoursEnd: '23:00:00',
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'DEWGLOW20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 399,
    maxDiscountValue: 200,
    description: 'Get 20% off on orders above ₹399 (Max ₹200)',
    isActive: true
  },
  {
    code: 'FIRSTDEW',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 299,
    description: 'Flat ₹100 off on your first beauty order',
    isActive: true
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 49,
    minOrderValue: 199,
    description: 'Free express 15-minute delivery on orders above ₹199',
    isActive: true
  }
];

export const INITIAL_DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: 'partner-blr-01',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.delivery@dewandgo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    vehicleType: 'electric_scooter',
    vehicleNumber: 'KA 01 EQ 4421',
    rating: 4.9,
    totalDeliveries: 428,
    isOnline: true,
    isActive: true,
    currentStatus: 'busy',
    maxActiveOrders: 2,
    joinedAt: '2025-08-15T09:00:00Z',
    currentLocation: {
      latitude: 12.9734,
      longitude: 77.6405,
      accuracy: 5,
      heading: 52,
      speed: 21,
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'partner-blr-02',
    name: 'Arun Verma',
    phone: '+91 98450 12345',
    email: 'arun.delivery@dewandgo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    vehicleType: 'bike',
    vehicleNumber: 'KA 03 HP 8892',
    rating: 4.8,
    totalDeliveries: 312,
    isOnline: true,
    isActive: true,
    currentStatus: 'available',
    maxActiveOrders: 2,
    joinedAt: '2025-10-10T11:00:00Z',
    currentLocation: {
      latitude: 12.9719,
      longitude: 77.6412,
      accuracy: 4,
      heading: 0,
      speed: 0,
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'partner-blr-03',
    name: 'Priya Sundaram',
    phone: '+91 99001 54321',
    email: 'priya.delivery@dewandgo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    vehicleType: 'electric_scooter',
    vehicleNumber: 'KA 05 EV 9012',
    rating: 5.0,
    totalDeliveries: 285,
    isOnline: true,
    isActive: true,
    currentStatus: 'available',
    maxActiveOrders: 2,
    joinedAt: '2025-11-01T08:30:00Z',
    currentLocation: {
      latitude: 12.9345,
      longitude: 77.6265,
      accuracy: 6,
      heading: 180,
      speed: 0,
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'partner-blr-04',
    name: 'Mohammed Faizal',
    phone: '+91 97412 87654',
    email: 'faizal.delivery@dewandgo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    vehicleType: 'bike',
    vehicleNumber: 'KA 04 MX 3319',
    rating: 4.7,
    totalDeliveries: 194,
    isOnline: false,
    isActive: true,
    currentStatus: 'offline',
    maxActiveOrders: 2,
    joinedAt: '2025-12-14T14:15:00Z',
    currentLocation: {
      latitude: 12.9756,
      longitude: 77.6067,
      accuracy: 10,
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'partner-blr-05',
    name: 'Kavita Reddy',
    phone: '+91 98860 99887',
    email: 'kavita.delivery@dewandgo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    vehicleType: 'electric_scooter',
    vehicleNumber: 'KA 01 TR 1109',
    rating: 4.6,
    totalDeliveries: 42,
    isOnline: false,
    isActive: false, // Suspended / Inactive account
    currentStatus: 'offline',
    maxActiveOrders: 2,
    joinedAt: '2026-01-20T10:00:00Z',
    currentLocation: {
      latitude: 12.9719,
      longitude: 77.6412,
      accuracy: 15,
      updatedAt: new Date().toISOString()
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-live-01',
    orderNumber: 'DWG-88210',
    userId: 'user-vinay',
    customerName: 'Vinay Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'vinay@example.com',
    status: 'out_for_delivery',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    subtotal: 1098,
    discountAmount: 200,
    couponCode: 'DEWGLOW20',
    deliveryFee: 0,
    taxAmount: 45,
    totalAmount: 943,
    shippingAddress: {
      id: 'addr-01',
      userId: 'user-vinay',
      recipientName: 'Vinay Sharma',
      phoneNumber: '+91 98765 43210',
      addressLine: 'Flat 402, Lotus Orchid, 12th Main Road',
      apartmentBuilding: 'HAL 2nd Stage',
      landmark: 'Near Corner House Ice Cream',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      deliveryInstructions: 'Leave package at security desk or ring bell twice. Insulated bag required.',
      isDefault: true
    },
    destinationCoordinates: {
      latitude: 12.9784,
      longitude: 77.6408
    },
    items: [
      {
        id: 'item-01',
        productId: 'prod-dew-glow-serum',
        variantId: 'var-serum-30ml',
        productName: 'Dew Glow Niacinamide 10% + Zinc 1% Clarifying Serum',
        variantName: '30 ml Bottle',
        sku: 'DWG-SRM-NIA-30',
        unitPrice: 549,
        quantity: 1,
        totalPrice: 549,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'item-02',
        productId: 'prod-water-gel-sunscreen',
        variantId: 'var-sunscreen-50ml',
        productName: 'Invisible Water Gel Sunscreen SPF 50+ PA++++',
        variantName: '50 ml Tube',
        sku: 'SOL-SUN-GEL-50',
        unitPrice: 549,
        quantity: 1,
        totalPrice: 549,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
      }
    ],
    estimatedDeliveryTime: new Date(Date.now() + 8 * 60000).toISOString(), // 8 mins from now
    assignedDeliveryPerson: {
      id: 'partner-blr-01',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      vehicleNumber: 'KA 01 EQ 4421',
      rating: 4.9
    },
    deliveryAssignment: {
      id: 'asgn-01',
      orderId: 'ord-live-01',
      partnerId: 'partner-blr-01',
      partnerName: 'Rajesh Kumar',
      partnerPhone: '+91 98765 43210',
      partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      vehicleNumber: 'KA 01 EQ 4421',
      vehicleType: 'electric_scooter',
      assignedAt: new Date(Date.now() - 12 * 60000).toISOString(),
      pickedUpAt: new Date(Date.now() - 6 * 60000).toISOString(),
      outForDeliveryAt: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'out_for_delivery',
      currentRiderLocation: {
        latitude: 12.9734,
        longitude: 77.6405,
        accuracy: 5,
        heading: 52,
        speed: 21,
        timestamp: new Date().toISOString()
      },
      destinationLocation: {
        latitude: 12.9784,
        longitude: 77.6408,
        addressText: 'Flat 402, Lotus Orchid, 12th Main Road, Indiranagar'
      },
      hubLocation: {
        latitude: 12.9719,
        longitude: 77.6412,
        name: 'Dew & Go Dark Store #104 — Indiranagar',
        address: '100ft Road, Indiranagar'
      },
      distanceRemainingKm: 0.95,
      etaMinutes: 4,
      lastLocationUpdate: new Date().toISOString(),
      locationSharingActive: true,
      routeGeometry: [
        [12.9734, 77.6405],
        [12.9745, 77.6406],
        [12.9760, 77.6407],
        [12.9772, 77.6407],
        [12.9784, 77.6408]
      ]
    },
    statusHistory: [
      {
        id: 'hist-01',
        orderId: 'ord-live-01',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
        actor: { id: 'sys', name: 'Dew & Go Checkout Engine', role: 'system' },
        notes: 'Pre-paid Razorpay order verified'
      },
      {
        id: 'hist-02',
        orderId: 'ord-live-01',
        status: 'processing',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        actor: { id: 'hub-mgr-01', name: 'Sanjay Rawat (Hub Lead)', role: 'store_manager' },
        notes: 'Formulations picked from cold storage and verified'
      },
      {
        id: 'hist-03',
        orderId: 'ord-live-01',
        status: 'packed',
        timestamp: new Date(Date.now() - 13 * 60000).toISOString(),
        actor: { id: 'pack-01', name: 'Micro-Hub Packaging Station 2', role: 'inventory_manager' },
        notes: 'Packed in insulated thermal bag with tamper seal #TS-9941'
      },
      {
        id: 'hist-04',
        orderId: 'ord-live-01',
        status: 'assigned',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        actor: { id: 'dispatch-ai', name: 'Smart Dispatch Dispatcher', role: 'delivery_manager' },
        notes: 'Assigned to Rajesh Kumar (KA 01 EQ 4421)'
      },
      {
        id: 'hist-05',
        orderId: 'ord-live-01',
        status: 'picked_up',
        timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
        actor: { id: 'partner-blr-01', name: 'Rajesh Kumar', role: 'delivery_person' },
        notes: 'Bag collected from Indiranagar Dark Store bay 4'
      },
      {
        id: 'hist-06',
        orderId: 'ord-live-01',
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        actor: { id: 'partner-blr-01', name: 'Rajesh Kumar', role: 'delivery_person' },
        notes: 'En route to customer doorstep'
      }
    ],
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ord-live-02',
    orderNumber: 'DWG-88214',
    userId: 'user-customer-02',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 99220 88711',
    customerEmail: 'ananya@example.com',
    status: 'ready_for_dispatch',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    subtotal: 649,
    discountAmount: 0,
    deliveryFee: 0,
    taxAmount: 32,
    totalAmount: 681,
    shippingAddress: {
      id: 'addr-02',
      userId: 'user-customer-02',
      recipientName: 'Ananya Deshmukh',
      phoneNumber: '+91 99220 88711',
      addressLine: 'Villa 14, Palm Grove, 4th Block',
      landmark: 'Near Sony World Junction',
      area: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560034',
      isDefault: true
    },
    destinationCoordinates: {
      latitude: 12.9352,
      longitude: 77.6245
    },
    items: [
      {
        id: 'item-03',
        productId: 'prod-ceramide-recovery-cream',
        variantId: 'var-cream-50g',
        productName: 'Cloud Barrier Ceramide + Peptide Recovery Cream',
        variantName: '50 g Glass Jar',
        sku: 'DWG-CRM-CER-50',
        unitPrice: 649,
        quantity: 1,
        totalPrice: 649,
        imageUrl: 'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=600&q=80'
      }
    ],
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60000).toISOString(),
    statusHistory: [
      {
        id: 'hist-20',
        orderId: 'ord-live-02',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
        actor: { id: 'sys', name: 'Dew & Go System', role: 'system' }
      },
      {
        id: 'hist-21',
        orderId: 'ord-live-02',
        status: 'processing',
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        actor: { id: 'hub-01', name: 'Koramangala Dark Store Hub', role: 'store_manager' }
      },
      {
        id: 'hist-22',
        orderId: 'ord-live-02',
        status: 'packed',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        actor: { id: 'pack-02', name: 'Koramangala Packaging Bay', role: 'inventory_manager' }
      },
      {
        id: 'hist-23',
        orderId: 'ord-live-02',
        status: 'ready_for_dispatch',
        timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
        actor: { id: 'hub-01', name: 'Dispatch Controller', role: 'delivery_manager' },
        notes: 'Awaiting rider allocation'
      }
    ],
    createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ord-live-03',
    orderNumber: 'DWG-88201',
    userId: 'user-vinay',
    customerName: 'Vinay Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'vinay@example.com',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cod',
    subtotal: 399,
    discountAmount: 0,
    deliveryFee: 49,
    taxAmount: 20,
    totalAmount: 468,
    shippingAddress: {
      id: 'addr-01',
      userId: 'user-vinay',
      recipientName: 'Vinay Sharma',
      phoneNumber: '+91 98765 43210',
      addressLine: 'Flat 402, Lotus Orchid, 12th Main Road',
      apartmentBuilding: 'HAL 2nd Stage',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      isDefault: true
    },
    items: [
      {
        id: 'item-04',
        productId: 'prod-glaze-lip-oil',
        variantId: 'var-lip-01',
        productName: 'Glaze Peptide Hydrating Lip Tint Oil',
        variantName: 'Petal Dew (Soft Rose)',
        sku: 'RPB-LIP-GLZ-01',
        unitPrice: 399,
        quantity: 1,
        totalPrice: 399,
        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'
      }
    ],
    actualDeliveryTime: new Date(Date.now() - 90 * 60000).toISOString(),
    statusHistory: [
      {
        id: 'hist-30',
        orderId: 'ord-live-03',
        status: 'delivered',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        actor: { id: 'partner-blr-02', name: 'Arun Verma', role: 'delivery_person' },
        notes: 'Handed over directly to customer. Cash collected ₹468.'
      }
    ],
    createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60000).toISOString()
  }
];

