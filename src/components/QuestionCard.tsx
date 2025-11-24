interface QuestionCardProps {
  questionNumber: number;
  question: string;
}

export function QuestionCard({ questionNumber, question }: QuestionCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-gray-600">Question {questionNumber}</span>
      </div>
      <p className="text-gray-900 text-lg leading-relaxed">{question}</p>
    </div>
  );
}
