import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radii } from "@/theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
  compact?: boolean;
};

export function Button({ label, onPress, variant = "primary", style, compact = false }: Props) {
  const backgroundColor = variant === "primary" ? colors.primary : variant === "secondary" ? colors.surfaceMuted : "transparent";
  const color = variant === "primary" ? "#fffdf8" : colors.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor, opacity: pressed ? 0.85 : 1, paddingVertical: compact ? 10 : 14 }, style]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
});
