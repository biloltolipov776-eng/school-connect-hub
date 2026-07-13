import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
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
  wood:    { light: "#e8c58c", dark: "#7c4a2a" },
  green:   { light: "#eeeed2", dark: "#769656" },
  neon:    { light: "#c8f7ff", dark: "#0f6b8f" },
};

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

/** Build square highlight styles: selected square + legal-move dots + premove */
function buildSquareStyles(
  selectedSq: string | null,
  legalTargets: string[],
  premoveSq: string | null,
  premoveTargets: string[],
  lightColor: string,
  darkColor: string,
): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};

  if (selectedSq) {
    styles[selectedSq] = { backgroundColor: "rgba(255, 220, 0, 0.45)" };
  }

  for (const sq of legalTargets) {
    const file = sq.charCodeAt(0) - 97;
    const rank = parseInt(sq[1]) - 1;
    const isLight = (file + rank) % 2 === 0;
    styles[sq] = {
      background: `radial-gradient(circle, rgba(0,0,0,0.30) 28%, ${isLight ? lightColor : darkColor} 30%)`,
      cursor: "pointer",
    };
  }

  // Premove highlights (purple/blue)
  if (premoveSq) {
    styles[premoveSq] = { backgroundColor: "rgba(100, 120, 255, 0.55)" };
  }
  for (const sq of premoveTargets) {
    styles[sq] = { backgroundColor: "rgba(100, 120, 255, 0.35)" };
  }

  return styles;
}

function PlayAI() {
  const search = Route.useSearch();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const askAi   = useServerFn(getAiMove);
  const applyRating = useServerFn(applyRatingChange);

  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus]   = useState<string>("");
  const [thinking, setThinking] = useState(false);
  const [whiteMs, setWhiteMs] = useState(search.init * 1000);
  const [blackMs, setBlackMs] = useState(search.init * 1000);
  const [finished, setFinished] = useState<null | "win" | "loss" | "draw">(null);
  const [ratingResult, setRatingResult] = useState<{ rating: number; delta: number } | null>(null);
  const [flagTooltip, setFlagTooltip] = useState<null | "me" | "ai">(null);

  // Click-to-move state
  const [selectedSq,   setSelectedSq]   = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);

  // Premove state (fires when it becomes player's turn again)
  const [premoveSq,      setPremoveSq]      = useState<string | null>(null);
  const [premoveTarget,  setPremoveTarget]  = useState<string | null>(null);
  const [premoveTargets, setPremoveTargets] = useState<string[]>([]);
  const premoveEnabled = profile?.premoves_enabled ?? true;

  const lastTickRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  const playerColor: "w" | "b" = "w";
  const theme = BOARD_THEMES[profile?.board_theme ?? "classic"] ?? BOARD_THEMES.classic;

  // ── Clock ────────────────────────────────────────────────────────────────
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
    if (whiteMs <= 0) void doFinish("loss", "Время истекло");
    else if (blackMs <= 0) void doFinish("win", "Время ИИ истекло");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whiteMs, blackMs]);

  // ── Game-end helpers ─────────────────────────────────────────────────────
  const checkEnd = useCallback((): boolean => {
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "b" : "w";
      void doFinish(winner === playerColor ? "win" : "loss", "Мат");
      return true;
    }
    if (game.isStalemate())           { void doFinish("draw", "Пат");                       return true; }
    if (game.isThreefoldRepetition()) { void doFinish("draw", "Троекратное повторение");    return true; }
    if (game.isInsufficientMaterial() || game.isDraw()) { void doFinish("draw", "Ничья");  return true; }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const doFinish = async (result: "win" | "loss" | "draw", reason: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(result);
    setStatus(reason + " · " + (result === "win" ? "Победа!" : result === "loss" ? "Поражение" : "Ничья"));
    try {
      const r = await applyRating({ data: { category: search.cat, result } });
      setRatingResult(r);
    } catch (e) { console.error(e); }
  };

  // ── AI move ──────────────────────────────────────────────────────────────
  const triggerAi = useCallback(async () => {
    if (game.isGameOver() || finishedRef.current) return;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, checkEnd, search]);

  // After AI move, fire queued premove if any
  useEffect(() => {
    if (thinking || finished || game.turn() !== playerColor) return;
    if (!premoveEnabled || !premoveSq || !premoveTarget) return;
    const from = premoveSq;
    const to   = premoveTarget;
    setPremoveSq(null);
    setPremoveTarget(null);
    setPremoveTargets([]);
    try {
      const m = game.move({ from, to, promotion: "q" });
      if (m) {
        setFen(game.fen());
        setWhiteMs((v) => v + search.inc * 1000);
        if (!checkEnd()) {
          setStatus(game.inCheck() ? "Шах!" : "");
          setTimeout(() => void triggerAi(), 300);
        }
      }
    } catch { /* premove was illegal — just discard */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thinking, game.turn()]);

  // ── Execute player move immediately ─────────────────────────────────────
  const executePlayerMove = useCallback((from: string, to: string): boolean => {
    if (finishedRef.current) return false;
    if (game.turn() !== playerColor) return false;
    try {
      const move = game.move({ from, to, promotion: "q" });
      if (!move) return false;
    } catch { return false; }
    setFen(game.fen());
    setWhiteMs((v) => v + search.inc * 1000);
    setSelectedSq(null);
    setLegalTargets([]);
    if (!checkEnd()) {
      setStatus(game.inCheck() ? "Шах!" : "");
      setTimeout(() => void triggerAi(), 300);
    }
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, checkEnd, triggerAi, search.inc]);

  // ── Click-to-move handler ────────────────────────────────────────────────
  const onSquareClick = useCallback((square: string) => {
    if (finishedRef.current) return;

    // It's AI's turn — register premove if enabled
    if (game.turn() !== playerColor) {
      if (!premoveEnabled) return;
      if (premoveSq) {
        // Second click = confirm premove destination
        setPremoveTarget(square);
        // Show which squares are threatened (for UI)
        setPremoveTargets([square]);
        setPremoveSq(null);
      } else {
        // First click during AI turn = select premove origin
        const piece = game.get(square as Parameters<typeof game.get>[0]);
        if (piece && piece.color === playerColor) {
          setPremoveSq(square);
          // Tentatively show where this piece could move (ignoring turn)
          const tentative = game.moves({ square: square as Parameters<typeof game.moves>[0], verbose: true });
          setPremoveTargets(tentative.map((m) => m.to));
        }
      }
      return;
    }

    // It's player's turn
    if (selectedSq) {
      if (selectedSq === square) {
        // Deselect
        setSelectedSq(null);
        setLegalTargets([]);
        return;
      }
      const moved = executePlayerMove(selectedSq, square);
      if (!moved) {
        // Maybe re-selecting a different own piece
        const piece = game.get(square as Parameters<typeof game.get>[0]);
        if (piece && piece.color === playerColor) {
          setSelectedSq(square);
          const moves = game.moves({ square: square as Parameters<typeof game.moves>[0], verbose: true });
          setLegalTargets(moves.map((m) => m.to));
        } else {
          setSelectedSq(null);
          setLegalTargets([]);
        }
      }
    } else {
      const piece = game.get(square as Parameters<typeof game.get>[0]);
      if (piece && piece.color === playerColor) {
        setSelectedSq(square);
        const moves = game.moves({ square: square as Parameters<typeof game.moves>[0], verbose: true });
        setLegalTargets(moves.map((m) => m.to));
      }
    }
  }, [game, selectedSq, premoveSq, premoveEnabled, playerColor, executePlayerMove]);

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!targetSquare || finishedRef.current) return false;

    // Dragging during AI turn = set premove
    if (game.turn() !== playerColor) {
      if (!premoveEnabled) return false;
      const piece = game.get(sourceSquare as Parameters<typeof game.get>[0]);
      if (piece && piece.color === playerColor) {
        setPremoveSq(sourceSquare);
        setPremoveTarget(targetSquare);
        setPremoveTargets([targetSquare]);
        setSelectedSq(null);
        setLegalTargets([]);
        return true; // visual-only, will execute later
      }
      return false;
    }

    const moved = executePlayerMove(sourceSquare, targetSquare);
    if (moved) { setSelectedSq(null); setLegalTargets([]); }
    return moved;
  }, [game, premoveEnabled, playerColor, executePlayerMove]);

  // ── Flag tooltip ─────────────────────────────────────────────────────────
  const showFlag = (who: "me" | "ai") => {
    setFlagTooltip(who);
    setTimeout(() => setFlagTooltip((c) => (c === who ? null : c)), 1800);
  };

  // ── Square styles ─────────────────────────────────────────────────────────
  const customSquareStyles = buildSquareStyles(
    selectedSq,
    legalTargets,
    premoveSq,
    premoveTargets,
    theme.light,
    theme.dark,
  );

  if (!profile) return <div className="min-h-screen grid place-items-center text-muted-foreground">…</div>;

  const isPlayerTurn = !finished && game.turn() === playerColor && !thinking;

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

      {/* Board container — full-width on mobile, max 600px */}
      <div className="w-full max-w-[min(100vw,600px)] mx-auto px-2 md:px-4 pb-10 space-y-2">

        {/* Opponent (AI) */}
        <div className="card-panel p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full grid place-items-center bg-muted text-xl border border-border flex-shrink-0">🤖</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="text-xl relative" onClick={() => showFlag("ai")} aria-label="Флаг ИИ">
                🤖
                {flagTooltip === "ai" && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs bg-popover border border-border rounded px-2 py-1 z-10">
                    Искусственный интеллект
                  </span>
                )}
              </button>
              <span className="font-medium text-sm">Gemini AI</span>
              <span className="text-xs text-muted-foreground">
                · {search.diff === "easy" ? "лёгкий" : search.diff === "medium" ? "средний" : "сложный"}
              </span>
            </div>
          </div>
          <div className={`font-mono text-lg tabular-nums px-3 py-1 rounded-lg flex-shrink-0 ${game.turn() === "b" && !finished ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {fmt(blackMs / 1000)}
          </div>
        </div>

        {/* Board — direct props, NOT options={} */}
        <div className="card-panel p-2 md:p-3">
          <Chessboard
            position={fen}
            boardOrientation="white"
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles}
            lightSquareStyle={{ backgroundColor: theme.light }}
            darkSquareStyle={{ backgroundColor: theme.dark }}
            allowDragging={!finished && !thinking}
            animationDurationInMs={200}
          />
        </div>

        {/* Player */}
        <div className="card-panel p-3 flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full grid place-items-center bg-muted text-sm border border-border bg-cover bg-center flex-shrink-0"
            style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
          >
            {!profile.avatar_url && profile.nickname[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="text-xl relative" onClick={() => showFlag("me")} aria-label="Мой флаг">
                {flagEmoji(profile.country_code)}
                {flagTooltip === "me" && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs bg-popover border border-border rounded px-2 py-1 z-10">
                    {countryName(profile.country_code)}
                  </span>
                )}
              </button>
              <span className="font-medium text-sm">@{profile.nickname}</span>
              <span className="text-xs text-muted-foreground">
                · {search.cat === "bullet" ? profile.rating_bullet : search.cat === "blitz" ? profile.rating_blitz : profile.rating_rapid}
              </span>
            </div>
          </div>
          <div className={`font-mono text-lg tabular-nums px-3 py-1 rounded-lg flex-shrink-0 ${game.turn() === "w" && !finished ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {fmt(whiteMs / 1000)}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-2 text-sm text-muted-foreground flex items-center gap-2">
          {thinking
            ? <><span className="animate-spin inline-block">⟳</span> ИИ думает…</>
            : premoveSq
              ? <span className="text-blue-400">↩ Премув запланирован</span>
              : status
                ? <span className={status.includes("Победа") ? "text-green-400" : status.includes("Поражение") ? "text-red-400" : ""}>{status}</span>
                : <span>{isPlayerTurn ? "Ваш ход" : "Ход ИИ"}</span>
          }
        </div>

        {/* Result card */}
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
                  ({ratingResult.delta >= 0 ? "+" : ""}{ratingResult.delta})
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
