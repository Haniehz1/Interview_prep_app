import { FeedbackData } from '../App';
import { Loader2 } from 'lucide-react';

interface FeedbackCardProps {
  feedback: FeedbackData;
  onRegenerate: (variation: 'regenerate' | 'shorten' | 'add-metrics') => void;
  isRegenerating: boolean;
}

export function FeedbackCard({ feedback, onRegenerate, isRegenerating }: FeedbackCardProps) {
  const scoreConfig = {
    strong: {
      label: 'Strong',
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300'
    },
    good: {
      label: 'Good',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300'
    },
    'needs-work': {
      label: 'Needs Work',
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300'
    }
  };

  const config = scoreConfig[feedback.score];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      {/* Header with Score Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Feedback</h3>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full border-2 ${config.bg} ${config.text} ${config.border}`}>
          {config.label}
        </span>
      </div>

      {/* Verdict */}
      <div>
        <p className="text-gray-900 leading-relaxed">
          {feedback.verdict}
        </p>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Improved Answer */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-gray-900">Improved Answer</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerate('regenerate')}
              disabled={isRegenerating}
              className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Regenerate'
              )}
            </button>
            <button
              onClick={() => onRegenerate('shorten')}
              disabled={isRegenerating}
              className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Shorten
            </button>
            <button
              onClick={() => onRegenerate('add-metrics')}
              disabled={isRegenerating}
              className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add metrics
            </button>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {feedback.improvedAnswer}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* What to Improve */}
      <div>
        <h4 className="text-gray-900 mb-3">What to Improve</h4>
        <ul className="space-y-2">
          {feedback.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-gray-700 flex-1">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
