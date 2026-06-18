import { View } from "react-native";

import { AppBadge, AppCard, AppScreen, AppText } from "@/components/ui-native";
import {
  healthOSRouteAliases,
  healthOSRouteRegistry,
  validateHealthOSRoutes,
} from "@/features/healthosRouting";

export default function HealthOSRouteMatrixScreen() {
  const validation = validateHealthOSRoutes();

  return (
    <AppScreen>
      <View className="gap-2">
        <AppText variant="display">Route Matrix</AppText>
        <AppText variant="bodyMuted">
          Dev-only QA view for HealthOS route wiring, bottom navigation, aliases,
          and sensitive route flags.
        </AppText>
      </View>

      <AppCard className="gap-2" variant="compact">
        <View className="flex-row flex-wrap gap-2">
          <AppBadge variant={validation.isValid ? "success" : "danger"}>
            {validation.isValid ? "Contract valid" : "Contract mismatch"}
          </AppBadge>
          <AppBadge>Bottom nav: {validation.visibleBottomNavKeys.join(", ")}</AppBadge>
        </View>
        <AppText variant="caption">
          Required visible tabs: {validation.bottomNavKeys.join(", ")}.
        </AppText>
      </AppCard>

      <View className="gap-3">
        {healthOSRouteRegistry.map((route) => (
          <AppCard className="gap-2" key={route.key} variant="compact">
            <View className="flex-row flex-wrap items-center gap-2">
              <AppText className="flex-1" variant="label">
                {route.title}
              </AppText>
              <AppBadge variant={route.visibleInBottomNav ? "info" : "neutral"}>
                {route.visibleInBottomNav ? "Bottom nav" : route.status}
              </AppBadge>
              {route.sensitive ? <AppBadge variant="private">Sensitive</AppBadge> : null}
            </View>
            <AppText variant="caption">{String(route.path)}</AppText>
            <AppText variant="caption">
              Group: {route.group} | Entry: {route.entryPoints.join(", ")}
            </AppText>
            {route.notes ? <AppText variant="caption">{route.notes}</AppText> : null}
          </AppCard>
        ))}
      </View>

      <View className="gap-3">
        <AppText variant="subtitle">Aliases</AppText>
        {healthOSRouteAliases.map((alias) => (
          <AppCard className="gap-1" key={String(alias.aliasPath)} variant="compact">
            <AppText variant="label">
              {String(alias.aliasPath)} {"->"} {String(alias.targetPath)}
            </AppText>
            <AppText variant="caption">
              {alias.existsAsFile ? "Alias route exists" : "Alias path not present"}
            </AppText>
            {alias.notes ? <AppText variant="caption">{alias.notes}</AppText> : null}
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}
