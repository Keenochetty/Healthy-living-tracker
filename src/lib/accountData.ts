import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/lib/supabase";
import { clearAllLocalNotificationsForUser } from "@/services/reminders/notificationService";

export const ACCOUNT_DELETION_CONFIRMATION = "DELETE MY ACCOUNT";

type ExportResponse = {
  error?: string;
  export?: Record<string, unknown>;
  ok: boolean;
  status?: string;
};

type DeleteResponse = {
  error?: string;
  message?: string;
  ok: boolean;
  status?: string;
};

export async function requestServerDataExport(categories: string[]) {
  const { data, error } = await supabase.functions.invoke<ExportResponse>(
    "data-export",
    { body: { categories } },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok || !data.export)
    throw new Error(data?.error ?? "Data export failed.");
  return data.export;
}

export async function deleteAuthenticatedAccount(confirmation: string) {
  const { data, error } = await supabase.functions.invoke<DeleteResponse>(
    "delete-account",
    {
      body: { acknowledgeRetention: true, confirmation },
    },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok || data.status !== "completed")
    throw new Error(data?.error ?? "Account deletion did not complete.");
  return data;
}

export async function clearLocalUserState() {
  await clearAllLocalNotificationsForUser().catch(() => undefined);
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  await AsyncStorage.clear();
}
