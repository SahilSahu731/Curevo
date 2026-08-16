import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

export default function NotificationsScreen() {
  const { state, markNotificationRead } = useCurevo();
  const unread = state.notifications.filter((notification) => !notification.isRead).length;

  return (
    <Screen>
      <SectionHeader eyebrow="Notifications" title="In-app reminders and updates." body={`You have ${unread} unread item${unread === 1 ? "" : "s"}.`} />

      {state.notifications.map((notification) => (
        <Card key={notification.id}>
          <View style={styles.row}>
            <View style={[styles.iconBadge, notification.isRead ? styles.read : styles.unread]}>
              <MaterialCommunityIcons name="bell-outline" size={18} color={notification.isRead ? colors.subtext : colors.primary} />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{notification.message}</Text>
              <Text style={styles.meta}>{new Date(notification.createdAt).toLocaleString()} · {notification.type}</Text>
            </View>
            <View style={styles.actions}>
              {notification.isRead ? <Text style={styles.readLabel}>Read</Text> : <Button label="Mark read" onPress={() => markNotificationRead(notification.id)} variant="secondary" compact />}
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  read: {
    backgroundColor: colors.surfaceSoft,
  },
  unread: {
    backgroundColor: colors.primarySoft,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  meta: {
    color: colors.subtext,
    fontSize: 11,
  },
  actions: {
    alignItems: "flex-end",
  },
  readLabel: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: "800",
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
