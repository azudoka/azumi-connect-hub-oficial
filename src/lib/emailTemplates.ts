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
  })
    .then((res) => {
      if (!res.ok) console.error("[email] resposta não-ok:", res.status, res.statusText);
    })
    .catch((e) => console.error("[email] falha de rede:", e));
}

const FONT_IMPORT =
  '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">';
const FONT_FAMILY = "'Poppins', Arial, sans-serif";

const AZUMI_LOGO_URL = "https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/azumi-logo.png";
const CONNECT_LOGO_URL = "https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/connect-logo.png";
const LOGO_H_AZUMI = 96;
const LOGO_H_CONNECT = 104;

const ICON_INSTAGRAM =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#B9C8E6" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="#B9C8E6" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="#B9C8E6"/></svg>';
const ICON_LINKEDIN =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#B9C8E6" stroke-width="1.8"/><circle cx="7.5" cy="8" r="1.3" fill="#B9C8E6"/><rect x="6.3" y="10.5" width="2.4" height="7" fill="#B9C8E6"/><path d="M11.5 10.5H13.8V11.8C14.3 10.9 15.3 10.3 16.5 10.3C18.6 10.3 19.5 11.6 19.5 13.9V17.5H17.1V14.3C17.1 13.1 16.7 12.3 15.6 12.3C14.7 12.3 14.2 12.9 14 13.5C13.9 13.7 13.9 14 13.9 14.3V17.5H11.5V10.5Z" fill="#B9C8E6"/></svg>';
const ICON_WHATSAPP =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.5 2 2 6.5 2 12C2 13.8 2.5 15.5 3.3 17L2 22L7.2 20.7C8.6 21.5 10.3 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" stroke="#B9C8E6" stroke-width="1.6"/><path d="M8.5 8.5C8.7 8 9.1 8 9.4 8H9.9C10.1 8 10.4 8 10.6 8.5C10.8 9 11.3 10.2 11.3 10.3C11.4 10.4 11.4 10.6 11.3 10.8C11.1 11.2 10.9 11.4 10.7 11.6C10.5 11.8 10.3 12 10.5 12.4C10.7 12.8 11.4 13.9 12.4 14.7C13.6 15.7 14.5 16 14.9 16.2C15.3 16.4 15.5 16.3 15.7 16.1C15.9 15.9 16.4 15.3 16.6 15C16.8 14.7 17 14.8 17.3 14.9C17.6 15 18.8 15.6 19.1 15.7C19.4 15.9 19.6 16 19.6 16.2C19.7 16.5 19.7 17.1 19.3 17.7C18.9 18.3 17.9 18.9 17.4 18.9C16.9 19 16.4 19.1 14.5 18.3C12.2 17.3 10.7 15.1 10.5 14.8C10.3 14.5 9 12.8 9 11C9 9.2 9.9 8.4 10.2 8.1L8.5 8.5Z" fill="#B9C8E6"/></svg>';

function emailHeader(): string {
  return `
  <tr><td style="background:#264478;padding:6px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left"><img src="${AZUMI_LOGO_URL}" height="${LOGO_H_AZUMI}" alt="Azumi RH" style="display:block;"></td>
      <td align="right"><img src="${CONNECT_LOGO_URL}" height="${LOGO_H_CONNECT}" alt="Connect" style="display:block;"></td>
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

export function emailSolicitarNps(params: { nomeContato: string; cargoVaga: string; link: string }): string {
  return emailWrapper(
    "Como foi sua experiência?",
    paragrafo(
      `Olá, ${params.nomeContato}! Um candidato para a vaga de <strong>${params.cargoVaga}</strong> foi aprovado. Gostaríamos de conhecer sua avaliação sobre o processo.`
    ) +
      botao(params.link, "Avaliar agora") +
      '<p style="font-size:12px;color:#8FA9D6;margin:16px 0 0;">Leva menos de 1 minuto — sua opinião é muito importante pra gente.</p>'
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

export function emailAtribuicaoVaga(params: { nomeConsultor: string; tituloVaga: string; empresa: string; linkVaga: string }): string {
  return emailWrapper(
    `Nova vaga atribuída a você`,
    paragrafo(
      `Olá, ${params.nomeConsultor}! Uma nova vaga foi aberta e atribuída a você: <strong>${params.tituloVaga}</strong> em ${params.empresa}. Acesse a plataforma para ver os detalhes e iniciar o processo.`
    ) + botao(params.linkVaga, "Abrir vaga no Connect")
  );
}

export function emailCandidatoConfirmouEntrevista(params: { nomeConsultor: string; nomeCandidato: string; cargo: string; horario: string; linkVaga: string }): string {
  return emailWrapper(
    `${params.nomeCandidato} confirmou a entrevista`,
    paragrafo(
      `Olá, ${params.nomeConsultor}! O candidato <strong>${params.nomeCandidato}</strong> confirmou presença na entrevista para a vaga de <strong>${params.cargo}</strong>.`
    ) + paragrafo(
      `Horário confirmado: <strong>${params.horario}</strong>`
    ) + botao(params.linkVaga, "Ver candidato no Connect")
  );
}

export function emailCandidatoSugeriuHorarios(params: { nomeConsultor: string; nomeCandidato: string; cargo: string; horario1: string; horario2: string; observacao?: string; linkVaga: string }): string {
  return emailWrapper(
    `${params.nomeCandidato} sugeriu novos horários`,
    paragrafo(
      `Olá, ${params.nomeConsultor}! O candidato <strong>${params.nomeCandidato}</strong> não está disponível nos horários sugeridos para a vaga de <strong>${params.cargo}</strong> e propôs as seguintes alternativas:`
    ) + paragrafo(
      `• <strong>${params.horario1}</strong><br/>• <strong>${params.horario2}</strong>`
    ) + (params.observacao ? paragrafo(`Observação: ${params.observacao}`) : "") +
    botao(params.linkVaga, "Revisar e confirmar no Connect")
  );
}

export function emailCompletarCadastro(params: { nome: string; cargoVaga: string; empresa: string; link: string }): string {
  return emailWrapper(
    "Complete seu cadastro",
    paragrafo(
      `Olá${params.nome ? `, ${params.nome}` : ""}! Você foi adicionado(a) ao processo seletivo pra vaga de <strong>${params.cargoVaga}</strong> em ${params.empresa}. Complete seu cadastro para que o time da Azumi RH possa avaliar seu perfil.`
    ) + botao(params.link, "Completar meu cadastro")
  );
}
