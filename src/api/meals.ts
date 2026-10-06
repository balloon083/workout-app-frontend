import api from './client';
import { FoodResult, MealEntry, MealInput, TodayMealsResponse } from './types';

export async function getMeals(): Promise<MealEntry[]> {
  const { data } = await api.get<MealEntry[]>('/meals');
  return data;
}

export async function getTodayMeals(): Promise<TodayMealsResponse> {
  const { data } = await api.get<TodayMealsResponse>('/meals/today');
  return data;
}

export async function createMeal(meal: MealInput): Promise<MealEntry> {
  const { data } = await api.post<MealEntry>('/meals', meal);
  return data;
}

export async function updateMeal(id: number, meal: MealInput): Promise<MealEntry> {
  const { data } = await api.put<MealEntry>(`/meals/${id}`, meal);
  return data;
}

export async function deleteMeal(id: number): Promise<void> {
  await api.delete(`/meals/${id}`);
}

export async function searchFoods(query: string): Promise<FoodResult[]> {
  const { data } = await api.get<FoodResult[]>('/foods/search', { params: { query } });
  return data;
}
