import { SessionState } from '../App';
import { RoleSelector } from './RoleSelector';
import { ContextSummary } from './ContextSummary';
import { Upload, Loader2 } from 'lucide-react';
import { useRef } from 'react';

interface LeftPanelProps {
  sessionState: SessionState;
  updateSessionState: (updates: Partial<SessionState>) => void;
  onStartInterview: () => void;
  canStartInterview: boolean;
  isGeneratingQuestions: boolean;
}

export function LeftPanel({
  sessionState,
  updateSessionState,
  onStartInterview,
  canStartInterview,
  isGeneratingQuestions
}: LeftPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please upload a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      updateSessionState({ resume: content });
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasContext = Boolean(
    sessionState.role || 
    sessionState.resume || 
    sessionState.jobDescription
  );

  const interviewStarted = Boolean(sessionState.questions);

  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-8 space-y-8">
        {/* Role Selector */}
        <section>
          <h2 className="text-gray-900 mb-3">Choose your role</h2>
          <RoleSelector
            selectedRole={sessionState.role}
            onSelectRole={(role) => updateSessionState({ role })}
            disabled={interviewStarted}
          />
        </section>

        <div className="h-px bg-gray-200" />

        {/* Your Background */}
        <section>
          <h2 className="text-gray-900 mb-3">Your Background</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Paste your resume
              </label>
              <textarea
                value={sessionState.resume || ''}
                onChange={(e) => updateSessionState({ resume: e.target.value })}
                placeholder="Copy and paste your resume here..."
                rows={6}
                disabled={interviewStarted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Short blurb about you
              </label>
              <textarea
                value={sessionState.shortBlurb || ''}
                onChange={(e) => updateSessionState({ shortBlurb: e.target.value })}
                placeholder="2-3 lines about your background and goals..."
                rows={3}
                disabled={interviewStarted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={interviewStarted}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Upload .txt file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </section>

        <div className="h-px bg-gray-200" />

        {/* Job Description */}
        <section>
          <h2 className="text-gray-900 mb-3">Job Description</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Paste the job description
            </label>
            <textarea
              value={sessionState.jobDescription || ''}
              onChange={(e) => updateSessionState({ jobDescription: e.target.value })}
              placeholder="Copy the full job description here..."
              rows={8}
              disabled={interviewStarted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </section>

        {/* Context Summary */}
        {hasContext && (
          <>
            <div className="h-px bg-gray-200" />
            <ContextSummary sessionState={sessionState} />
          </>
        )}

        {/* Start Interview Button */}
        {!interviewStarted && (
          <button
            onClick={onStartInterview}
            disabled={!canStartInterview || isGeneratingQuestions}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isGeneratingQuestions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating questions...
              </>
            ) : (
              'Start Interview'
            )}
          </button>
        )}

        {/* Interview Status */}
        {interviewStarted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              ✓ Interview in progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
