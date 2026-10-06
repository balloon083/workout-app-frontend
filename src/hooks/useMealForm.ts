import { FoodResult, MealEntry, MealInput } from '@/api';
import { useEffect, useState } from 'react';

export const MACRO_FIELDS = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'] as const;
export type MacroField = (typeof MACRO_FIELDS)[number];

/** Macro inputs are kept as strings so the user can type freely. */
export type MacroValues = Record<MacroField, string>;

const EMPTY_MACROS: MacroValues = {
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
};

const DEFAULT_QUANTITY = '100';

/** Scales a per-serving nutrient value to the chosen quantity, rounded to 0.1. */
function scale(value: number | null, servingSize: number, quantity: number): string {
  if (value == null) return '';
  return String(Math.round((value / servingSize) * quantity * 10) / 10);
}

function macrosForFood(food: FoodResult, quantity: string): MacroValues {
  const servingSize = food.servingSize || 100;
  const qty = parseFloat(quantity) || 0;
  const result = { ...EMPTY_MACROS };
  for (const field of MACRO_FIELDS) {
    result[field] = scale(food[field], servingSize, qty);
  }
  return result;
}

const toOptionalNumber = (value: string) => (value.trim() ? parseFloat(value) : null);

/** State for the add / edit meal form. */
export function useMealForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodResult | null>(null);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [macros, setMacros] = useState<MacroValues>(EMPTY_MACROS);

  // When a searched food is selected, macros follow the quantity field.
  useEffect(() => {
    if (selectedFood) setMacros(macrosForFood(selectedFood, quantity));
  }, [selectedFood, quantity]);

  function clear() {
    setEditingId(null);
    setSelectedFood(null);
    setFoodName('');
    setQuantity(DEFAULT_QUANTITY);
    setMacros(EMPTY_MACROS);
  }

  return {
    isOpen,
    isEditing: editingId !== null,
    editingId,
    selectedFood,
    foodName,
    setFoodName,
    quantity,
    setQuantity,
    macros,

    setMacro(field: MacroField, value: string) {
      setMacros((prev) => ({ ...prev, [field]: value }));
    },

    openNew() {
      clear();
      setIsOpen(true);
    },

    /** Opens the form pre-filled with known values, e.g. from photo analysis. */
    openWith(name: string, values: Partial<Record<MacroField, number>>) {
      clear();
      setFoodName(name);
      setMacros({ ...EMPTY_MACROS, ...mapValues(values) });
      setIsOpen(true);
    },

    openForEdit(entry: MealEntry) {
      clear();
      setEditingId(entry.id);
      setFoodName(entry.food_name);
      setMacros({
        calories: String(entry.calories ?? ''),
        protein: entry.protein ?? '',
        carbs: entry.carbs ?? '',
        fat: entry.fat ?? '',
        fiber: entry.fiber ?? '',
        sugar: entry.sugar ?? '',
      });
      setIsOpen(true);
    },

    selectFood(food: FoodResult) {
      setSelectedFood(food);
      setFoodName(food.description);
      setQuantity(food.servingSize ? String(food.servingSize) : DEFAULT_QUANTITY);
    },

    close() {
      clear();
      setIsOpen(false);
    },

    /** Returns a user-facing problem with the form, or null if it can be saved. */
    validate(): { title: string; message: string } | null {
      if (!foodName.trim()) return { title: 'Missing food', message: 'Select or enter a food first.' };
      if (!macros.calories.trim()) return { title: 'Missing calories', message: 'Enter a calorie amount.' };
      return null;
    },

    toInput(): MealInput {
      return {
        food_name: foodName,
        calories: Math.round(parseFloat(macros.calories) || 0),
        protein: toOptionalNumber(macros.protein),
        carbs: toOptionalNumber(macros.carbs),
        fat: toOptionalNumber(macros.fat),
        fiber: toOptionalNumber(macros.fiber),
        sugar: toOptionalNumber(macros.sugar),
      };
    },
  };
}

function mapValues(values: Partial<Record<MacroField, number>>): Partial<MacroValues> {
  const out: Partial<MacroValues> = {};
  for (const field of MACRO_FIELDS) {
    const v = values[field];
    if (v != null) out[field] = String(v);
  }
  return out;
}

export type MealForm = ReturnType<typeof useMealForm>;
