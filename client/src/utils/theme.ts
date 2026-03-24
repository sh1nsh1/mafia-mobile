export type Palette = {
  accentPrimary: string;
  accentSecondary: string;

  backgroundPrimary: string;
  backgroundSecondary: string;

  borderPrimary: string;
  borderSecondary: string;

  foregroundPrimary: string;
  foregroundSecondary: string;

  textPrimary: string;
  textSecondary: string;
};

export const lightColors: Palette = {
  accentPrimary: "#aa0000", // красный (мафия)
  accentSecondary: "#ff5555", // более светлый красный

  backgroundPrimary: "#ffffff", // белый фон
  backgroundSecondary: "#f5f5f5", // чуть серый фон

  borderPrimary: "#dddddd", // светлые границы
  borderSecondary: "#cccccc", // чуть темнее границы

  foregroundPrimary: "#ffffff", // светлый передний план
  foregroundSecondary: "#f0f0f0", // очень светлый

  textPrimary: "#0a0a09", // чёрный текст
  textSecondary: "#666666", // серый вторичный текст
};

export const darkColors: Palette = {
  accentPrimary: "#aa0000", // красный (мафия)
  accentSecondary: "#ff3333", // светлый красный акцент

  backgroundPrimary: "#000000", // чёрный фон
  backgroundSecondary: "#0a0a0a", // чуть светлее чёрный

  borderPrimary: "#14110F", // тёмно‑красная граница
  borderSecondary: "#7E7F83", // чуть светлее

  foregroundPrimary: "#111111", // очень тёмный передний план
  foregroundSecondary: "#1a1a1a", // чуть светлее

  textPrimary: "#ffffff", // белый текст
  textSecondary: "#bbbbbb", // светло‑серый текст
};

export const HEADER_FONT = "NozhikBold";
export const PARAGRAPH_FONT = "IosevkaCharon";
