export { appColors, realmColors, statusColors } from "./colors";
export { zLayers } from "./layers";
export { appMotion } from "./motion";
export { appRadius } from "./radius";
export { appShadows } from "./shadows";
export { appSpacing, touchTargets } from "./spacing";
export { typography } from "./typography";
export { createFoundationStyles, foundationStyles } from "./foundationStyles";
export {
  healthDarkTheme,
  healthDarkShadows,
  healthLightTheme,
  healthRadius,
  healthRealmAccents,
  healthShadows,
  realmAccentWithOpacity,
} from "./healthTheme";
export type { HealthColorTheme } from "./healthTheme";

export function getContrastText(color: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(color);

  if (!match) {
    return "#ffffff";
  }

  const value = match[1];
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 255000;

  return luminance > 0.58 ? "#08111a" : "#ffffff";
}
