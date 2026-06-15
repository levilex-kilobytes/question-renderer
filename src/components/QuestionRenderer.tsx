import { useState, useCallback } from 'react';
import type { Question, Answers } from '../types/question';

interface Props {
  questions: Question[];
  allowPasting: boolean;
  onSubmit: (answers: Answers) => void;
}

function validate(question: Question, value: string | string[]): string | null {
  const rules = question.validation;
  if (!rules) return null;

  if (rules.required) {
    if (Array.isArray(value) && value.length === 0) return 'This field is required.';
    if (typeof value === 'string' && value.trim() === '') return 'This field is required.';
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.trim().length < rules.minLength)
      return `Minimum ${rules.minLength} characters required.`;
    if (rules.maxLength && value.trim().length > rules.maxLength)
      return `Maximum ${rules.maxLength} characters allowed.`;
    if (rules.pattern && !new RegExp(rules.pattern).test(value))
      return 'Invalid format.';
  }

  return null;
}

export default function QuestionRenderer({ questions, allowPasting, onSubmit }: Props) {
  const initialAnswers: Answers = Object.fromEntries(
    questions.map((q) => [q.id, q.type === 'checkbox' ? [] : ''])
  );

  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (id: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [id]: value }));
      const question = questions.find((q) => q.id === id)!;
      setErrors((prev) => ({ ...prev, [id]: validate(question, value) }));
    },
    [questions]
  );

  const handleBlur = useCallback(
    (id: string) => {
      setTouched((prev) => ({ ...prev, [id]: true }));
      const question = questions.find((q) => q.id === id)!;
      setErrors((prev) => ({ ...prev, [id]: validate(question, answers[id]) }));
    },
    [questions, answers]
  );

  const handleCheckbox = useCallback(
    (id: string, value: string, checked: boolean) => {
      const current = (answers[id] as string[]) || [];
      const updated = checked ? [...current, value] : current.filter((v) => v !== value);
      handleChange(id, updated);
    },
    [answers, handleChange]
  );

  const preventPaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!allowPasting) e.preventDefault();
    },
    [allowPasting]
  );

  const isFormValid = questions.every((q) => validate(q, answers[q.id]) === null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string | null> = {};
    const newTouched: Record<string, boolean> = {};

    questions.forEach((q) => {
      newErrors[q.id] = validate(q, answers[q.id]);
      newTouched[q.id] = true;
    });

    setErrors(newErrors);
    setTouched(newTouched);

    if (Object.values(newErrors).every((e) => e === null)) {
      onSubmit(answers);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      {questions.map((question) => {
        const error = touched[question.id] ? errors[question.id] : null;
        const errorId = `${question.id}-error`;

        return (
          <div key={question.id} style={styles.fieldGroup}>
            {question.type === 'checkbox' || question.type === 'radio' ? (
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>{question.label}</legend>
                {question.options?.map((option) => (
                  <label key={option.value} style={styles.optionLabel}>
                    <input
                      type={question.type}
                      name={question.id}
                      value={option.value}
                      checked={
                        question.type === 'checkbox'
                          ? (answers[question.id] as string[]).includes(option.value)
                          : answers[question.id] === option.value
                      }
                      onChange={(e) => {
                        if (question.type === 'checkbox') {
                          handleCheckbox(question.id, option.value, e.target.checked);
                        } else {
                          handleChange(question.id, option.value);
                        }
                      }}
                      onBlur={() => handleBlur(question.id)}
                      aria-describedby={error ? errorId : undefined}
                      style={styles.optionInput}
                    />
                    {option.label}
                  </label>
                ))}
                {error && (
                  <p id={errorId} role="alert" style={styles.error}>
                    {error}
                  </p>
                )}
              </fieldset>
            ) : (
              <>
                <label htmlFor={question.id} style={styles.label}>
                  {question.label}
                </label>

                {question.type === 'text' && (
                  <input
                    id={question.id}
                    type="text"
                    value={answers[question.id] as string}
                    placeholder={question.placeholder}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    onBlur={() => handleBlur(question.id)}
                    onPaste={preventPaste}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    style={{
                      ...styles.input,
                      ...(error ? styles.inputError : {}),
                    }}
                  />
                )}

                {question.type === 'textarea' && (
                  <textarea
                    id={question.id}
                    value={answers[question.id] as string}
                    placeholder={question.placeholder}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    onBlur={() => handleBlur(question.id)}
                    onPaste={preventPaste}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    style={{
                      ...styles.input,
                      ...styles.textarea,
                      ...(error ? styles.inputError : {}),
                    }}
                  />
                )}

                {question.type === 'select' && (
                  <select
                    id={question.id}
                    value={answers[question.id] as string}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    onBlur={() => handleBlur(question.id)}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    style={{
                      ...styles.input,
                      ...(error ? styles.inputError : {}),
                    }}
                  >
                    {question.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {error && (
                  <p id={errorId} role="alert" style={styles.error}>
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={!isFormValid}
        style={{
          ...styles.button,
          ...(!isFormValid ? styles.buttonDisabled : {}),
        }}
      >
        Submit
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#111',
  },
  legend: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#111',
    marginBottom: '0.5rem',
  },
  fieldset: {
    border: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    fontSize: '0.95rem',
    border: '1.5px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textarea: {
    minHeight: '120px',
    resize: 'vertical',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#111',
    cursor: 'pointer',
  },
  optionInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  error: {
    fontSize: '0.8rem',
    color: '#ef4444',
    margin: 0,
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#111',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
};