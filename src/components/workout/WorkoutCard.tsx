import { Exercise, Workout } from '@/api';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import { formatDuration, timeAgo } from '@/utils/time';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WorkoutCardProps {
  workout: Workout;
  /** Compact shows a set count per exercise; full lists every set. */
  variant?: 'compact' | 'full';
}

function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function SetLines({ exercise }: { exercise: Exercise }) {
  return (
    <>
      {exercise.sets.map((s, i) => (
        <Text key={s.id} style={styles.setLine}>
          Set {i + 1}: {s.weight ? `${s.weight} lb × ` : ''}
          {s.reps ?? '—'} reps {s.completed ? '✓' : ''}
        </Text>
      ))}
    </>
  );
}

/** A logged workout, used in the workout history and on the dashboard. */
export default function WorkoutCard({ workout, variant = 'full' }: WorkoutCardProps) {
  const { created_at, duration_seconds, notes, exercises } = workout;

  return (
    <View style={sharedStyles.listCard}>
      <View style={[sharedStyles.rowBetween, styles.header]}>
        <Text style={styles.time}>{timeAgo(created_at)}</Text>
        {duration_seconds ? <Text style={styles.duration}>{formatDuration(duration_seconds)}</Text> : null}
      </View>

      {notes ? <Text style={styles.notes}>{notes}</Text> : null}

      {variant === 'full' && exercises.length === 0 && (
        <Text style={styles.emptyLabel}>Empty workout (no exercises logged)</Text>
      )}

      {exercises.map((ex) =>
        variant === 'compact' ? (
          <Text key={ex.id} style={styles.compactExercise}>
            {ex.exercise_name}
            {ex.sets.length > 0 ? ` — ${pluralize(ex.sets.length, 'set')}` : ''}
          </Text>
        ) : (
          <View key={ex.id} style={styles.exercise}>
            <Text style={styles.exerciseName}>{ex.exercise_name}</Text>
            <SetLines exercise={ex} />
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 4 },
  time: { fontWeight: '600', color: colors.text },
  duration: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  notes: { color: colors.subtext, fontStyle: 'italic', marginBottom: 4 },
  emptyLabel: { color: colors.subtext, fontStyle: 'italic', fontSize: 13 },
  compactExercise: { color: colors.text, marginTop: 2 },
  exercise: { marginTop: 6 },
  exerciseName: { color: colors.text, fontWeight: '600', marginBottom: 2 },
  setLine: { color: colors.subtext, fontSize: 13, marginLeft: 8 },
});
