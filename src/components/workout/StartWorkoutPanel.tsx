import { Program } from '@/api';
import Button from '@/components/ui/Button';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StartWorkoutPanelProps {
  programs: Program[];
  onStartEmpty: () => void;
  onStartProgram: (program: Program) => void;
  onNewProgram: () => void;
}

/** Shown when no workout is in progress: start buttons plus saved programs. */
export default function StartWorkoutPanel({
  programs,
  onStartEmpty,
  onStartProgram,
  onNewProgram,
}: StartWorkoutPanelProps) {
  return (
    <>
      <View style={styles.buttons}>
        <Button title="Start Empty Workout" onPress={onStartEmpty} style={styles.startButton} />
        <Button title="New Program" variant="outline" onPress={onNewProgram} />
      </View>

      {programs.length > 0 && (
        <View style={styles.programs}>
          <Text style={styles.programsTitle}>Your Programs</Text>
          {programs.map((program) => (
            <View key={program.id} style={[sharedStyles.listCard, styles.programCard]}>
              <View style={[sharedStyles.rowBetween, styles.programHeader]}>
                <Text style={styles.programName}>{program.name}</Text>
                <TouchableOpacity style={styles.programStart} onPress={() => onStartProgram(program)}>
                  <Text style={styles.programStartText}>Start</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.programExercises}>
                {program.exercises.map((e) => e.exercise_name).join(', ')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: 10, marginBottom: 20 },
  startButton: { padding: 16 },
  programs: { marginBottom: 20 },
  programsTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  programCard: { borderRadius: 10 },
  programHeader: { marginBottom: 4 },
  programName: { color: colors.text, fontWeight: '600', fontSize: 15 },
  programStart: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  programStartText: { color: colors.primaryText, fontWeight: '600', fontSize: 13 },
  programExercises: { color: colors.subtext, fontSize: 13 },
});
