
export interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  duration: string;
  fasting: boolean;
  reportsIn: string;
  popular?: boolean;
  testCount?: number; // For packages
}

export interface LabCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const categories: LabCategory[] = [
  { id: '1', name: 'Popular Packages', slug: 'popular' },
  { id: '2', name: 'Blood Studies', slug: 'blood' },
  { id: '3', name: 'Diabetes', slug: 'diabetes' },
  { id: '4', name: 'Heart Health', slug: 'heart' },
  { id: '5', name: 'Thyroid', slug: 'thyroid' },
  { id: '6', name: 'Womens Health', slug: 'women' },
  { id: '7', name: 'Vitamins', slug: 'vitamins' },
];

const labTests: LabTest[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    description: 'Measures different parts of the blood to check overall health.',
    price: 399,
    originalPrice: 599,
    category: 'blood',
    duration: '10 mins',
    fasting: false,
    reportsIn: '24 Hours',
    popular: true
  },
  {
    id: '2',
    name: 'Full Body Checkup - Advanced',
    description: 'Comprehensive health checkup including 75+ tests.',
    price: 1499,
    originalPrice: 2999,
    category: 'popular',
    duration: '30 mins',
    fasting: true,
    reportsIn: '48 Hours',
    popular: true,
    testCount: 78
  },
  {
    id: '3',
    name: 'Diabetes Screening (HbA1c)',
    description: 'Average blood sugar level over past 3 months.',
    price: 499,
    originalPrice: 700,
    category: 'diabetes',
    duration: '10 mins',
    fasting: false,
    reportsIn: '24 Hours'
  },
  {
    id: '4',
    name: 'Lipid Profile',
    description: 'Measures cholesterol and triglycerides for heart health.',
    price: 699,
    originalPrice: 1000,
    category: 'heart',
    duration: '15 mins',
    fasting: true,
    reportsIn: '24 Hours'
  },
  {
    id: '5',
    name: 'Thyroid Profile (T3, T4, TSH)',
    description: 'Checks thyroid function.',
    price: 599,
    originalPrice: 899,
    category: 'thyroid',
    duration: '15 mins',
    fasting: false,
    reportsIn: '24 Hours'
  },
  {
    id: '6',
    name: 'Vitamin D & B12 Combo',
    description: 'Essential vitamins for bone and nerve health.',
    price: 999,
    originalPrice: 1599,
    category: 'vitamins',
    duration: '15 mins',
    fasting: false,
    reportsIn: '36 Hours'
  },
  {
    id: '7',
    name: 'Iron Deficiency Profile',
    description: 'Checks iron levels and anemia risk.',
    price: 799,
    category: 'blood',
    duration: '15 mins',
    fasting: false,
    reportsIn: '24 Hours'
  },
  {
    id: '8',
    name: 'Women Wellness Package',
    description: 'Tailored health checkup for women.',
    price: 1999,
    originalPrice: 3500,
    category: 'women',
    duration: '30 mins',
    fasting: true,
    reportsIn: '48 Hours',
    testCount: 45
  }
];

export const getLabCategories = async (): Promise<LabCategory[]> => {
  // Simulate API delay
  return new Promise((resolve) => setTimeout(() => resolve(categories), 500));
};

export const getLabTests = async (categorySlug?: string): Promise<LabTest[]> => {
   return new Promise((resolve) => {
    setTimeout(() => {
        if (categorySlug && categorySlug !== 'popular') {
            resolve(labTests.filter(test => test.category === categorySlug));
        } else if (categorySlug === 'popular') {
             resolve(labTests.filter(test => test.popular));
        } else {
            resolve(labTests);
        }
    }, 500);
   });
};
