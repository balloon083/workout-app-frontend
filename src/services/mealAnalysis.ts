// PLACEHOLDER for the food recognition model.
// analyzeMealPhoto() currently returns a random canned result after a short
// delay so the capture flow can be built end to end. When the model is
// served, replace the body with a real request that uploads `photoUri`.
// Nothing else in the app needs to change.

export interface AnalyzedMeal {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

const SAMPLE_RESULTS: AnalyzedMeal[] = [
  { food_name: 'Grilled Chicken Breast', calories: 231, protein: 43.5, carbs: 0, fat: 5, fiber: 0, sugar: 0 },
  { food_name: 'Caesar Salad', calories: 481, protein: 12, carbs: 16, fat: 43, fiber: 3, sugar: 3 },
  { food_name: 'Spaghetti with Marinara', calories: 396, protein: 13, carbs: 78, fat: 4, fiber: 6, sugar: 9 },
  { food_name: 'Avocado Toast', calories: 340, protein: 9, carbs: 33, fat: 21, fiber: 10, sugar: 3 },
  { food_name: 'Salmon Fillet', calories: 367, protein: 39, carbs: 0, fat: 22, fiber: 0, sugar: 0 },
  { food_name: 'Cheeseburger', calories: 563, protein: 28, carbs: 40, fat: 33, fiber: 2, sugar: 8 },
];

const FAKE_LATENCY_MS = 1600;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzeMealPhoto(photoUri: string): Promise<AnalyzedMeal> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
  return SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)];
}
