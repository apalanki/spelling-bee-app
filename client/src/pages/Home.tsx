/**
 * Spelling Bee Adventure — Home Page
 * Design: Sunny Candy Kingdom — candy-pop maximalist, touch-first for Fire tablet
 * Colors: Sky blue bg, hot yellow primary, bubblegum pink accent, mint green success
 * Fonts: Baloo 2 (display/titles), Nunito (body/definitions)
 * Layout: Fixed-height screen. Top ~45% = word info. Bottom ~55% = keyboard.
 * Touch: All tap targets min 60px, no hover states needed, pointer-events for touch
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_WORDS, WORD_GROUPS, type Word } from "@/lib/words";

// ─── Constants ────────────────────────────────────────────────────────────────
const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];
const STORAGE_KEY = "spellingbee_progress_v2";
const BEE_MASCOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663316541527/5QTLgapLzLPi8jWfLnj2vZ/bee-mascot-4t3uRXJ5dyPNkds8NzX4Wv.webp";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663316541527/5QTLgapLzLPi8jWfLnj2vZ/spelling-hero-bg-avX7pJ6gWG9thNoHDsSwXS.webp";
const STAR_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663316541527/5QTLgapLzLPi8jWfLnj2vZ/correct-star-PdjXTMUjXdPEQb9CkqCNY5.webp";

// ─── Progress helpers ─────────────────────────────────────────────────────────
function loadProgress(): Record<number, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveProgress(p: Record<number, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#FFD700","#FF69B4","#00CED1","#FF6347","#7CFC00","#FF1493","#1E90FF","#FFA500","#DA70D6"];
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-20px",
            width: Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
          animate={{ y: "110vh", rotate: [0, 720], opacity: [1, 1, 0] }}
          transition={{ duration: 1.2 + Math.random() * 1.2, delay: Math.random() * 0.6, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ─── Bee mascot ───────────────────────────────────────────────────────────────
type BeeState = "idle" | "happy" | "sad";
function BeeMascot({ state, size = 72 }: { state: BeeState; size?: number }) {
  return (
    <motion.img
      src={BEE_MASCOT}
      alt="Bee"
      className="drop-shadow-lg select-none"
      style={{ width: size, height: size }}
      animate={
        state === "happy" ? { scale: [1, 1.4, 1], rotate: [0, -20, 20, 0] } :
        state === "sad"   ? { x: [0, -10, 10, -10, 10, 0] } :
        { y: [0, -5, 0] }
      }
      transition={
        state === "idle"
          ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
          : { duration: 0.5 }
      }
    />
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
function HomeScreen({ onSelectGroup, progress, onResetProgress }: {
  onSelectGroup: (g: number) => void;
  progress: Record<number, boolean>;
  onResetProgress: () => void;
}) {
  const totalMastered = Object.values(progress).filter(Boolean).length;
  const [showReset, setShowReset] = useState(false);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
        <BeeMascot state="idle" size={64} />
        <div className="flex-1">
          <h1
            className="text-3xl font-extrabold text-yellow-400 leading-tight"
            style={{
              fontFamily: "'Baloo 2', cursive",
              textShadow: "0 3px 0 #b45309, 0 0 20px rgba(251,191,36,0.5)",
            }}
          >
            Spelling Bee Adventure!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-white/40 rounded-full h-4 overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${(totalMastered / ALL_WORDS.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span
              className="text-white font-bold text-sm whitespace-nowrap drop-shadow"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {totalMastered}/{ALL_WORDS.length} ⭐
            </span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowReset(true)}
          className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-lg shadow"
        >
          ⚙️
        </motion.button>
      </div>

      {/* Word group grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {WORD_GROUPS.map((group, idx) => {
            const groupMastered = group.filter(w => progress[w.id]).length;
            const allDone = groupMastered === group.length;
            const inProgress = groupMastered > 0 && !allDone;

            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.92, y: 3 }}
                onClick={() => onSelectGroup(idx)}
                className="relative flex flex-col items-center justify-center rounded-2xl p-3 min-h-[88px] transition-all"
                style={{
                  background: allDone
                    ? "linear-gradient(135deg, #86efac 0%, #4ade80 100%)"
                    : inProgress
                    ? "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                  border: allDone
                    ? "3px solid #16a34a"
                    : inProgress
                    ? "3px solid #d97706"
                    : "3px solid #bae6fd",
                  boxShadow: "0 5px 0 rgba(0,0,0,0.12)",
                }}
              >
                {allDone && <span className="absolute -top-2 -right-2 text-lg">⭐</span>}
                <span
                  className="text-xs font-bold text-gray-500"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Set {idx + 1}
                </span>
                <span
                  className="text-xs font-semibold text-gray-700 text-center leading-tight mt-0.5"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {group[0].word}–{group[group.length - 1].word}
                </span>
                <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center">
                  {group.map(w => (
                    <div
                      key={w.id}
                      className="w-2 h-2 rounded-full"
                      style={{ background: progress[w.id] ? "#22c55e" : "#e2e8f0" }}
                    />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Reset dialog */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowReset(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3
                className="text-xl font-extrabold text-center text-gray-800 mb-2"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                Reset Progress?
              </h3>
              <p
                className="text-sm text-gray-600 text-center mb-4"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                This will clear all your stars and start fresh!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-gray-700 bg-gray-100"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onResetProgress(); setShowReset(false); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #f87171, #ef4444)", fontFamily: "'Nunito', sans-serif" }}
                >
                  Reset ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Practice Screen ──────────────────────────────────────────────────────────
function PracticeScreen({ groupIndex, onBack, progress, onUpdateProgress }: {
  groupIndex: number;
  onBack: () => void;
  progress: Record<number, boolean>;
  onUpdateProgress: (id: number, correct: boolean) => void;
}) {
  const group = WORD_GROUPS[groupIndex];
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [beeState, setBeeState] = useState<BeeState>("idle");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [groupComplete, setGroupComplete] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<Set<string>>(new Set());
  const [spellingIndex, setSpellingIndex] = useState<number>(-1); // active letter during Spell It
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockInput = useRef(false);
  // Stable ref so the word-change useEffect never re-fires due to speakWord identity changes
  const speakWordRef = useRef<(word: string) => void>(() => {});

  const currentWord = group[wordIndex];
  // Only use letters for the answer (handle multi-word, accented chars etc.)
  const targetLetters = currentWord.word.toLowerCase().replace(/[^a-z]/g, "");
  const displayChars = currentWord.word.split("");

  // ── TTS helpers — uses Google Translate audio URL as <Audio> src (no CORS on media elements)
  // Falls back to Web Speech API if audio fails.
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.src = "";
      currentAudio.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  // Build a Google Translate TTS URL — browsers can load audio src cross-origin without CORS
  const gttsUrl = (text: string) =>
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob&ttsspeed=0.8`;

  // Play a single piece of text via Google TTS audio; falls back to Web Speech API
  const playTTS = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      stopAudio();
      const audio = new Audio(gttsUrl(text));
      audio.crossOrigin = "anonymous";
      currentAudio.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => {
        // Fallback: browser Web Speech API
        if ("speechSynthesis" in window) {
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = 0.75; utt.pitch = 1.0; utt.volume = 1.0;
          utt.onend = () => resolve();
          utt.onerror = () => resolve();
          window.speechSynthesis.speak(utt);
        } else {
          resolve();
        }
      };
      audio.play().catch(() => {
        // autoplay blocked — try Web Speech API
        if ("speechSynthesis" in window) {
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = 0.75; utt.pitch = 1.0; utt.volume = 1.0;
          utt.onend = () => resolve();
          utt.onerror = () => resolve();
          window.speechSynthesis.speak(utt);
        } else {
          resolve();
        }
      });
    });
  }, [stopAudio]);

  // Simple one-shot speak (for feedback messages)
  const speak = useCallback((text: string) => {
    playTTS(text).catch(() => {});
  }, [playTTS]);

  // Speak word twice: say it, pause 700ms, say it again
  const speakWord = useCallback((word: string) => {
    stopAudio();
    playTTS(word)
      .then(() => new Promise<void>(r => setTimeout(r, 700)))
      .then(() => playTTS(word))
      .catch(() => {});
  }, [playTTS, stopAudio]);

  // Spell it out letter by letter with visual highlight sync
  const spellWord = useCallback((word: string) => {
    stopAudio();
    setSpellingIndex(-1);
    const letters = word.replace(/[^a-zA-Z]/g, "").split("");

    const spellLetters = (idx: number): Promise<void> => {
      if (idx >= letters.length) {
        setSpellingIndex(-1);
        return Promise.resolve();
      }
      setSpellingIndex(idx);
      return playTTS(letters[idx])
        .then(() => new Promise<void>(r => setTimeout(r, 150)))
        .then(() => spellLetters(idx + 1));
    };

    playTTS(word)
      .then(() => new Promise<void>(r => setTimeout(r, 500)))
      .then(() => spellLetters(0))
      .catch(() => {});
  }, [playTTS, stopAudio]);

  // Keep the ref in sync with the latest speakWord without adding it to the effect deps
  useEffect(() => {
    speakWordRef.current = speakWord;
  });

  // Reset state when word changes — uses ref so this only fires when wordIndex actually changes
  useEffect(() => {
    setTyped([]);
    setFeedback(null);
    setShowDefinition(false);
    setWrongLetters(new Set());
    setSpellingIndex(-1);
    setBeeState("idle");
    blockInput.current = false;
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) speakWordRef.current(currentWord.word);
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIndex]);

  const advanceWord = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setShowConfetti(false);
    if (wordIndex < group.length - 1) {
      setWordIndex(i => i + 1);
    } else {
      setGroupComplete(true);
    }
  }, [wordIndex, group.length]);

  const handleLetterTap = useCallback((letter: string) => {
    if (blockInput.current) return;
    const newTyped = [...typed, letter.toLowerCase()];
    setTyped(newTyped);

    if (newTyped.length === targetLetters.length) {
      blockInput.current = true;
      const attempt = newTyped.join("");
      if (attempt === targetLetters) {
        stopAudio(); // stop any in-progress audio before playing feedback
        setFeedback("correct");
        setBeeState("happy");
        setShowConfetti(true);
        onUpdateProgress(currentWord.id, true);
        speak("Amazing! You got it!");
        feedbackTimer.current = setTimeout(() => {
          stopAudio(); // stop feedback audio before advancing to next word
          advanceWord();
        }, 2000);
      } else {
        stopAudio(); // stop any in-progress audio before playing feedback
        setFeedback("wrong");
        setBeeState("sad");
        const wrong = new Set<string>();
        newTyped.forEach((l, i) => { if (l !== targetLetters[i]) wrong.add(l); });
        setWrongLetters(wrong);
        speak("Oops! Try again!");
        feedbackTimer.current = setTimeout(() => {
          setTyped([]);
          setFeedback(null);
          setBeeState("idle");
          setWrongLetters(new Set());
          blockInput.current = false;
        }, 1400);
      }
    }
  }, [typed, targetLetters, currentWord.id, onUpdateProgress, speakWord, advanceWord]);

  const handleBackspace = useCallback(() => {
    if (blockInput.current) return;
    setTyped(t => t.slice(0, -1));
  }, []);

  // Slot styling
  const getSlotStyle = (letterIndex: number) => {
    if (feedback === "correct") return { bg: "#4ade80", border: "#16a34a", text: "#14532d" };
    if (feedback === "wrong" && letterIndex < typed.length) return { bg: "#fca5a5", border: "#ef4444", text: "#7f1d1d" };
    if (letterIndex < typed.length) return { bg: "#fef3c7", border: "#f59e0b", text: "#78350f" };
    return { bg: "#ffffff", border: "#93c5fd", text: "#1e3a5f" };
  };

  // Group complete screen
  if (groupComplete) {
    const mastered = group.filter(w => progress[w.id]).length;
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg, #86efac 0%, #4ade80 50%, #22c55e 100%)" }}
      >
        <Confetti />
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180 }}
          className="flex flex-col items-center gap-4"
        >
          <img src={STAR_IMG} alt="Star" className="w-28 h-28" />
          <h2
            className="text-4xl font-extrabold text-white drop-shadow-lg text-center"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Set {groupIndex + 1} Done! 🎉
          </h2>
          <p
            className="text-2xl font-bold text-white/90 text-center"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {mastered} / {group.length} words correct!
          </p>
          <div className="flex gap-3 mt-2">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setGroupComplete(false); setWordIndex(0); }}
              className="px-7 py-4 rounded-2xl text-xl font-extrabold text-white shadow-[0_5px_0_rgba(0,0,0,0.2)]"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", fontFamily: "'Baloo 2', cursive" }}
            >
              🔄 Try Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onBack}
              className="px-7 py-4 rounded-2xl text-xl font-extrabold text-white shadow-[0_5px_0_rgba(0,0,0,0.2)]"
              style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)", fontFamily: "'Baloo 2', cursive" }}
            >
              🏠 Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Build letter slot indices for display
  let letterCount = 0;
  const charData = displayChars.map(char => {
    const isLetter = /[a-zA-Z]/.test(char);
    const li = isLetter ? letterCount++ : -1;
    return { char, isLetter, li };
  });

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #c8eeff 50%, #e8f7ff 100%)", height: "100dvh" }}
    >
      {showConfetti && <Confetti />}

      {/* ── TOP SECTION (word info) ── */}
      <div className="flex flex-col flex-shrink-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onPointerDown={(e) => { e.preventDefault(); onBack(); }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold bg-white/70 shadow-[0_4px_0_rgba(0,0,0,0.12)]"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            ←
          </motion.button>

          <div className="flex flex-col items-center">
            <span
              className="text-sm font-bold text-white drop-shadow"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Set {groupIndex + 1} · Word {wordIndex + 1} of {group.length}
            </span>
            {/* Progress dots */}
            <div className="flex gap-1.5 mt-1">
              {group.map((w, i) => (
                <div
                  key={w.id}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === wordIndex ? 20 : 8,
                    height: 8,
                    background: progress[w.id] ? "#4ade80" : i === wordIndex ? "#fbbf24" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          </div>

          <BeeMascot state={beeState} size={56} />
        </div>

        {/* Part of speech */}
        <div className="flex justify-center mt-1">
          <span
            className="px-3 py-0.5 rounded-full text-sm font-bold text-white shadow"
            style={{
              background: "linear-gradient(135deg, #f472b6, #ec4899)",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {currentWord.partOfSpeech}
          </span>
        </div>

        {/* Definition (shown on hint) */}
        <AnimatePresence>
          {showDefinition && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-3 mt-1 bg-white/80 rounded-2xl px-3 py-1.5 shadow"
            >
              <p
                className="text-sm font-semibold text-gray-700 text-center leading-snug"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {currentWord.definition}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letter slots */}
        <div className="flex flex-wrap justify-center gap-1.5 px-3 mt-2">
          {charData.map(({ char, isLetter, li }, i) => {
            if (!isLetter) {
              return (
                <div key={i} className="flex items-center justify-center" style={{ height: 52 }}>
                  <span className="text-2xl font-bold text-gray-600">{char}</span>
                </div>
              );
            }
            const s = getSlotStyle(li);
            const typedChar = typed[li]?.toUpperCase() ?? "";
            const isSpellingActive = spellingIndex === li;
            return (
              <motion.div
                key={i}
                animate={
                  isSpellingActive
                    ? { scale: [1, 1.25, 1], y: [0, -6, 0] }
                    : feedback === "wrong" && li < typed.length
                    ? { x: [0, -7, 7, -7, 7, 0] }
                    : feedback === "correct"
                    ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }
                    : {}
                }
                transition={{ duration: isSpellingActive ? 0.35 : 0.4, delay: isSpellingActive ? 0 : li * 0.04 }}
                className="flex items-center justify-center rounded-xl font-extrabold text-2xl"
                style={{
                  width: 46,
                  height: 52,
                  background: isSpellingActive ? "#fbbf24" : s.bg,
                  border: isSpellingActive ? "3px solid #d97706" : `3px solid ${s.border}`,
                  color: isSpellingActive ? "#78350f" : s.text,
                  boxShadow: isSpellingActive ? "0 4px 0 #d97706, 0 0 12px rgba(251,191,36,0.6)" : "0 4px 0 rgba(0,0,0,0.12)",
                  fontFamily: "'Baloo 2', cursive",
                  transition: "background 0.1s, border-color 0.1s",
                }}
              >
                {/* Show the letter during spelling mode even if not typed yet */}
                {isSpellingActive
                  ? currentWord.word.replace(/[^a-zA-Z]/g, "")[li]?.toUpperCase() ?? typedChar
                  : typedChar}
              </motion.div>
            );
          })}
        </div>

        {/* Feedback banner */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mx-3 mt-1.5 py-1.5 rounded-2xl text-center font-extrabold text-lg shadow-lg"
              style={{
                background: feedback === "correct"
                  ? "linear-gradient(135deg, #4ade80, #22c55e)"
                  : "linear-gradient(135deg, #fca5a5, #ef4444)",
                color: "white",
                fontFamily: "'Baloo 2', cursive",
              }}
            >
              {feedback === "correct"
                ? "🌟 Amazing! Correct! 🌟"
                : "❌ Not quite! Try again! 🎯"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!feedback && (
          <div className="flex flex-col items-center gap-1.5 mt-1.5 px-3">
            {/* Row 1: primary audio buttons */}
            <div className="flex justify-center gap-2 w-full">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => { e.preventDefault(); speakWord(currentWord.word); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.15)]"
                style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)", fontFamily: "'Nunito', sans-serif", fontSize: 15 }}
              >
                🔊 Hear Word
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => { e.preventDefault(); spellWord(currentWord.word); }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.15)]"
                style={{ background: "linear-gradient(135deg, #fb923c, #f97316)", fontFamily: "'Nunito', sans-serif", fontSize: 15 }}
              >
                🔤 Spell It
              </motion.button>
            </div>
            {/* Row 2: hint + skip */}
            <div className="flex justify-center gap-2 w-full">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => { e.preventDefault(); setShowDefinition(v => !v); speak(currentWord.definition); }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-2xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.12)]"
                style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", fontFamily: "'Nunito', sans-serif", fontSize: 14 }}
              >
                💡 Hint
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => { e.preventDefault(); advanceWord(); }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-2xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.12)]"
                style={{ background: "linear-gradient(135deg, #94a3b8, #64748b)", fontFamily: "'Nunito', sans-serif", fontSize: 14 }}
              >
                ⏭ Skip
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* ── KEYBOARD SECTION (fills remaining space) ── */}
      <div
        className="flex flex-col justify-evenly pb-2 pt-2 flex-1"
        style={{
          background: "rgba(255,255,255,0.35)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -3px 12px rgba(0,0,0,0.08)",
        }}
      >
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center" style={{ gap: "calc((100vw - 10px) / 10 * 0.08)" }}>
            {row.map(letter => {
              const lLower = letter.toLowerCase();
              const isWrong = wrongLetters.has(lLower);
              const keyW = `calc((100vw - 10px) / 10 * 0.88)`;
              return (
                <motion.button
                  key={letter}
                  whileTap={{ scale: 0.85, y: 4 }}
                  onPointerDown={(e) => { e.preventDefault(); handleLetterTap(letter); }}
                  className="flex items-center justify-center rounded-xl font-extrabold select-none"
                  style={{
                    width: keyW,
                    height: 64,
                    fontSize: 26,
                    background: isWrong
                      ? "linear-gradient(180deg, #fca5a5 0%, #ef4444 100%)"
                      : "linear-gradient(180deg, #ffffff 0%, #dbeafe 100%)",
                    border: isWrong ? "3px solid #dc2626" : "3px solid #93c5fd",
                    color: isWrong ? "white" : "#1e3a5f",
                    boxShadow: "0 5px 0 rgba(0,0,0,0.14)",
                    fontFamily: "'Baloo 2', cursive",
                    touchAction: "none",
                    flexShrink: 0,
                  }}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        ))}

        {/* Backspace row */}
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.92, y: 3 }}
            onPointerDown={(e) => { e.preventDefault(); handleBackspace(); }}
            className="flex items-center justify-center gap-2 rounded-xl font-extrabold select-none"
            style={{
              height: 64,
              width: "calc((100vw - 10px) / 10 * 3.5)",
              fontSize: 22,
              background: "linear-gradient(180deg, #fde68a 0%, #fbbf24 100%)",
              border: "3px solid #d97706",
              color: "#78350f",
              boxShadow: "0 5px 0 rgba(0,0,0,0.14)",
              fontFamily: "'Baloo 2', cursive",
              touchAction: "none",
            }}
          >
            ⌫ Delete
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState<"home" | "practice">("home");
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [progress, setProgress] = useState<Record<number, boolean>>(loadProgress);

  const handleUpdateProgress = useCallback((id: number, correct: boolean) => {
    setProgress(prev => {
      const next = { ...prev, [id]: correct || !!prev[id] };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleResetProgress = useCallback(() => {
    setProgress({});
    saveProgress({});
  }, []);

  return (
    <>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior: none; overflow: hidden; }
      `}</style>
      {screen === "home" ? (
        <HomeScreen
          onSelectGroup={(g) => { setSelectedGroup(g); setScreen("practice"); }}
          progress={progress}
          onResetProgress={handleResetProgress}
        />
      ) : (
        <PracticeScreen
          groupIndex={selectedGroup}
          onBack={() => setScreen("home")}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
        />
      )}
    </>
  );
}
