import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.0.103:3000';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

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

export interface TodayMealsResponse {
  entries: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
}

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

export interface MealInput {
  food_name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function createWorkout(workoutData: {
  notes: string;
  duration_seconds: number;
  exercises: NewExercise[];
}): Promise<Workout> {
  const response = await api.post('/workouts', workoutData);
  return response.data;
}

export async function getWorkouts(): Promise<Workout[]> {
  const response = await api.get('/workouts');
  return response.data;
}

export async function createMeal(mealData: MealInput): Promise<MealEntry> {
  const response = await api.post('/meals', mealData);
  return response.data;
}

export async function updateMeal(id: number, mealData: MealInput): Promise<MealEntry> {
  const response = await api.put(`/meals/${id}`, mealData);
  return response.data;
}

export async function deleteMeal(id: number): Promise<void> {
  await api.delete(`/meals/${id}`);
}

export async function getTodayMeals(): Promise<TodayMealsResponse> {
  const response = await api.get('/meals/today');
  return response.data;
}

export async function getMeals(): Promise<MealEntry[]> {
  const response = await api.get('/meals');
  return response.data;
}

export async function createProgram(data: {
  name: string;
  exercises: string[];
}): Promise<Program> {
  const response = await api.post('/programs', data);
  return response.data;
}

export async function getPrograms(): Promise<Program[]> {
  const response = await api.get('/programs');
  return response.data;
}

export async function searchFoods(query: string): Promise<FoodResult[]> {
  const response = await api.get('/foods/search', { params: { query } });
  return response.data;
}

export default api;