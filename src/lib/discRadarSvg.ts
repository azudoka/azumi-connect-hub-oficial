export function gerarRadarSvgString(scores: { D: number; I: number; S: number; C: number }): string {
  const tamanho = 240;
  const centro = tamanho / 2;
  const raioMax = tamanho / 2 - 30;
  const fatores: Array<{ label: string; valor: number; angulo: number }> = [
    { label: "D", valor: scores.D, angulo: -90 },
    { label: "I", valor: scores.I, angulo: 0 },
    { label: "S", valor: scores.S, angulo: 90 },
    { label: "C", valor: scores.C, angulo: 180 },
  ];

  function pontoNoAngulo(angulo: number, raio: number) {
    const rad = (angulo * Math.PI) / 180;
    return { x: centro + raio * Math.cos(rad), y: centro + raio * Math.sin(rad) };
  }

  const pontosScore = fatores
    .map((f) => pontoNoAngulo(f.angulo, (f.valor / 100) * raioMax))
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const grades = [0.25, 0.5, 0.75, 1]
    .map((pct) => {
      const pts = fatores
        .map((f) => pontoNoAngulo(f.angulo, pct * raioMax))
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#E5E7EB" stroke-width="1" />`;
    })
    .join("");

  const labels = fatores
    .map((f) => {
      const p = pontoNoAngulo(f.angulo, raioMax + 18);
      return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="600" fill="#334155">${f.label}</text>`;
    })
    .join("");

  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}" xmlns="http://www.w3.org/2000/svg">${grades}<polygon points="${pontosScore}" fill="#3B82F6" fill-opacity="0.35" stroke="#3B82F6" stroke-width="2" />${labels}</svg>`;
}
