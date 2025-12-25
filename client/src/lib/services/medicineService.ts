
export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  manufacturer: string;
  dosageForm: string; // e.g., Tablet, Syrup, Injection
  packSize: string; // e.g., 10 tablets, 100ml
  prescriptionRequired: boolean;
  imageUrl?: string; // We can use placeholders if needed
  popular?: boolean;
}

export interface MedicineCategory {
  id: string;
  name: string;
  slug: string;
}

const categories: MedicineCategory[] = [
  { id: '1', name: 'Popular Essentials', slug: 'popular' },
  { id: '2', name: 'Pain Relief', slug: 'pain-relief' },
  { id: '3', name: 'Vitamin & Supplements', slug: 'vitamins' },
  { id: '4', name: 'Cold & Immunity', slug: 'cold-immunity' },
  { id: '5', name: 'Diabetes Care', slug: 'diabetes' },
  { id: '6', name: 'Skin Care', slug: 'skin-care' },
  { id: '7', name: 'Stomach Care', slug: 'stomach' },
];

const medicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 650mg',
    description: 'Effective effective fever and mild to moderate pain.',
    price: 30,
    originalPrice: 45,
    category: 'pain-relief',
    manufacturer: 'HealthCare Pharma',
    dosageForm: 'Tablet',
    packSize: '15 Tablets',
    prescriptionRequired: false,
    popular: true
  },
  {
    id: '2',
    name: 'Vitamin C + Zinc',
    description: 'Daily immunity booster supplements.',
    price: 350,
    originalPrice: 499,
    category: 'vitamins',
    manufacturer: 'NutriLife',
    dosageForm: 'Tablet',
    packSize: '60 Tablets',
    prescriptionRequired: false,
    popular: true
  },
  {
    id: '3',
    name: 'SugarCheck Glucometer Strips',
    description: 'Test strips for blood glucose monitoring.',
    price: 750,
    originalPrice: 999,
    category: 'diabetes',
    manufacturer: 'Diabetes Care Inc',
    dosageForm: 'Strips',
    packSize: '50 Strips',
    prescriptionRequired: false,
    popular: true
  },
  {
    id: '4',
    name: 'Cough Relief Syrup',
    description: 'Soothing syrup for dry and wet cough.',
    price: 120,
    originalPrice: 150,
    category: 'cold-immunity',
    manufacturer: 'Herbal Remedies',
    dosageForm: 'Syrup',
    packSize: '100ml',
    prescriptionRequired: false
  },
  {
    id: '5',
    name: 'Multivitamin Gold',
    description: 'Complete daily multivitamin for adults.',
    price: 899,
    originalPrice: 1299,
    category: 'vitamins',
    manufacturer: 'Global Health',
    dosageForm: 'Capsule',
    packSize: '30 Capsules',
    prescriptionRequired: false
  },
  {
    id: '6',
    name: 'Muscle Pain Spray',
    description: 'Instant relief from back pain and muscle sprains.',
    price: 250,
    category: 'pain-relief',
    manufacturer: 'FastRelief',
    dosageForm: 'Spray',
    packSize: '50g',
    prescriptionRequired: false
  },
  {
    id: '7',
    name: 'Aloe Vera Moisturizer',
    description: 'Hydrating gel for all skin types.',
    price: 299,
    originalPrice: 399,
    category: 'skin-care',
    manufacturer: 'NatureBeauty',
    dosageForm: 'Gel',
    packSize: '100g',
    prescriptionRequired: false
  },
  {
    id: '8',
    name: 'Digestion Aid Enzyme',
    description: 'Helps in digestion and relieves bloating.',
    price: 180,
    category: 'stomach',
    manufacturer: 'GastroHealth',
    dosageForm: 'Tablet',
    packSize: '10 Tablets',
    prescriptionRequired: false
  }
];

export const getMedicineCategories = async (): Promise<MedicineCategory[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(categories), 500));
};

export const getMedicines = async (categorySlug?: string): Promise<Medicine[]> => {
   return new Promise((resolve) => {
    setTimeout(() => {
        if (categorySlug && categorySlug !== 'popular') {
            resolve(medicines.filter(m => m.category === categorySlug));
        } else if (categorySlug === 'popular') {
             resolve(medicines.filter(m => m.popular));
        } else {
            resolve(medicines);
        }
    }, 500);
   });
};
