import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export type CustomSelectOption = {
  value: string;
  label: string;
  meta?: string;
  disabled?: boolean;
};

type CustomSelectProps = {
  id?: string;
  label?: string;
  ariaLabel?: string;
  value: string;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  compact?: boolean;
  onChange: (value: string) => void;
};

function findNextEnabledIndex(
  options: CustomSelectOption[],
  startIndex: number,
  step: 1 | -1,
): number {
  if (options.length === 0) return -1;
  let index = startIndex;
  for (let i = 0; i < options.length; i += 1) {
    index = (index + step + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

export default function CustomSelect({
  id,
  label,
  ariaLabel,
  value,
  options,
  placeholder = '',
  disabled = false,
  error,
  compact = false,
  onChange,
}: CustomSelectProps) {
  const generatedId = useId();
  const triggerId = id || generatedId;
  const listboxId = `${triggerId}-listbox`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  function openMenu(initialDirection?: 1 | -1) {
    if (disabled || options.length === 0) return;
    const currentIndex = options.findIndex((opt) => opt.value === value && !opt.disabled);
    if (currentIndex >= 0) {
      setActiveIndex(currentIndex);
    } else if (initialDirection === -1) {
      setActiveIndex(findNextEnabledIndex(options, 0, -1));
    } else {
      setActiveIndex(findNextEnabledIndex(options, -1, 1));
    }
    setOpen(true);
  }

  function selectOption(option: CustomSelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu(-1);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => findNextEnabledIndex(options, prev < 0 ? -1 : prev, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => findNextEnabledIndex(options, prev < 0 ? 0 : prev, -1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(findNextEnabledIndex(options, -1, 1));
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(findNextEnabledIndex(options, 0, -1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const activeOption = options[activeIndex];
      if (activeOption && !activeOption.disabled) {
        selectOption(activeOption);
      }
    }
  }

  return (
    <div className="cc-select-field">
      {label && (
        <label htmlFor={triggerId} className="cc-select-label">
          {label}
        </label>
      )}
      <div
        ref={containerRef}
        className={[
          'cc-select',
          open ? 'is-open' : '',
          compact ? 'is-compact' : '',
          error ? 'has-error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className="cc-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-label={ariaLabel}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="cc-select-trigger-content">
            <span
              className={`cc-select-trigger-text${!selectedOption ? ' is-placeholder' : ''}`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.meta && (
              <span className="cc-select-trigger-meta">{selectedOption.meta}</span>
            )}
          </span>
          <span className="cc-select-chevron" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {open && (
          <div id={listboxId} role="listbox" className="cc-select-menu">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={[
                    'cc-select-option',
                    isSelected ? 'is-selected' : '',
                    isActive ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  onClick={() => selectOption(option)}
                >
                  <span className="cc-select-option-label">{option.label}</span>
                  {(option.meta || isSelected) && (
                    <span className="cc-select-option-right">
                      {option.meta && (
                        <span className="cc-select-option-meta">{option.meta}</span>
                      )}
                      {isSelected && (
                        <span className="cc-select-check" aria-hidden="true">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && (
        <small role="alert" className="cc-select-error">
          {error}
        </small>
      )}
    </div>
  );
}
