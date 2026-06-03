import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { APP_MODULES, CORE_MODULE_KEYS } from "@/constants/modules";
import { AppModuleKey } from "@/types/app";
import {
  getEnabledModules,
  saveEnabledModules,
} from "@/lib/profilePreferences";
import { ModuleCard } from "./ModuleCard";
import { useAppTheme } from "@/theme/ThemeProvider";

type ModulePickerProps = {
  onChange?: (modules: AppModuleKey[]) => void;
};

export function ModulePicker({ onChange }: ModulePickerProps) {
  const { theme } = useAppTheme();
  const [enabledModules, setEnabledModules] =
    useState<AppModuleKey[]>(CORE_MODULE_KEYS);

  useEffect(() => {
    getEnabledModules().then((modules) => {
      setEnabledModules(modules);
      onChange?.(modules);
    });
  }, [onChange]);

  async function toggleModule(moduleKey: AppModuleKey) {
    if (CORE_MODULE_KEYS.includes(moduleKey)) return;

    const exists = enabledModules.includes(moduleKey);

    const nextModules = exists
      ? enabledModules.filter((key) => key !== moduleKey)
      : [...enabledModules, moduleKey];

    const saved = await saveEnabledModules(nextModules);

    setEnabledModules(saved);
    onChange?.(saved);
  }

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>
          Choose what matters
        </Text>
        <Text style={{ color: theme.mutedText, marginTop: 4 }}>
          Your app grows with you. Add only the features you need.
        </Text>
      </View>

      {APP_MODULES.map((module) => {
        const enabled = enabledModules.includes(module.key);

        return (
          <ModuleCard
            key={module.key}
            module={module}
            enabled={enabled}
            onToggle={() => toggleModule(module.key)}
          />
        );
      })}
    </View>
  );
}
