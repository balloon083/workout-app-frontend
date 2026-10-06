import { createProgram } from '@/api';
import Button from '@/components/ui/Button';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import { getErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ExercisePickerModal from './ExercisePickerModal';

interface ProgramFormProps {
  onClose: () => void;
  onSaved: () => void;
}

/** Form for creating a named, reusable list of exercises. */
export default function ProgramForm({ onClose, onSaved }: ProgramFormProps) {
  const [name, setName] = useState('');
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function removeExercise(index: number) {
    setExerciseNames((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give your program a name.');
      return;
    }
    if (exerciseNames.length === 0) {
      Alert.alert('Missing exercises', 'Add at least one exercise to the program.');
      return;
    }

    setSaving(true);
    try {
      await createProgram({ name: name.trim(), exercises: exerciseNames });
      onSaved();
    } catch (err) {
      Alert.alert('Save failed', getErrorMessage(err, 'Something went wrong saving the program.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={sharedStyles.formCard}>
      <View style={[sharedStyles.rowBetween, styles.header]}>
        <Text style={styles.title}>New Program</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={sharedStyles.input}
        placeholder="Program name (e.g. 'Push Day')"
        placeholderTextColor={colors.subtext}
        value={name}
        onChangeText={setName}
      />

      {exerciseNames.map((exerciseName, index) => (
        <View key={`${exerciseName}-${index}`} style={[sharedStyles.rowBetween, styles.exerciseRow]}>
          <Text style={styles.exerciseText}>
            {index + 1}. {exerciseName}
          </Text>
          <TouchableOpacity onPress={() => removeExercise(index)}>
            <Ionicons name="close" size={18} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      ))}

      <Button
        title="+ Add Exercise"
        variant="outline"
        onPress={() => setPickerOpen(true)}
        style={styles.addButton}
      />
      <Button title={saving ? 'Saving...' : 'Save Program'} onPress={handleSave} disabled={saving} />

      <ExercisePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(picked) => setExerciseNames((prev) => [...prev, picked])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  exerciseRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  exerciseText: { color: colors.text, fontSize: 14, flex: 1 },
  addButton: { padding: 12, marginBottom: 12 },
});
