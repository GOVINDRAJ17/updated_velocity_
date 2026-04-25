import { createContext, useContext, useState, ReactNode } from 'react';

type WalkieTalkieMode = 'hold' | 'push-manual' | 'push-timer';

interface WalkieTalkieContextType {
  mode: WalkieTalkieMode;
  setMode: (mode: WalkieTalkieMode) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
}

const WalkieTalkieContext = createContext<WalkieTalkieContextType | undefined>(undefined);

export function WalkieTalkieProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WalkieTalkieMode>('hold');
  const [timerDuration, setTimerDuration] = useState(10);

  return (
    <WalkieTalkieContext.Provider value={{ mode, setMode, timerDuration, setTimerDuration }}>
      {children}
    </WalkieTalkieContext.Provider>
  );
}

export function useWalkieTalkie() {
  const context = useContext(WalkieTalkieContext);
  if (!context) {
    throw new Error('useWalkieTalkie must be used within WalkieTalkieProvider');
  }
  return context;
}
