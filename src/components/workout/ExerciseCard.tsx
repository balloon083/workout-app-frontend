import { colors } from '@/constants/theme';
import { DraftExercise } from '@/hooks/useWorkoutDraft';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SetRow, { SetHeader } from './SetRow';

interface ExerciseCardProps {
  exercise: DraftExercise;
  canRemove: boolean;
  onPickName: () => void;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onChangeSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
  onToggleSet: (setId: string) => void;
}

export default function ExerciseCard({
  exercise,
  canRemove,
  onPickName,
  onRemove,
  onAddSet,
  onRemoveSet,
  onChangeSet,
  onToggleSet,
}: ExerciseCardProps) {
  const { exercise_name, sets } = exercise;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.nameButton} onPress={onPickName}>
          <Text style={exercise_name ? styles.nameText : styles.namePlaceholder} numberOfLines={1}>
            {exercise_name || 'Select Exercise'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.subtext} />
        </TouchableOpacity>
        {canRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {sets.length > 0 && <SetHeader />}

      {sets.map((set, index) => (
        <SetRow
          key={set.id}
          index={index}
          set={set}
          canRemove={sets.length > 1}
          onChange={(field, value) => onChangeSet(set.id, field, value)}
          onToggle={() => onToggleSet(set.id)}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  nameText: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  namePlaceholder: { color: colors.subtext, fontSize: 15, flex: 1 },
  addSetButton: { alignItems: 'center', paddingVertical: 8 },
  addSetText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
