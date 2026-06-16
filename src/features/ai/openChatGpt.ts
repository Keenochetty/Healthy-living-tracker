import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

import { CHATGPT_BRIDGE_CONFIG } from "./chatGptBridgeConfig";

export async function openChatGpt(): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(CHATGPT_BRIDGE_CONFIG.chatGptUrl);
  } catch {
    await Linking.openURL(CHATGPT_BRIDGE_CONFIG.chatGptUrl);
  }
}
