import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/Colors";

interface GlowCardProps {
  children: ReactNode;
  style?: ViewStyle;
  glowColor?: string;
}

export function GlowCard({ children, style, glowColor }: GlowCardProps) {
  const shadowColor = glowColor || Colors.mallardGreen;

  return (
    <View
      style={[
        styles.card,
        {
          shadowColor,
          borderColor: `${shadowColor}33`,
        },
        style,
      ]}
    >
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
