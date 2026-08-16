import { Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { useCurevo } from "@/state/useCurevoStore";
import { colors, radii } from "@/theme/tokens";

export default function AdminScreen() {
  const { state, updateMemberStatus, updateTicketStatus } = useCurevo();

  if (state.user?.role !== "admin") {
    return <Redirect href="/profile" />;
  }

  const unreadFeedback = state.feedback.filter((item) => item.status === "new").length;
  const openTickets = state.supportTickets.filter((ticket) => ticket.status !== "resolved").length;

  return (
    <Screen>
      <SectionHeader eyebrow="Admin" title="Operations dashboard." body="This is a flat, review-first summary for triage and moderation." />

      <View style={styles.metricRow}>
        <Card><Metric label="Members" value={`${state.members.length}`} /></Card>
        <Card><Metric label="Feedback" value={`${unreadFeedback}`} /></Card>
        <Card><Metric label="Tickets" value={`${openTickets}`} /></Card>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Members</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {state.members.map((member) => (
            <View key={member.id} style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{member.name.slice(0, 1)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{member.name}</Text>
                <Text style={styles.rowMeta}>{member.email} · {member.role} · {member.status}</Text>
              </View>
              <View style={styles.rowActions}>
                <Button label={member.status === "active" ? "Suspend" : "Activate"} onPress={() => updateMemberStatus(member.id, member.status === "active" ? "suspended" : "active")} variant="secondary" compact />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Feedback</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {state.feedback.map((item) => (
            <View key={item.id} style={styles.queueRow}>
              <View style={styles.iconBadge}><MaterialCommunityIcons name="message-text-outline" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.message}</Text>
                <Text style={styles.rowMeta}>{item.category} · {item.status} · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Support tickets</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {state.supportTickets.map((ticket) => (
            <View key={ticket.id} style={styles.queueRow}>
              <View style={styles.iconBadge}><MaterialCommunityIcons name="lifebuoy" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{ticket.subject}</Text>
                <Text style={styles.rowMeta}>{ticket.status} · {new Date(ticket.createdAt).toLocaleDateString()}</Text>
              </View>
              <Button label="Resolve" onPress={() => updateTicketStatus(ticket.id, "resolved")} variant="secondary" compact />
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "900",
  },
  rowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  rowMeta: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  rowActions: {
    alignItems: "flex-end",
  },
  queueRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
