import { TodayMealsResponse } from '@/api';
import { colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DailyTotalsCardProps {
  totals: TodayMealsResponse;
}

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{Math.round(value)}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export default function DailyTotalsCard({ totals }: DailyTotalsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Today's Total</Text>
      <Text style={styles.calories}>{Math.round(totals.totalCalories)} cal</Text>
      <View style={styles.macroRow}>
        <Macro label="Protein" value={totals.totalProtein} />
        <Macro label="Carbs" value={totals.totalCarbs} />
        <Macro label="Fat" value={totals.totalFat} />
        <Macro label="Fiber" value={totals.totalFiber} />
        <Macro label="Sugar" value={totals.totalSugar} />
      </View>
      <Text style={styles.resetNote}>Resets at midnight</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: { fontSize: 14, color: colors.subtext },
  calories: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  resetNote: { fontSize: 11, color: colors.subtext, marginTop: 8 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  macro: { alignItems: 'center', flex: 1 },
  macroValue: { color: colors.text, fontSize: 16, fontWeight: '700' },
  macroLabel: { color: colors.subtext, fontSize: 11, marginTop: 2 },
});
