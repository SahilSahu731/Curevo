import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { colors, spacing } from "@/theme/tokens";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.page,
    paddingBottom: 48,
    gap: 16,
  },
});
