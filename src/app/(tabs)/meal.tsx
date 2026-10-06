import { TodayMealsResponse, createMeal, deleteMeal, getTodayMeals, updateMeal } from '@/api';
import DailyTotalsCard from '@/components/meal/DailyTotalsCard';
import MealEntryCard from '@/components/meal/MealEntryCard';
import MealForm from '@/components/meal/MealForm';
import Button from '@/components/ui/Button';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import { useMealForm } from '@/hooks/useMealForm';
import { analyzeMealPhoto } from '@/services/mealAnalysis';
import { getErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

const EMPTY_DAY: TodayMealsResponse = {
  entries: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  totalFiber: 0,
  totalSugar: 0,
};

export default function MealTab() {
  const [today, setToday] = useState<TodayMealsResponse>(EMPTY_DAY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const form = useMealForm();

  const loadMeals = useCallback(async () => {
    try {
      setToday(await getTodayMeals());
    } catch (err) {
      console.error('Failed to load meals', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals])
  );

  async function captureMeal() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access to capture a meal photo.');
      return;
    }

    const photo = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
    if (photo.canceled) return;

    setAnalyzing(true);
    try {
      const { food_name, ...macros } = await analyzeMealPhoto(photo.assets[0].uri);
      form.openWith(food_name, macros);
    } catch (err) {
      Alert.alert('Analysis failed', getErrorMessage(err, 'Could not analyze that photo.'));
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveMeal() {
    const problem = form.validate();
    if (problem) {
      Alert.alert(problem.title, problem.message);
      return;
    }

    setSaving(true);
    try {
      const input = form.toInput();
      if (form.editingId !== null) {
        await updateMeal(form.editingId, input);
      } else {
        await createMeal(input);
      }
      form.close();
      await loadMeals();
    } catch (err) {
      Alert.alert('Save failed', getErrorMessage(err, 'Something went wrong saving the meal.'));
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal() {
    if (form.editingId === null) return;
    setDeleting(true);
    try {
      await deleteMeal(form.editingId);
      form.close();
      await loadMeals();
    } catch (err) {
      Alert.alert('Delete failed', getErrorMessage(err, 'Something went wrong deleting the meal.'));
    } finally {
      setDeleting(false);
    }
  }

  const header = (
    <>
      <Text style={sharedStyles.title}>Meals</Text>
      <DailyTotalsCard totals={today} />

      {form.isOpen ? (
        <MealForm
          form={form}
          saving={saving}
          deleting={deleting}
          onSave={saveMeal}
          onDelete={removeMeal}
        />
      ) : (
        <View style={styles.actions}>
          <Button
            title="Capture Meal"
            variant="outline"
            icon={<Ionicons name="camera" size={18} color={colors.primary} />}
            onPress={captureMeal}
            loading={analyzing}
            style={styles.actionButton}
          />
          <Button title="New Meal" onPress={form.openNew} style={styles.actionButton} />
        </View>
      )}

      <Text style={sharedStyles.sectionTitle}>Today's Entries</Text>
    </>
  );

  return (
    <FlatList
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.screenContent}
      ListHeaderComponent={header}
      data={today.entries}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={sharedStyles.emptyText}>No meals logged today.</Text>}
      renderItem={({ item }) => <MealEntryCard entry={item} onPress={() => form.openForEdit(item)} />}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionButton: { flex: 1 },
});
