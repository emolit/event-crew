import { themeColors } from "@/lib/theme";

it("uses the EVENT CREW production palette", () => {
  expect(themeColors).toMatchObject({
    background: "#F2EFE6",
    foreground: "#0A0A09",
    accent: "#F4BD00",
    muted: "#66645D",
    mutedOnDark: "#B9B6AD",
    line: "#CAC7BD",
    danger: "#B83A2D",
  });
});

function relativeLuminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3) {
    throw new Error(`Invalid RGB hex color: ${hex}`);
  }

  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

it.each([
  ["muted text on cream", themeColors.muted, themeColors.background],
  ["muted text on black", themeColors.mutedOnDark, themeColors.foreground],
  ["black text on yellow", themeColors.foreground, themeColors.accent],
])("keeps %s at WCAG AA contrast", (_label, foreground, background) => {
  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
});
