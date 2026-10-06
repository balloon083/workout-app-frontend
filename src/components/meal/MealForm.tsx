import Button from '@/components/ui/Button';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import { MacroField, MealForm as MealFormState } from '@/hooks/useMealForm';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FoodPickerModal from './FoodPickerModal';

interface MealFormProps {
  form: MealFormState;
  saving: boolean;
  deleting: boolean;
  onSave: () => void;
  onDelete: () => void;
}

// Laid out two per row.
const FIELD_ROWS: [MacroField, string][][] = [
  [['calories', 'Calories'], ['protein', 'Protein']],
  [['carbs', 'Carbs'], ['fat', 'Fat']],
  [['fiber', 'Fiber'], ['sugar', 'Sugar']],
];

export default function MealForm({ form, saving, deleting, onSave, onDelete }: MealFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { selectedFood, isEditing } = form;

  return (
    <View style={sharedStyles.formCard}>
      <View style={[sharedStyles.rowBetween, styles.header]}>
        <Text style={styles.title}>{isEditing ? 'Edit Meal' : 'New Meal'}</Text>
        <TouchableOpacity onPress={form.close}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={() => setPickerOpen(true)}>
        <Ionicons name="search" size={16} color={colors.subtext} />
        <Text style={styles.searchPlaceholder}>Search a food to auto-fill</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, styles.foodName]}
        value={form.foodName}
        onChangeText={form.setFoodName}
        placeholder="Food name"
        placeholderTextColor={colors.subtext}
      />

      {selectedFood && (
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            value={form.quantity}
            onChangeText={form.setQuantity}
            keyboardType="numeric"
          />
          <Text style={styles.quantityLabel}>{selectedFood.servingSizeUnit || 'g'}</Text>
        </View>
      )}

      <Text style={styles.editNote}>Tap any value below to adjust it</Text>

      {FIELD_ROWS.map((row) => (
        <View key={row[0][0]} style={styles.fieldRow}>
          {row.map(([field, label]) => (
            <View key={field} style={styles.field}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput
                style={[styles.input, styles.fieldInput]}
                value={form.macros[field]}
                onChangeText={(v) => form.setMacro(field, v)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.subtext}
              />
            </View>
          ))}
        </View>
      ))}

      <View style={styles.actions}>
        {isEditing && (
          <Button
            title={deleting ? 'Deleting...' : 'Delete'}
            variant="danger"
            onPress={onDelete}
            disabled={deleting}
          />
        )}
        <Button
          title={saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Meal'}
          onPress={onSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>

      <FoodPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={form.selectFood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 10 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.inputBackground,
    marginBottom: 8,
  },
  searchPlaceholder: { color: colors.subtext, fontSize: 15, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    backgroundColor: colors.inputBackground,
  },
  foodName: { marginBottom: 12, fontSize: 14 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  quantityLabel: { color: colors.subtext, fontSize: 14 },
  quantityInput: { width: 80, textAlign: 'center' },
  editNote: { color: colors.subtext, fontSize: 11, marginBottom: 8, fontStyle: 'italic' },
  fieldRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  field: { flex: 1 },
  fieldLabel: { color: colors.subtext, fontSize: 12, marginBottom: 4 },
  fieldInput: { fontSize: 15, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveButton: { flex: 1 },
});
