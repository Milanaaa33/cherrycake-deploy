import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

type DatePickerProps = {
  id?: string;
  label?: string;
  value: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, idx) =>
    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + idx),
  );
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DatePicker({
  id,
  label,
  value,
  min,
  max,
  disabled = false,
  error,
  onChange,
}: DatePickerProps) {
  const { t, language } = useTranslation();
  const generatedId = useId();
  const triggerId = id || generatedId;
  const dialogId = `${triggerId}-calendar`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [todayDate] = useState(getTodayDate);
  const todayIso = useMemo(() => toIsoDate(todayDate), [todayDate]);

  const initialAnchor = useMemo(
    () => parseIsoDate(value) ?? (min ? parseIsoDate(min) : null) ?? todayDate,
    [value, min, todayDate],
  );

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialAnchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialAnchor.getMonth());

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const parsedValue = useMemo(() => parseIsoDate(value), [value]);

  const formattedDisplay = useMemo(() => {
    if (!parsedValue) return value || t('calendar.chooseDate', 'Choose date');
    try {
      return new Intl.DateTimeFormat(language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parsedValue);
    } catch {
      return value;
    }
  }, [parsedValue, value, language, t]);

  const monthTitle = useMemo(() => {
    const sample = new Date(viewYear, viewMonth, 1);
    try {
      const raw = new Intl.DateTimeFormat(language, {
        month: 'long',
        year: 'numeric',
      }).format(sample);
      return capitalize(raw);
    } catch {
      return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    }
  }, [viewYear, viewMonth, language]);

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => {
      const refDate = new Date(2024, 0, 1 + i); // Jan 1, 2024 is Monday
      return formatter.format(refDate).replace(/\.$/, '');
    });
  }, [language]);

  const days = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevDisabled = useMemo(() => {
    if (!min) return false;
    const lastDayOfPrevMonth = toIsoDate(new Date(viewYear, viewMonth, 0));
    return lastDayOfPrevMonth < min;
  }, [min, viewYear, viewMonth]);

  const nextDisabled = useMemo(() => {
    if (!max) return false;
    const firstDayOfNextMonth = toIsoDate(new Date(viewYear, viewMonth + 1, 1));
    return firstDayOfNextMonth > max;
  }, [max, viewYear, viewMonth]);

  const todayDisabled =
    (Boolean(min) && todayIso < (min as string)) ||
    (Boolean(max) && todayIso > (max as string));

  function toggleCalendar() {
    if (disabled) return;
    if (!open) {
      const anchor = parseIsoDate(value) ?? (min ? parseIsoDate(min) : null) ?? todayDate;
      setViewYear(anchor.getFullYear());
      setViewMonth(anchor.getMonth());
    }
    setOpen((prev) => !prev);
  }

  function stepMonth(delta: -1 | 1) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function pickDate(iso: string) {
    onChange(iso);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="cc-date-field">
      {label && (
        <label htmlFor={triggerId} className="cc-date-label">
          {label}
        </label>
      )}
      <div
        ref={containerRef}
        className={[
          'cc-date',
          open ? 'is-open' : '',
          error ? 'has-error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className="cc-date-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onClick={toggleCalendar}
        >
          <span className={`cc-date-trigger-text${!parsedValue ? ' is-placeholder' : ''}`}>
            {formattedDisplay}
          </span>
          <span className="cc-date-icon" aria-hidden="true">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
        </button>

        {open && (
          <div
            id={dialogId}
            role="dialog"
            aria-label={label || t('calendar.chooseDate', 'Choose date')}
            className="cc-date-popover"
          >
            <div className="cc-date-header">
              <h4 className="cc-date-month-title">{monthTitle}</h4>
              <div className="cc-date-nav-group">
                <button
                  type="button"
                  className="cc-date-nav-btn"
                  aria-label={t('calendar.prevMonth', 'Previous month')}
                  disabled={prevDisabled}
                  onClick={() => stepMonth(-1)}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="cc-date-nav-btn"
                  aria-label={t('calendar.nextMonth', 'Next month')}
                  disabled={nextDisabled}
                  onClick={() => stepMonth(1)}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="cc-date-weekdays" aria-hidden="true">
              {weekdayLabels.map((wd) => (
                <span key={wd}>{wd}</span>
              ))}
            </div>

            <div className="cc-date-grid">
              {days.map((dayDate) => {
                const iso = toIsoDate(dayDate);
                const isCurrentMonth =
                  dayDate.getFullYear() === viewYear && dayDate.getMonth() === viewMonth;
                const isSelected = iso === value;
                const isToday = iso === todayIso;
                const isDisabled =
                  (Boolean(min) && iso < (min as string)) ||
                  (Boolean(max) && iso > (max as string));

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    className={[
                      'cc-date-day',
                      !isCurrentMonth ? 'is-outside' : '',
                      isToday ? 'is-today' : '',
                      isSelected ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => pickDate(iso)}
                  >
                    {dayDate.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="cc-date-footer">
              <button
                type="button"
                className="cc-date-footer-btn is-today-btn"
                disabled={todayDisabled}
                onClick={() => pickDate(todayIso)}
              >
                {t('calendar.today', 'Today')}
              </button>
              <button
                type="button"
                className="cc-date-footer-btn is-close-btn"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <small role="alert" className="cc-date-error">
          {error}
        </small>
      )}
    </div>
  );
}
