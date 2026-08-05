import { MealEntry, Workout, getMeals, getWorkouts } from '@/api/client';
import MonthCalendar from '@/components/MonthCalendar';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { dateKeyFromDate, formatDuration, timeAgo, toDateKey } from '@/utils/time';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ActivityItem =
  | { type: 'workout'; data: Workout; created_at: string }
  | { type: 'meal'; data: MealEntry; created_at: string };

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  async function loadData() {
    try {
      const [workoutsData, mealsData] = await Promise.all([getWorkouts(), getMeals()]);
      setWorkouts(workoutsData);
      setMeals(mealsData);
    } catch (err) {
      console.error('Failed to load profile data', err);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const allActivity: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [
      ...workouts.map((w) => ({ type: 'workout' as const, data: w, created_at: w.created_at })),
      ...meals.map((m) => ({ type: 'meal' as const, data: m, created_at: m.created_at })),
    ];
    return items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [workouts, meals]);

  const lastActivity = allActivity[0] ?? null;

  const markedDateKeys = useMemo(() => {
    const keys = new Set<string>();
    allActivity.forEach((item) => keys.add(toDateKey(item.created_at)));
    return keys;
  }, [allActivity]);

  const selectedDayItems = useMemo(() => {
    const key = dateKeyFromDate(selectedDate);
    return allActivity.filter((item) => toDateKey(item.created_at) === key);
  }, [allActivity, selectedDate]);

  function changeMonth(direction: 1 | -1) {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  const selectedDateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {lastActivity && (
        <View style={styles.lastActivityCard}>
          <Text style={styles.lastActivityLabel}>Last activity</Text>
          {lastActivity.type === 'workout' ? (
            <>
              <Text style={styles.lastActivityMain}>
                Logged a workout{' '}
                {lastActivity.data.exercises.length > 0
                  ? `(${lastActivity.data.exercises.length} exercise${
                      lastActivity.data.exercises.length > 1 ? 's' : ''
                    })`
                  : ''}
              </Text>
              {lastActivity.data.duration_seconds ? (
                <Text style={styles.lastActivitySub}>
                  {formatDuration(lastActivity.data.duration_seconds)}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.lastActivityMain}>
              Logged {lastActivity.data.food_name} ({lastActivity.data.calories} cal)
            </Text>
          )}
          <Text style={styles.lastActivityTime}>{timeAgo(lastActivity.created_at)}</Text>
        </View>
      )}

      <MonthCalendar
        displayedMonth={displayedMonth}
        selectedDate={selectedDate}
        markedDateKeys={markedDateKeys}
        onSelectDate={setSelectedDate}
        onChangeMonth={changeMonth}
      />

      <Text style={styles.sectionTitle}>{selectedDateLabel}</Text>
      {selectedDayItems.length === 0 ? (
        <Text style={styles.emptyText}>Nothing logged this day.</Text>
      ) : (
        selectedDayItems.map((item, index) => (
          <View key={`${item.type}-${item.data.id}-${index}`} style={styles.dayItemCard}>
            {item.type === 'workout' ? (
              <>
                <Text style={styles.dayItemTitle}>
                  Workout
                  {item.data.duration_seconds
                    ? ` — ${formatDuration(item.data.duration_seconds)}`
                    : ''}
                </Text>
                {item.data.notes ? <Text style={styles.dayItemSub}>{item.data.notes}</Text> : null}
                {item.data.exercises.map((ex) => (
                  <Text key={ex.id} style={styles.dayItemDetail}>
                    {ex.exercise_name}
                    {ex.sets.length > 0 ? ` — ${ex.sets.length} sets` : ''}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.dayItemTitle}>
                {item.data.food_name} — {item.data.calories} cal
              </Text>
            )}
          </View>
        ))
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: colors.text },
  lastActivityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  lastActivityLabel: { fontSize: 12, color: colors.subtext, marginBottom: 6 },
  lastActivityMain: { fontSize: 16, fontWeight: '600', color: colors.text },
  lastActivitySub: { fontSize: 13, color: colors.primary, marginTop: 2 },
  lastActivityTime: { fontSize: 12, color: colors.subtext, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text },
  emptyText: { color: colors.subtext, marginBottom: 20 },
  dayItemCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dayItemTitle: { color: colors.text, fontWeight: '600' },
  dayItemSub: { color: colors.subtext, fontStyle: 'italic', marginTop: 2 },
  dayItemDetail: { color: colors.text, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: { fontSize: 13, color: colors.subtext, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: colors.text },
  signOutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: '600' },
});