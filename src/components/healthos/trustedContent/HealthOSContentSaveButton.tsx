import { Bookmark, BookmarkCheck } from "lucide-react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";

type Props = {
  onPress: () => void;
  saved?: boolean;
};

export function HealthOSContentSaveButton({ onPress, saved }: Props) {
  return (
    <HealthOSPill
      icon={saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      label={saved ? "Saved" : "Save"}
      onPress={onPress}
      size="sm"
      variant={saved ? "success" : "glass"}
    />
  );
}
