import Button from '@/components/ui/Button';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import { WorkoutDraft } from '@/hooks/useWorkoutDraft';
import { formatStopwatch } from '@/utils/time';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import ExerciseCard from './ExerciseCard';
import ExercisePickerModal from './ExercisePickerModal';

interface ActiveWorkoutProps {
  draft: WorkoutDraft;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  saving: boolean;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

/** The in-progress workout: timer, notes, exercise cards, and save / discard actions. */
export default function ActiveWorkout({
  draft,
  elapsedSeconds,
  isTimerRunning,
  saving,
  onPauseTimer,
  onResumeTimer,
  onDiscard,
  onSave,
}: ActiveWorkoutProps) {
  // Which exercise card the exercise picker is choosing a name for.
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const canRemoveExercises = draft.exercises.length > 1;

  return (
    <View style={sharedStyles.formCard}>
      <View style={styles.timer}>
        <Text style={styles.timerLabel}>
          {isTimerRunning ? 'Workout in progress' : 'Workout paused'}
        </Text>
        <Text style={styles.timerValue}>{formatStopwatch(elapsedSeconds)}</Text>
      </View>

      <TextInput
        style={sharedStyles.input}
        placeholder="Notes (optional, e.g. 'evening run')"
        placeholderTextColor={colors.subtext}
        value={draft.notes}
        onChangeText={draft.setNotes}
      />

      {draft.exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          canRemove={canRemoveExercises}
          onPickName={() => setPickingFor(ex.id)}
          onRemove={() => draft.removeExercise(ex.id)}
          onAddSet={() => draft.addSet(ex.id)}
          onRemoveSet={(setId) => draft.removeSet(ex.id, setId)}
          onChangeSet={(setId, field, value) => draft.updateSet(ex.id, setId, field, value)}
          onToggleSet={(setId) => draft.toggleSet(ex.id, setId)}
        />
      ))}

      <Button
        title="+ Add Another Exercise"
        variant="outline"
        onPress={draft.addExercise}
        style={styles.addExercise}
      />

      <View style={styles.actions}>
        <Button title="Discard" variant="danger" onPress={onDiscard} />
        <Button
          title={saving ? 'Saving...' : isTimerRunning ? 'Finish & Save' : 'Save Workout'}
          onPress={onSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>

      <Button
        title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
        variant="link"
        onPress={isTimerRunning ? onPauseTimer : onResumeTimer}
      />

      <ExercisePickerModal
        visible={pickingFor !== null}
        onClose={() => setPickingFor(null)}
        onSelect={(name) => {
          if (pickingFor) draft.renameExercise(pickingFor, name);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  timer: { alignItems: 'center', marginBottom: 12, paddingVertical: 8 },
  timerLabel: { color: colors.subtext, fontSize: 13, marginBottom: 4 },
  timerValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  addExercise: { padding: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  saveButton: { flex: 1 },
});
