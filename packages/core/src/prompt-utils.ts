export function sanitizePromptValue(value: string) {
  return value
    .replace(/\$imagegen/g, "image generation")
    .replace(/公式LINEロゴ/g, "禁止された公式ロゴ")
    .replace(/審査通過保証/g, "審査前チェック")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 800);
}

export function renderTemplate(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (prompt, [key, value]) =>
      prompt.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}
