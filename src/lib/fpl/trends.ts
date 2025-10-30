// Minimal placeholders for trend helpers. Real trend uses history; v1.1 uses current signals.

export function normalize(value: number, min = 0, max = 10): number {
	if (!Number.isFinite(value)) return 0;
	const clamped = Math.max(min, Math.min(max, value));
	return (clamped - min) / (max - min);
}

export function slopeSimple(values: number[]): number {
	if (values.length < 2) return 0;
	return values[values.length - 1] - values[0];
}
