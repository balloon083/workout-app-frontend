import { colors } from '@/constants/theme';
import { DraftSet } from '@/hooks/useWorkoutDraft';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SetRowProps {
  index: number;
  set: DraftSet;
  canRemove: boolean;
  onChange: (field: 'weight' | 'reps', value: string) => void;
  onToggle: () => void;
  onRemove: () => void;
}

export function SetHeader() {
  return (
    <View style={styles.headerRow}>
      <Text style={[styles.headerText, styles.colSmall]}>Set</Text>
      <Text style={[styles.headerText, styles.colFlex]}>Weight</Text>
      <Text style={[styles.headerText, styles.colFlex]}>Reps</Text>
      <Text style={[styles.headerText, styles.colSmall]}>Done</Text>
    </View>
  );
}

export default function SetRow({ index, set, canRemove, onChange, onToggle, onRemove }: SetRowProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.setNumber, styles.colSmall]}>{index + 1}</Text>
      <TextInput
        style={[styles.input, styles.colFlex]}
        placeholder="—"
        placeholderTextColor={colors.subtext}
        value={set.weight}
        onChangeText={(v) => onChange('weight', v)}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, styles.colFlex]}
        placeholder="—"
        placeholderTextColor={colors.subtext}
        value={set.reps}
        onChangeText={(v) => onChange('reps', v)}
        keyboardType="numeric"
      />
      <View style={styles.colSmall}>
        <TouchableOpacity onPress={onToggle} style={styles.checkButton}>
          <Ionicons
            name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={set.completed ? colors.primary : colors.subtext}
          />
        </TouchableOpacity>
      </View>
      {canRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Ionicons name="close" size={16} color={colors.subtext} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 2 },
  headerText: { color: colors.subtext, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  colSmall: { width: 36, alignItems: 'center' },
  colFlex: { flex: 1, marginHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  setNumber: { color: colors.subtext, fontSize: 13, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    textAlign: 'center',
  },
  checkButton: { padding: 2 },
  removeButton: { padding: 4, marginLeft: 2 },
});
