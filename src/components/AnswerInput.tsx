import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function AnswerInput({ onSubmit, isLoading, initialValue }: AnswerInputProps) {
  const [answer, setAnswer] = useState(initialValue || '');

  useEffect(() => {
    if (initialValue) {
      setAnswer(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  return (
    <div>
      <h3 className="text-gray-700 mb-3">Your Answer</h3>
      <div className="space-y-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here... Think about specific examples from your experience."
          rows={12}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          style={{ minHeight: '300px' }}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating feedback...
              </>
            ) : (
              'Get Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
