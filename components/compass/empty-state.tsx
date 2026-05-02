'use client';

import { exampleBriefs, type ExampleBrief } from '@/lib/mock-data';

interface EmptyStateProps {
  onSelectExample: (example: ExampleBrief) => void;
}

export function EmptyState({ onSelectExample }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      {/* Compass Icon */}
      <div className="w-14 h-14 rounded-lg bg-[rgba(127,119,221,0.15)] flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#7F77DD" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="3" stroke="#7F77DD" strokeWidth="1.5"/>
          <line x1="12" y1="3" x2="12" y2="6" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="18" x2="12" y2="21" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="3" y1="12" x2="6" y2="12" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18" y1="12" x2="21" y2="12" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Greeting */}
      <h1 className="text-[22px] font-medium text-[#E8E6F0] mb-3">Hi Sarah</h1>
      <p className="text-[#B4B2A9] text-center max-w-lg mb-8 leading-relaxed">
        What are we working on today? Describe your campaign on the left and pick your filters to surface the highest-value targets across BPI&apos;s data library.
      </p>

      {/* Example Briefs Card */}
      <div className="w-full max-w-xl bg-[#15151A] rounded-lg border border-[rgba(255,255,255,0.08)] p-5">
        <h2 className="text-[#E8E6F0] text-sm font-medium mb-4">Or start with an example</h2>
        <div className="flex flex-col gap-3">
          {exampleBriefs.map((example, index) => (
            <button
              key={index}
              onClick={() => onSelectExample(example)}
              className="flex items-start gap-3 text-left p-3 rounded-md bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
            >
              <span 
                className="px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5"
                style={{ 
                  backgroundColor: `${example.color}20`,
                  color: example.color 
                }}
              >
                {example.category}
              </span>
              <span className="text-[#B4B2A9] text-sm group-hover:text-[#E8E6F0] transition-colors">
                {example.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <p className="text-[#5F5E5A] text-sm mt-8">
        11,560 accounts indexed across journalism, news media, podcasts, sports, entertainment, business, and lifestyle.
      </p>
    </div>
  );
}
