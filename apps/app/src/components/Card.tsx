import { StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "@/theme/tokens";

export function Card({ children, tone = "surface" }: { children: React.ReactNode; tone?: "surface" | "soft" | "primary" | "accent" }) {
  const backgroundColor = tone === "primary" ? colors.primary : tone === "accent" ? colors.accentSoft : tone === "soft" ? colors.surfaceSoft : colors.surface;
  const borderColor = tone === "primary" ? colors.primary : colors.border;
  return <View style={[styles.card, { backgroundColor, borderColor }]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.card,
  },
});
