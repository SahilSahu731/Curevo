import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii } from "@/theme/tokens";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
};

export function TextField({ label, value, onChangeText, placeholder, multiline = false, keyboardType = "default" }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        placeholderTextColor={colors.subtext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
});
