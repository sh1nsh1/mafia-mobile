import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewProps,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ViewProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const baseStyles = [
    styles.base,
    fullWidth && styles.fullWidth,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "outline" && styles.outline,
    size === "sm" && styles.sm,
    size === "md" && styles.md,
    size === "lg" && styles.lg,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && styles.secondaryText,
    variant === "outline" && styles.outlineText,
    size === "sm" && styles.sm,
    size === "md" && styles.md,
    size === "lg" && styles.lg,
  ];

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={baseStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: "#007AFF",
  },
  secondary: {
    backgroundColor: "#6C757D",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  disabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  sm: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lg: {
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textBase: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#007AFF",
  },
});
