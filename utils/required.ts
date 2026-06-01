export function required(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} is required.`);
  return value.trim();
}
