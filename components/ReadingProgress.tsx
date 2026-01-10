import React from "react";

interface Props {
  current: number;
  total: number;
  currentChunkTitle?: string;
}

const ReadingProgress: React.FC<Props> = ({
  current,
  total,
  currentChunkTitle,
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-slate-900/95 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-200 font-bold text-sm">
            Đang luận giải...
          </span>
          <span className="text-amber-400 font-bold">
            {current}/{total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {currentChunkTitle && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="animate-spin">⏳</div>
            <span>{currentChunkTitle}</span>
          </div>
        )}

        <div className="text-center text-amber-300 text-xs mt-2">
          {percentage}% hoàn thành
        </div>
      </div>
    </div>
  );
};

export default ReadingProgress;
