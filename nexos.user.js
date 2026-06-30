// ==UserScript==
// @name         Nexos
// @namespace    https://github.com/luccasmarquess-netizen/nexos-tampermonkey01
// @version      1.1.0
// @description  Resumo de atendimento técnico direto no Chatwoot — sem IA, sem dados externos
// @author       Luccas Marques
// @match        https://app.chatwoot.com/app/accounts/*/conversations/*
// @match        https://app.chatwoot.com/app/accounts/*/team/*/conversations/*
// @match        https://app.chatwoot.com/app/accounts/*/mentions/conversations/*
// @match        https://app.chatwoot.com/app/accounts/*/*/conversations/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      app.chatwoot.com
// @updateURL    https://raw.githubusercontent.com/luccasmarquess-netizen/nexos-tampermonkey01/main/nexos.user.js
// @downloadURL  https://raw.githubusercontent.com/luccasmarquess-netizen/nexos-tampermonkey01/main/nexos.user.js
// ==/UserScript==

(function () {
  'use strict';

  function getIdsFromUrl() {
    const m = location.href.match(/accounts\/(\d+)(?:\/[^/]+)*\/conversations\/(\d+)/);
    return m ? { accountId: m[1], conversationId: m[2] } : null;
  }

  // ─── Dados ───────────────────────────────────────────────────────────────
  const FAV = [
    'Acesso remoto estabelecido (RustDesk)',
    'Módulo Mobile instalado e validado',
    'Máquina TEF verificada/integrada',
    'Emissor fiscal componente configurado',
    'Validação e testes de emissão fiscal realizados com resultado positivo',
    'Integração iFood verificada',
    'Integração 99Food verificada',
    'Integração Keeta verificada',
    'Bot WhatsApp configurado e validado',
    'VPN (Hamachi/Radmin) configurada',
    'Impressora instalada e configurada no Consumer',
    'Teste de impressão realizado com resultado positivo',
    'Balança instalada e configurada no Consumer',
    'Chave Google Maps configurada no Consumer',
    'MenuDino configurado e validado',
  ];

  const CATS = [
    { g: 'Instalação e Sistema', a: [
      'Acesso remoto estabelecido (RustDesk)',
      'Consumer aberto e versão verificada',
      'Atualização do Consumer executada',
      'Consumer reiniciado',
      'Bloqueio de antivírus/UAC verificado',
      'Ativação/licença verificada',
      'Backup realizado antes da intervenção',
      'Reinstalação do Consumer realizada',
    ]},
    { g: 'Rede e Conectividade', a: [
      'Teste de conectividade com a internet',
      'IP fixo verificado/configurado no servidor',
      'Versão rede verificada entre computadores',
      'VPN (Hamachi/Radmin) configurada',
      'Reconexão entre PC servidor e PC cliente realizada',
      'Alteração de métricas de rede realizada',
    ]},
    { g: 'Impressoras e Hardware', a: [
      'Impressora instalada e configurada no Consumer',
      'Driver da impressora reinstalado',
      'Local de produção vinculado aos produtos',
      'Teste de impressão realizado com resultado positivo',
      'Gaveta de dinheiro verificada',
      'Balança instalada e configurada no Consumer',
    ]},
    { g: 'Fiscal', a: [
      'Módulo fiscal verificado (NFC-e/NF-e)',
      'Emissor fiscal componente configurado',
      'Certificado digital verificado/atualizado',
      'Rejeição de cupom fiscal identificada e corrigida',
      'Validação e testes de emissão fiscal realizados com resultado positivo',
      'Emissão de cupom fiscal em lote realizada',
      'Arquivos XML exportados ao contador',
      'Cancelamento de NFC-e/NF-e realizado',
    ]},
    { g: 'Pedidos e Integrações', a: [
      'Módulo Mobile instalado e validado',
      'Integração iFood verificada',
      'Integração 99Food verificada',
      'Integração Keeta verificada',
      'Bot WhatsApp verificado',
      'App do Entregador verificado',
      'Monitor de Preparo verificado',
      'Recebimento via PIX configurado',
      'Totem verificado/configurado',
      'Integração via API do parceiro configurada',
      'SmartPOS verificado/configurado',
      'Serviços logísticos verificados',
    ]},
    { g: 'MenuDino', a: [
      'MenuDino configurado e validado',
      'Chave Google Maps configurada no Consumer',
      'Recebimento via PIX configurado',
      'Produtos em destaque no MenuDino configurados',
      'Conta Google Play Developer criada/configurada',
      'Ponto central de localização do estabelecimento ajustado',
    ]},
    { g: 'Firebird', a: [
      'Firebird reinstalado do zero',
      'Serviço do Firebird reiniciado',
      'Firebird padrão reinstalado',
      'Firebird exclusivo removido',
      'Comunicação do Firebird com o Consumer validada',
      'Recuperação do banco de dados realizada',
    ]},
    { g: 'Orientação', a: [
      'Responsável orientado quanto ao procedimento',
      'Responsável orientado sobre possíveis impactos e prevenção',
      'Manual do Consumer indicado ao cliente',
      'Consumer Connect (relatórios online) demonstrado',
      'CRM verificado e orientações repassadas ao cliente',
      'Cliente orientado a solicitar visita de técnico local / suporte próprio',
    ]},
  ];

  const DESFECHOS = [
    { l: 'Resolvido',     cls: 'df-ok',   bloco: '✅ DESFECHO: Resolvido\nTodos os procedimentos foram concluídos com êxito e o problema foi resolvido durante o atendimento.' },
    { l: 'Parcial',       cls: 'df-warn', bloco: '⚠️ DESFECHO: Parcial\nO problema foi parcialmente resolvido. Pendências identificadas serão acompanhadas em novo contato.' },
    { l: 'Análise Q.A',   cls: 'df-info', bloco: '🔍 DESFECHO: Encaminhado para Q.A\nO chamado foi encaminhado para análise pela equipe de qualidade para investigação aprofundada.' },
    { l: 'Ag. cliente',   cls: 'df-gray', bloco: '⏳ DESFECHO: Aguardando cliente\nAtendimento suspenso. Aguardando retorno do responsável pelo estabelecimento para continuidade.' },
  ];

  const FRASE_FINAL = 'Todos os procedimentos e testes foram realizados na presença do responsável pelo estabelecimento.';

  const TRADUCOES = [
    [/acesso remoto estabelecido/i,              '• Realizamos o atendimento de forma remota'],
    [/atualização do consumer executada/i,        '• Atualizamos o sistema para a versão mais recente'],
    [/consumer reiniciado/i,                      '• Reiniciamos o sistema'],
    [/reinstalação do consumer realizada/i,       '• Reinstalamos o sistema completo'],
    [/backup realizado/i,                         '• Realizamos uma cópia de segurança dos dados'],
    [/bloqueio de antivírus.*verificado/i,        '• Verificamos as permissões de segurança do computador'],
    [/ativação\/licença verificada/i,             '• Verificamos a licença de uso do sistema'],
    [/ip fixo.*configurado/i,                     '• Configuramos o endereço de rede do servidor'],
    [/vpn.*configurada/i,                         '• Configuramos a conexão entre os computadores da loja'],
    [/reconexão entre pc servidor/i,              '• Restabelecemos a comunicação entre os computadores da loja'],
    [/impressora instalada e configurada/i,       '• Instalamos e configuramos a impressora no sistema'],
    [/driver da impressora reinstalado/i,         '• Reinstalamos o driver da impressora'],
    [/teste de impressão realizado.*positivo/i,   '• Testamos a impressão com resultado positivo'],
    [/gaveta de dinheiro verificada/i,            '• Verificamos o funcionamento da gaveta de dinheiro'],
    [/balança instalada e configurada/i,          '• Instalamos e configuramos a balança no sistema'],
    [/emissor fiscal.*configurado/i,              '• Corrigimos o sistema de emissão de cupons fiscais'],
    [/módulo fiscal verificado/i,                 '• Verificamos o módulo de emissão de notas fiscais'],
    [/certificado digital verificado\/atualizado/i,'• Atualizamos o certificado digital do estabelecimento'],
    [/rejeição de cupom fiscal.*corrigida/i,      '• Identificamos e corrigimos a rejeição de cupons fiscais'],
    [/validação e testes de emissão fiscal.*positivo/i, '• Realizamos testes de emissão fiscal com resultado positivo'],
    [/emissão de cupom fiscal em lote/i,          '• Emitimos os cupons fiscais pendentes em lote'],
    [/arquivos xml exportados/i,                  '• Exportamos os arquivos fiscais para o contador'],
    [/cancelamento de nfc-e\/nf-e/i,              '• Realizamos o cancelamento das notas fiscais solicitadas'],
    [/integração ifood verificada/i,              '• Verificamos o recebimento de pedidos pelo iFood'],
    [/integração 99food verificada/i,             '• Verificamos o recebimento de pedidos pelo 99Food'],
    [/integração keeta verificada/i,              '• Verificamos o recebimento de pedidos pelo Keeta'],
    [/bot whatsapp.*validado/i,                   '• Configuramos e testamos o Bot do WhatsApp'],
    [/bot whatsapp verificado/i,                  '• Verificamos o funcionamento do Bot do WhatsApp'],
    [/app do entregador verificado/i,             '• Verificamos o funcionamento do App do Entregador'],
    [/monitor de preparo verificado/i,            '• Verificamos o funcionamento do Monitor de Preparo'],
    [/recebimento via pix configurado/i,          '• Configuramos o recebimento de pagamentos via PIX'],
    [/totem verificado\/configurado/i,            '• Verificamos e configuramos o totem de autoatendimento'],
    [/módulo mobile instalado e validado/i,       '• Instalamos e validamos o módulo de atendimento pelo celular'],
    [/máquina tef verificada\/integrada/i,        '• Verificamos e integramos a maquininha de cartão'],
    [/integração via api do parceiro/i,           '• Configuramos a integração com o sistema do parceiro'],
    [/menudino configurado e validado/i,          '• Configuramos e validamos o cardápio online'],
    [/chave google maps configurada/i,            '• Configuramos a integração com o mapa para entregas'],
    [/firebird.*reinstalado.*zero/i,              '• Reinstalamos o banco de dados do sistema do zero'],
    [/firebird padrão reinstalado/i,              '• Restauramos o banco de dados do sistema'],
    [/firebird exclusivo removido/i,              '• Removemos a versão exclusiva do banco de dados'],
    [/serviço do firebird reiniciado/i,           '• Reiniciamos o serviço de banco de dados'],
    [/comunicação do firebird.*validada/i,        '• Validamos a comunicação do banco de dados com o sistema'],
    [/recuperação do banco de dados/i,            '• Recuperamos o banco de dados do sistema'],
    [/responsável orientado quanto ao procedimento/i, '• Orientamos o responsável sobre os procedimentos realizados'],
    [/responsável orientado sobre.*impactos/i,    '• Orientamos o responsável sobre possíveis impactos e prevenção'],
    [/manual do consumer indicado/i,              '• Indicamos o manual do sistema para consulta'],
    [/consumer connect.*demonstrado/i,            '• Apresentamos o portal de relatórios online'],
    [/crm verificado.*orientações/i,              '• Verificamos o CRM e repassamos orientações'],
    [/cliente orientado.*visita de técnico/i,     '• Orientamos o cliente a solicitar suporte técnico presencial'],
  ];

  function buildResumoTecnico(steps, df, obs) {
    let txt = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    txt += `\n${FRASE_FINAL}`;
    if (obs) txt += `\n\nObservação: ${obs}`;
    const d = DESFECHOS.find(x => x.l === df);
    if (d) txt += `\n\n${d.bloco}`;
    return txt;
  }

  function buildResumoCliente(steps, df, obs) {
    const itens = [];
    for (const step of steps) {
      for (const [re, texto] of TRADUCOES) {
        if (re.test(step) && !itens.includes(texto)) { itens.push(texto); break; }
      }
    }
    if (itens.length === 0) itens.push('• Realizamos os procedimentos necessários para resolver o problema');
    if (obs) itens.push(`• ${obs}`);
    const desfechoMap = {
      'Resolvido':   '\nO problema foi resolvido durante este atendimento.',
      'Parcial':     '\nO problema foi parcialmente resolvido. Entraremos em contato para continuidade.',
      'Análise Q.A': '\nO caso foi encaminhado para análise aprofundada da nossa equipe.',
      'Ag. cliente': '\nO atendimento está aguardando seu retorno para continuidade.',
    };
    let txt = itens.join('\n');
    if (df && desfechoMap[df]) txt += `\n${desfechoMap[df]}`;
    txt += '\n\nCaso tenha qualquer dúvida, estamos à disposição.';
    return txt;
  }

  // ─── Botão flutuante (fora do iframe) ───────────────────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'nexos-toggle-outer';
  toggleBtn.textContent = 'NEXOS';
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: '2147483647',
    background: '#1F93FF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px 0 0 8px',
    padding: '10px 6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '.05em',
    writingMode: 'vertical-rl',
    boxShadow: '-2px 0 8px rgba(0,0,0,.18)',
  });
  document.documentElement.appendChild(toggleBtn);

  // ─── iframe isolado ──────────────────────────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.id = 'nexos-iframe';
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    top: '0',
    width: '360px',
    height: '100vh',
    border: 'none',
    zIndex: '2147483646',
    display: 'none',
    boxShadow: '-4px 0 24px rgba(0,0,0,.15)',
  });
  document.documentElement.appendChild(iframe);

  // ─── Conteúdo do iframe ──────────────────────────────────────────────────
  const iframeContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #111;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
#hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #1F93FF;
  color: #fff;
  flex-shrink: 0;
}
#hdr h2 { font-size: 14px; font-weight: 700; }
#close-btn {
  background: none; border: none; color: #fff;
  cursor: pointer; font-size: 20px; line-height: 1; padding: 0 4px;
}
#body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sec {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.sec-title {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 8px 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sec-body { padding: 8px 10px; }
.sub-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}
.steps-grid { display: flex; flex-direction: column; gap: 4px; }
.step-btn {
  text-align: left;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  transition: all .1s;
}
.step-btn:hover { border-color: #1F93FF; color: #1F93FF; }
.step-btn.sel { background: #eff6ff; border-color: #1F93FF; color: #1F93FF; font-weight: 500; }
.chk {
  width: 14px; height: 14px; border-radius: 3px;
  border: 1.5px solid #d1d5db;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
}
.step-btn.sel .chk { background: #1F93FF; border-color: #1F93FF; color: #fff; }
.cat-btn {
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cat-btn:last-of-type { border-bottom: none; }
.cat-btn:hover { background: #e5e7eb; }
.cat-content {
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  display: none;
  flex-direction: column;
  gap: 4px;
}
.cat-content.open { display: flex; }
.df-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.df-btn {
  padding: 7px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  text-align: center;
}
.df-btn:hover { border-color: #6b7280; }
.df-btn.df-ok   { background: #dcfce7; border-color: #16a34a; color: #15803d; }
.df-btn.df-warn { background: #fef9c3; border-color: #ca8a04; color: #a16207; }
.df-btn.df-info { background: #eff6ff; border-color: #1F93FF; color: #1677d2; }
.df-btn.df-gray { background: #f3f4f6; border-color: #6b7280; color: #374151; }
.sel-list { display: flex; flex-direction: column; gap: 3px; }
.sel-item {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px;
  background: #eff6ff;
  border-radius: 5px;
  font-size: 12px;
  color: #1677d2;
}
.sel-item .rm {
  margin-left: auto;
  background: none; border: none;
  color: #93c5fd; cursor: pointer;
  font-size: 16px; line-height: 1;
  flex-shrink: 0;
}
.sel-item .rm:hover { color: #1F93FF; }
.drag-h { cursor: grab; color: #93c5fd; font-size: 12px; flex-shrink: 0; }
input, textarea {
  width: 100%;
  padding: 7px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #111;
  font-family: inherit;
  outline: none;
}
input:focus, textarea:focus { border-color: #1F93FF; }
textarea { resize: vertical; }
.custom-row { display: flex; gap: 6px; margin-top: 6px; }
.custom-row input { flex: 1; }
.add-btn {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #1F93FF;
  background: #eff6ff;
  color: #1F93FF;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.add-btn:hover { background: #1F93FF; color: #fff; }
.badge {
  background: #1F93FF; color: #fff;
  border-radius: 99px;
  font-size: 10px; font-weight: 700;
  min-width: 18px; height: 18px;
  padding: 0 5px;
  display: inline-flex; align-items: center; justify-content: center;
}
#ftr {
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  display: flex; flex-direction: column; gap: 6px;
  flex-shrink: 0;
  background: #f9fafb;
}
.tab-bar { display: flex; gap: 4px; }
.tab {
  flex: 1; padding: 6px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 12px; font-weight: 500;
  cursor: pointer; text-align: center; color: #6b7280;
}
.tab.active { background: #eff6ff; border-color: #1F93FF; color: #1F93FF; font-weight: 600; }
.preview {
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 7px; padding: 10px;
  font-size: 12px; line-height: 1.7;
  white-space: pre-wrap; color: #111;
  max-height: 160px; overflow-y: auto;
  display: none;
}
.btn {
  padding: 9px 12px; border-radius: 7px; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; font-family: inherit;
}
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary { background: #1F93FF; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #1677d2; }
.btn-secondary { background: #fff; color: #374151; border: 1px solid #d1d5db; }
.btn-secondary:hover:not(:disabled) { border-color: #9ca3af; }
.btn-danger { background: #fff; color: #dc2626; border: 1px solid #fca5a5; }
.btn-danger:hover:not(:disabled) { background: #fee2e2; }
.confirm-box {
  padding: 10px; background: #fefce8;
  border: 1px solid #fde047; border-radius: 7px;
  font-size: 12px; color: #854d0e;
  display: none; flex-direction: column; gap: 8px;
}
.confirm-box.show { display: flex; }
.confirm-actions { display: flex; gap: 6px; }
.confirm-actions .btn { flex: 1; }
.status { font-size: 12px; text-align: center; padding: 4px; display: none; }
.status.ok { color: #16a34a; }
.status.err { color: #dc2626; }
.token-row { display: flex; gap: 6px; }
.token-row input { flex: 1; }
.token-save {
  padding: 7px 10px; border-radius: 6px;
  border: 1px solid #d1d5db; background: #fff;
  font-size: 12px; cursor: pointer; white-space: nowrap;
  font-family: inherit;
}
.token-save:hover { border-color: #1F93FF; color: #1F93FF; }
.hint { font-size: 11px; color: #9ca3af; margin-top: 5px; }
.token-ok { font-size: 11px; color: #16a34a; margin-top: 4px; display: none; }
</style>
</head>
<body>
<div id="hdr">
  <h2>🔗 Nexos</h2>
  <button id="close-btn">×</button>
</div>
<div id="body">

  <div class="sec">
    <div class="sec-title">🔑 Token do Chatwoot</div>
    <div class="sec-body">
      <div class="token-row">
        <input id="token-input" type="password" placeholder="Cole seu token de acesso..."/>
        <button class="token-save" id="token-save">Salvar</button>
      </div>
      <div class="hint">Chatwoot → Configurações → Perfil → Token de acesso</div>
      <div class="token-ok" id="token-ok">✓ Token salvo</div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">
      <span>📋 Passos realizados</span>
      <span class="badge" id="badge" style="display:none">0</span>
    </div>
    <div class="sec-body">
      <div class="sub-label">⭐ Mais usados</div>
      <div class="steps-grid" id="fav-grid"></div>
      <div class="sub-label" style="margin-top:10px;">📂 Outras ações</div>
      <div id="cats"></div>
      <div class="custom-row">
        <input id="custom-input" placeholder="Ação personalizada..."/>
        <button class="add-btn" id="custom-add">+ Adicionar</button>
      </div>
    </div>
  </div>

  <div class="sec" id="sel-sec" style="display:none">
    <div class="sec-title">✅ Passos selecionados</div>
    <div class="sec-body">
      <div class="sel-list" id="sel-list"></div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">🏁 Desfecho</div>
    <div class="sec-body">
      <div class="df-grid" id="df-grid"></div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">📝 Observação adicional (opcional)</div>
    <div class="sec-body">
      <textarea id="obs" rows="2" placeholder="Ex: cliente orientado sobre certificado digital"></textarea>
    </div>
  </div>

</div>
<div id="ftr">
  <div class="tab-bar">
    <button class="tab active" id="tab-tec">Resumo técnico</button>
    <button class="tab" id="tab-cli">Para o cliente</button>
  </div>
  <div class="preview" id="preview"></div>
  <div class="confirm-box" id="confirm-box">
    <div><strong>⚠️ Nota pública</strong><br>Esta nota ficará visível para o cliente no Chatwoot. Confirma?</div>
    <div class="confirm-actions">
      <button class="btn btn-primary" id="confirm-yes">Confirmar</button>
      <button class="btn btn-secondary" id="confirm-no">Cancelar</button>
    </div>
  </div>
  <div class="status" id="status"></div>
  <button class="btn btn-primary" id="btn-gerar">Gerar resumo</button>
  <div id="action-btns" style="display:none;flex-direction:column;gap:6px;">
    <button class="btn btn-secondary" id="btn-copy">📋 Copiar texto</button>
    <button class="btn btn-secondary" id="btn-private">🔒 Enviar nota privada</button>
    <button class="btn btn-danger" id="btn-public">👁 Enviar ao cliente (nota pública)</button>
    <button class="btn btn-secondary" id="btn-reset" style="font-size:12px;color:#9ca3af;border-color:#e5e7eb;">↺ Novo chamado</button>
  </div>
</div>
<script>
// Estado
let steps = [];
let df = '';
let activeTab = 'tec';
let resumoTec = '';
let resumoCli = '';

const FAV = ${JSON.stringify(FAV)};
const CATS = ${JSON.stringify(CATS)};
const DESFECHOS = ${JSON.stringify(DESFECHOS)};
const TRADUCOES_RE = ${JSON.stringify(TRADUCOES.map(([re, txt]) => [re.source, re.flags, txt]))};
const FRASE_FINAL = ${JSON.stringify(FRASE_FINAL)};

function buildTec(steps, df, obs) {
  let txt = steps.map((s,i) => (i+1)+'. '+s).join('\\n');
  txt += '\\n' + FRASE_FINAL;
  if (obs) txt += '\\n\\nObservação: ' + obs;
  const d = DESFECHOS.find(x => x.l === df);
  if (d) txt += '\\n\\n' + d.bloco;
  return txt;
}

function buildCli(steps, df, obs) {
  const itens = [];
  for (const step of steps) {
    for (const [src, flags, texto] of TRADUCOES_RE) {
      if (new RegExp(src, flags).test(step) && !itens.includes(texto)) { itens.push(texto); break; }
    }
  }
  if (!itens.length) itens.push('• Realizamos os procedimentos necessários para resolver o problema');
  if (obs) itens.push('• ' + obs);
  const dm = {
    'Resolvido':   '\\nO problema foi resolvido durante este atendimento.',
    'Parcial':     '\\nO problema foi parcialmente resolvido. Entraremos em contato para continuidade.',
    'Análise Q.A': '\\nO caso foi encaminhado para análise aprofundada da nossa equipe.',
    'Ag. cliente': '\\nO atendimento está aguardando seu retorno para continuidade.',
  };
  let txt = itens.join('\\n');
  if (df && dm[df]) txt += dm[df];
  txt += '\\n\\nCaso tenha qualquer dúvida, estamos à disposição.';
  return txt;
}

// Token
const tokenInput = document.getElementById('token-input');
const tokenOk = document.getElementById('token-ok');
const savedToken = localStorage.getItem('nexos_token') || '';
tokenInput.value = savedToken;
if (savedToken) tokenOk.style.display = 'block';

document.getElementById('token-save').addEventListener('click', () => {
  const v = tokenInput.value.trim();
  localStorage.setItem('nexos_token', v);
  tokenOk.textContent = v ? '✓ Token salvo' : '✓ Token removido';
  tokenOk.style.display = 'block';
  setTimeout(() => tokenOk.style.display = 'none', 2000);
});

// Favoritos
const favGrid = document.getElementById('fav-grid');
FAV.forEach(l => {
  const btn = document.createElement('button');
  btn.className = 'step-btn';
  btn.dataset.label = l;
  btn.innerHTML = '<span class="chk"></span><span>'+l+'</span>';
  btn.addEventListener('click', () => toggleStep(l));
  favGrid.appendChild(btn);
});

// Categorias
const catsEl = document.getElementById('cats');
CATS.forEach(cat => {
  const catBtn = document.createElement('button');
  catBtn.className = 'cat-btn';
  catBtn.innerHTML = '<span>'+cat.g+'</span><span class="arr">▸</span>';
  catsEl.appendChild(catBtn);
  const content = document.createElement('div');
  content.className = 'cat-content';
  cat.a.forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'step-btn';
    btn.dataset.label = l;
    btn.innerHTML = '<span class="chk"></span><span>'+l+'</span>';
    btn.addEventListener('click', () => toggleStep(l));
    content.appendChild(btn);
  });
  catsEl.appendChild(content);
  catBtn.addEventListener('click', () => {
    const open = content.classList.contains('open');
    catsEl.querySelectorAll('.cat-content').forEach(el => el.classList.remove('open'));
    catsEl.querySelectorAll('.arr').forEach(el => el.textContent = '▸');
    if (!open) { content.classList.add('open'); catBtn.querySelector('.arr').textContent = '▾'; }
  });
});

// Personalizado
document.getElementById('custom-add').addEventListener('click', addCustom);
document.getElementById('custom-input').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
function addCustom() {
  const v = document.getElementById('custom-input').value.trim();
  if (!v) return;
  toggleStep(v);
  document.getElementById('custom-input').value = '';
}

// Desfecho
const dfCls = ['df-ok','df-warn','df-info','df-gray'];
DESFECHOS.forEach((d, i) => {
  const btn = document.createElement('button');
  btn.className = 'df-btn';
  btn.textContent = d.l;
  btn.dataset.df = d.l;
  btn.dataset.cls = dfCls[i];
  btn.addEventListener('click', () => {
    df = df === d.l ? '' : d.l;
    renderDf();
    resetResult();
  });
  document.getElementById('df-grid').appendChild(btn);
});
function renderDf() {
  document.querySelectorAll('.df-btn').forEach(btn => {
    dfCls.forEach(c => btn.classList.remove(c));
    if (btn.dataset.df === df) btn.classList.add(btn.dataset.cls);
  });
}

// Steps
function toggleStep(label) {
  steps = steps.includes(label) ? steps.filter(s => s !== label) : [...steps, label];
  renderSteps();
  resetResult();
}
function renderSteps() {
  document.querySelectorAll('.step-btn').forEach(btn => {
    const sel = steps.includes(btn.dataset.label);
    btn.classList.toggle('sel', sel);
    btn.querySelector('.chk').textContent = sel ? '✓' : '';
  });
  const badge = document.getElementById('badge');
  badge.style.display = steps.length ? 'inline-flex' : 'none';
  badge.textContent = steps.length;
  const sec = document.getElementById('sel-sec');
  const list = document.getElementById('sel-list');
  list.innerHTML = '';
  sec.style.display = steps.length ? 'block' : 'none';
  steps.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'sel-item';
    item.draggable = true;
    item.dataset.idx = i;
    item.innerHTML = '<span class="drag-h">⠿</span><span style="flex:1">'+s+'</span><button class="rm">×</button>';
    item.querySelector('.rm').addEventListener('click', () => toggleStep(s));
    item.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', i));
    item.addEventListener('dragover', e => e.preventDefault());
    item.addEventListener('drop', e => {
      e.preventDefault();
      const from = parseInt(e.dataTransfer.getData('text/plain'));
      const to = i;
      if (from === to) return;
      const arr = [...steps];
      const [el] = arr.splice(from, 1);
      arr.splice(to, 0, el);
      steps = arr;
      renderSteps();
    });
    list.appendChild(item);
  });
}

// Tabs
document.getElementById('tab-tec').addEventListener('click', () => setTab('tec'));
document.getElementById('tab-cli').addEventListener('click', () => setTab('cli'));
function setTab(tab) {
  activeTab = tab;
  document.getElementById('tab-tec').classList.toggle('active', tab === 'tec');
  document.getElementById('tab-cli').classList.toggle('active', tab === 'cli');
  const p = document.getElementById('preview');
  const txt = tab === 'tec' ? resumoTec : resumoCli;
  if (txt) { p.textContent = txt; p.style.display = 'block'; }
  else p.style.display = 'none';
  document.getElementById('confirm-box').classList.remove('show');
  clearStatus();
}

// Gerar
document.getElementById('btn-gerar').addEventListener('click', () => {
  if (!steps.length) { showStatus('Selecione ao menos um passo.', 'err'); return; }
  const obs = document.getElementById('obs').value.trim();
  resumoTec = buildTec(steps, df, obs);
  resumoCli = buildCli(steps, df, obs);
  const p = document.getElementById('preview');
  p.textContent = activeTab === 'tec' ? resumoTec : resumoCli;
  p.style.display = 'block';
  document.getElementById('btn-gerar').style.display = 'none';
  document.getElementById('action-btns').style.display = 'flex';
  clearStatus();
});

// Copiar
document.getElementById('btn-copy').addEventListener('click', () => {
  const txt = activeTab === 'tec' ? resumoTec : resumoCli;
  navigator.clipboard.writeText(txt).then(() => showStatus('✓ Copiado!', 'ok')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = txt;
    Object.assign(ta.style, {position:'fixed',top:'0',left:'0',width:'1px',height:'1px',opacity:'0'});
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showStatus('✓ Copiado!', 'ok');
  });
});

// Nota privada
document.getElementById('btn-private').addEventListener('click', () => sendNote(true));

// Nota pública
document.getElementById('btn-public').addEventListener('click', () => {
  document.getElementById('confirm-box').classList.add('show');
  clearStatus();
});
document.getElementById('confirm-no').addEventListener('click', () => {
  document.getElementById('confirm-box').classList.remove('show');
});
document.getElementById('confirm-yes').addEventListener('click', () => {
  document.getElementById('confirm-box').classList.remove('show');
  sendNote(false);
});

function sendNote(isPrivate) {
  const token = (localStorage.getItem('nexos_token') || '').trim();
  if (!token) { showStatus('Configure o token do Chatwoot primeiro.', 'err'); return; }
  const content = isPrivate ? resumoTec : resumoCli;
  showStatus('Enviando...', '');
  // Envia mensagem para o script pai fazer o GM_xmlhttpRequest
  window.parent.postMessage({ type: 'nexos_send', content, isPrivate, token }, '*');
}

// Reset
document.getElementById('btn-reset').addEventListener('click', () => {
  steps = []; df = ''; resumoTec = ''; resumoCli = '';
  document.getElementById('obs').value = '';
  document.getElementById('custom-input').value = '';
  document.getElementById('preview').style.display = 'none';
  document.getElementById('preview').textContent = '';
  document.getElementById('btn-gerar').style.display = 'flex';
  document.getElementById('action-btns').style.display = 'none';
  document.getElementById('confirm-box').classList.remove('show');
  renderSteps(); renderDf(); clearStatus();
  catsEl.querySelectorAll('.cat-content').forEach(el => el.classList.remove('open'));
  catsEl.querySelectorAll('.arr').forEach(el => el.textContent = '▸');
});

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg; el.className = 'status ' + type; el.style.display = 'block';
}
function clearStatus() {
  const el = document.getElementById('status');
  el.style.display = 'none'; el.textContent = '';
}

// Recebe resposta do envio
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'nexos_result') {
    showStatus(e.data.ok
      ? (e.data.isPrivate ? '✓ Nota privada enviada!' : '✓ Nota pública enviada ao cliente!')
      : 'Erro ao enviar. Verifique o token e a URL.', e.data.ok ? 'ok' : 'err');
  }
});

// Fechar
document.getElementById('close-btn').addEventListener('click', () => {
  window.parent.postMessage({ type: 'nexos_close' }, '*');
});
</script>
</body>
</html>`;

  // ─── Injeta conteúdo no iframe ───────────────────────────────────────────
  iframe.addEventListener('load', () => {});
  document.documentElement.appendChild(iframe);

  const blob = new Blob([iframeContent], { type: 'text/html' });
  iframe.src = URL.createObjectURL(blob);

  // ─── Comunicação com o iframe ─────────────────────────────────────────────
  window.addEventListener('message', e => {
    if (!e.data) return;

    if (e.data.type === 'nexos_close') {
      iframe.style.display = 'none';
      toggleBtn.style.display = 'block';
    }

    if (e.data.type === 'nexos_send') {
      const ids = getIdsFromUrl();
      if (!ids) {
        iframe.contentWindow.postMessage({ type: 'nexos_result', ok: false, isPrivate: e.data.isPrivate }, '*');
        return;
      }
      GM_xmlhttpRequest({
        method: 'POST',
        url: `https://app.chatwoot.com/api/v1/accounts/${ids.accountId}/conversations/${ids.conversationId}/messages`,
        headers: { 'Content-Type': 'application/json', 'api_access_token': e.data.token },
        data: JSON.stringify({ content: e.data.content, message_type: 'outgoing', private: e.data.isPrivate }),
        onload: r => iframe.contentWindow.postMessage({ type: 'nexos_result', ok: r.status >= 200 && r.status < 300, isPrivate: e.data.isPrivate }, '*'),
        onerror: () => iframe.contentWindow.postMessage({ type: 'nexos_result', ok: false, isPrivate: e.data.isPrivate }, '*'),
      });
    }
  });

  // ─── Toggle ───────────────────────────────────────────────────────────────
  toggleBtn.addEventListener('click', () => {
    iframe.style.display = 'block';
    toggleBtn.style.display = 'none';
  });

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'n') {
      const open = iframe.style.display !== 'none';
      iframe.style.display = open ? 'none' : 'block';
      toggleBtn.style.display = open ? 'block' : 'none';
    }
  });

  // ─── Detecta troca de conversa (SPA) ────────────────────────────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
    }
  }).observe(document.body, { childList: true, subtree: true });

})();
