"use client";

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';

export type RoleCode = 'ai_pm' | 'eng_manager' | 'designer';
export type RoleLabel = 'AI Product Manager' | 'Engineering Manager' | 'Product Designer';

const ROLE_LABEL_TO_CODE: Record<RoleLabel, RoleCode> = {
  'AI Product Manager': 'ai_pm',
  'Engineering Manager': 'eng_manager',
  'Product Designer': 'designer'
};

export interface SessionState {
  role?: RoleLabel;
  resume?: string;
  shortBlurb?: string;
  jobDescription?: string;
  currentQuestion?: number;
  questions?: string[];
  answers?: Array<{
    text: string;
    feedback?: FeedbackData;
  }>;
}

export interface FeedbackData {
  score: 'strong' | 'good' | 'needs-work';
  verdict: string;
  improvedAnswer: string;
  improvements: string[];
}

interface CoachResponseBody {
  score: number;
  summary: string;
  improvedAnswer: string;
  watchouts: string[];
}

const getRoleCode = (role?: RoleLabel): RoleCode | null => {
  if (!role) return null;
  return ROLE_LABEL_TO_CODE[role] ?? null;
};

const mapScore = (score: number): FeedbackData['score'] => {
  if (score >= 4) return 'strong';
  if (score >= 3) return 'good';
  return 'needs-work';
};

async function generateQuestionRequest(params: {
  role: RoleCode;
  resumeText: string;
  blurb: string;
  jobDescription: string;
}): Promise<string> {
  const response = await fetch('/api/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.question) {
    throw new Error(body?.error || 'Failed to generate a question');
  }

  return body.question as string;
}

async function coachAnswerRequest(params: {
  role: RoleCode;
  resumeText: string;
  blurb: string;
  jobDescription: string;
  question: string;
  answer: string;
}): Promise<FeedbackData> {
  const response = await fetch('/api/coach-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const body = (await response.json().catch(() => null)) as CoachResponseBody | { error?: string } | null;
  if (!response.ok || !body || 'error' in (body as Record<string, unknown>)) {
    throw new Error((body as { error?: string })?.error || 'Failed to coach answer');
  }

  const { score, summary, improvedAnswer, watchouts } = body as CoachResponseBody;
  return {
    score: mapScore(score),
    verdict: summary,
    improvedAnswer,
    improvements: Array.isArray(watchouts) ? watchouts : []
  };
}

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('interviewPrepSession');
    if (savedSession) {
      setSessionState(JSON.parse(savedSession));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(sessionState).length > 0) {
      localStorage.setItem('interviewPrepSession', JSON.stringify(sessionState));
    }
  }, [sessionState]);

  const handleStartInterview = async () => {
    const roleCode = getRoleCode(sessionState.role);
    if (!roleCode || !sessionState.resume || !sessionState.jobDescription) {
      alert('Please complete all required fields before starting');
      return;
    }

    setIsGeneratingQuestions(true);

    try {
      const questions: string[] = [];
      for (let i = 0; i < 5; i += 1) {
        const question = await generateQuestionRequest({
          role: roleCode,
          resumeText: sessionState.resume || '',
          blurb: sessionState.shortBlurb || '',
          jobDescription: sessionState.jobDescription || ''
        });
        questions.push(question);
      }

      setSessionState((prev) => ({
        ...prev,
        questions,
        currentQuestion: 0,
        answers: []
      }));
    } catch (error) {
      console.error('Error generating questions', error);
      alert('Something went wrong while generating questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async (answerText: string) => {
    if (!sessionState.questions || sessionState.currentQuestion === undefined) return;

    const roleCode = getRoleCode(sessionState.role);
    if (!roleCode || !sessionState.jobDescription) {
      alert('Missing required context to coach your answer.');
      return;
    }

    const question = sessionState.questions[sessionState.currentQuestion];
    setIsGeneratingFeedback(true);

    try {
      const feedback = await coachAnswerRequest({
        role: roleCode,
        resumeText: sessionState.resume || '',
        blurb: sessionState.shortBlurb || '',
        jobDescription: sessionState.jobDescription,
        question,
        answer: answerText
      });

      const newAnswers = [...(sessionState.answers || [])];
      newAnswers[sessionState.currentQuestion] = { text: answerText, feedback };

      setSessionState((prev) => ({
        ...prev,
        answers: newAnswers
      }));
    } catch (error) {
      console.error('Error coaching answer', error);
      alert('Something went wrong while coaching your answer. Please try again.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    if (!sessionState.questions || sessionState.currentQuestion === undefined) return;
    const lastIndex = sessionState.questions.length - 1;
    if (sessionState.currentQuestion < lastIndex) {
      setSessionState((prev) => ({
        ...prev,
        currentQuestion: (prev.currentQuestion || 0) + 1
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (sessionState.currentQuestion === undefined) return;
    if (sessionState.currentQuestion > 0) {
      setSessionState((prev) => ({
        ...prev,
        currentQuestion: (prev.currentQuestion || 0) - 1
      }));
    }
  };

  const handleRegenerateImprovedAnswer = async (variation: 'regenerate' | 'shorten' | 'add-metrics') => {
    if (!sessionState.questions || sessionState.currentQuestion === undefined) return;
    const currentQ = sessionState.currentQuestion;
    const currentAnswer = sessionState.answers?.[currentQ];
    if (!currentAnswer?.feedback) return;

    if (variation === 'regenerate') {
      const roleCode = getRoleCode(sessionState.role);
      if (!roleCode || !sessionState.jobDescription) {
        alert('Missing required context to coach your answer.');
        return;
      }

      setIsGeneratingFeedback(true);
      try {
        const refreshedFeedback = await coachAnswerRequest({
          role: roleCode,
          resumeText: sessionState.resume || '',
          blurb: sessionState.shortBlurb || '',
          jobDescription: sessionState.jobDescription,
          question: sessionState.questions[currentQ],
          answer: currentAnswer.text
        });

        const newAnswers = [...(sessionState.answers || [])];
        newAnswers[currentQ] = { ...currentAnswer, feedback: refreshedFeedback };
        setSessionState((prev) => ({
          ...prev,
          answers: newAnswers
        }));
      } catch (error) {
        console.error('Error regenerating feedback', error);
        alert('Something went wrong while regenerating feedback. Please try again.');
      } finally {
        setIsGeneratingFeedback(false);
      }
      return;
    }

    let improvedAnswer = currentAnswer.feedback.improvedAnswer;
    if (variation === 'shorten') {
      improvedAnswer = improvedAnswer.split('.').slice(0, 2).join('.').trim();
      if (!improvedAnswer.endsWith('.')) {
        improvedAnswer = `${improvedAnswer}.`;
      }
    } else if (variation === 'add-metrics') {
      improvedAnswer = `${improvedAnswer} I also quantified the impact by tying outcomes to metrics like activation, velocity, and adoption so stakeholders saw clear results.`;
    }

    const newAnswers = [...(sessionState.answers || [])];
    newAnswers[currentQ] = {
      ...currentAnswer,
      feedback: {
        ...currentAnswer.feedback,
        improvedAnswer
      }
    };

    setSessionState((prev) => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const handleClear = () => {
    if (confirm('Clear all progress and start over?')) {
      localStorage.removeItem('interviewPrepSession');
      setSessionState({});
    }
  };

  const updateSessionState = (updates: Partial<SessionState>) => {
    setSessionState((prev) => ({ ...prev, ...updates }));
  };

  const canStartInterview = Boolean(
    sessionState.role &&
    sessionState.resume &&
    sessionState.jobDescription &&
    !sessionState.questions
  );

  const totalQuestions = sessionState.questions?.length ?? 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <LeftPanel
        sessionState={sessionState}
        updateSessionState={updateSessionState}
        onStartInterview={handleStartInterview}
        canStartInterview={canStartInterview}
        isGeneratingQuestions={isGeneratingQuestions}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-gray-900">Interview Prep Coach</h1>

          <div className="flex items-center gap-4">
            {sessionState.questions && sessionState.currentQuestion !== undefined && (
              <span className="text-gray-600">
                Question {sessionState.currentQuestion + 1} of {totalQuestions || '…'}
              </span>
            )}
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <RightPanel
          sessionState={sessionState}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
          onPreviousQuestion={handlePreviousQuestion}
          onRegenerateImprovedAnswer={handleRegenerateImprovedAnswer}
          isGeneratingFeedback={isGeneratingFeedback}
        />
      </div>
    </div>
  );
}
