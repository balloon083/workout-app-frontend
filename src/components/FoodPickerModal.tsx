import { FoodResult, searchFoods } from '@/api/client';
import { colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FoodPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (food: FoodResult) => void;
}

export default function FoodPickerModal({ visible, onClose, onSelect }: FoodPickerModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchFoods(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Food search failed', err);
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(food: FoodResult) {
    onSelect(food);
    handleClose();
  }

  function handleClose() {
    setQuery('');
    setResults([]);
    setSearched(false);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Food</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.subtext} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods (e.g. 'grilled chicken breast')"
            placeholderTextColor={colors.subtext}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!loading && searched && results.length === 0 && (
          <Text style={styles.emptyText}>No foods match "{query}".</Text>
        )}

        {!loading && !searched && query.trim().length < 2 && (
          <Text style={styles.hintText}>Type at least 2 characters to search.</Text>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => item.fdcId.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.brandOwner ? (
                  <Text style={styles.rowBrand}>{item.brandOwner}</Text>
                ) : null}
                <Text style={styles.rowMacros}>
                  {item.calories != null ? `${Math.round(item.calories)} cal` : '— cal'}
                  {item.protein != null ? `  •  ${Math.round(item.protein)}g protein` : ''}
                  {item.servingSize
                    ? `  •  per ${item.servingSize}${item.servingSizeUnit || 'g'}`
                    : '  •  per 100g'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 12, fontSize: 16 },
  loadingRow: { paddingVertical: 20 },
  emptyText: { color: colors.subtext, textAlign: 'center', marginTop: 30, paddingHorizontal: 16 },
  hintText: { color: colors.subtext, textAlign: 'center', marginTop: 30, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowTextContainer: { flex: 1, marginRight: 8 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowBrand: { color: colors.subtext, fontSize: 12, marginTop: 2 },
  rowMacros: { color: colors.primary, fontSize: 12, marginTop: 4 },
});