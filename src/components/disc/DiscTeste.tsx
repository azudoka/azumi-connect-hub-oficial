import { useMemo, useState } from "react";
import { Plus, Minus, ChevronLeft, ChevronRight, Download, AlertTriangle, Lightbulb } from "lucide-react";
import {
  DISC_QUESTIONS,
  calcularScores,
  perfilPredominante,
  type DiscAnswer,
  type DiscDim,
  type DiscScores,
} from "./discQuestions";
import PerfilIlustracao from "./PerfilIlustracao";
import { getDiscInterpretacao } from "./discProfileContent";
import { DiscRadarChart } from "./DiscRadarChart";
import { gerarRadarSvgString } from "@/lib/discRadarSvg";

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

  const perfilSecundarioDim = useMemo(
    () => (["D", "I", "S", "C"] as DiscDim[]).sort((a, b) => scores[b] - scores[a])[1],
    [scores],
  );
  const { predominante: profContent, secundario: profSecContent } = useMemo(
    () => getDiscInterpretacao(perfil.dim, perfilSecundarioDim),
    [perfil.dim, perfilSecundarioDim],
  );

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

  function ilustracaoSvgString(dim: DiscDim) {
    const cor = COR[dim];
    const tint = `${cor}22`;
    const stroke = "#1f2937";
    let extra = "";
    if (dim === "D") {
      extra = `
        <rect x="74" y="22" width="8" height="32" rx="3" fill="${cor}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="78" cy="20" r="9" fill="#fde7d3" stroke="${stroke}" stroke-width="1.5"/>
        <path d="M95 25 l8 -4 -5 8 6 2 -10 6" fill="none" stroke="${cor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (dim === "I") {
      extra = `
        <path d="M82 44 L102 36 L102 64 L82 56 Z" fill="${cor}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>
        <rect x="74" y="46" width="10" height="8" fill="${cor}" stroke="${stroke}" stroke-width="1.5"/>
        <path d="M106 42 q4 8 0 16 M110 38 q6 12 0 24" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round"/>
        <path d="M53 54 q7 6 14 0" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`;
    } else if (dim === "S") {
      extra = `
        <path d="M60 78 c -8 -8 -16 -2 -16 6 c 0 8 16 16 16 16 c 0 0 16 -8 16 -16 c 0 -8 -8 -14 -16 -6 z" fill="${cor}" stroke="${stroke}" stroke-width="1.5"/>
        <path d="M53 55 q7 4 14 0" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`;
    } else {
      extra = `
        <circle cx="86" cy="46" r="10" fill="#fff" stroke="${cor}" stroke-width="3"/>
        <line x1="94" y1="54" x2="104" y2="64" stroke="${cor}" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="54" cy="50" r="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="66" cy="50" r="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
        <line x1="58" y1="50" x2="62" y2="50" stroke="${stroke}" stroke-width="1.5"/>`;
    }
    return `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="58" fill="${tint}"/>
      <path d="M30 110 C 30 86, 90 86, 90 110 Z" fill="${cor}"/>
      <circle cx="60" cy="50" r="18" fill="#fde7d3" stroke="${stroke}" stroke-width="1.5"/>
      <path d="M44 46 C 46 32, 74 32, 76 46 Z" fill="${stroke}"/>
      ${extra}
    </svg>`;
  }

  function downloadRelatorio() {
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Relatório DISC — ${candidateName}</title>
<style>
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,Inter,sans-serif}
  body{background:#F5F7FA;color:#1f2937;padding:24px}
  .wrap{max-width:780px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  header{background:${NAVY};color:#fff;padding:28px 32px}
  header .logo{font-size:22px;font-weight:600}
  header .logo span{color:#93C5FD}
  header .sub{margin-top:6px;color:rgba(255,255,255,.8);font-size:14px}
  .body{padding:28px 32px}
  h1{font-size:20px;margin-bottom:4px}
  .lead{color:#64748b;font-size:14px;margin-bottom:24px}
  .hero{display:flex;align-items:center;gap:20px;margin-bottom:22px;padding:18px;border-radius:10px;background:#F8FAFC}
  .hero .nome{font-size:26px;font-weight:700;color:${COR[perfil.dim]}}
  .hero .frase{margin-top:6px;font-size:14px;color:#475569}
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
  .dicas{margin-top:18px;padding:18px;border-radius:10px;border:1px solid #E2E8F0}
  .dicas h3{font-size:14px;margin-bottom:8px;color:${COR[perfil.dim]}}
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

      <div class="hero">
        ${ilustracaoSvgString(perfil.dim)}
        <div>
          <div class="nome">${perfil.nome}</div>
          <div class="frase">${perfil.fraseImpacto}</div>
        </div>
      </div>

      <div style="display:flex;align-items:flex-start;gap:24px;margin-bottom:8px">
        <div style="flex-shrink:0">${gerarRadarSvgString(scores)}</div>
        <div style="flex:1;padding-top:8px">
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
        </div>
      </div>

      <div class="perfil">
        <h2>${profContent.nome}</h2>
        <p>${profContent.resumo}</p>
        <h3 style="font-size:13px;margin:14px 0 6px;color:#059669">Pontos fortes</h3>
        <ul>${profContent.pontosFortes.map((p) => `<li>${p}</li>`).join("")}</ul>
        <h3 style="font-size:13px;margin:14px 0 6px;color:#d97706">Pontos de desenvolvimento</h3>
        <ul>${profContent.pontosDesenvolvimento.map((p) => `<li>${p}</li>`).join("")}</ul>
      </div>

      <div class="dicas">
        <h3>Como funciona melhor</h3>
        <ul>${profContent.comoFuncionaMelhor.map((p) => `<li>${p}</li>`).join("")}</ul>
      </div>

      ${profSecContent ? `<div class="perfil" style="margin-top:16px;border-left:4px solid ${COR[profSecContent.letra]};padding-left:14px"><p style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;margin-bottom:4px">Perfil secundário</p><h2 style="color:${COR[profSecContent.letra]};font-size:18px">${profSecContent.nome}</h2><p>${profSecContent.resumo}</p></div>` : ""}

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
    const corPerfil = COR[perfil.dim];
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seu perfil comportamental</h3>
          <p className="text-sm text-muted-foreground">Baseado nas 12 perguntas respondidas.</p>
        </div>

        <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5">
          <PerfilIlustracao dim={perfil.dim} size={104} />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Seu perfil</p>
            <h2 className="text-2xl font-bold leading-tight" style={{ color: corPerfil }}>
              {perfil.nome}
            </h2>
            <p className="mt-1 text-sm text-foreground/80">{perfil.fraseImpacto}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <DiscRadarChart scores={scores} />
        </div>

        <button
          type="button"
          onClick={downloadRelatorio}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Download className="h-4 w-4" /> Baixar relatório DISC
        </button>

        <div className="flex items-start gap-2 rounded-lg border-l-4 border-amber-400 bg-[hsl(var(--warning)/0.1)] p-3 text-xs text-foreground/90">
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
          <h3 className="text-lg font-semibold text-foreground">Perfil DISC</h3>
          <p className="text-sm text-muted-foreground">
            Para cada conjunto, marque <strong>+ Mais</strong> o que mais combina com você e <strong>− Menos</strong> o que menos combina.
          </p>
        </div>
        <div className="text-xs font-medium text-muted-foreground">{completas}/{DISC_QUESTIONS.length}</div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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
                  ? "border-primary bg-primary text-primary-foreground"
                  : ok
                  ? "border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.12)] text-success"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-sm font-medium text-foreground/80">Pergunta {idx + 1} de {DISC_QUESTIONS.length}</p>
        <div className="space-y-2">
          {q.options.map((opt) => {
            const isMais = ans.mais === opt.dim;
            const isMenos = ans.menos === opt.dim;
            return (
              <div
                key={opt.dim}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  isMais ? "border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.12)]" :
                  isMenos ? "border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.12)]" :
                  "border-border bg-card"
                }`}
              >
                <span className="flex-1 text-sm text-foreground">{opt.text}</span>
                <button
                  type="button"
                  onClick={() => marcar("mais", opt.dim)}
                  className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium border ${
                    isMais ? "border-success bg-success text-success-foreground" : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" /> Mais
                </button>
                <button
                  type="button"
                  onClick={() => marcar("menos", opt.dim)}
                  className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium border ${
                    isMenos ? "border-destructive bg-destructive text-destructive-foreground" : "border-border text-muted-foreground hover:bg-muted/50"
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
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground/80 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        {idx < DISC_QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(DISC_QUESTIONS.length - 1, i + 1))}
            disabled={!(ans.mais && ans.menos)}
            title={!(ans.mais && ans.menos) ? "Marque + Mais e − Menos para continuar" : undefined}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
