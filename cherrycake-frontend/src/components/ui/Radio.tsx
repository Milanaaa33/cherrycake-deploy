import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export default function Radio({ label, id, ...props }: RadioProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className="cc-choice">
      <input {...props} id={inputId} type="radio" className="cc-choice-input" />
      <span>{label}</span>
    </label>
  );
}
