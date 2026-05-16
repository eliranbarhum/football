import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { LEAGUES } from '../constants/players';

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {LEAGUES.map((league) => {
          const isActive = selected === league.id;
          return (
            <TouchableOpacity
              key={league.id}
              onPress={() => onSelect(league.id)}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.chipIcon}>{league.icon}</Text>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {league.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    minWidth: 72,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
