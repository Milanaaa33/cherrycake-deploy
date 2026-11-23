import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export default function Checkbox({ label, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className="cc-choice">
      <input {...props} id={inputId} type="checkbox" className="cc-choice-input" />
      <span>{label}</span>
    </label>
  );
}
