import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import QuestionRenderer from '../components/QuestionRenderer';
import type { Question } from '../types/question';

const textQuestion: Question[] = [
  {
    id: 'fullName',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    validation: { required: true, minLength: 3 },
  },
];

const textareaQuestion: Question[] = [
  {
    id: 'motivation',
    type: 'textarea',
    label: 'Why do you want to join?',
    placeholder: 'Tell us your motivation...',
    validation: { required: true, minLength: 10 },
  },
];

const selectQuestion: Question[] = [
  {
    id: 'educationLevel',
    type: 'select',
    label: 'Highest Education Level',
    options: [
      { label: 'Select an option', value: '' },
      { label: 'High School', value: 'highschool' },
      { label: "Bachelor's Degree", value: 'bachelors' },
    ],
    validation: { required: true },
  },
];

const radioQuestion: Question[] = [
  {
    id: 'preferredTrack',
    type: 'radio',
    label: 'Preferred Track',
    options: [
      { label: 'Frontend', value: 'frontend' },
      { label: 'Backend', value: 'backend' },
      { label: 'Fullstack', value: 'fullstack' },
    ],
    validation: { required: true },
  },
];

const checkboxQuestion: Question[] = [
  {
    id: 'skills',
    type: 'checkbox',
    label: 'Skills You Already Have',
    options: [
      { label: 'HTML', value: 'html' },
      { label: 'CSS', value: 'css' },
      { label: 'JavaScript', value: 'javascript' },
    ],
    validation: { required: true },
  },
];

const allQuestions: Question[] = [
  ...textQuestion,
  ...textareaQuestion,
  ...selectQuestion,
  ...radioQuestion,
  ...checkboxQuestion,
];

describe('QuestionRenderer', () => {
  // Rendering tests
  it('renders text questions correctly', () => {
    render(<QuestionRenderer questions={textQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
  });

  it('renders textarea questions correctly', () => {
    render(<QuestionRenderer questions={textareaQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Why do you want to join?')).toBeInTheDocument();
  });

  it('renders select questions with all options', () => {
    render(<QuestionRenderer questions={selectQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Highest Education Level')).toBeInTheDocument();
    expect(screen.getByText('High School')).toBeInTheDocument();
    expect(screen.getByText("Bachelor's Degree")).toBeInTheDocument();
  });

  it('renders radio questions with all options', () => {
    render(<QuestionRenderer questions={radioQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByText('Preferred Track')).toBeInTheDocument();
    expect(screen.getByLabelText('Frontend')).toBeInTheDocument();
    expect(screen.getByLabelText('Backend')).toBeInTheDocument();
    expect(screen.getByLabelText('Fullstack')).toBeInTheDocument();
  });

  it('renders checkbox questions with all options', () => {
    render(<QuestionRenderer questions={checkboxQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByText('Skills You Already Have')).toBeInTheDocument();
    expect(screen.getByLabelText('HTML')).toBeInTheDocument();
    expect(screen.getByLabelText('CSS')).toBeInTheDocument();
    expect(screen.getByLabelText('JavaScript')).toBeInTheDocument();
  });

  // Submission blocking tests
  it('blocks submission when required text input is empty', () => {
    render(<QuestionRenderer questions={textQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('blocks submission when required textarea is empty', () => {
    render(<QuestionRenderer questions={textareaQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('blocks submission when required select has no value', () => {
    render(<QuestionRenderer questions={selectQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('blocks submission when required radio has no selected option', () => {
    render(<QuestionRenderer questions={radioQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('blocks submission when required checkbox has no selected option', () => {
    render(<QuestionRenderer questions={checkboxQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  // Error message tests
  it('shows error messages for invalid fields', async () => {
    render(<QuestionRenderer questions={textQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    const input = screen.getByLabelText('Full Name');
    await userEvent.click(input);
    await userEvent.tab();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // Submit enabled test
  it('enables submit when all required fields are valid', async () => {
    render(<QuestionRenderer questions={allQuestions} allowPasting={true} onSubmit={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Full Name'), 'Lennox Omondi');
    await userEvent.type(screen.getByLabelText('Why do you want to join?'), 'I want to join because I am serious about becoming a software engineer.');
    await userEvent.selectOptions(screen.getByLabelText('Highest Education Level'), 'bachelors');
    await userEvent.click(screen.getByLabelText('Fullstack'));
    await userEvent.click(screen.getByLabelText('HTML'));

    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
  });

  // Answer format tests
  it('submits text, textarea, select, and radio answers as strings', async () => {
    const onSubmit = vi.fn();
    render(<QuestionRenderer questions={allQuestions} allowPasting={true} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Full Name'), 'Lennox Omondi');
    await userEvent.type(screen.getByLabelText('Why do you want to join?'), 'I want to join because I am serious about becoming a software engineer.');
    await userEvent.selectOptions(screen.getByLabelText('Highest Education Level'), 'bachelors');
    await userEvent.click(screen.getByLabelText('Fullstack'));
    await userEvent.click(screen.getByLabelText('HTML'));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: expect.any(String),
        motivation: expect.any(String),
        educationLevel: expect.any(String),
        preferredTrack: expect.any(String),
      })
    );
  });

  it('submits checkbox answers as an array', async () => {
    const onSubmit = vi.fn();
    render(<QuestionRenderer questions={allQuestions} allowPasting={true} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Full Name'), 'Lennox Omondi');
    await userEvent.type(screen.getByLabelText('Why do you want to join?'), 'I want to join because I am serious about becoming a software engineer.');
    await userEvent.selectOptions(screen.getByLabelText('Highest Education Level'), 'bachelors');
    await userEvent.click(screen.getByLabelText('Fullstack'));
    await userEvent.click(screen.getByLabelText('HTML'));
    await userEvent.click(screen.getByLabelText('CSS'));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: expect.arrayContaining(['html', 'css']),
      })
    );
  });

  // Paste tests
  it('blocks paste into text input when allowPasting is false', () => {
    render(<QuestionRenderer questions={textQuestion} allowPasting={false} onSubmit={vi.fn()} />);
    const input = screen.getByLabelText('Full Name');
    const pasteEvent = fireEvent.paste(input, {
      clipboardData: { getData: () => 'pasted text' },
    });
    expect(pasteEvent).toBe(false);
  });

  it('blocks paste into textarea when allowPasting is false', () => {
    render(<QuestionRenderer questions={textareaQuestion} allowPasting={false} onSubmit={vi.fn()} />);
    const textarea = screen.getByLabelText('Why do you want to join?');
    const pasteEvent = fireEvent.paste(textarea, {
      clipboardData: { getData: () => 'pasted text' },
    });
    expect(pasteEvent).toBe(false);
  });

  it('allows paste into text input and textarea when allowPasting is true', () => {
    render(<QuestionRenderer questions={textQuestion} allowPasting={true} onSubmit={vi.fn()} />);
    const input = screen.getByLabelText('Full Name');
    const pasteEvent = fireEvent.paste(input, {
      clipboardData: { getData: () => 'pasted text' },
    });
    expect(pasteEvent).toBe(true);
  });
});