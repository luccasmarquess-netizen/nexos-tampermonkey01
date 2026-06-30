// ==UserScript==
// @name         Nexos
// @namespace    https://github.com/luccasmarquess-netizen/nexos-tampermonkey01
// @version      1.0.0
// @description  Resumo de atendimento técnico direto no Chatwoot — sem IA, sem dados externos
// @author       Luccas Marques
// @match        https://app.chatwoot.com/app/accounts/*/conversations/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      app.chatwoot.com
// @updateURL    https://raw.githubusercontent.com/luccasmarquess-netizen/nexos-tampermonkey01/main/nexos.user.js
// @downloadURL  https://raw.githubusercontent.com/luccasmarquess-netizen/nexos-tampermonkey01/main/nexos.user.js
// ==/UserScript==

(function () {
  'use strict';

  // ─── Extrai accountId e conversationId da URL ────────────────────────────
  function getIdsFromUrl() {
    const m = location.href.match(/accounts\/(\d+)\/conversations\/(\d+)/);
    return m ? { accountId: m[1], conversationId: m[2] } : null;
  }

  // ─── Dados — passos ──────────────────────────────────────────────────────
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
    { l: 'Resolvido',     bloco: '✅ DESFECHO: Resolvido\nTodos os procedimentos foram concluídos com êxito e o problema foi resolvido durante o atendimento.' },
    { l: 'Parcial',       bloco: '⚠️ DESFECHO: Parcial\nO problema foi parcialmente resolvido. Pendências identificadas serão acompanhadas em novo contato.' },
    { l: 'Análise Q.A',   bloco: '🔍 DESFECHO: Encaminhado para Q.A\nO chamado foi encaminhado para análise pela equipe de qualidade para investigação aprofundada.' },
    { l: 'Ag. cliente',   bloco: '⏳ DESFECHO: Aguardando cliente\nAtendimento suspenso. Aguardando retorno do responsável pelo estabelecimento para continuidade.' },
  ];

  const FRASE_FINAL = 'Todos os procedimentos e testes foram realizados na presença do responsável pelo estabelecimento.';

  // ─── Geração de resumo por template (sem IA) ─────────────────────────────
  function buildResumoTecnico(steps, df, obs) {
    let txt = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    txt += `\n${FRASE_FINAL}`;
    if (obs) txt += `\n\nObservação: ${obs}`;
    const d = DESFECHOS.find(x => x.l === df);
    if (d) txt += `\n\n${d.bloco}`;
    return txt;
  }

  function buildResumoCliente(steps, df, obs) {
    // Mapa de tradução: termo técnico → linguagem simples
    const traducoes = [
      [/acesso remoto estabelecido.*$/i,           '• Realizamos o atendimento de forma remota'],
      [/atualização do consumer executada/i,        '• Atualizamos o sistema para a versão mais recente'],
      [/consumer reiniciado/i,                      '• Reiniciamos o sistema'],
      [/reinstalação do consumer realizada/i,       '• Reinstalamos o sistema completo'],
      [/backup realizado/i,                         '• Realizamos uma cópia de segurança dos dados antes de iniciar'],
      [/bloqueio de antivírus.*verificado/i,        '• Verificamos as permissões de segurança do computador'],
      [/ativação\/licença verificada/i,             '• Verificamos a licença de uso do sistema'],
      [/ip fixo.*configurado/i,                     '• Configuramos o endereço de rede do servidor'],
      [/vpn.*configurada/i,                         '• Configuramos a conexão entre os computadores da loja'],
      [/reconexão entre pc servidor e pc cliente/i, '• Restabelecemos a comunicação entre os computadores da loja'],
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
      [/arquivos xml exportados ao contador/i,      '• Exportamos os arquivos fiscais para o contador'],
      [/cancelamento de nfc-e\/nf-e/i,              '• Realizamos o cancelamento das notas fiscais solicitadas'],
      [/integração ifood verificada/i,              '• Verificamos e confirmamos o recebimento de pedidos pelo iFood'],
      [/integração 99food verificada/i,             '• Verificamos e confirmamos o recebimento de pedidos pelo 99Food'],
      [/integração keeta verificada/i,              '• Verificamos e confirmamos o recebimento de pedidos pelo Keeta'],
      [/bot whatsapp.*validado/i,                   '• Configuramos e testamos o Bot do WhatsApp'],
      [/bot whatsapp verificado/i,                  '• Verificamos o funcionamento do Bot do WhatsApp'],
      [/app do entregador verificado/i,             '• Verificamos o funcionamento do App do Entregador'],
      [/monitor de preparo verificado/i,            '• Verificamos o funcionamento do Monitor de Preparo'],
      [/recebimento via pix configurado/i,          '• Configuramos o recebimento de pagamentos via PIX'],
      [/totem verificado\/configurado/i,            '• Verificamos e configuramos o totem de autoatendimento'],
      [/módulo mobile instalado e validado/i,       '• Instalamos e validamos o módulo de atendimento pelo celular'],
      [/máquina tef verificada\/integrada/i,        '• Verificamos e integramos a maquininha de cartão'],
      [/integração via api do parceiro/i,           '• Configuramos a integração com o sistema do parceiro'],
      [/smartpos verificado\/configurado/i,         '• Verificamos e configuramos o terminal de pagamento'],
      [/serviços logísticos verificados/i,          '• Verificamos os serviços de entrega configurados'],
      [/menudino configurado e validado/i,          '• Configuramos e validamos o cardápio online do estabelecimento'],
      [/chave google maps configurada/i,            '• Configuramos a integração com o mapa para entregas'],
      [/produtos em destaque.*configurados/i,       '• Configuramos os produtos em destaque no cardápio online'],
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
      [/local de produção vinculado/i,              '• Vinculamos os locais de produção aos produtos'],
      [/conta google play developer/i,              '• Configuramos a conta de desenvolvedor necessária'],
      [/ponto central de localização.*ajustado/i,   '• Ajustamos a localização do estabelecimento no mapa'],
      [/versão rede verificada/i,                   '• Verificamos a comunicação em rede entre os computadores'],
      [/teste de conectividade.*internet/i,         '• Testamos a conexão com a internet'],
      [/alteração de métricas de rede/i,            '• Ajustamos as configurações de rede'],
    ];

    const itens = [];
    for (const step of steps) {
      let traduzido = null;
      for (const [regex, texto] of traducoes) {
        if (regex.test(step)) { traduzido = texto; break; }
      }
      if (traduzido && !itens.includes(traduzido)) itens.push(traduzido);
    }

    // Se não achou tradução para algum passo, adiciona genérico
    if (itens.length === 0) itens.push('• Realizamos os procedimentos necessários para resolver o problema');

    // Adiciona obs se tiver
    if (obs) itens.push(`• ${obs}`);

    // Desfecho em linguagem simples
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

  // ─── API Chatwoot via GM_xmlhttpRequest ──────────────────────────────────
  function chatwootPost(accountId, conversationId, content, isPrivate, token) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: `https://app.chatwoot.com/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
        headers: {
          'Content-Type': 'application/json',
          'api_access_token': token,
        },
        data: JSON.stringify({ content, message_type: 'outgoing', private: isPrivate }),
        onload: r => r.status >= 200 && r.status < 300 ? resolve() : reject(r.status),
        onerror: reject,
      });
    });
  }

  // ─── Estado da UI ────────────────────────────────────────────────────────
  let selectedSteps = [];
  let selectedDf = '';
  let obsText = '';
  let openCat = null;
  let currentIds = null;

  // ─── CSS ─────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #nexos-toggle {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 99999;
      background: #1F93FF;
      color: #fff;
      border: none;
      border-radius: 8px 0 0 8px;
      padding: 10px 6px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .05em;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      box-shadow: -2px 0 8px rgba(0,0,0,.18);
      transition: background .15s;
    }
    #nexos-toggle:hover { background: #1677d2; }

    #nexos-panel {
      position: fixed;
      right: 0;
      top: 0;
      height: 100vh;
      width: 360px;
      background: #fff;
      border-left: 1px solid #e5e7eb;
      box-shadow: -4px 0 24px rgba(0,0,0,.12);
      z-index: 99998;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #111;
      transition: transform .2s ease;
    }
    #nexos-panel.hidden { transform: translateX(100%); }

    #nexos-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid #e5e7eb;
      background: #1F93FF;
      color: #fff;
      flex-shrink: 0;
    }
    #nexos-header h2 { margin: 0; font-size: 14px; font-weight: 700; letter-spacing: .03em; }
    #nexos-close {
      background: none; border: none; color: #fff;
      cursor: pointer; font-size: 18px; line-height: 1; padding: 2px 4px;
    }

    #nexos-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .nx-section {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .nx-section-title {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: .06em;
      padding: 8px 10px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    .nx-section-body { padding: 8px 10px; }

    .nx-steps-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nx-step-btn {
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
      transition: all .1s;
    }
    .nx-step-btn:hover { border-color: #1F93FF; color: #1F93FF; }
    .nx-step-btn.selected {
      background: #eff6ff;
      border-color: #1F93FF;
      color: #1F93FF;
      font-weight: 500;
    }
    .nx-step-btn .nx-check {
      width: 14px; height: 14px; border-radius: 3px;
      border: 1.5px solid #d1d5db;
      background: #fff;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px;
    }
    .nx-step-btn.selected .nx-check {
      background: #1F93FF; border-color: #1F93FF; color: #fff;
    }

    .nx-cat-btn {
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
    .nx-cat-btn:last-child { border-bottom: none; }
    .nx-cat-btn:hover { background: #e5e7eb; }
    .nx-cat-content {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nx-df-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .nx-df-btn {
      padding: 7px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: #374151;
      text-align: center;
      transition: all .1s;
    }
    .nx-df-btn:hover { border-color: #6b7280; }
    .nx-df-btn.selected-ok  { background: #dcfce7; border-color: #16a34a; color: #15803d; }
    .nx-df-btn.selected-warn{ background: #fef9c3; border-color: #ca8a04; color: #a16207; }
    .nx-df-btn.selected-info{ background: #eff6ff; border-color: #1F93FF; color: #1677d2; }
    .nx-df-btn.selected-gray{ background: #f3f4f6; border-color: #6b7280; color: #374151; }

    .nx-selected-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .nx-selected-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      background: #eff6ff;
      border-radius: 5px;
      font-size: 12px;
      color: #1677d2;
    }
    .nx-selected-item .nx-rm {
      margin-left: auto;
      background: none;
      border: none;
      color: #93c5fd;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0 2px;
      flex-shrink: 0;
    }
    .nx-selected-item .nx-rm:hover { color: #1F93FF; }
    .nx-drag-handle {
      cursor: grab;
      color: #93c5fd;
      font-size: 12px;
      flex-shrink: 0;
    }

    .nx-input {
      width: 100%;
      padding: 7px 8px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 12px;
      color: #111;
      box-sizing: border-box;
      outline: none;
    }
    .nx-input:focus { border-color: #1F93FF; }

    .nx-custom-row {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .nx-custom-row input { flex: 1; }
    .nx-add-btn {
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
    .nx-add-btn:hover { background: #1F93FF; color: #fff; }

    #nexos-footer {
      padding: 10px 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      background: #f9fafb;
    }

    .nx-btn {
      padding: 9px 12px;
      border-radius: 7px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all .15s;
      width: 100%;
    }
    .nx-btn:disabled { opacity: .5; cursor: not-allowed; }
    .nx-btn-primary { background: #1F93FF; color: #fff; }
    .nx-btn-primary:hover:not(:disabled) { background: #1677d2; }
    .nx-btn-secondary { background: #fff; color: #374151; border: 1px solid #d1d5db; }
    .nx-btn-secondary:hover:not(:disabled) { border-color: #9ca3af; }
    .nx-btn-danger { background: #fff; color: #dc2626; border: 1px solid #fca5a5; }
    .nx-btn-danger:hover:not(:disabled) { background: #fee2e2; }
    .nx-btn-ok { background: #16a34a; color: #fff; }

    .nx-confirm-box {
      padding: 10px;
      background: #fefce8;
      border: 1px solid #fde047;
      border-radius: 7px;
      font-size: 12px;
      color: #854d0e;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nx-confirm-box strong { display: block; margin-bottom: 2px; }
    .nx-confirm-actions { display: flex; gap: 6px; }
    .nx-confirm-actions button { flex: 1; }

    .nx-result-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 7px;
      padding: 10px;
      font-size: 12px;
      line-height: 1.7;
      white-space: pre-wrap;
      color: #111;
      max-height: 180px;
      overflow-y: auto;
    }

    .nx-status {
      font-size: 12px;
      text-align: center;
      padding: 4px;
    }
    .nx-status.ok { color: #16a34a; }
    .nx-status.err { color: #dc2626; }

    .nx-token-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .nx-token-row input { flex: 1; }
    .nx-token-save {
      padding: 7px 10px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      background: #fff;
      font-size: 12px;
      cursor: pointer;
      white-space: nowrap;
    }
    .nx-token-save:hover { border-color: #1F93FF; color: #1F93FF; }

    .nx-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #1F93FF;
      color: #fff;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
    }

    .nx-tab-bar {
      display: flex;
      gap: 4px;
      margin-bottom: 4px;
    }
    .nx-tab {
      flex: 1;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      background: #fff;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
      color: #6b7280;
    }
    .nx-tab.active {
      background: #eff6ff;
      border-color: #1F93FF;
      color: #1F93FF;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);

  // ─── Estrutura HTML ───────────────────────────────────────────────────────
  const toggle = document.createElement('button');
  toggle.id = 'nexos-toggle';
  toggle.textContent = 'NEXOS';
  toggle.title = 'Abrir Nexos (Alt+N)';
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.id = 'nexos-panel';
  panel.classList.add('hidden');
  panel.innerHTML = `
    <div id="nexos-header">
      <h2>🔗 Nexos</h2>
      <button id="nexos-close" title="Fechar">×</button>
    </div>
    <div id="nexos-body">

      <!-- Token -->
      <div class="nx-section">
        <div class="nx-section-title">🔑 Token do Chatwoot</div>
        <div class="nx-section-body">
          <div class="nx-token-row">
            <input class="nx-input" id="nx-token" type="password" placeholder="Cole seu token de acesso..."/>
            <button class="nx-token-save" id="nx-token-save">Salvar</button>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:5px;">
            Chatwoot → Configurações → Perfil → Token de acesso
          </div>
          <div id="nx-token-status" style="font-size:11px;color:#16a34a;margin-top:4px;display:none;">✓ Token salvo</div>
        </div>
      </div>

      <!-- Passos -->
      <div class="nx-section">
        <div class="nx-section-title" style="display:flex;align-items:center;justify-content:space-between;">
          <span>📋 Passos realizados</span>
          <span id="nx-steps-count" class="nx-badge" style="display:none;">0</span>
        </div>
        <div class="nx-section-body">

          <!-- Favoritos -->
          <div style="font-size:11px;font-weight:600;color:#6b7280;margin-bottom:6px;">⭐ Mais usados</div>
          <div class="nx-steps-grid" id="nx-fav-grid"></div>

          <!-- Categorias -->
          <div style="font-size:11px;font-weight:600;color:#6b7280;margin:10px 0 4px;">📂 Outras ações</div>
          <div id="nx-cats"></div>

          <!-- Personalizado -->
          <div class="nx-custom-row">
            <input class="nx-input" id="nx-custom-input" placeholder="Ação personalizada..."/>
            <button class="nx-add-btn" id="nx-custom-add">+ Adicionar</button>
          </div>
        </div>
      </div>

      <!-- Selecionados -->
      <div class="nx-section" id="nx-selected-section" style="display:none;">
        <div class="nx-section-title">✅ Passos selecionados</div>
        <div class="nx-section-body">
          <div class="nx-selected-list" id="nx-selected-list"></div>
        </div>
      </div>

      <!-- Desfecho -->
      <div class="nx-section">
        <div class="nx-section-title">🏁 Desfecho</div>
        <div class="nx-section-body">
          <div class="nx-df-grid" id="nx-df-grid"></div>
        </div>
      </div>

      <!-- Observação -->
      <div class="nx-section">
        <div class="nx-section-title">📝 Observação adicional (opcional)</div>
        <div class="nx-section-body">
          <textarea class="nx-input" id="nx-obs" rows="2" placeholder="Ex: cliente orientado sobre certificado digital" style="resize:vertical;"></textarea>
        </div>
      </div>

    </div>
    <div id="nexos-footer">
      <div class="nx-tab-bar">
        <button class="nx-tab active" id="nx-tab-tec">Resumo técnico</button>
        <button class="nx-tab" id="nx-tab-cli">Para o cliente</button>
      </div>
      <div id="nx-preview" class="nx-result-box" style="display:none;"></div>
      <div id="nx-confirm-public" style="display:none;" class="nx-confirm-box">
        <div><strong>⚠️ Nota pública</strong>Esta nota ficará visível para o cliente no Chatwoot. Confirma o envio?</div>
        <div class="nx-confirm-actions">
          <button class="nx-btn nx-btn-primary" id="nx-confirm-yes">Confirmar</button>
          <button class="nx-btn nx-btn-secondary" id="nx-confirm-no">Cancelar</button>
        </div>
      </div>
      <div id="nx-status" class="nx-status" style="display:none;"></div>
      <button class="nx-btn nx-btn-primary" id="nx-btn-gerar">Gerar resumo</button>
      <div id="nx-action-btns" style="display:none;flex-direction:column;gap:6px;">
        <button class="nx-btn nx-btn-secondary" id="nx-btn-copy">📋 Copiar texto</button>
        <button class="nx-btn nx-btn-secondary" id="nx-btn-private">🔒 Enviar nota privada</button>
        <button class="nx-btn nx-btn-danger"    id="nx-btn-public">👁 Enviar ao cliente (nota pública)</button>
        <button class="nx-btn nx-btn-secondary" id="nx-btn-reset" style="font-size:12px;color:#9ca3af;border-color:#e5e7eb;">↺ Novo chamado</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // ─── Referências aos elementos ────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ─── Token ───────────────────────────────────────────────────────────────
  const savedToken = GM_getValue('nexos_cw_token', '');
  $('nx-token').value = savedToken;
  if (savedToken) $('nx-token-status').style.display = 'block';

  $('nx-token-save').addEventListener('click', () => {
    const v = $('nx-token').value.trim();
    GM_setValue('nexos_cw_token', v);
    const s = $('nx-token-status');
    s.style.display = 'block';
    s.textContent = v ? '✓ Token salvo' : '✓ Token removido';
    setTimeout(() => { s.style.display = 'none'; }, 2000);
  });

  // ─── Favoritos ───────────────────────────────────────────────────────────
  const favGrid = $('nx-fav-grid');
  FAV.forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'nx-step-btn';
    btn.dataset.label = l;
    btn.innerHTML = `<span class="nx-check"></span><span>${l}</span>`;
    btn.addEventListener('click', () => toggleStep(l));
    favGrid.appendChild(btn);
  });

  // ─── Categorias ──────────────────────────────────────────────────────────
  const catsEl = $('nx-cats');
  CATS.forEach(cat => {
    const catBtn = document.createElement('button');
    catBtn.className = 'nx-cat-btn';
    catBtn.innerHTML = `<span>${cat.g}</span><span class="nx-cat-arrow">▸</span>`;
    catsEl.appendChild(catBtn);

    const catContent = document.createElement('div');
    catContent.className = 'nx-cat-content';
    catContent.style.display = 'none';
    cat.a.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'nx-step-btn';
      btn.dataset.label = l;
      btn.innerHTML = `<span class="nx-check"></span><span>${l}</span>`;
      btn.addEventListener('click', () => toggleStep(l));
      catContent.appendChild(btn);
    });
    catsEl.appendChild(catContent);

    catBtn.addEventListener('click', () => {
      const isOpen = catContent.style.display !== 'none';
      // fecha todos
      catsEl.querySelectorAll('.nx-cat-content').forEach(el => el.style.display = 'none');
      catsEl.querySelectorAll('.nx-cat-arrow').forEach(el => el.textContent = '▸');
      if (!isOpen) {
        catContent.style.display = 'flex';
        catBtn.querySelector('.nx-cat-arrow').textContent = '▾';
      }
    });
  });

  // ─── Personalizado ───────────────────────────────────────────────────────
  $('nx-custom-add').addEventListener('click', addCustom);
  $('nx-custom-input').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });

  function addCustom() {
    const v = $('nx-custom-input').value.trim();
    if (!v) return;
    toggleStep(v);
    $('nx-custom-input').value = '';
  }

  // ─── Desfecho ────────────────────────────────────────────────────────────
  const dfCls = ['selected-ok', 'selected-warn', 'selected-info', 'selected-gray'];
  DESFECHOS.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'nx-df-btn';
    btn.textContent = d.l;
    btn.dataset.df = d.l;
    btn.dataset.cls = dfCls[i];
    btn.addEventListener('click', () => {
      selectedDf = selectedDf === d.l ? '' : d.l;
      renderDf();
    });
    $('nx-df-grid').appendChild(btn);
  });

  function renderDf() {
    $('nx-df-grid').querySelectorAll('.nx-df-btn').forEach(btn => {
      dfCls.forEach(c => btn.classList.remove(c));
      if (btn.dataset.df === selectedDf) btn.classList.add(btn.dataset.cls);
    });
  }

  // ─── Observação ──────────────────────────────────────────────────────────
  $('nx-obs').addEventListener('input', () => { obsText = $('nx-obs').value; });

  // ─── Lógica de steps ─────────────────────────────────────────────────────
  function toggleStep(label) {
    if (selectedSteps.includes(label)) {
      selectedSteps = selectedSteps.filter(s => s !== label);
    } else {
      selectedSteps.push(label);
    }
    renderSteps();
    resetResult();
  }

  function renderSteps() {
    // Atualiza botões de seleção (FAV + cats)
    document.querySelectorAll('.nx-step-btn').forEach(btn => {
      const sel = selectedSteps.includes(btn.dataset.label);
      btn.classList.toggle('selected', sel);
      btn.querySelector('.nx-check').textContent = sel ? '✓' : '';
    });

    // Badge
    const badge = $('nx-steps-count');
    if (selectedSteps.length > 0) {
      badge.style.display = 'inline-flex';
      badge.textContent = selectedSteps.length;
    } else {
      badge.style.display = 'none';
    }

    // Lista de selecionados
    const section = $('nx-selected-section');
    const list = $('nx-selected-list');
    list.innerHTML = '';
    if (selectedSteps.length === 0) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';

    selectedSteps.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'nx-selected-item';
      item.draggable = true;
      item.dataset.idx = i;
      item.innerHTML = `
        <span class="nx-drag-handle" title="Arrastar">⠿</span>
        <span style="flex:1;font-size:12px;">${s}</span>
        <button class="nx-rm" title="Remover">×</button>
      `;
      item.querySelector('.nx-rm').addEventListener('click', () => toggleStep(s));

      // Drag-and-drop
      item.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', i); });
      item.addEventListener('dragover', e => e.preventDefault());
      item.addEventListener('drop', e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('text/plain'));
        const to = i;
        if (from === to) return;
        const arr = [...selectedSteps];
        const [el] = arr.splice(from, 1);
        arr.splice(to, 0, el);
        selectedSteps = arr;
        renderSteps();
      });

      list.appendChild(item);
    });
  }

  // ─── Tabs (técnico / cliente) ─────────────────────────────────────────────
  let activeTab = 'tec';
  let resumoTecnico = '';
  let resumoCliente = '';

  $('nx-tab-tec').addEventListener('click', () => setTab('tec'));
  $('nx-tab-cli').addEventListener('click', () => setTab('cli'));

  function setTab(tab) {
    activeTab = tab;
    $('nx-tab-tec').classList.toggle('active', tab === 'tec');
    $('nx-tab-cli').classList.toggle('active', tab === 'cli');
    const preview = $('nx-preview');
    if (tab === 'tec' && resumoTecnico) { preview.textContent = resumoTecnico; preview.style.display = 'block'; }
    else if (tab === 'cli' && resumoCliente) { preview.textContent = resumoCliente; preview.style.display = 'block'; }
    else { preview.style.display = 'none'; }
    $('nx-confirm-public').style.display = 'none';
    clearStatus();
  }

  // ─── Gerar resumo ────────────────────────────────────────────────────────
  $('nx-btn-gerar').addEventListener('click', () => {
    if (selectedSteps.length === 0) {
      showStatus('Selecione ao menos um passo.', 'err');
      return;
    }
    resumoTecnico = buildResumoTecnico(selectedSteps, selectedDf, obsText);
    resumoCliente = buildResumoCliente(selectedSteps, selectedDf, obsText);

    const preview = $('nx-preview');
    preview.textContent = activeTab === 'tec' ? resumoTecnico : resumoCliente;
    preview.style.display = 'block';

    $('nx-btn-gerar').style.display = 'none';
    $('nx-action-btns').style.display = 'flex';
    clearStatus();
  });

  // ─── Copiar ──────────────────────────────────────────────────────────────
  $('nx-btn-copy').addEventListener('click', () => {
    const txt = activeTab === 'tec' ? resumoTecnico : resumoCliente;
    navigator.clipboard.writeText(txt).then(() => {
      showStatus('✓ Copiado!', 'ok');
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showStatus('✓ Copiado!', 'ok');
    });
  });

  // ─── Enviar nota privada ─────────────────────────────────────────────────
  $('nx-btn-private').addEventListener('click', () => sendNote(true));

  // ─── Enviar nota pública (com confirmação) ────────────────────────────────
  $('nx-btn-public').addEventListener('click', () => {
    $('nx-confirm-public').style.display = 'block';
    clearStatus();
  });
  $('nx-confirm-no').addEventListener('click', () => {
    $('nx-confirm-public').style.display = 'none';
  });
  $('nx-confirm-yes').addEventListener('click', () => {
    $('nx-confirm-public').style.display = 'none';
    sendNote(false);
  });

  async function sendNote(isPrivate) {
    const token = GM_getValue('nexos_cw_token', '').trim();
    if (!token) { showStatus('Configure o token do Chatwoot primeiro.', 'err'); return; }

    currentIds = getIdsFromUrl();
    if (!currentIds) { showStatus('Não foi possível identificar a conversa.', 'err'); return; }

    const content = isPrivate ? resumoTecnico : resumoCliente;
    const btnP = $('nx-btn-private');
    const btnPub = $('nx-btn-public');
    btnP.disabled = true; btnPub.disabled = true;
    showStatus('Enviando...', '');

    try {
      await chatwootPost(currentIds.accountId, currentIds.conversationId, content, isPrivate, token);
      showStatus(isPrivate ? '✓ Nota privada enviada!' : '✓ Nota pública enviada ao cliente!', 'ok');
    } catch (e) {
      showStatus('Erro ao enviar. Verifique o token e a URL.', 'err');
    } finally {
      btnP.disabled = false; btnPub.disabled = false;
    }
  }

  // ─── Novo chamado ────────────────────────────────────────────────────────
  $('nx-btn-reset').addEventListener('click', () => {
    selectedSteps = [];
    selectedDf = '';
    obsText = '';
    resumoTecnico = '';
    resumoCliente = '';
    $('nx-obs').value = '';
    $('nx-custom-input').value = '';
    $('nx-preview').style.display = 'none';
    $('nx-preview').textContent = '';
    $('nx-btn-gerar').style.display = 'flex';
    $('nx-action-btns').style.display = 'none';
    $('nx-confirm-public').style.display = 'none';
    renderSteps();
    renderDf();
    clearStatus();
    // Fecha todas as categorias
    catsEl.querySelectorAll('.nx-cat-content').forEach(el => el.style.display = 'none');
    catsEl.querySelectorAll('.nx-cat-arrow').forEach(el => el.textContent = '▸');
  });

  // ─── Status ──────────────────────────────────────────────────────────────
  function showStatus(msg, type) {
    const el = $('nx-status');
    el.textContent = msg;
    el.className = 'nx-status ' + type;
    el.style.display = 'block';
  }
  function clearStatus() {
    const el = $('nx-status');
    el.style.display = 'none';
    el.textContent = '';
  }

  function resetResult() {
    resumoTecnico = '';
    resumoCliente = '';
    $('nx-preview').style.display = 'none';
    $('nx-preview').textContent = '';
    $('nx-btn-gerar').style.display = 'flex';
    $('nx-action-btns').style.display = 'none';
    $('nx-confirm-public').style.display = 'none';
    clearStatus();
  }

  // ─── Abrir / fechar painel ────────────────────────────────────────────────
  function openPanel() {
    currentIds = getIdsFromUrl();
    panel.classList.remove('hidden');
    toggle.style.display = 'none';
  }
  function closePanel() {
    panel.classList.add('hidden');
    toggle.style.display = 'flex';
  }

  toggle.addEventListener('click', openPanel);
  $('nexos-close').addEventListener('click', closePanel);

  // Atalho Alt+N
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'n') {
      panel.classList.contains('hidden') ? openPanel() : closePanel();
    }
  });

  // ─── Detecta troca de conversa (SPA) ─────────────────────────────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      currentIds = getIdsFromUrl();
      // Reseta resultado ao trocar de conversa
      resetResult();
      clearStatus();
    }
  }).observe(document.body, { childList: true, subtree: true });

})();
