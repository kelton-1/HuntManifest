import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lock, LucideIcon } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface InsightCardProps {
  title: string;
  icon: LucideIcon;
  locked?: boolean;
  lockMessage?: string;
  children: ReactNode;
}

export function InsightCard({ title, icon: Icon, locked, lockMessage, children }: InsightCardProps) {
  if (locked) {
    return (
      <View style={[styles.card, styles.locked]}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, styles.iconContainerLocked]}>
            <Lock size={16} color={Colors.darkTextSecondary} />
          </View>
          <Text style={[styles.title, styles.titleLocked]}>{title}</Text>
        </View>
        <Text style={styles.lockMessage}>{lockMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon size={16} color={Colors.mallardGreen} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    gap: 16,
  },
  locked: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${Colors.mallardGreen}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerLocked: {
    backgroundColor: `${Colors.darkTextSecondary}1A`,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.darkText,
  },
  titleLocked: {
    color: Colors.darkTextSecondary,
  },
  lockMessage: {
    fontSize: 14,
    color: Colors.darkTextSecondary,
  },
});
