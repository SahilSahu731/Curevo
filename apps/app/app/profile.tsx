import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

export default function ProfileScreen() {
  const { state, setRole, setTheme, toggleMfa, signOut, exportData, deleteAccount, createFeedback } = useCurevo();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"feature" | "bug" | "support">("feature");
  const router = useRouter();

  return (
    <Screen>
      <SectionHeader eyebrow="Profile" title="Account, privacy, and support." body="This is the mobile control center for your wellbeing workspace." />

      <Card>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{state.user?.name.slice(0, 1) ?? "C"}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{state.user?.name}</Text>
            <Text style={styles.email}>{state.user?.email}</Text>
            <Text style={styles.meta}>{state.user?.role} · {state.user?.emailVerified ? "email verified" : "email pending"} · {state.user?.mfaEnabled ? "MFA on" : "MFA off"}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.optionRow}>
          {(["light", "dark", "system"] as const).map((item) => (
            <Pressable key={item} onPress={() => setTheme(item)} style={[styles.option, state.theme === item && styles.optionActive]}>
              <Text style={[styles.optionText, state.theme === item && styles.optionTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.actionStack}>
          <Button label={state.user?.mfaEnabled ? "Disable MFA" : "Enable MFA"} onPress={toggleMfa} variant="secondary" />
          <Button label="Export my data" onPress={() => Alert.alert("Data export", exportData().slice(0, 1400))} variant="secondary" />
          <Button label="Open admin dashboard" onPress={() => router.push("/admin")} variant="secondary" />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Send feedback</Text>
        <Text style={styles.cardBody}>Share a quick note or request. It will appear in the admin queue.</Text>
        <View style={styles.optionRow}>
          {(["feature", "bug", "support"] as const).map((item) => (
            <Pressable key={item} onPress={() => setCategory(item)} style={[styles.option, category === item && styles.optionActive]}>
              <Text style={[styles.optionText, category === item && styles.optionTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <TextField label="Message" value={message} onChangeText={setMessage} placeholder="What would make this better?" multiline />
        <Button
          label="Submit feedback"
          onPress={() => {
            if (!message.trim()) return;
            createFeedback({ message: message.trim(), category });
            setMessage("");
          }}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Account actions</Text>
        <View style={styles.actionStack}>
          <Button label="Switch to admin demo" onPress={() => setRole("admin")} variant="secondary" />
          <Button label="Switch to member demo" onPress={() => setRole("member")} variant="secondary" />
          <Button label="Sign out" onPress={signOut} variant="ghost" />
          <Button
            label="Delete account"
            onPress={() => {
              deleteAccount();
            }}
            variant="ghost"
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  email: {
    color: colors.subtext,
    fontSize: 13,
    marginTop: 4,
  },
  meta: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 8,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  cardBody: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  option: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.subtext,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  optionTextActive: {
    color: colors.primary,
  },
  actionStack: {
    gap: 10,
  },
});
