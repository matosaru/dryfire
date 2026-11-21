export type NumberInputProps = {
  id: string;
  name?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: string;
  hintText: string;
  required?: boolean;
  inputMode?: 'numeric' | 'decimal';
};

/** Native validation and descriptive limits without a client-side setup pass. */
export function NumberInput({ id, min, max, step, hintText, ...input }: NumberInputProps) {
  return <>
    <input {...input} id={id} type="number" min={min} max={max} step={step} aria-describedby={`${id}Limit`} />
    <small id={`${id}Limit`} className="numeric-hint">{`${min}–${max} · ${hintText}`}</small>
  </>;
}
