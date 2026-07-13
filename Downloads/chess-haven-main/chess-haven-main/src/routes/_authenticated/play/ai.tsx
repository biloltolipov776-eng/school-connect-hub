import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { getAiMove } from "@/lib/chess-ai.functions";
import { applyRatingChange } from "@/lib/rating.functions";
import { flagEmoji, countryName } from "@/lib/countries";

const SearchSchema = z.object({
  init: z.coerce.number().default(300),
  inc: z.coerce.number().default(0),
  cat: z.enum(["bullet", "blitz", "rapid"]).default("blitz"),
  diff: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const Route = createFileRoute("/_authenticated/play/ai")({
  head: () => ({ meta: [{ title: "Партия против ИИ — Шахматы онлайн" }] }),
  validateSearch: SearchSchema,
  component: PlayAI,
});

const BOARD_THEMES: Record<string, { light: string; dark: string }> = {
  classic: { light: "#f0d9b5", dark: "#b58863" },
  wood: { light: "#e8c58c", dark: "#7c4a2a" },
  green: { light: "#eeeed2", dark: "#769656" },
  neon: { light: "#c8f7ff", dark: "#0f6b8f" },
};

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

// Build custom square styles for legal move dots
function buildMoveStyles(
  selectedSq: string | null,
  legalMoves: string[],
  lightColor: string,
  darkColor: string,
): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};

  if (selectedSq) {
    styles[selectedSq] = {
      backgroundColor: "rgba(255, 220, 0, 0.45)",
    };
  }

  for (const sq of legalMoves) {
    // Determine if square is light or dark
    const file = sq.charCodeAt(0) - 97; // a=0 … h=7
    const rank = parseInt(sq[1]) - 1;   // 1=0 … 8=7
    const isLight = (file + rank) % 2 === 0;
    const base = isLight ? lightColor : darkColor;

    styles[sq] = {
      background: `radial-gradient(circle, rgba(0,0,0,0.28) 28%, ${base} 30%)`,
    };
  }

  return styles;
}

function PlayAI() {
  const search = Route.useSearch();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const askAi = useServerFn(getAiMove);
  const applyRating = useServerFn(applyRatingChange);

  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus] = useState<string>("");
  const [thinking, setThinking] = useState(false);
  const [whiteMs, setWhiteMs] = useState(search.init * 1000);
  const [blackMs, setBlackMs] = useState(search.init * 1000);
  const [finished, setFinished] = useState<null | "win" | "loss" | "draw">(null);
  const [ratingResult, setRatingResult] = useState<{ rating: number; delta: number } | null>(null);
  const [flagTooltip, setFlagTooltip] = useState<null | "me" | "ai">(null);

  // Click-to-move state
  const [selectedSq, setSelectedSq] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const lastTickRef = useRef<number>(Date.now());

  const playerColor: "w" | "b" = "w";
  const theme = BOARD_THEMES[profile?.board_theme ?? "classic"] ?? BOARD_THEMES.classic;

  // Clock tick
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      if (game.turn() === "w") setWhiteMs((v) => v - delta);
      else setBlackMs((v) => v - delta);
    }, 200);
    return () => clearInterval(id);
  }, [game, finished]);

  useEffect(() => {
    if (finished) return;
    if (whiteMs <= 0) finish("loss", "Время истекло");
    else if (blackMs <= 0) finish("win", "Время ИИ истекло");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whiteMs, blackMs]);

  const checkEnd = useCallback(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "b" : "w";
      const result: "win" | "loss" = winner === playerColor ? "win" : "loss";
      finish(result, "Мат");
      return true;
    }
    if (game.isStalemate()) { finish("draw", "Пат"); return true; }
    if (game.isThreefoldRepetition()) { finish("draw", "Троекратное повторение"); return true; }
    if (game.isInsufficientMaterial() || game.isDraw()) { finish("draw", "Ничья"); return true; }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const finish = async (result: "win" | "loss" | "draw", reason: string) => {
    if (finished) return;
    setFinished(result);
    setStatus(
      reason + " · " + (result === "win" ? "Победа!" : result === "loss" ? "Поражение" : "Ничья"),
    );
    try {
      const r = await applyRating({ data: { category: search.cat, result } });
      setRatingResult(r);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerAi = async () => {
    if (game.isGameOver() || finished) return;
    if (game.turn() === playerColor) return;
    setThinking(true);
    try {
      const move = await askAi({ data: { fen: game.fen(), difficulty: search.diff } });
      if (move.from && move.to) {
        const m = game.move({ from: move.from, to: move.to, promotion: move.promotion ?? "q" });
        if (m) {
          setFen(game.fen());
          setBlackMs((v) => v + search.inc * 1000);
          if (!checkEnd()) setStatus(game.inCheck() ? "Шах!" : "");
        }
      }
    } finally {
      setThinking(false);
    }
  };

  // Execute a player move from->to
  const executeMove = useCallback(
    (from: string, to: string) => {
      if (finished) return false;
      if (game.turn() !== playerColor) return false;
      try {
        const move = game.move({ from, to, promotion: "q" });
        if (!move) return false;
      } catch {
        return false;
      }
      setFen(game.fen());
      setWhiteMs((v) => v + search.inc * 1000);
      setSelectedSq(null);
      setLegalMoves([]);
      if (!checkEnd()) {
        setStatus(game.inCheck() ? "Шах!" : "");
        setTimeout(() => void triggerAi(), 300);
      }
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, finished, search.inc, checkEnd],
  );

  // Click on a square
  const onSquareClick = useCallback(
    (square: string) => {
      if (finished || game.turn() !== playerColor || thinking) return;

      // If a square is already selected
      if (selectedSq) {
        // Try to move there
        const moved = executeMove(selectedSq, square);
        if (!moved) {
          // Maybe selecting a different own piece
          const piece = game.get(square as Parameters<typeof game.get>[0]);
          if (piece && piece.color === playerColor) {
            setSelectedSq(square);
            const moves = game.moves({ square: square as Parameters<typeof game.moves>[0], verbose: true });
            setLegalMoves(moves.map((m) => m.to));
          } else {
            setSelectedSq(null);
            setLegalMoves([]);
          }
        }
      } else {
        // No piece selected yet — select if own piece
        const piece = game.get(square as Parameters<typeof game.get>[0]);
        if (piece && piece.color === playerColor) {
          setSelectedSq(square);
          const moves = game.moves({ square: square as Parameters<typeof game.moves>[0], verbose: true });
          setLegalMoves(moves.map((m) => m.to));
        }
      }
    },
    [game, finished, selectedSq, playerColor, thinking, executeMove],
  );

  // Drag-and-drop still works too
  const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!targetSquare || finished) return false;
    if (game.turn() !== playerColor) return false;
    const moved = executeMove(sourceSquare, targetSquare);
    if (moved) { setSelectedSq(null); setLegalMoves([]); }
    return moved;
  };

  const aiCountry = "🤖";
  const aiName = "Gemini AI";

  const showFlag = (who: "me" | "ai") => {
    setFlagTooltip(who);
    setTimeout(() => setFlagTooltip((c) => (c === who ? null : c)), 1800);
  };

  const customSquareStyles = useMemo(
    () => buildMoveStyles(selectedSq, legalMoves, theme.light, theme.dark),
    [selectedSq, legalMoves, theme.light, theme.dark],
  );

  const chessboardOptions = useMemo(
    () => ({
      position: fen,
      boardOrientation: "white" as const,
      onPieceDrop: onDrop,
      onSquareClick,
      lightSquareStyle: { backgroundColor: theme.light },
      darkSquareStyle: { backgroundColor: theme.dark },
      customSquareStyles,
      allowDragging: !finished && game.turn() === playerColor && !thinking,
      animationDurationInMs: 200,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fen, theme.light, theme.dark, finished, thinking, customSquareStyles, onSquareClick],
  );

  if (!profile) return <div className="min-h-screen grid place-items-center text-muted-foreground">…</div>;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-3 md:p-4">
        <Link to="/home" className="text-primary text-sm">← В меню</Link>
        <div className="text-sm text-muted-foreground text-center">
          {search.cat === "bullet" ? "Пуля" : search.cat === "blitz" ? "Блиц" : "Рапид"} ·{" "}
          {Math.floor(search.init / 60)}+{search.inc}
        </div>
        <div className="w-16" />
      </header>

      {/* Responsive board wrapper */}
      <div className="max-w-[min(100vw,600px)] mx-auto px-2 md:px-4 pb-10 space-y-2">
        {/* Opponent (AI) header */}
        <div className="card-panel p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full grid place-items-center bg-muted text-xl border border-border flex-shrink-0">🤖</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                className="text-xl relative"
                onClick={() => showFlag("ai")}
                aria-label="Флаг ИИ"
              >
                {aiCountry}
                {flagTooltip === "ai" && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs bg-popover border border-border rounded px-2 py-1 z-10">
                    Искусственный интеллект
                  </span>
                )}
              </button>
              <div className="font-medium text-sm">{aiName}</div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                · {search.diff === "easy" ? "лёгкий" : search.diff === "medium" ? "средний" : "сложный"}
              </div>
            </div>
          </div>
          <div className={`font-mono text-lg tabular-nums px-3 py-1 rounded-lg flex-shrink-0 ${game.turn() === "b" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {fmt(blackMs / 1000)}
          </div>
        </div>

        {/* Board */}
        <div className="card-panel p-2 md:p-3">
          <Chessboard options={chessboardOptions} />
        </div>

        {/* Player header */}
        <div className="card-panel p-3 flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full grid place-items-center bg-muted text-sm border border-border bg-cover bg-center flex-shrink-0"
            style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
          >
            {!profile.avatar_url && profile.nickname[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                className="text-xl relative"
                onClick={() => showFlag("me")}
                aria-label="Мой флаг"
              >
                {flagEmoji(profile.country_code)}
                {flagTooltip === "me" && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs bg-popover border border-border rounded px-2 py-1 z-10">
                    {countryName(profile.country_code)}
                  </span>
                )}
              </button>
              <div className="font-medium text-sm">@{profile.nickname}</div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                · Рейтинг {search.cat === "bullet" ? profile.rating_bullet : search.cat === "blitz" ? profile.rating_blitz : profile.rating_rapid}
              </div>
            </div>
          </div>
          <div className={`font-mono text-lg tabular-nums px-3 py-1 rounded-lg flex-shrink-0 ${game.turn() === "w" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {fmt(whiteMs / 1000)}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between px-2 text-sm">
          <div className="text-muted-foreground">
            {thinking ? "ИИ думает…" : status || (game.turn() === "w" ? "Ваш ход" : "Ход ИИ")}
          </div>
        </div>

        {finished && (
          <div className="card-panel p-6 text-center space-y-3">
            <div className="text-3xl font-bold">
              {finished === "win" ? "🏆 Победа!" : finished === "loss" ? "😔 Поражение" : "🤝 Ничья"}
            </div>
            <div className="text-muted-foreground">{status}</div>
            {ratingResult && (
              <div className="text-lg">
                Рейтинг: <span className="font-bold text-primary">{ratingResult.rating}</span>{" "}
                <span className={ratingResult.delta > 0 ? "text-green-400" : ratingResult.delta < 0 ? "text-destructive" : ""}>
                  ({ratingResult.delta >= 0 ? "+" : ""}
                  {ratingResult.delta})
                </span>
              </div>
            )}
            <button className="btn-primary" onClick={() => navigate({ to: "/home" })}>
              В меню
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
