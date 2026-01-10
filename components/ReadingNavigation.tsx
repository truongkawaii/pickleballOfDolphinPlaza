import React from "react";
import { ReadingSection } from "../types";

interface Props {
  sections: ReadingSection[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const ReadingNavigation: React.FC<Props> = ({
  sections,
  activeSection,
  onNavigate,
}) => {
  return (
    <nav className="sticky top-4 bg-slate-900/80 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-4 mb-6">
      <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-3">
        Mục Lục
      </h3>
      <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
              activeSection === section.id
                ? "bg-amber-500/20 text-amber-200 font-semibold"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-amber-300"
            }`}
          >
            <span className="mr-2">{idx + 1}.</span>
            {section.title}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ReadingNavigation;
