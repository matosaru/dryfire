export const NUMBER_INPUTS: Readonly<Record<string, { min: number; max: number; step: number; label: string }>>;
export function parseNumberInput(value: unknown, id: string): number;
export function readNumberInput(input: HTMLInputElement): number;
