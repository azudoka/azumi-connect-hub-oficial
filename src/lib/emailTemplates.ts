// src/lib/emailTemplates.ts
// Módulo reutilizável de templates de e-mail — Azumi RH / Connect
// Cada função gera o HTML completo pronto pra enviar via API de e-mail.
// Para novos tipos de e-mail no futuro: copiar o padrão de qualquer
// função abaixo, só trocar título/corpo/botão.

const EMAIL_API = "https://azumi-email-api.vercel.app/api/send-email";

/** Dispara o e-mail em fire-and-forget. Nunca lança exceção. */
export function sendEmail(to: string, subject: string, html: string): void {
  fetch(EMAIL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html }),
  }).catch((e) => console.error("[email]", e));
}

const FONT_IMPORT =
  '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">';
const FONT_FAMILY = "'Poppins', Arial, sans-serif";

// Logos embutidas em base64 — funciona em produção, mas se quiser
// mais confiabilidade em todos os clientes de e-mail (principalmente
// Outlook), suba essas duas imagens pro Supabase Storage (bucket
// public-applications) e troque essas constantes pela URL pública.
const AZUMI_LOGO_B64 =
  "data:image/png;base64,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";
const CONNECT_LOGO_B64 =
  "data:image/png;base64,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";

const ICON_INSTAGRAM =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#B9C8E6" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="#B9C8E6" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="#B9C8E6"/></svg>';
const ICON_LINKEDIN =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#B9C8E6" stroke-width="1.8"/><circle cx="7.5" cy="8" r="1.3" fill="#B9C8E6"/><rect x="6.3" y="10.5" width="2.4" height="7" fill="#B9C8E6"/><path d="M11.5 10.5H13.8V11.8C14.3 10.9 15.3 10.3 16.5 10.3C18.6 10.3 19.5 11.6 19.5 13.9V17.5H17.1V14.3C17.1 13.1 16.7 12.3 15.6 12.3C14.7 12.3 14.2 12.9 14 13.5C13.9 13.7 13.9 14 13.9 14.3V17.5H11.5V10.5Z" fill="#B9C8E6"/></svg>';
const ICON_WHATSAPP =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.5 2 2 6.5 2 12C2 13.8 2.5 15.5 3.3 17L2 22L7.2 20.7C8.6 21.5 10.3 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" stroke="#B9C8E6" stroke-width="1.6"/><path d="M8.5 8.5C8.7 8 9.1 8 9.4 8H9.9C10.1 8 10.4 8 10.6 8.5C10.8 9 11.3 10.2 11.3 10.3C11.4 10.4 11.4 10.6 11.3 10.8C11.1 11.2 10.9 11.4 10.7 11.6C10.5 11.8 10.3 12 10.5 12.4C10.7 12.8 11.4 13.9 12.4 14.7C13.6 15.7 14.5 16 14.9 16.2C15.3 16.4 15.5 16.3 15.7 16.1C15.9 15.9 16.4 15.3 16.6 15C16.8 14.7 17 14.8 17.3 14.9C17.6 15 18.8 15.6 19.1 15.7C19.4 15.9 19.6 16 19.6 16.2C19.7 16.5 19.7 17.1 19.3 17.7C18.9 18.3 17.9 18.9 17.4 18.9C16.9 19 16.4 19.1 14.5 18.3C12.2 17.3 10.7 15.1 10.5 14.8C10.3 14.5 9 12.8 9 11C9 9.2 9.9 8.4 10.2 8.1L8.5 8.5Z" fill="#B9C8E6"/></svg>';

function emailHeader(): string {
  return `
  <tr><td style="background:#264478;padding:26px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left"><img src="${AZUMI_LOGO_B64}" height="26" alt="Azumi RH" style="display:block;"></td>
      <td align="right"><img src="${CONNECT_LOGO_B64}" height="44" alt="Connect" style="display:block;"></td>
    </tr></table>
  </td></tr>`;
}

function emailFooter(): string {
  return `
  <tr><td style="background:#14233F;padding:32px 32px;text-align:center;">
    <p style="font-size:11px;color:#7FA8E8;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;font-family:${FONT_FAMILY};">A evolução do HR Tech</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 18px;"><tr>
      <td style="padding:0 8px;"><a href="https://instagram.com/azumirh">${ICON_INSTAGRAM}</a></td>
      <td style="padding:0 8px;"><a href="https://linkedin.com/company/azumirh">${ICON_LINKEDIN}</a></td>
      <td style="padding:0 8px;"><a href="https://wa.me/5541988350743">${ICON_WHATSAPP}</a></td>
    </tr></table>
    <p style="font-size:12px;color:#B9C8E6;margin:0;font-family:${FONT_FAMILY};">
      <strong>CONNECT</strong> by AZUMI RH · azumirh.com · contato@azumirh.com.br
    </p>
  </td></tr>`;
}

function emailWrapper(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">${FONT_IMPORT}</head>
<body style="margin:0;padding:24px;background:#EEF2FA;font-family:${FONT_FAMILY};">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(20,35,63,0.1);font-family:${FONT_FAMILY};">
${emailHeader()}
  <tr><td style="padding:48px 40px;text-align:center;">
    <h1 style="font-size:26px;font-weight:800;color:#14233F;margin:0 0 18px;line-height:1.25;font-family:${FONT_FAMILY};">${title}</h1>
    ${bodyHtml}
  </td></tr>
${emailFooter()}
</table>
</body></html>`;
}

function botao(link: string, texto: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px auto 0;"><tr><td style="background:#264478;border-radius:100px;">
    <a href="${link}" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;font-family:${FONT_FAMILY};">${texto}</a>
  </td></tr></table>`;
}

function paragrafo(texto: string): string {
  return `<p style="font-size:15px;color:#5B6B85;line-height:1.65;margin:0 auto;max-width:440px;font-family:${FONT_FAMILY};">${texto}</p>`;
}

// ── TEMPLATES ────────────────────────────────────────────────────────────

export function emailBoasVindas(params: { nome: string; link: string }): string {
  return emailWrapper(
    `Bem-vindo(a), ${params.nome}!`,
    paragrafo(
      "Seu cadastro na Azumi RH foi realizado com sucesso. Agora você pode acompanhar processos seletivos, responder testes de perfil e ficar por dentro de oportunidades que combinam com você."
    ) + botao(params.link, "Acessar minha conta")
  );
}

export function emailConviteProcesso(params: { nome: string; cargoVaga: string; empresa: string; link: string }): string {
  return emailWrapper(
    "Você foi convidado(a)<br>para um processo seletivo!",
    paragrafo(
      `Olá, ${params.nome}! A Azumi RH está com um processo aberto pra vaga de <strong>${params.cargoVaga}</strong> em ${params.empresa}. Veja os detalhes completos e confirme se deseja participar.`
    ) + botao(params.link, "Ver detalhes da vaga")
  );
}

export function emailConviteQuestionario(params: { nome: string; cargoVaga: string; link: string }): string {
  return emailWrapper(
    "Você avançou de etapa! 🎉",
    paragrafo(
      `Parabéns, ${params.nome}! Você avançou pra próxima etapa do processo seletivo pra vaga de <strong>${params.cargoVaga}</strong>. Queremos te conhecer melhor através de um questionário rápido.`
    ) +
      botao(params.link, "Responder agora") +
      '<p style="font-size:12px;color:#8FA9D6;margin:16px 0 0;">Se preferir, você pode responder depois — o link continua válido.</p>'
  );
}

export function emailResultadoDisc(params: { nome: string; link: string }): string {
  return emailWrapper(
    "Seu Perfil Comportamental<br>está pronto!",
    paragrafo(
      `Olá, ${params.nome}! Você concluiu seu teste de Perfil DISC. Confira seus pontos fortes e como você se destaca no ambiente de trabalho.`
    ) + botao(params.link, "Ver meu resultado")
  );
}

export function emailAprovado(params: { nome: string; cargoVaga: string; empresa: string; link: string }): string {
  return emailWrapper(
    `Parabéns, ${params.nome}!`,
    '<table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;"><tr><td style="background:#E4F5EC;border-radius:100px;padding:6px 18px;"><span style="color:#1E8A4C;font-size:12px;font-weight:700;">✓ APROVADO</span></td></tr></table>' +
      paragrafo(
        `Você foi aprovado(a) no processo seletivo pra vaga de <strong>${params.cargoVaga}</strong> em <strong>${params.empresa}</strong>. Nossa equipe vai entrar em contato em breve com os próximos passos.`
      ) +
      botao(params.link, "Ver detalhes")
  );
}

export function emailNaoAprovado(params: { nome: string; cargoVaga: string }): string {
  return emailWrapper(
    `Obrigado por participar,<br>${params.nome}`,
    paragrafo(
      `Agradecemos muito seu interesse na vaga de <strong>${params.cargoVaga}</strong> e o tempo dedicado durante o processo. Dessa vez seguimos com outro perfil, mas seu cadastro fica em nosso banco de talentos pra futuras oportunidades. Desejamos sucesso na sua jornada!`
    )
  );
}

export function emailAgendamentoEntrevista(params: {
  nome: string;
  cargoVaga: string;
  data: string;
  hora: string;
  modalidade: string;
  link: string;
}): string {
  return emailWrapper(
    "Sua entrevista foi agendada",
    paragrafo(`Olá, ${params.nome}! Confirmamos sua entrevista pra vaga de <strong>${params.cargoVaga}</strong>.`) +
      `<table cellpadding="0" cellspacing="0" style="margin:20px auto;background:#EEF2FA;border-radius:10px;"><tr><td style="padding:16px 24px;text-align:left;">
        <p style="font-size:13px;color:#14233F;margin:0 0 4px;"><strong>Data:</strong> ${params.data}</p>
        <p style="font-size:13px;color:#14233F;margin:0 0 4px;"><strong>Horário:</strong> ${params.hora}</p>
        <p style="font-size:13px;color:#14233F;margin:0;"><strong>Modalidade:</strong> ${params.modalidade}</p>
      </td></tr></table>` +
      botao(params.link, "Confirmar presença")
  );
}

export function emailRedefinirSenha(params: { link: string }): string {
  return emailWrapper(
    "Redefinir sua senha",
    paragrafo(
      "Recebemos uma solicitação pra redefinir a senha da sua conta. Clique no botão abaixo pra criar uma nova senha. Se você não pediu isso, pode ignorar este e-mail com segurança."
    ) +
      botao(params.link, "Redefinir senha") +
      '<p style="font-size:12px;color:#8FA9D6;margin:16px 0 0;">Este link expira em 1 hora por segurança.</p>'
  );
}
