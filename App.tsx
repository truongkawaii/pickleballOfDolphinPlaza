import React, { useState, useEffect, useRef } from "react";
import {
  UserProfile,
  FortuneResult,
  LoveCompatibility,
  ComprehensiveReading,
  ViewState,
  ReadingChunk,
  ProgressiveReading,
} from "./types";
import {
  getDailyFortune,
  checkLoveCompatibility,
} from "./services/geminiService";
import {
  generateReadingChunks,
  getTotalChunks,
} from "./services/progressiveReadingService";
import ProfileForm from "./components/ProfileForm";
import ReadingSection from "./components/ReadingSection";
import ReadingNavigation from "./components/ReadingNavigation";
import ReadingProgress from "./components/ReadingProgress";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>("HOME");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(
    null
  );
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [progressiveReading, setProgressiveReading] =
    useState<ProgressiveReading | null>(null);
  const [loveResult, setLoveResult] = useState<LoveCompatibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentChunkTitle, setCurrentChunkTitle] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("section-0");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load profile from local storage if exists
  useEffect(() => {
    const saved = localStorage.getItem("thienmenh_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleProfileSubmit = (data: UserProfile) => {
    setProfile(data);
    localStorage.setItem("thienmenh_profile", JSON.stringify(data));
    setView("HOME");
  };

  const handleGetFortune = async () => {
    if (!profile) {
      setView("PROFILE");
      return;
    }
    setLoading(true);
    try {
      const res = await getDailyFortune(profile);
      setFortune(res);
      setView("FORTUNE");
    } catch (err) {
      alert("Năng lượng vũ trụ đang bị nhiễu, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleGetComprehensiveReading = async () => {
    if (!profile) {
      setView("PROFILE");
      return;
    }

    setIsGenerating(true);
    setView("COMPREHENSIVE");
    setActiveSection("section-0");

    const totalChunks = getTotalChunks();
    setProgressiveReading({
      overview: "",
      overviewComplete: false,
      chunks: [],
      totalChunks,
      completedChunks: 0,
    });

    try {
      for await (const chunk of generateReadingChunks(profile)) {
        setCurrentChunkTitle(chunk.title);

        setProgressiveReading((prev) => {
          if (!prev) return null;

          const newChunks = [...prev.chunks, chunk];
          const completed = newChunks.filter((c) => c.isComplete).length;

          return {
            ...prev,
            chunks: newChunks,
            completedChunks: completed,
            overview: chunk.chunkId === 0 ? chunk.content : prev.overview,
            overviewComplete:
              chunk.chunkId === 0 ? chunk.isComplete : prev.overviewComplete,
          };
        });

        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi luận giải. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
      setCurrentChunkTitle("");
    }
  };

  const handleLoveMatch = async (p2: UserProfile) => {
    if (!profile) return;
    setPartnerProfile(p2);
    setLoading(true);
    try {
      const res = await checkLoveCompatibility(profile, p2);
      setLoveResult(res);
      setView("LOVE_RESULT");
    } catch (err) {
      alert("Không thể kết nối nhân duyên lúc này!");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const LoadingScreen = () => (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-amber-200 text-lg animate-pulse serif italic">
        Đang luận giải tinh tú, xin chờ trong giây lát...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen mystic-gradient overflow-x-hidden pb-20">
      {loading && <LoadingScreen />}

      {/* Header */}
      <header className="py-8 px-4 text-center">
        <h1
          className="text-4xl md:text-6xl font-black text-amber-500 mb-2 cursor-pointer transition-transform hover:scale-105"
          onClick={() => setView("HOME")}
        >
          Thiên Mệnh
        </h1>
        <p className="text-slate-400 italic">
          Luận giải vận mệnh - Thấu hiểu nhân duyên
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 flex justify-center items-start min-h-[60vh]">
        {/* HOME VIEW */}
        {view === "HOME" && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={handleGetComprehensiveReading}
              className="group bg-slate-900/40 hover:bg-slate-900/60 border border-amber-500/20 p-10 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <span className="text-4xl">🔮</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-200">
                Luận Giải Tử Vi Toàn Diện
              </h3>
              <p className="text-slate-400">
                Phân tích chi tiết lá số tử vi, các cung mệnh, và vận trình cuộc
                đời.
              </p>
            </div>

            <div
              onClick={handleGetFortune}
              className="group bg-slate-900/40 hover:bg-slate-900/60 border border-amber-500/20 p-10 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-200">
                Xem Tử Vi Hàng Ngày
              </h3>
              <p className="text-slate-400">
                Khám phá vận trình tài lộc, sự nghiệp và sức khỏe của bạn trong
                ngày hôm nay.
              </p>
            </div>

            <div
              onClick={() => setView("LOVE_INPUT")}
              className="group bg-slate-900/40 hover:bg-slate-900/60 border border-pink-500/20 p-10 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <span className="text-4xl">💖</span>
              </div>
              <h3 className="text-2xl font-bold text-pink-200">
                Bói Tình Duyên
              </h3>
              <p className="text-slate-400">
                Xem mức độ tương hợp giữa bạn và người ấy dựa trên các yếu tố
                tâm linh.
              </p>
            </div>

            {!profile && (
              <div className="md:col-span-3 flex justify-center pt-8">
                <button
                  onClick={() => setView("PROFILE")}
                  className="px-8 py-3 bg-slate-800 border border-amber-500/30 rounded-full text-amber-200 hover:bg-slate-700 transition-all"
                >
                  Thiết lập hồ sơ cá nhân
                </button>
              </div>
            )}
            {profile && (
              <div className="md:col-span-3 text-center text-slate-500 text-sm mt-4">
                Đang xem cho:{" "}
                <span className="text-amber-500 font-bold">{profile.name}</span>
                <button
                  onClick={() => setView("PROFILE")}
                  className="ml-2 underline hover:text-amber-400"
                >
                  Đổi thông tin
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {view === "PROFILE" && (
          <ProfileForm
            initialData={profile || undefined}
            onSubmit={handleProfileSubmit}
            title="Hồ Sơ Mệnh Lý"
            buttonText="Lưu Thông Tin"
          />
        )}

        {/* COMPREHENSIVE READING VIEW */}
        {view === "COMPREHENSIVE" && progressiveReading && (
          <>
            {/* Progress Indicator */}
            {isGenerating && (
              <ReadingProgress
                current={progressiveReading.completedChunks}
                total={progressiveReading.totalChunks}
                currentChunkTitle={currentChunkTitle}
              />
            )}

            <div className="w-full">
              {/* Overview Section */}
              {progressiveReading.overviewComplete && (
                <div className="bg-slate-900/60 border border-amber-500/30 p-8 rounded-3xl mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-amber-200 serif">
                      Lá Số Tử Vi Toàn Diện
                    </h2>
                    <button
                      onClick={() => setView("HOME")}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕ Đóng
                    </button>
                  </div>

                  <div className="mb-8 p-6 bg-amber-500/5 rounded-2xl italic border-l-4 border-amber-500 text-lg leading-relaxed text-slate-200">
                    <ReadingSection
                      section={{
                        id: "overview",
                        title: "Tổng Quan",
                        content: progressiveReading.overview,
                      }}
                      index={-1}
                    />
                  </div>
                </div>
              )}

              {/* Chunks Display */}
              <div className="space-y-4">
                {progressiveReading.chunks.map((chunk, idx) => (
                  <div
                    key={chunk.chunkId}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    {chunk.isComplete ? (
                      <ReadingSection
                        section={{
                          id: chunk.sectionId,
                          title: chunk.title,
                          content: chunk.content,
                        }}
                        index={idx}
                      />
                    ) : chunk.error ? (
                      <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-2xl">
                        <h4 className="text-red-400 font-bold mb-2">
                          {chunk.title}
                        </h4>
                        <p className="text-red-300">Lỗi: {chunk.error}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 border border-amber-500/20 p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin text-2xl">⏳</div>
                          <h4 className="text-amber-300 font-bold">
                            {chunk.title}
                          </h4>
                        </div>
                        <p className="text-slate-400 mt-2 text-sm">
                          Đang luận giải...
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading placeholder for next chunk */}
                {isGenerating &&
                  progressiveReading.chunks.length <
                    progressiveReading.totalChunks && (
                    <div className="bg-slate-900/20 border border-amber-500/10 p-6 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="animate-pulse text-amber-500">●</div>
                        <p className="text-slate-500">
                          Chuẩn bị phần tiếp theo...
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </>
        )}

        {/* FORTUNE VIEW */}
        {view === "FORTUNE" && fortune && (
          <div className="w-full bg-slate-900/60 border border-amber-500/30 p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-amber-200 serif">
                Quẻ Tử Vi Hôm Nay
              </h2>
              <button
                onClick={() => setView("HOME")}
                className="text-slate-400 hover:text-white"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="mb-8 p-6 bg-amber-500/5 rounded-2xl italic border-l-4 border-amber-500 text-lg leading-relaxed text-slate-200">
              "{fortune.summary}"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h4 className="text-amber-500 font-bold flex items-center gap-2">
                  <span>💼</span> Sự Nghiệp
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {fortune.career}
                </p>
              </section>
              <section className="space-y-2">
                <h4 className="text-pink-500 font-bold flex items-center gap-2">
                  <span>❤️</span> Tình Cảm
                </h4>
                <p className="text-slate-300 leading-relaxed">{fortune.love}</p>
              </section>
              <section className="space-y-2">
                <h4 className="text-green-500 font-bold flex items-center gap-2">
                  <span>🌱</span> Sức Khỏe
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {fortune.health}
                </p>
              </section>
              <div className="bg-slate-800/50 p-6 rounded-2xl grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="block text-xs text-slate-500 uppercase tracking-widest mb-1">
                    Số May Mắn
                  </span>
                  <span className="text-3xl font-bold text-amber-400">
                    {fortune.luckyNumber}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-xs text-slate-500 uppercase tracking-widest mb-1">
                    Màu Sắc May Mắn
                  </span>
                  <span className="text-lg font-bold text-amber-100">
                    {fortune.luckyColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOVE INPUT VIEW */}
        {view === "LOVE_INPUT" && (
          <ProfileForm
            onSubmit={handleLoveMatch}
            title="Thông Tin Người Ấy"
            buttonText="Xem Kết Quả Tương Hợp"
          />
        )}

        {/* LOVE RESULT VIEW */}
        {view === "LOVE_RESULT" && loveResult && partnerProfile && (
          <div className="w-full bg-slate-900/60 border border-pink-500/30 p-8 rounded-3xl animate-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-pink-200 serif">
                Nhân Duyên Tiền Định
              </h2>
              <button
                onClick={() => setView("HOME")}
                className="text-slate-400 hover:text-white"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="flex flex-col items-center mb-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="rgba(236, 72, 153, 0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth="8"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * loveResult.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">
                    {loveResult.score}%
                  </span>
                  <span className="text-xs text-pink-300 uppercase font-bold">
                    Hợp nhau
                  </span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-xl font-bold text-slate-200">
                  {profile?.name} & {partnerProfile.name}
                </p>
                <p className="text-pink-400 serif italic mt-2 text-lg">
                  "{loveResult.verdict}"
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                  <h5 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                    <span>✅</span> Điểm Cộng
                  </h5>
                  <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                    {loveResult.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                  <h5 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    <span>⚠️</span> Cần Lưu Ý
                  </h5>
                  <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                    {loveResult.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                <h5 className="text-amber-400 font-bold mb-2">
                  Lời Khuyên Của Chuyên Gia
                </h5>
                <p className="text-slate-300 italic">{loveResult.advice}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Call to Action / Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 md:hidden flex justify-around items-center z-40">
        <button
          onClick={() => setView("HOME")}
          className={`flex flex-col items-center p-2 ${
            view === "HOME" ? "text-amber-500" : "text-slate-500"
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] uppercase font-bold mt-1">
            Trang chủ
          </span>
        </button>
        <button
          onClick={handleGetComprehensiveReading}
          className={`flex flex-col items-center p-2 ${
            view === "COMPREHENSIVE" ? "text-amber-500" : "text-slate-500"
          }`}
        >
          <span className="text-xl">🔮</span>
          <span className="text-[10px] uppercase font-bold mt-1">Tử vi</span>
        </button>
        <button
          onClick={() => setView("LOVE_INPUT")}
          className={`flex flex-col items-center p-2 ${
            view === "LOVE_INPUT" || view === "LOVE_RESULT"
              ? "text-pink-500"
              : "text-slate-500"
          }`}
        >
          <span className="text-xl">💖</span>
          <span className="text-[10px] uppercase font-bold mt-1">
            Tình duyên
          </span>
        </button>
        <button
          onClick={() => setView("PROFILE")}
          className={`flex flex-col items-center p-2 ${
            view === "PROFILE" ? "text-blue-500" : "text-slate-500"
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px] uppercase font-bold mt-1">Cá nhân</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
