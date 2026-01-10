import React, { useState } from "react";
import { ReadingSection as ReadingSectionType } from "../types";
import { parseReadingContent } from "../utils/contentParser";

interface Props {
  section: ReadingSectionType;
  index: number;
}

const ReadingSection: React.FC<Props> = ({ section, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const parsedContent = parseReadingContent(section.content);

  return (
    <div className="mb-4 bg-slate-900/40 border border-amber-500/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {index === 0
              ? "✨"
              : index === 1
              ? "🏛️"
              : index === 2
              ? "👤"
              : index === 3
              ? "👨‍👩‍👧"
              : index === 4
              ? "🍀"
              : index === 5
              ? "🏠"
              : index === 6
              ? "💼"
              : "🤝"}
          </span>
          <h3 className="text-xl font-bold text-amber-200 text-left">
            {section.title}
          </h3>
        </div>
        <svg
          className={`w-6 h-6 text-amber-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 py-6 border-t border-amber-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="prose prose-invert max-w-none">
            {parsedContent.map((item, idx) => {
              switch (item.type) {
                case "subsection-header":
                  return (
                    <h4
                      key={idx}
                      className="text-lg font-bold text-amber-300 mt-6 mb-3 first:mt-0"
                    >
                      {item.content}
                    </h4>
                  );

                case "bullet":
                  return (
                    <div key={idx} className="flex gap-3 mb-3 ml-4">
                      <span className="text-amber-500 mt-1 flex-shrink-0">
                        •
                      </span>
                      <p className="text-slate-300 leading-relaxed flex-1">
                        {item.content}
                      </p>
                    </div>
                  );

                case "nested-bullet":
                  return (
                    <div key={idx} className="flex gap-3 mb-2 ml-12">
                      <span className="text-amber-400/60 mt-1 flex-shrink-0 text-sm">
                        *
                      </span>
                      <p className="text-slate-400 leading-relaxed flex-1 text-sm">
                        {item.content}
                      </p>
                    </div>
                  );

                case "paragraph":
                default:
                  return (
                    <p
                      key={idx}
                      className="text-slate-300 leading-relaxed mb-4"
                    >
                      {item.content}
                    </p>
                  );
              }
            })}

            {section.subsections && section.subsections.length > 0 && (
              <div className="space-y-6 mt-6">
                {section.subsections.map((subsection, idx) => (
                  <div
                    key={idx}
                    className="pl-4 border-l-2 border-amber-500/30"
                  >
                    <h4 className="text-lg font-bold text-amber-300 mb-3">
                      {subsection.title}
                    </h4>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {subsection.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingSection;
