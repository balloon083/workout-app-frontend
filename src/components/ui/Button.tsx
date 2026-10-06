import { colors } from '@/constants/theme';
import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'outline' | 'danger' | 'link';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Shows a spinner instead of the title and disables the button. */
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const textColor = variant === 'primary' ? colors.primaryText : TEXT_COLORS[variant];

  return (
    <TouchableOpacity
      style={[styles.base, VARIANT_STYLES[variant], style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor }, variant === 'link' && styles.linkText]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const TEXT_COLORS: Record<Exclude<Variant, 'primary'>, string> = {
  outline: colors.primary,
  danger: colors.danger,
  link: colors.subtext,
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    padding: 14,
  },
  text: { fontSize: 16, fontWeight: '600' },
  linkText: { fontSize: 13, fontWeight: '400' },
});

const VARIANT_STYLES = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1, borderColor: colors.primary },
  danger: { borderWidth: 1, borderColor: colors.danger, paddingHorizontal: 20 },
  link: { padding: 0, marginTop: 10 },
});
