import { MealEntry } from '@/api';
import { sharedStyles } from '@/constants/styles';
import { colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MealEntryCardProps {
  entry: MealEntry;
  onPress: () => void;
}

/** e.g. "24g protein  •  40g carbs", skipping macros that weren't logged. */
function macroSummary(entry: MealEntry): string {
  const parts: [string | null, string][] = [
    [entry.protein, 'protein'],
    [entry.carbs, 'carbs'],
    [entry.fat, 'fat'],
  ];
  return parts
    .filter(([value]) => value)
    .map(([value, label]) => `${Math.round(parseFloat(value!))}g ${label}`)
    .join('  •  ');
}

export default function MealEntryCard({ entry, onPress }: MealEntryCardProps) {
  const summary = macroSummary(entry);

  return (
    <TouchableOpacity style={sharedStyles.listCard} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.foodName} numberOfLines={2}>
          {entry.food_name}
        </Text>
        <Text style={styles.calories}>{entry.calories} cal</Text>
      </View>
      {summary ? <Text style={styles.macros}>{summary}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  foodName: { fontSize: 15, color: colors.text, flex: 1, marginRight: 8 },
  calories: { fontSize: 15, fontWeight: '600', color: colors.primary },
  macros: { color: colors.subtext, fontSize: 12, marginTop: 4 },
});
