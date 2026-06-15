import { useState } from 'react';
import QuestionRenderer from './components/QuestionRenderer';
import questions from './config/questions.json';
import type { Answers, Question } from './types/question';

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const typedQuestions = questions as Question[];

  const handleSubmit = (answers: Answers) => {
    console.log('Submitted answers:', answers);
    setSubmitted(true);
  };

  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <h1 style={styles.title}>Application Form</h1>
        <p style={styles.subtitle}>
          Fill in all fields carefully. All required fields must be completed before submitting.
        </p>
      </div>

      {submitted ? (
        <div style={styles.success}>
           Submitted successfully!
        </div>
      ) : (
        <QuestionRenderer
          questions={typedQuestions}
          allowPasting={false}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 1rem',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    maxWidth: '640px',
    margin: '0 auto 2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: 1.6,
  },
  success: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '1.5rem',
    backgroundColor: '#f0fdf4',
    border: '1.5px solid #86efac',
    borderRadius: '8px',
    color: '#15803d',
    fontSize: '1rem',
    fontWeight: 600,
  },
};