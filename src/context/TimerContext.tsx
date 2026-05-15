import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";

interface TimerContextType {
  ativo: boolean;
  pausado: boolean;
  segundos: number;
  tarefaNome: string;
  empresaNome: string;
  iniciar: (tarefaNome: string, empresaNome: string) => void;
  pausar: () => void;
  retomar: () => void;
  encerrar: () => number;
}

const TimerContext = createContext<TimerContextType>({
  ativo: false, pausado: false, segundos: 0,
  tarefaNome: "", empresaNome: "",
  iniciar: () => {}, pausar: () => {}, retomar: () => {},
  encerrar: () => 0,
});

export function TimerProvider({ children }: { children: ReactNode }) {
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [tarefaNome, setTarefaNome] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (ativo && !pausado) {
      intervalRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ativo, pausado]);

  function iniciar(tarefa: string, empresa: string) {
    setTarefaNome(tarefa);
    setEmpresaNome(empresa);
    setSegundos(0);
    setPausado(false);
    setAtivo(true);
  }

  function pausar() { setPausado(true); }
  function retomar() { setPausado(false); }

  function encerrar(): number {
    const s = segundos;
    setAtivo(false);
    setPausado(false);
    setSegundos(0);
    setTarefaNome("");
    setEmpresaNome("");
    return s;
  }

  return (
    <TimerContext.Provider value={{
      ativo, pausado, segundos, tarefaNome, empresaNome,
      iniciar, pausar, retomar, encerrar,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerGlobal() {
  return useContext(TimerContext);
}
