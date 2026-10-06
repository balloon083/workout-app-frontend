// Shapes returned by and sent to the backend API.

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Workouts

export interface SetRecord {
  id: number;
  set_order: number;
  weight: string | null;
  reps: number | null;
  completed: boolean;
}

export interface Exercise {
  id: number;
  exercise_name: string;
  sets: SetRecord[];
}

export interface Workout {
  id: number;
  workout_date: string;
  notes: string | null;
  duration_seconds: number | null;
  created_at: string;
  exercises: Exercise[];
}

export interface NewSet {
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface NewExercise {
  exercise_name: string;
  sets: NewSet[];
}

export interface NewWorkout {
  notes: string;
  duration_seconds: number;
  exercises: NewExercise[];
}

// Programs

export interface ProgramExercise {
  id: number;
  exercise_name: string;
  exercise_order: number;
}

export interface Program {
  id: number;
  name: string;
  created_at: string;
  exercises: ProgramExercise[];
}

export interface NewProgram {
  name: string;
  exercises: string[];
}

// Meals

export interface MealEntry {
  id: number;
  food_name: string;
  calories: number;
  protein: string | null;
  carbs: string | null;
  fat: string | null;
  fiber: string | null;
  sugar: string | null;
  entry_date: string;
  created_at: string;
}

export interface MealInput {
  food_name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
}

export interface TodayMealsResponse {
  entries: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
}

// Food search (USDA)

export interface FoodResult {
  fdcId: number;
  description: string;
  brandOwner: string | null;
  servingSize: number | null;
  servingSizeUnit: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
}
