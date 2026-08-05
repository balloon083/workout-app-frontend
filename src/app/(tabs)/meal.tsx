import {
  FoodResult,
  MealEntry,
  TodayMealsResponse,
  createMeal,
  deleteMeal,
  getTodayMeals,
  updateMeal,
} from '@/api/client';
import FoodPickerModal from '@/components/FoodPickerModal';
import { colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_TOTALS: TodayMealsResponse = {
  entries: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  totalFiber: 0,
  totalSugar: 0,
};

// TEMPORARY: stand-in for the real image classification model.
// Once the trained model is ready, replace this with a real call
// (e.g. analyzeMealImage from api/client) that sends the photo off
// for actual analysis instead of picking from this list.
const MOCK_RESULTS = [
  { food_name: 'Grilled Chicken Breast', calories: 231, protein: 43.5, carbs: 0, fat: 5, fiber: 0, sugar: 0 },
  { food_name: 'Caesar Salad', calories: 481, protein: 12, carbs: 16, fat: 43, fiber: 3, sugar: 3 },
  { food_name: 'Spaghetti with Marinara', calories: 396, protein: 13, carbs: 78, fat: 4, fiber: 6, sugar: 9 },
  { food_name: 'Avocado Toast', calories: 340, protein: 9, carbs: 33, fat: 21, fiber: 10, sugar: 3 },
  { food_name: 'Salmon Fillet', calories: 367, protein: 39, carbs: 0, fat: 22, fiber: 0, sugar: 0 },
  { food_name: 'Cheeseburger', calories: 563, protein: 28, carbs: 40, fat: 33, fiber: 2, sugar: 8 },
];

function getMockAnalysis() {
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
}

export default function MealTab() {
  const [today, setToday] = useState<TodayMealsResponse>(DEFAULT_TOTALS);
  const [showForm, setShowForm] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [selectedFood, setSelectedFood] = useState<FoodResult | null>(null);
  const [foodName, setFoodName] = useState('');
  const [quantityGrams, setQuantityGrams] = useState('100');

  const [caloriesInput, setCaloriesInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [fatInput, setFatInput] = useState('');
  const [fiberInput, setFiberInput] = useState('');
  const [sugarInput, setSugarInput] = useState('');

  async function loadMeals() {
    try {
      const data = await getTodayMeals();
      setToday(data);
    } catch (err) {
      console.error('Failed to load meals', err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  function scale(value: number | null, base: number, qty: number): string {
    if (value == null) return '';
    return String(Math.round(((value / base) * qty) * 10) / 10);
  }

  useEffect(() => {
    if (!selectedFood) return;
    const base = selectedFood.servingSize || 100;
    const qty = parseFloat(quantityGrams) || 0;
    setCaloriesInput(scale(selectedFood.calories, base, qty));
    setProteinInput(scale(selectedFood.protein, base, qty));
    setCarbsInput(scale(selectedFood.carbs, base, qty));
    setFatInput(scale(selectedFood.fat, base, qty));
    setFiberInput(scale(selectedFood.fiber, base, qty));
    setSugarInput(scale(selectedFood.sugar, base, qty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFood, quantityGrams]);

  function resetForm() {
    setEditingId(null);
    setSelectedFood(null);
    setFoodName('');
    setQuantityGrams('100');
    setCaloriesInput('');
    setProteinInput('');
    setCarbsInput('');
    setFatInput('');
    setFiberInput('');
    setSugarInput('');
    setShowForm(false);
  }

  function handleSelectFood(food: FoodResult) {
    setSelectedFood(food);
    setFoodName(food.description);
    setQuantityGrams(food.servingSize ? String(food.servingSize) : '100');
  }

  function openForEdit(entry: MealEntry) {
    setEditingId(entry.id);
    setSelectedFood(null);
    setFoodName(entry.food_name);
    setQuantityGrams('100');
    setCaloriesInput(String(entry.calories ?? ''));
    setProteinInput(entry.protein ? String(entry.protein) : '');
    setCarbsInput(entry.carbs ? String(entry.carbs) : '');
    setFatInput(entry.fat ? String(entry.fat) : '');
    setFiberInput(entry.fiber ? String(entry.fiber) : '');
    setSugarInput(entry.sugar ? String(entry.sugar) : '');
    setShowForm(true);
  }

  function openNewMealForm() {
    resetForm();
    setShowForm(true);
  }

  // Takes the photo, then shows a short "Analyzing..." delay before
  // filling the form with a plausible-looking result - this stands in
  // for the real trained model until it's ready to swap in.
  async function handleCaptureMeal() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access to capture a meal photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: true,
    });

    if (result.canceled) {
      return;
    }

    setAnalyzing(true);
    // Fake network/analysis delay so it feels like real processing.
    setTimeout(() => {
      const analyzed = getMockAnalysis();
      resetForm();
      setFoodName(analyzed.food_name);
      setCaloriesInput(String(analyzed.calories));
      setProteinInput(String(analyzed.protein));
      setCarbsInput(String(analyzed.carbs));
      setFatInput(String(analyzed.fat));
      setFiberInput(String(analyzed.fiber));
      setSugarInput(String(analyzed.sugar));
      setShowForm(true);
      setAnalyzing(false);
    }, 1600);
  }

  async function handleSave() {
    if (!foodName.trim()) {
      Alert.alert('Missing food', 'Select or enter a food first.');
      return;
    }
    if (!caloriesInput.trim()) {
      Alert.alert('Missing calories', 'Enter a calorie amount.');
      return;
    }

    const payload = {
      food_name: foodName,
      calories: Math.round(parseFloat(caloriesInput) || 0),
      protein: proteinInput.trim() ? parseFloat(proteinInput) : null,
      carbs: carbsInput.trim() ? parseFloat(carbsInput) : null,
      fat: fatInput.trim() ? parseFloat(fatInput) : null,
      fiber: fiberInput.trim() ? parseFloat(fiberInput) : null,
      sugar: sugarInput.trim() ? parseFloat(sugarInput) : null,
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateMeal(editingId, payload);
      } else {
        await createMeal(payload);
      }
      resetForm();
      await loadMeals();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Something went wrong saving the meal.';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (editingId === null) return;
    setDeleting(true);
    try {
      await deleteMeal(editingId);
      resetForm();
      await loadMeals();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Something went wrong deleting the meal.';
      Alert.alert('Delete failed', message);
    } finally {
      setDeleting(false);
    }
  }

  function macroRow(label: string, value: number) {
    return (
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{Math.round(value)}</Text>
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
    );
  }

  function macroField(label: string, value: string, onChangeText: (v: string) => void) {
    return (
      <View style={styles.macroFieldCol}>
        <Text style={styles.macroFieldLabel}>{label}</Text>
        <TextInput
          style={styles.macroFieldInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.subtext}
        />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Meals</Text>

            <View style={styles.calorieCard}>
              <Text style={styles.calorieLabel}>Today's Total</Text>
              <Text style={styles.calorieValue}>{Math.round(today.totalCalories)} cal</Text>
              <View style={styles.macroRow}>
                {macroRow('Protein', today.totalProtein)}
                {macroRow('Carbs', today.totalCarbs)}
                {macroRow('Fat', today.totalFat)}
                {macroRow('Fiber', today.totalFiber)}
                {macroRow('Sugar', today.totalSugar)}
              </View>
              <Text style={styles.calorieResetNote}>Resets at midnight</Text>
            </View>

            {!showForm && (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleCaptureMeal}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={18} color={colors.primary} />
                      <Text style={styles.captureButtonText}>Capture Meal</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.newMealButton} onPress={openNewMealForm}>
                  <Text style={styles.newMealButtonText}>New Meal</Text>
                </TouchableOpacity>
              </View>
            )}

            {showForm && (
              <View style={styles.form}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editingId !== null ? 'Edit Meal' : 'New Meal'}
                  </Text>
                  <TouchableOpacity onPress={resetForm}>
                    <Ionicons name="close" size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.foodPickerButton}
                  onPress={() => setPickerOpen(true)}
                >
                  <Ionicons name="search" size={16} color={colors.subtext} />
                  <Text style={styles.foodPickerPlaceholder}>Search a food to auto-fill</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.foodNameInput}
                  value={foodName}
                  onChangeText={setFoodName}
                  placeholder="Food name"
                  placeholderTextColor={colors.subtext}
                />

                {selectedFood && (
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Quantity</Text>
                    <TextInput
                      style={styles.quantityInput}
                      value={quantityGrams}
                      onChangeText={setQuantityGrams}
                      keyboardType="numeric"
                    />
                    <Text style={styles.quantityUnit}>
                      {selectedFood.servingSizeUnit || 'g'}
                    </Text>
                  </View>
                )}

                <Text style={styles.editNote}>Tap any value below to adjust it</Text>

                <View style={styles.macroFieldsRow}>
                  {macroField('Calories', caloriesInput, setCaloriesInput)}
                  {macroField('Protein', proteinInput, setProteinInput)}
                </View>
                <View style={styles.macroFieldsRow}>
                  {macroField('Carbs', carbsInput, setCarbsInput)}
                  {macroField('Fat', fatInput, setFatInput)}
                </View>
                <View style={styles.macroFieldsRow}>
                  {macroField('Fiber', fiberInput, setFiberInput)}
                  {macroField('Sugar', sugarInput, setSugarInput)}
                </View>

                <View style={styles.saveRow}>
                  {editingId !== null && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDelete}
                      disabled={deleting}
                    >
                      <Text style={styles.deleteButtonText}>
                        {deleting ? 'Deleting...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.saveButton, styles.saveButtonFlex]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={styles.saveButtonText}>
                      {saving ? 'Saving...' : editingId !== null ? 'Save Changes' : 'Save Meal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Today's Entries</Text>
          </>
        }
        data={today.entries}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No meals logged today.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.mealCard} onPress={() => openForEdit(item)}>
            <View style={styles.mealCardHeader}>
              <Text style={styles.foodName} numberOfLines={2}>
                {item.food_name}
              </Text>
              <Text style={styles.calories}>{item.calories} cal</Text>
            </View>
            {(item.protein || item.carbs || item.fat) && (
              <Text style={styles.mealMacros}>
                {item.protein ? `${Math.round(parseFloat(item.protein))}g protein` : ''}
                {item.carbs ? `  •  ${Math.round(parseFloat(item.carbs))}g carbs` : ''}
                {item.fat ? `  •  ${Math.round(parseFloat(item.fat))}g fat` : ''}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      <FoodPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectFood}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  calorieCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  calorieLabel: { fontSize: 14, color: colors.subtext },
  calorieValue: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  calorieResetNote: { fontSize: 11, color: colors.subtext, marginTop: 8 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue: { color: colors.text, fontSize: 16, fontWeight: '700' },
  macroLabel: { color: colors.subtext, fontSize: 11, marginTop: 2 },
  actionButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
  },
  captureButtonText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  newMealButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMealButtonText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
  form: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  foodPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.inputBackground,
    marginBottom: 8,
  },
  foodPickerPlaceholder: { color: colors.subtext, fontSize: 15, flex: 1 },
  foodNameInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    marginBottom: 12,
    fontSize: 14,
  },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  quantityLabel: { color: colors.subtext, fontSize: 14 },
  quantityInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    width: 80,
    textAlign: 'center',
  },
  quantityUnit: { color: colors.subtext, fontSize: 14 },
  editNote: { color: colors.subtext, fontSize: 11, marginBottom: 8, fontStyle: 'italic' },
  macroFieldsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  macroFieldCol: { flex: 1 },
  macroFieldLabel: { color: colors.subtext, fontSize: 12, marginBottom: 4 },
  macroFieldInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    fontSize: 15,
    textAlign: 'center',
  },
  saveRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteButtonText: { color: colors.danger, fontWeight: '600' },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonFlex: { flex: 1 },
  saveButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: colors.text },
  emptyText: { color: colors.subtext, textAlign: 'center', marginTop: 20 },
  mealCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodName: { fontSize: 15, color: colors.text, flex: 1, marginRight: 8 },
  calories: { fontSize: 15, fontWeight: '600', color: colors.primary },
  mealMacros: { color: colors.subtext, fontSize: 12, marginTop: 4 },
});