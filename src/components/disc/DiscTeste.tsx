import { useMemo, useState } from "react";
import { Plus, Minus, ChevronLeft, ChevronRight, Download, AlertTriangle } from "lucide-react";
import {
  DISC_QUESTIONS,
  calcularScores,
  perfilPredominante,
  type DiscAnswer,
  type DiscDim,
  type DiscScores,
} from "./discQuestions";

const NAVY = "#031D38";
const BLUE = "#034C8B";

const COR: Record<DiscDim, string> = {
  D: "#ef4444",
  I: "#f59e0b",
  S: "#10b981",
  C: "#3b82f6",
};

interface Props {
  candidateName: string;
  onComplete: (scores: DiscScores, perfilDim: DiscDim) => void;
}

export default function DiscTeste({ candidateName, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, DiscAnswer>>({});
  const [idx, setIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const q = DISC_QUESTIONS[idx];
  const ans = answers[q.id] ?? {};

  const completas = useMemo(
    () => DISC_QUESTIONS.filter((qq) => answers[qq.id]?.mais && answers[qq.id]?.menos).length,
    [answers],
  );
  const progresso = Math.round((completas / DISC_QUESTIONS.length) * 100);
  const tudoOk = completas === DISC_QUESTIONS.length;

  const scores = useMemo(() => calcularScores(answers), [answers]);
  const perfil = useMemo(() => perfilPredominante(scores), [scores]);

  function marcar(tipo: "mais" | "menos", dim: DiscDim) {
    setAnswers((prev) => {
      const cur: DiscAnswer = { ...(prev[q.id] ?? {}) };
      // se já estava marcado como o outro tipo, troca
      if (tipo === "mais") {
        if (cur.menos === dim) cur.menos = undefined;
        cur.mais = cur.mais === dim ? undefined : dim;
      } else {
        if (cur.mais === dim) cur.mais = undefined;
        cur.menos = cur.menos === dim ? undefined : dim;
      }
      return { ...prev, [q.id]: cur };
    });
  }

  function downloadRelatorio() {
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Relatório DISC — ${candidateName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,Inter,sans-serif}
  body{background:#F5F7FA;color:#1f2937;padding:24px}
  .wrap{max-width:780px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  header{background:${NAVY};color:#fff;padding:28px 32px}
  header .logo{font-size:22px;font-weight:600}
  header .logo span{color:#93C5FD}
  header .sub{margin-top:6px;color:rgba(255,255,255,.8);font-size:14px}
  .body{padding:28px 32px}
  h1{font-size:20px;margin-bottom:4px}
  .lead{color:#64748b;font-size:14px;margin-bottom:24px}
  .bar-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
  .bar-row .k{width:24px;font-weight:700}
  .bar-row .track{flex:1;height:14px;border-radius:7px;background:#e5e7eb;overflow:hidden}
  .bar-row .fill{height:100%;border-radius:7px}
  .bar-row .v{width:48px;text-align:right;font-variant-numeric:tabular-nums;font-size:13px;color:#475569}
  .perfil{margin-top:24px;padding:18px;border-radius:10px;background:#F1F5F9}
  .perfil h2{font-size:16px;margin-bottom:6px}
  .perfil p{font-size:14px;color:#475569}
  ul{margin-top:14px;padding-left:18px}
  ul li{font-size:14px;margin:4px 0;color:#334155}
  .aviso{margin-top:22px;padding:14px;border-left:4px solid #f59e0b;background:#FFF7ED;color:#92400e;font-size:13px;border-radius:6px}
  footer{padding:16px 32px;background:#F8FAFC;color:#64748b;font-size:12px;text-align:center;border-top:1px solid #E2E8F0}
  @media print{body{background:#fff;padding:0}.wrap{box-shadow:none;border-radius:0}}
</style></head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">azumi <span>RH</span></div>
      <div class="sub">Relatório de perfil DISC</div>
    </header>
    <div class="body">
      <h1>${candidateName}</h1>
      <div class="lead">Resultado obtido em ${new Date().toLocaleDateString("pt-BR")}</div>

      ${(["D", "I", "S", "C"] as DiscDim[])
        .map(
          (d) => `
        <div class="bar-row">
          <div class="k" style="color:${COR[d]}">${d}</div>
          <div class="track"><div class="fill" style="width:${scores[d]}%;background:${COR[d]}"></div></div>
          <div class="v">${scores[d]}%</div>
        </div>`,
        )
        .join("")}

      <div class="perfil">
        <h2>${perfil.nome}</h2>
        <p>${perfil.descricao}</p>
        <ul>${perfil.pontosFortes.map((p) => `<li>${p}</li>`).join("")}</ul>
      </div>

      <div class="aviso">
        Este resultado é uma leitura comportamental de triagem. Não é um diagnóstico psicológico.
      </div>
    </div>
    <footer>azumirh.com.br</footer>
  </div>
  <script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  if (showResult) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Seu perfil comportamental</h3>
          <p className="text-sm text-slate-500">Baseado nas 12 perguntas respondidas.</p>
        </div>

        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-5">
          {(["D", "I", "S", "C"] as DiscDim[]).map((d) => (
            <div key={d} className="flex items-center gap-3">
              <div className="w-5 text-sm font-bold" style={{ color: COR[d] }}>{d}</div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${scores[d]}%`, background: COR[d] }}
                />
              </div>
              <div className="w-12 text-right text-xs tabular-nums text-slate-600">{scores[d]}%</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="text-base font-semibold text-slate-900">{perfil.nome}</h4>
          <p className="mt-1 text-sm text-slate-600">{perfil.descricao}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {perfil.pontosFortes.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>

        <button
          type="button"
          onClick={downloadRelatorio}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" /> Baixar relatório DISC
        </button>

        <div className="flex items-start gap-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Este resultado é uma leitura comportamental de triagem. Não é um diagnóstico psicológico.</span>
        </div>

        <button
          type="button"
          onClick={() => onComplete(scores, perfil.dim)}
          className="h-12 w-full rounded-lg text-sm font-semibold text-white"
          style={{ background: BLUE }}
        >
          Confirmar e enviar →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Perfil DISC</h3>
          <p className="text-sm text-slate-500">
            Para cada conjunto, marque <strong>+ Mais</strong> o que mais combina com você e <strong>− Menos</strong> o que menos combina.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-600">{completas}/{DISC_QUESTIONS.length}</div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, background: BLUE }} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DISC_QUESTIONS.map((qq, i) => {
          const ok = answers[qq.id]?.mais && answers[qq.id]?.menos;
          return (
            <button
              key={qq.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-7 w-7 rounded-md text-xs font-medium border transition ${
                i === idx
                  ? "border-slate-900 bg-slate-900 text-white"
                  : ok
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-medium text-slate-700">Pergunta {idx + 1} de {DISC_QUESTIONS.length}</p>
        <div className="space-y-2">
          {q.options.map((opt) => {
            const isMais = ans.mais === opt.dim;
            const isMenos = ans.menos === opt.dim;
            return (
              <div
                key={opt.dim}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  isMais ? "border-emerald-300 bg-emerald-50" :
                  isMenos ? "border-rose-300 bg-rose-50" :
                  "border-slate-200 bg-white"
                }`}
              >
                <span className="flex-1 text-sm text-slate-800">{opt.text}</span>
                <button
                  type="button"
                  onClick={() => marcar("mais", opt.dim)}
                  className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium border ${
                    isMais ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" /> Mais
                </button>
                <button
                  type="button"
                  onClick={() => marcar("menos", opt.dim)}
                  className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium border ${
                    isMenos ? "border-rose-500 bg-rose-500 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Minus className="h-3.5 w-3.5" /> Menos
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        {idx < DISC_QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(DISC_QUESTIONS.length - 1, i + 1))}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: BLUE }}
          >
            Próxima <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowResult(true)}
            disabled={!tudoOk}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: BLUE }}
          >
            Ver resultado →
          </button>
        )}
      </div>
    </div>
  );
}
