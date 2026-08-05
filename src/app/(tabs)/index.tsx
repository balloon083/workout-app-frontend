import { Workout, getTodayMeals, getWorkouts } from '@/api/client';
import { colors } from '@/constants/theme';
import { formatDuration, timeAgo } from '@/utils/time';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function HomeTab() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const mealsData = await getTodayMeals();
      setTodayCalories(mealsData.totalCalories);

      const workoutsData = await getWorkouts();
      setRecentWorkouts(workoutsData.slice(0, 10));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.calorieCard}>
        <Text style={styles.calorieLabel}>Today's Calories</Text>
        <Text style={styles.calorieValue}>{todayCalories}</Text>
      </View>

      <Text style={styles.sectionTitle}>Previous Workouts</Text>
      <FlatList
        data={recentWorkouts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No workouts logged yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTime}>{timeAgo(item.created_at)}</Text>
              {item.duration_seconds ? (
                <Text style={styles.workoutDuration}>{formatDuration(item.duration_seconds)}</Text>
              ) : null}
            </View>
            {item.notes ? <Text style={styles.workoutNotes}>{item.notes}</Text> : null}
            {item.exercises.map((ex) => (
              <View key={ex.id} style={styles.exerciseBlock}>
                <Text style={styles.exerciseText}>
                  {ex.exercise_name}
                  {ex.sets.length > 0 ? ` — ${ex.sets.length} set${ex.sets.length > 1 ? 's' : ''}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: colors.text },
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: colors.text },
  emptyText: { color: colors.subtext, textAlign: 'center', marginTop: 20 },
  workoutCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutTime: { fontWeight: '600', color: colors.text },
  workoutDuration: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  workoutNotes: { color: colors.subtext, fontStyle: 'italic', marginBottom: 4 },
  exerciseBlock: { marginTop: 2 },
  exerciseText: { color: colors.text },
});