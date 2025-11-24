import { SessionState } from '../App';
import { QuestionCard } from './QuestionCard';
import { AnswerInput } from './AnswerInput';
import { FeedbackCard } from './FeedbackCard';

interface RightPanelProps {
  sessionState: SessionState;
  onSubmitAnswer: (answer: string) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onRegenerateImprovedAnswer: (variation: 'regenerate' | 'shorten' | 'add-metrics') => void;
  isGeneratingFeedback: boolean;
}

export function RightPanel({
  sessionState,
  onSubmitAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onRegenerateImprovedAnswer,
  isGeneratingFeedback
}: RightPanelProps) {
  const hasQuestions = Boolean(sessionState.questions);
  const currentQ = sessionState.currentQuestion ?? 0;
  const currentAnswer = sessionState.answers?.[currentQ];
  const hasFeedback = Boolean(currentAnswer?.feedback);
  const totalQuestions = sessionState.questions?.length ?? 0;
  const isLastQuestion = totalQuestions > 0 ? currentQ === totalQuestions - 1 : false;
  const allQuestionsCompleted = Boolean(
    sessionState.answers && 
    totalQuestions > 0 &&
    sessionState.answers.length === totalQuestions && 
    sessionState.answers.every(a => a.feedback)
  );

  if (!hasQuestions) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-gray-900 mb-2">Ready to start?</h3>
          <p className="text-gray-600">
            Complete the setup on the left, then click "Start Interview" to generate your personalized practice questions.
          </p>
        </div>
      </div>
    );
  }

  if (allQuestionsCompleted) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-900 mb-2">Interview Complete! 🎯</h3>
          <p className="text-gray-600">
            You've completed all 5 questions. Scroll through your answers and review the feedback to identify areas for improvement.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Click "Reset" in the top right to start a new practice session.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestionText = sessionState.questions![currentQ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Question Card */}
        <QuestionCard
          questionNumber={currentQ + 1}
          question={currentQuestionText}
        />

        {/* Answer Input */}
        {!hasFeedback && (
          <AnswerInput
            onSubmit={onSubmitAnswer}
            isLoading={isGeneratingFeedback}
            initialValue={currentAnswer?.text}
          />
        )}

        {/* Feedback Card */}
        {hasFeedback && currentAnswer && (
          <>
            <div>
              <h3 className="text-gray-700 mb-3">Your Answer</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{currentAnswer.text}</p>
              </div>
            </div>

            <FeedbackCard
              feedback={currentAnswer.feedback!}
              onRegenerate={onRegenerateImprovedAnswer}
              isRegenerating={isGeneratingFeedback}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {currentQ > 0 && (
                <button
                  onClick={onPreviousQuestion}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Previous Question
                </button>
              )}
              
              {!isLastQuestion && (
                <button
                  onClick={onNextQuestion}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-auto"
                >
                  Next Question →
                </button>
              )}
            </div>

            {isLastQuestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-blue-900">
                  🎉 That was the final question! Review your feedback above to improve your interview skills.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
