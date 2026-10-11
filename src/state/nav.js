// Navigation maison : 5 onglets + une pile d'écrans (jeu, association…). Aucune dépendance.
import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useNav = () => useContext(Ctx);

export function NavProvider({ children }) {
  const [tab, setTab] = useState('jouer');
  const [stack, setStack] = useState([]);
  const go = useCallback((name, params = {}) => setStack((s) => [...s, { name, params }]), []);
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const replace = useCallback((name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params }]), []);
  const value = useMemo(() => ({ tab, setTab, stack, go, back, replace, top: stack[stack.length - 1] || null }), [tab, stack, go, back, replace]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
