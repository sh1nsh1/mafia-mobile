import { HEADER_FONT, PARAGRAPH_FONT } from "@/utils/theme";
import { ActionSheetOptions, useActionSheet } from "@expo/react-native-action-sheet";
import { useTheme } from "./useTheme";

type StyleKeys =
  | "titleTextStyle"
  | "messageTextStyle"
  | "textStyle"
  | "containerStyle"
  | "separatorStyle"
  | "showSeparators";

type CustomActionSheetOptions = Omit<ActionSheetOptions, StyleKeys>;

export default function useCustomActionSheet() {
  const { showActionSheetWithOptions } = useActionSheet();
  const { colors } = useTheme();

  return (
    options: CustomActionSheetOptions,
    callback: (i?: number) => void | Promise<void>,
  ) => {
    const themeOptions: Pick<ActionSheetOptions, StyleKeys> = {
      titleTextStyle: {
        fontFamily: HEADER_FONT,
        fontSize: 64,
        alignSelf: "center",
        color: colors.textPrimary,
        letterSpacing: 3,
      },
      messageTextStyle: {
        fontFamily: PARAGRAPH_FONT,
        fontSize: 18,
        alignSelf: "center",
        color: colors.textPrimary,
      },
      textStyle: {
        fontFamily: PARAGRAPH_FONT,
        fontSize: 18,
        fontWeight: 600,
        alignSelf: "center",
        color: colors.textPrimary,
      },
      containerStyle: {
        justifyContent: "center",
        alignItems: "stretch",
        padding: 10,
        backgroundColor: colors.backgroundSecondary,
      },
      separatorStyle: {
        backgroundColor: colors.borderPrimary,
        height: 1,
        borderColor: colors.borderPrimary,
      },
      showSeparators: true,
    };

    return showActionSheetWithOptions(
      Object.assign({}, options, themeOptions),
      callback,
    );
  };
}
