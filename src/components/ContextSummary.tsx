import { SessionState } from '../App';

interface ContextSummaryProps {
  sessionState: SessionState;
}

export function ContextSummary({ sessionState }: ContextSummaryProps) {
  const resumeWordCount = sessionState.resume 
    ? sessionState.resume.trim().split(/\s+/).length 
    : 0;
  
  const jdWordCount = sessionState.jobDescription 
    ? sessionState.jobDescription.trim().split(/\s+/).length 
    : 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm text-gray-700 mb-3">Context Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Role selected:</span>
          <span className="text-gray-900">
            {sessionState.role || '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Resume length:</span>
          <span className="text-gray-900">
            {resumeWordCount > 0 ? `${resumeWordCount} words` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">JD length:</span>
          <span className="text-gray-900">
            {jdWordCount > 0 ? `${jdWordCount} words` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
