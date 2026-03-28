import { useTheme } from "@/hooks/useTheme";
import { PARAGRAPH_FONT } from "@/utils/theme";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export type InputProps = TextInputProps & {
  size?: number;
};

export function Input(props: InputProps) {
  const { style, size = 18 } = props;
  const { colors } = useTheme();
  const inputStyle: TextInputProps["style"] = [
    styles.input,
    {
      fontSize: size,
      color: colors.textSecondary,
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.borderPrimary,
    },
    style,
  ];

  return (
    <TextInput
      style={inputStyle}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: PARAGRAPH_FONT,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
