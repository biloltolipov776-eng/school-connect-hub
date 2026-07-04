import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
type Size = "sm" | "md" | "lg";

const Ctx = createContext<{
  theme: Theme; setTheme: (t: Theme) => void;
  size: Size; setSize: (s: Size) => void;
}>({ theme: "dark", setTheme: () => {}, size: "md", setSize: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [size, setSizeState] = useState<Size>("md");
  useEffect(() => {
    const t = (localStorage.getItem("theme") as Theme) || "dark";
    const s = (localStorage.getItem("size") as Size) || "md";
    setThemeState(t); setSizeState(s);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.size = size;
  }, [theme, size]);
  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem("theme", t); };
  const setSize = (s: Size) => { setSizeState(s); localStorage.setItem("size", s); };
  return <Ctx.Provider value={{ theme, setTheme, size, setSize }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
