import { Workout, getTodayMeals, getWorkouts } from '@/api';
import WorkoutCard from '@/components/workout/WorkoutCard';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

const RECENT_WORKOUT_COUNT = 10;

export default function HomeTab() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [meals, workouts] = await Promise.all([getTodayMeals(), getWorkouts()]);
      setTodayCalories(meals.totalCalories);
      setRecentWorkouts(workouts.slice(0, RECENT_WORKOUT_COUNT));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <View style={[sharedStyles.screen, styles.container]}>
      <Text style={sharedStyles.title}>Dashboard</Text>

      <View style={styles.calorieCard}>
        <Text style={styles.calorieLabel}>Today's Calories</Text>
        <Text style={styles.calorieValue}>{todayCalories}</Text>
      </View>

      <Text style={sharedStyles.sectionTitle}>Previous Workouts</Text>
      <FlatList
        data={recentWorkouts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
        ListEmptyComponent={<Text style={sharedStyles.emptyText}>No workouts logged yet.</Text>}
        renderItem={({ item }) => <WorkoutCard workout={item} variant="compact" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60 },
  calorieCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  calorieLabel: { fontSize: 14, color: colors.subtext },
  calorieValue: { fontSize: 36, fontWeight: 'bold', color: colors.primary },
});
