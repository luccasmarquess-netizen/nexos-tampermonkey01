// ==UserScript==
// @name         Nexos
// @namespace    https://github.com/luccasmarquess-netizen/nexos-tampermonkey01
// @version      3.0.2
// @description  Resumo de atendimento tecnico direto no Chatwoot
// @author       Luccas Marques
// @match        https://app.chatwoot.com/app/accounts/*/conversations/*
// @match        https://app.chatwoot.com/app/accounts/*/team/*/conversations/*
// @match        https://app.chatwoot.com/app/accounts/*/mentions/conversations/*
// @match        https://app.chatwoot.com/app/accounts/*/*/conversations/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      app.chatwoot.com
// @connect      nexos-tampermonkey.luccasmarquess.workers.dev
// @updateURL    https://raw.githubusercontent.com/luccasmarquess-netizen/nexos-tampermonkey01/main/nexos.user.js
// @downloadURL  https://raw.githubusercontent.com/luccasmarquess-netizen/nexos-tampermonkey01/main/nexos.user.js
// ==/UserScript==

(function () {
  'use strict';

  const NEXOS_KEY = 'nexos-programaconsumer-2025';
  const WORKER_URL = 'https://nexos-tampermonkey.luccasmarquess.workers.dev';

  // --- Dados ---
  const FAV = [
    'Acesso remoto estabelecido (RustDesk)',
    'Modulo Mobile instalado e validado',
    'Maquina TEF verificada/integrada',
    'Emissor fiscal componente configurado',
    'Validacao e testes de emissao fiscal realizados com resultado positivo',
    'Integracao iFood verificada',
    'Integracao 99Food verificada',
    'Integracao Keeta verificada',
    'Bot WhatsApp configurado e validado',
    'VPN (Hamachi/Radmin) configurada',
    'Impressora instalada e configurada no Consumer',
    'Teste de impressao realizado com resultado positivo',
    'Balanca instalada e configurada no Consumer',
    'Chave Google Maps configurada no Consumer',
    'MenuDino configurado e validado',
  ];

  const CATS = [
    { g: 'Instalacao e Sistema', a: ['Acesso remoto estabelecido (RustDesk)','Consumer aberto e versao verificada','Atualizacao do Consumer executada','Consumer reiniciado','Bloqueio de antivirus/UAC verificado','Ativacao/licenca verificada','Backup realizado antes da intervencao','Reinstalacao do Consumer realizada'] },
    { g: 'Rede e Conectividade', a: ['Teste de conectividade com a internet','IP fixo verificado/configurado no servidor','Versao rede verificada entre computadores','VPN (Hamachi/Radmin) configurada','Reconexao entre PC servidor e PC cliente realizada','Alteracao de metricas de rede realizada'] },
    { g: 'Impressoras e Hardware', a: ['Impressora instalada e configurada no Consumer','Driver da impressora reinstalado','Local de producao vinculado aos produtos','Teste de impressao realizado com resultado positivo','Gaveta de dinheiro verificada','Balanca instalada e configurada no Consumer'] },
    { g: 'Fiscal', a: ['Modulo fiscal verificado (NFC-e/NF-e)','Emissor fiscal componente configurado','Certificado digital verificado/atualizado','Rejeicao de cupom fiscal identificada e corrigida','Validacao e testes de emissao fiscal realizados com resultado positivo','Emissao de cupom fiscal em lote realizada','Arquivos XML exportados ao contador','Cancelamento de NFC-e/NF-e realizado'] },
    { g: 'Pedidos e Integracoes', a: ['Modulo Mobile instalado e validado','Integracao iFood verificada','Integracao 99Food verificada','Integracao Keeta verificada','Bot WhatsApp verificado','App do Entregador verificado','Monitor de Preparo verificado','Recebimento via PIX configurado','Totem verificado/configurado','Integracao via API do parceiro configurada','SmartPOS verificado/configurado','Servicos logisticos verificados'] },
    { g: 'MenuDino', a: ['MenuDino configurado e validado','Chave Google Maps configurada no Consumer','Recebimento via PIX configurado','Produtos em destaque no MenuDino configurados','Conta Google Play Developer criada/configurada','Ponto central de localizacao do estabelecimento ajustado'] },
    { g: 'Firebird', a: ['Firebird reinstalado do zero','Servico do Firebird reiniciado','Firebird padrao reinstalado','Firebird exclusivo removido','Comunicacao do Firebird com o Consumer validada','Recuperacao do banco de dados realizada'] },
    { g: 'Orientacao', a: ['Responsavel orientado quanto ao procedimento','Responsavel orientado sobre possiveis impactos e prevencao','Manual do Consumer indicado ao cliente','Consumer Connect (relatorios online) demonstrado','CRM verificado e orientacoes repassadas ao cliente','Cliente orientado a solicitar visita de tecnico local / suporte proprio'] },
  ];

  const DESFECHOS = [
    { l: 'Resolvido',   bloco: 'DESFECHO: Resolvido\nTodos os procedimentos foram concluidos com exito e o problema foi resolvido durante o atendimento.' },
    { l: 'Parcial',     bloco: 'DESFECHO: Parcial\nO problema foi parcialmente resolvido. Pendencias identificadas serao acompanhadas em novo contato.' },
    { l: 'Analise Q.A', bloco: 'DESFECHO: Encaminhado para Q.A\nO chamado foi encaminhado para analise pela equipe de qualidade para investigacao aprofundada.' },
    { l: 'Ag. cliente', bloco: 'DESFECHO: Aguardando cliente\nAtendimento suspenso. Aguardando retorno do responsavel pelo estabelecimento para continuidade.' },
  ];

  const FRASE_FINAL = 'Todos os procedimentos e testes foram realizados na presenca do responsavel pelo estabelecimento.';

  const TRADUCOES = [
    [/acesso remoto estabelecido/i,              '* Realizamos o atendimento de forma remota, conectando ao computador do estabelecimento pela internet'],
    [/atualizacao do consumer executada/i,        '* Atualizamos o sistema Consumer para a versao mais recente, garantindo melhor desempenho e correcoes de erros'],
    [/consumer reiniciado/i,                      '* Reiniciamos o sistema Consumer para aplicar as configuracoes e resolver instabilidades'],
    [/reinstalacao do consumer realizada/i,       '* Realizamos a reinstalacao completa do sistema Consumer para resolver problemas de funcionamento'],
    [/backup realizado/i,                         '* Realizamos uma copia de seguranca dos dados do sistema antes de iniciar as alteracoes'],
    [/bloqueio de antivirus.*verificado/i,        '* Verificamos as permissoes de seguranca do computador para garantir o funcionamento correto do sistema'],
    [/ip fixo.*configurado/i,                     '* Configuramos o endereco de rede do servidor para garantir comunicacao estavel entre os computadores'],
    [/vpn.*configurada/i,                         '* Configuramos a conexao segura entre os computadores da loja'],
    [/reconexao entre pc servidor/i,              '* Restabelecemos a comunicacao entre os computadores da loja, resolvendo o problema de conexao interna'],
    [/impressora instalada e configurada/i,       '* Instalamos e configuramos a impressora no sistema, permitindo a impressao de cupons e pedidos'],
    [/driver da impressora reinstalado/i,         '* Reinstalamos o programa da impressora para corrigir falhas de comunicacao com o sistema'],
    [/teste de impressao realizado.*positivo/i,   '* Realizamos testes de impressao com resultado positivo, confirmando o funcionamento correto'],
    [/gaveta de dinheiro verificada/i,            '* Verificamos e testamos o funcionamento da gaveta de dinheiro'],
    [/balanca instalada e configurada/i,          '* Instalamos e configuramos a balanca no sistema Consumer'],
    [/emissor fiscal.*configurado/i,              '* Corrigimos e configuramos o sistema de emissao de cupons fiscais (NFC-e), permitindo a emissao de notas novamente'],
    [/modulo fiscal verificado/i,                 '* Verificamos o modulo de emissao de notas fiscais e confirmamos seu funcionamento'],
    [/certificado digital verificado/i,           '* Verificamos e atualizamos o certificado digital necessario para a emissao de notas fiscais'],
    [/rejeicao de cupom fiscal.*corrigida/i,      '* Identificamos e corrigimos o motivo da rejeicao dos cupons fiscais junto a Receita Federal'],
    [/validacao e testes de emissao fiscal/i,     '* Realizamos testes de emissao fiscal e confirmamos que as notas estao sendo emitidas corretamente'],
    [/emissao de cupom fiscal em lote/i,          '* Emitimos os cupons fiscais que estavam pendentes no sistema'],
    [/arquivos xml exportados/i,                  '* Exportamos os arquivos fiscais (XML) para o contador'],
    [/cancelamento de nfc-e/i,                    '* Realizamos o cancelamento das notas fiscais solicitadas junto a Receita Federal'],
    [/integracao ifood verificada/i,              '* Verificamos e confirmamos que os pedidos do iFood estao sendo recebidos corretamente no sistema'],
    [/integracao 99food verificada/i,             '* Verificamos e confirmamos que os pedidos do 99Food estao sendo recebidos corretamente'],
    [/integracao keeta verificada/i,              '* Verificamos e confirmamos que os pedidos do Keeta estao sendo recebidos corretamente'],
    [/bot whatsapp.*validado/i,                   '* Configuramos e testamos o Bot do WhatsApp, que agora esta respondendo automaticamente aos clientes'],
    [/bot whatsapp verificado/i,                  '* Verificamos o funcionamento do Bot do WhatsApp e confirmamos que esta ativo'],
    [/app do entregador verificado/i,             '* Verificamos o funcionamento do aplicativo dos entregadores'],
    [/monitor de preparo verificado/i,            '* Verificamos o funcionamento do monitor de preparo da cozinha (KDS)'],
    [/recebimento via pix configurado/i,          '* Configuramos o recebimento de pagamentos via PIX no sistema'],
    [/totem verificado/i,                         '* Verificamos e configuramos o totem de autoatendimento'],
    [/modulo mobile instalado/i,                  '* Instalamos e configuramos o modulo de atendimento pelo celular (comanda mobile)'],
    [/maquina tef verificada/i,                   '* Verificamos e integramos a maquininha de cartao com o sistema'],
    [/integracao via api do parceiro/i,           '* Configuramos a integracao com o sistema do parceiro'],
    [/menudino configurado/i,                     '* Configuramos e validamos o cardapio online do estabelecimento no MenuDino'],
    [/chave google maps configurada/i,            '* Configuramos a integracao com o Google Maps para calculo de areas de entrega'],
    [/firebird.*reinstalado.*zero/i,              '* Reinstalamos o banco de dados do sistema do zero para resolver problemas de funcionamento'],
    [/firebird padrao reinstalado/i,              '* Restauramos o banco de dados do sistema para corrigir falhas'],
    [/firebird exclusivo removido/i,              '* Removemos a versao exclusiva do banco de dados que estava causando conflitos'],
    [/servico do firebird reiniciado/i,           '* Reiniciamos o servico de banco de dados do sistema'],
    [/comunicacao do firebird.*validada/i,        '* Confirmamos que o banco de dados esta se comunicando corretamente com o sistema'],
    [/recuperacao do banco de dados/i,            '* Recuperamos o banco de dados do sistema apos identificar corrupcao nos arquivos'],
    [/responsavel orientado quanto/i,             '* Orientamos o responsavel pelo estabelecimento sobre os procedimentos realizados e proximos passos'],
    [/responsavel orientado sobre.*impactos/i,    '* Orientamos o responsavel sobre possiveis impactos e como prevenir o problema no futuro'],
    [/manual do consumer indicado/i,              '* Indicamos o manual do sistema para consulta em caso de duvidas'],
    [/consumer connect.*demonstrado/i,            '* Demonstramos o portal de relatorios online (Consumer Connect) para acompanhamento do negocio'],
    [/crm verificado/i,                           '* Verificamos o historico de relacionamento com clientes e repassamos orientacoes'],
    [/cliente orientado.*visita/i,                '* Orientamos sobre a necessidade de suporte tecnico presencial para resolucao definitiva'],
  ];

  // --- Construcao de resumos ---
  function buildTec(steps, df, obs) {
    let txt = steps.map((s, i) => (i + 1) + '. ' + s).join('\n');
    txt += '\n' + FRASE_FINAL;
    if (obs) txt += '\n\nObservacao: ' + obs;
    const d = DESFECHOS.find(x => x.l === df);
    if (d) txt += '\n\n' + d.bloco;
    return txt;
  }

  function buildCli(steps, df, obs, fim) {
    const itens = [];
    for (const step of steps) {
      for (const [re2, texto] of TRADUCOES) {
        if (re2.test(step) && !itens.includes(texto)) { itens.push(texto); break; }
      }
    }
    if (!itens.length) itens.push('* Realizamos os procedimentos necessarios para resolver o problema relatado.');
    if (obs) itens.push('* Observacao: ' + obs);
    const dm = {
      'Resolvido':   'O problema foi resolvido durante este atendimento. Caso perceba qualquer instabilidade, nao hesite em nos contatar.',
      'Parcial':     'O problema foi parcialmente resolvido. Nossa equipe entrara em contato para continuidade do atendimento.',
      'Analise Q.A': 'O caso foi encaminhado para analise aprofundada da nossa equipe tecnica. Retornaremos em breve com um posicionamento.',
      'Ag. cliente': 'O atendimento esta aguardando seu retorno para que possamos dar continuidade.',
    };
    let txt = 'Ola! Segue o resumo do atendimento realizado hoje:\n\n';
    txt += itens.join('\n');
    if (df && dm[df]) txt += '\n\n' + dm[df];
    txt += '\n\nCaso tenha qualquer duvida, estamos a disposicao.';
    if (fim) txt += '\n\n' + fim;
    return txt;
  }

  // --- Captura de mensagens do agente ---
  function capturarMensagensAgente() {
    const msgs = [];
    document.querySelectorAll('.prose.prose-bubble p').forEach(function(p) {
      const txt = p.textContent.trim();
      if (!txt || txt.length < 3) return;
      var el = p;
      for (var i = 0; i < 8; i++) {
        el = el.parentElement;
        if (!el) break;
        var cls = el.className || '';
        if (cls.includes('right-bubble')) { msgs.push(txt); break; }
        if (cls.includes('left-bubble') || cls.includes('n-solid-amber')) break;
      }
    });
    return msgs;
  }

  function anonimizar(texto) {
    return texto
      .replace(/(\+?55\s?)?(\(?\d{2}\)?\s?)(\d{4,5}[-\s]?\d{4})/g, '[TELEFONE]')
      .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '[CPF]')
      .replace(/\d{2}\.?\d{3}\.?\d{3}\/?0001-?\d{2}/g, '[CNPJ]')
      .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\d{5}-?\d{3}/g, '[CEP]');
  }

  // --- Chamada ao Worker ---
  function chamarIA(prompt) {
    return new Promise(function(resolve, reject) {
      GM_xmlhttpRequest({
        method: 'POST',
        url: WORKER_URL,
        headers: { 'Content-Type': 'application/json', 'X-Nexos-Key': NEXOS_KEY },
        data: JSON.stringify({ prompt: prompt }),
        onload: function(r) {
          try {
            var j = JSON.parse(r.responseText);
            resolve(j.text || '');
          } catch(e) { reject(e); }
        },
        onerror: reject,
      });
    });
  }

  // --- Tema ---
  function isDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var T = {
    light: {
      bg: '#ffffff', bgSec: '#f9fafb', bgMu: '#f3f4f6',
      border: '#e5e7eb', tx: '#111111', tx2: '#374151', tx3: '#6b7280', tx4: '#9ca3af',
      overlay: 'rgba(0,0,0,0.5)', stepSel: '#eff6ff', stepSelTx: '#1F93FF',
      ftrBg: '#f9fafb', catBg: '#f3f4f6', catTx: '#374151',
      inpBg: '#ffffff', inpBorder: '#e5e7eb', inpTx: '#111111',
      prevBg: '#f9fafb',
    },
    dark: {
      bg: '#1e1e2e', bgSec: '#2a2a3d', bgMu: '#252538',
      border: '#3a3a50', tx: '#e2e2f0', tx2: '#c0c0d8', tx3: '#8888a8', tx4: '#666688',
      overlay: 'rgba(0,0,0,0.7)', stepSel: '#1e3a5f', stepSelTx: '#60a5fa',
      ftrBg: '#2a2a3d', catBg: '#252538', catTx: '#c0c0d8',
      inpBg: '#1e1e2e', inpBorder: '#3a3a50', inpTx: '#e2e2f0',
      prevBg: '#2a2a3d',
    },
  };

  function getT() { return isDark() ? T.dark : T.light; }

  function applyTheme() {
    var t = getT();
    overlay.style.background = t.overlay;
    modal.style.background = t.bg;
    modal.style.color = t.tx;
    hdr.style.background = '#1F93FF'; // sempre azul
    ftr.style.background = t.ftrBg;
    ftr.style.borderTopColor = t.border;
    body.style.background = t.bg;

    // Seções
    modal.querySelectorAll('[data-sec-wrap]').forEach(function(el) {
      el.style.borderColor = t.border;
    });
    modal.querySelectorAll('[data-sec-title]').forEach(function(el) {
      el.style.background = t.bgSec;
      el.style.borderBottomColor = t.border;
      el.style.color = t.tx3;
    });
    modal.querySelectorAll('[data-sec-body]').forEach(function(el) {
      el.style.background = t.bg;
    });

    // Steps
    modal.querySelectorAll('[data-label]').forEach(function(b) {
      var sel = selectedSteps.includes(b.dataset.label);
      b.style.background = sel ? t.stepSel : t.bg;
      b.style.borderColor = sel ? '#1F93FF' : t.border;
      b.style.color = sel ? t.stepSelTx : t.tx2;
    });

    // Cat btns
    modal.querySelectorAll('[data-cat-btn]').forEach(function(b) {
      b.style.background = t.catBg;
      b.style.borderBottomColor = t.border;
      b.style.color = t.catTx;
    });

    // Inputs
    modal.querySelectorAll('[data-inp]').forEach(function(el) {
      el.style.background = t.inpBg;
      el.style.borderColor = t.inpBorder;
      el.style.color = t.inpTx;
    });

    // Preview
    preview.style.background = t.prevBg;
    preview.style.borderColor = t.border;
    preview.style.color = t.tx;

    // Tabs
    setTabStyles(activeTab);

    // Reset btn
    btnReset.style.color = t.tx4;
    btnReset.style.borderColor = t.border;

    // ConvPreviewBox
    convPreviewBox.style.background = t.prevBg;
    convPreviewBox.style.borderColor = t.border;
    convPreviewBox.style.color = t.tx2;
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    applyTheme();
  });

  // --- Estado ---
  var selectedSteps = [];
  var selectedDf = '';
  var activeTab = 'tec';
  var resumoTec = '';
  var resumoCli = '';

  // --- Overlay ---
  var overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.5)',
    zIndex: '2147483640',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  });

  var modal = document.createElement('div');
  Object.assign(modal.style, {
    background: '#fff',
    borderRadius: '12px',
    width: '540px',
    maxWidth: '92vw',
    maxHeight: '92vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '13px',
    color: '#111',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  });

  // Header
  var hdr = document.createElement('div');
  Object.assign(hdr.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', background: '#1F93FF', color: '#fff',
    flexShrink: '0', position: 'sticky', top: '0', zIndex: '10',
  });
  hdr.innerHTML = '<span style="font-size:15px;font-weight:700;">Nexos</span>';
  var closeBtn = document.createElement('button');
  closeBtn.textContent = 'x';
  Object.assign(closeBtn.style, {
    background: 'none', border: 'none', color: '#fff',
    fontSize: '20px', cursor: 'pointer', lineHeight: '1', padding: '0 4px',
  });
  hdr.appendChild(closeBtn);
  modal.appendChild(hdr);

  // Body
  var body = document.createElement('div');
  body.id = 'nexos-modal-body';
  Object.assign(body.style, {
    padding: '14px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  });
  modal.appendChild(body);

  // Footer
  var ftr = document.createElement('div');
  Object.assign(ftr.style, {
    padding: '10px 12px', borderTop: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column', gap: '6px',
    flexShrink: '0', background: '#f9fafb',
    position: 'sticky', bottom: '0', zIndex: '10',
  });
  modal.appendChild(ftr);

  overlay.appendChild(modal);
  document.documentElement.appendChild(overlay);

  // --- Helpers ---
  function mkSec(title, collapsible) {
    var wrap = document.createElement('div');
    wrap.dataset.secWrap = '1';
    Object.assign(wrap.style, { border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' });
    var t = document.createElement('div');
    t.dataset.secTitle = '1';
    Object.assign(t.style, {
      fontSize: '11px', fontWeight: '700', color: '#6b7280',
      textTransform: 'uppercase', letterSpacing: '.06em',
      padding: '8px 10px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
    });
    t.textContent = collapsible ? title + ' >' : title;
    var b = document.createElement('div');
    b.dataset.secBody = '1';
    b.style.padding = '8px 10px';
    if (collapsible) {
      b.style.display = 'none';
      t.style.cursor = 'pointer';
      t.addEventListener('click', function() {
        var open = b.style.display !== 'none';
        b.style.display = open ? 'none' : 'block';
        t.textContent = title + (open ? ' >' : ' v');
      });
    }
    wrap.appendChild(t);
    wrap.appendChild(b);
    return { wrap: wrap, title: t, body: b };
  }

  function mkBtn(text, style) {
    var b = document.createElement('button');
    b.textContent = text;
    Object.assign(b.style, Object.assign({
      padding: '9px 12px', borderRadius: '7px', border: 'none',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      width: '100%', fontFamily: 'inherit',
    }, style || {}));
    return b;
  }

  function mkInp(placeholder, isTextarea) {
    var i = document.createElement(isTextarea ? 'textarea' : 'input');
    if (!isTextarea) i.type = 'text';
    i.placeholder = placeholder;
    i.dataset.inp = '1';
    Object.assign(i.style, {
      width: '100%', padding: '7px 8px', border: '1px solid #e5e7eb',
      borderRadius: '6px', fontSize: '12px', color: '#111',
      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    });
    return i;
  }

  function mkStepBtn(label) {
    var b = document.createElement('button');
    b.dataset.label = label;
    Object.assign(b.style, {
      textAlign: 'left', padding: '6px 8px', borderRadius: '6px',
      border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer',
      fontSize: '12px', color: '#374151', display: 'flex',
      alignItems: 'center', gap: '6px', width: '100%',
    });
    var chk = document.createElement('span');
    Object.assign(chk.style, {
      width: '14px', height: '14px', borderRadius: '3px',
      border: '1.5px solid #d1d5db', flexShrink: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px',
    });
    var lbl = document.createElement('span');
    lbl.textContent = label;
    b.appendChild(chk);
    b.appendChild(lbl);
    b.addEventListener('click', function() { toggleStep(label); });
    return b;
  }

  function updateStepBtn(b) {
    var sel = selectedSteps.includes(b.dataset.label);
    b.style.background = sel ? '#eff6ff' : '#fff';
    b.style.borderColor = sel ? '#1F93FF' : '#e5e7eb';
    b.style.color = sel ? '#1F93FF' : '#374151';
    var chk = b.querySelector('span');
    chk.textContent = sel ? 'v' : '';
    chk.style.background = sel ? '#1F93FF' : '#fff';
    chk.style.borderColor = sel ? '#1F93FF' : '#d1d5db';
    chk.style.color = '#fff';
  }

  // --- Secao: Resumir conversa (colapsivel) ---
  var convSec = mkSec('Resumir conversa (IA)', true);
  var convHint = document.createElement('div');
  convHint.style.cssText = 'font-size:11px;color:#9ca3af;margin-bottom:8px;line-height:1.5;';
  convHint.textContent = 'Captura apenas mensagens do agente. Dados sensiveis sao removidos antes do envio para a IA.';
  convSec.body.appendChild(convHint);

  var convPreviewBox = document.createElement('div');
  Object.assign(convPreviewBox.style, {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px',
    padding: '8px', fontSize: '11px', lineHeight: '1.6',
    whiteSpace: 'pre-wrap', color: '#374151',
    maxHeight: '100px', overflowY: 'auto', display: 'none', marginBottom: '8px',
  });
  convSec.body.appendChild(convPreviewBox);

  var convStatusEl = document.createElement('div');
  convStatusEl.style.cssText = 'font-size:11px;margin-bottom:6px;display:none;';
  convSec.body.appendChild(convStatusEl);

  var convBtnRow = document.createElement('div');
  convBtnRow.style.cssText = 'display:flex;gap:6px;';

  var convBtnPreview = document.createElement('button');
  convBtnPreview.textContent = 'Ver o que sera enviado';
  Object.assign(convBtnPreview.style, {
    flex: '1', padding: '7px', borderRadius: '6px',
    border: '1px solid #d1d5db', background: '#fff',
    color: '#374151', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
  });

  var convBtnGerar = document.createElement('button');
  convBtnGerar.textContent = 'Gerar resumo (IA)';
  Object.assign(convBtnGerar.style, {
    flex: '1', padding: '7px', borderRadius: '6px',
    border: '1px solid #1F93FF', background: '#eff6ff',
    color: '#1F93FF', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
  });

  convBtnRow.appendChild(convBtnPreview);
  convBtnRow.appendChild(convBtnGerar);
  convSec.body.appendChild(convBtnRow);
  body.appendChild(convSec.wrap);

  convBtnPreview.addEventListener('click', function() {
    var msgs = capturarMensagensAgente();
    if (!msgs.length) {
      convStatusEl.textContent = 'Nenhuma mensagem do agente encontrada nesta conversa.';
      convStatusEl.style.color = '#dc2626';
      convStatusEl.style.display = 'block';
      convPreviewBox.style.display = 'none';
      return;
    }
    var textoAnon = anonimizar(msgs.join('\n---\n'));
    convPreviewBox.textContent = textoAnon;
    convPreviewBox.style.display = 'block';
    convStatusEl.textContent = msgs.length + ' mensagem(ns) do agente capturada(s). Dados sensiveis anonimizados.';
    convStatusEl.style.color = '#16a34a';
    convStatusEl.style.display = 'block';
  });

  convBtnGerar.addEventListener('click', async function() {
    var msgs = capturarMensagensAgente();
    if (!msgs.length) { showStatus('Nenhuma mensagem do agente encontrada.', 'err'); return; }
    var textoAnon = anonimizar(msgs.join('\n---\n'));
    convBtnGerar.textContent = 'Gerando...';
    convBtnGerar.disabled = true;
    convBtnPreview.disabled = true;
    try {
      var prompt = 'Voce e um tecnico senior de suporte do sistema Consumer (PDV/ERP para restaurantes). Analise as mensagens abaixo enviadas pelo agente de suporte durante um atendimento e gere um resumo tecnico profissional dos procedimentos realizados. Itens numerados na ordem cronologica, verbos no passado em primeira pessoa do plural (Realizamos, Verificamos, Configuramos, Orientamos), linguagem tecnica formal. Encerre com: ' + FRASE_FINAL + '. Nao inclua dados pessoais. NAO inclua bloco de desfecho. MENSAGENS DO AGENTE: ' + textoAnon + ' Responda APENAS com o resumo numerado e a frase final.';
      var texto = await chamarIA(prompt);
      if (texto) {
        resumoTec = texto;
        preview.textContent = resumoTec;
        preview.style.display = 'block';
        activeTab = 'tec';
        setTabStyles('tec');
        btnGerar.style.display = 'none';
        actionBtns.style.display = 'flex';
        showStatus('Resumo gerado a partir da conversa!', 'ok');
        convSec.body.style.display = 'none';
        convSec.title.textContent = 'Resumir conversa (IA) >';
      } else {
        showStatus('Erro ao gerar resumo. Tente novamente.', 'err');
      }
    } catch(e) {
      showStatus('Erro ao conectar com a IA.', 'err');
    }
    convBtnGerar.textContent = 'Gerar resumo (IA)';
    convBtnGerar.disabled = false;
    convBtnPreview.disabled = false;
  });

  // --- Secao: Passos ---
  var stepsSec = mkSec('Passos realizados', false);
  var badge = document.createElement('span');
  Object.assign(badge.style, {
    background: '#1F93FF', color: '#fff', borderRadius: '99px',
    fontSize: '10px', fontWeight: '700', padding: '1px 7px', display: 'none',
  });
  stepsSec.title.style.display = 'flex';
  stepsSec.title.style.justifyContent = 'space-between';
  stepsSec.title.style.alignItems = 'center';
  stepsSec.title.appendChild(badge);

  var favLabel = document.createElement('div');
  favLabel.style.cssText = 'font-size:11px;font-weight:600;color:#6b7280;margin-bottom:6px;';
  favLabel.textContent = 'Mais usados';
  stepsSec.body.appendChild(favLabel);

  var favGrid = document.createElement('div');
  favGrid.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
  FAV.forEach(function(l) { favGrid.appendChild(mkStepBtn(l)); });
  stepsSec.body.appendChild(favGrid);

  var catsLabel = document.createElement('div');
  catsLabel.style.cssText = 'font-size:11px;font-weight:600;color:#6b7280;margin:10px 0 4px;';
  catsLabel.textContent = 'Outras acoes';
  stepsSec.body.appendChild(catsLabel);

  var catsWrap = document.createElement('div');
  CATS.forEach(function(cat) {
    var catBtn = document.createElement('button');
    catBtn.dataset.catBtn = '1';
    Object.assign(catBtn.style, {
      width: '100%', textAlign: 'left', padding: '7px 10px',
      border: 'none', borderBottom: '1px solid #e5e7eb',
      background: '#f3f4f6', cursor: 'pointer', fontSize: '12px',
      fontWeight: '600', color: '#374151', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
    });
    var arr = document.createElement('span');
    arr.textContent = '>';
    catBtn.appendChild(document.createTextNode(cat.g));
    catBtn.appendChild(arr);

    var content2 = document.createElement('div');
    content2.style.cssText = 'display:none;flex-direction:column;gap:4px;padding:8px 10px;border-bottom:1px solid #e5e7eb;';
    cat.a.forEach(function(l) { content2.appendChild(mkStepBtn(l)); });

    catBtn.addEventListener('click', function() {
      var open = content2.style.display !== 'none';
      catsWrap.querySelectorAll('[data-cat-content]').forEach(function(el) { el.style.display = 'none'; });
      catsWrap.querySelectorAll('[data-cat-arr]').forEach(function(el) { el.textContent = '>'; });
      if (!open) { content2.style.display = 'flex'; arr.textContent = 'v'; }
    });
    content2.dataset.catContent = '1';
    arr.dataset.catArr = '1';
    catsWrap.appendChild(catBtn);
    catsWrap.appendChild(content2);
  });
  stepsSec.body.appendChild(catsWrap);

  var customRow = document.createElement('div');
  customRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
  var customInp = mkInp('Acao personalizada...');
  customInp.style.flex = '1';
  var customAddBtn = document.createElement('button');
  customAddBtn.textContent = '+ Adicionar';
  Object.assign(customAddBtn.style, {
    padding: '7px 10px', borderRadius: '6px',
    border: '1px solid #1F93FF', background: '#eff6ff',
    color: '#1F93FF', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  });
  customAddBtn.addEventListener('click', addCustom);
  customInp.addEventListener('keydown', function(e) { if (e.key === 'Enter') addCustom(); });
  function addCustom() {
    var v = customInp.value.trim();
    if (!v) return;
    toggleStep(v);
    customInp.value = '';
  }
  customRow.appendChild(customInp);
  customRow.appendChild(customAddBtn);
  stepsSec.body.appendChild(customRow);

  // Extrair passos via IA
  var convLabel2 = document.createElement('div');
  convLabel2.style.cssText = 'font-size:11px;font-weight:600;color:#6b7280;margin:10px 0 4px;';
  convLabel2.textContent = 'Extrair passos da conversa (IA)';
  stepsSec.body.appendChild(convLabel2);

  var convHint2 = document.createElement('div');
  convHint2.style.cssText = 'font-size:11px;color:#9ca3af;margin-bottom:6px;';
  convHint2.textContent = 'Cole a conversa com o cliente. A IA identifica os procedimentos e adiciona aos passos.';
  stepsSec.body.appendChild(convHint2);

  var convInp = document.createElement('textarea');
  convInp.dataset.inp = '1';
  convInp.dataset.inp = '1';
  convInp.placeholder = 'Cole aqui a conversa com o cliente...';
  convInp.rows = 3;
  convInp.style.cssText = 'width:100%;padding:7px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;resize:vertical;';
  stepsSec.body.appendChild(convInp);

  var convBtn = document.createElement('button');
  convBtn.textContent = 'Extrair passos';
  Object.assign(convBtn.style, {
    marginTop: '6px', padding: '7px 12px', borderRadius: '6px',
    border: '1px solid #7c3aed', background: '#f5f3ff',
    color: '#7c3aed', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', width: '100%', fontFamily: 'inherit',
  });
  convBtn.addEventListener('click', async function() {
    var conv = convInp.value.trim();
    if (!conv) { showStatus('Cole a conversa antes de extrair.', 'err'); return; }
    convBtn.textContent = 'Extraindo...';
    convBtn.disabled = true;
    try {
      var prompt = 'Voce e um tecnico de suporte do sistema Consumer. Analise a conversa abaixo e liste APENAS os procedimentos tecnicos que foram realizados durante o atendimento. Responda SOMENTE com uma lista JSON de strings, sem markdown, sem explicacoes. Exemplo: ["Acesso remoto estabelecido (RustDesk)", "Consumer reiniciado"]. CONVERSA: ' + conv + ' Responda APENAS com o array JSON.';
      var texto = await chamarIA(prompt);
      if (texto) {
        var raw = texto.replace(/```json|```/g, '').trim();
        var passos = JSON.parse(raw);
        if (Array.isArray(passos) && passos.length) {
          passos.forEach(function(p) { if (p && !selectedSteps.includes(p)) selectedSteps.push(p); });
          renderSteps();
          convInp.value = '';
          showStatus(passos.length + ' passo(s) extraido(s) e adicionado(s)!', 'ok');
        } else {
          showStatus('Nenhum procedimento identificado. Tente descrever mais a conversa.', 'err');
        }
      } else {
        showStatus('Erro ao extrair. Tente novamente.', 'err');
      }
    } catch(e) {
      showStatus('Erro ao conectar com a IA.', 'err');
    }
    convBtn.textContent = 'Extrair passos';
    convBtn.disabled = false;
  });
  stepsSec.body.appendChild(convBtn);
  body.appendChild(stepsSec.wrap);

  // --- Secao: Selecionados ---
  var selSec = mkSec('Passos selecionados', false);
  selSec.wrap.style.display = 'none';
  var selList = document.createElement('div');
  selList.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
  selSec.body.appendChild(selList);
  body.appendChild(selSec.wrap);

  // --- Secao: Desfecho ---
  var dfSec = mkSec('Desfecho', false);
  var dfGrid = document.createElement('div');
  dfGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
  var dfColors = [
    { bg: '#dcfce7', border: '#16a34a', color: '#15803d' },
    { bg: '#fef9c3', border: '#ca8a04', color: '#a16207' },
    { bg: '#eff6ff', border: '#1F93FF',  color: '#1677d2' },
    { bg: '#f3f4f6', border: '#6b7280',  color: '#374151' },
  ];
  DESFECHOS.forEach(function(d, i) {
    var b = document.createElement('button');
    b.textContent = d.l;
    b.dataset.df = d.l;
    Object.assign(b.style, {
      padding: '7px', borderRadius: '6px', border: '1px solid #e5e7eb',
      background: '#fff', cursor: 'pointer', fontSize: '12px',
      fontWeight: '500', color: '#374151', textAlign: 'center',
    });
    b.addEventListener('click', function() {
      selectedDf = (selectedDf === d.l) ? '' : d.l;
      renderDf();
      resetResult();
    });
    dfGrid.appendChild(b);
  });
  dfSec.body.appendChild(dfGrid);
  body.appendChild(dfSec.wrap);

  // --- Secao: Mensagem de finalizacao (colapsivel) ---
  var fimSec = mkSec('Mensagem de finalizacao (para o cliente)', true);
  var fimHint = document.createElement('div');
  fimHint.style.cssText = 'font-size:11px;color:#9ca3af;margin-bottom:6px;';
  fimHint.textContent = 'Salva automaticamente. Aparece no final do resumo para o cliente.';
  var fimInp = document.createElement('textarea');
  fimInp.dataset.inp = '1';
  fimInp.placeholder = 'Ex: Att, Luccas - Suporte Consumer';
  fimInp.rows = 3;
  fimInp.style.cssText = 'width:100%;padding:7px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;resize:vertical;';
  fimInp.value = GM_getValue('nexos_fim', '');
  fimInp.addEventListener('input', function() { GM_setValue('nexos_fim', fimInp.value.trim()); });
  fimSec.body.appendChild(fimHint);
  fimSec.body.appendChild(fimInp);
  body.appendChild(fimSec.wrap);

  // --- Secao: Observacao (colapsivel) ---
  var obsSec = mkSec('Observacao adicional (opcional)', true);
  var obsInp = mkInp('Ex: cliente orientado sobre certificado digital', true);
  obsInp.rows = 2;
  obsInp.style.resize = 'vertical';
  obsSec.body.appendChild(obsInp);
  body.appendChild(obsSec.wrap);

  // --- Footer ---
  var tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;gap:4px;';
  var tabTec = document.createElement('button');
  var tabCli = document.createElement('button');
  tabTec.textContent = 'Resumo tecnico';
  tabCli.textContent = 'Para o cliente';
  [tabTec, tabCli].forEach(function(t) {
    Object.assign(t.style, {
      flex: '1', padding: '6px', borderRadius: '6px',
      border: '1px solid #e5e7eb', background: '#fff',
      fontSize: '12px', fontWeight: '500', cursor: 'pointer', color: '#6b7280',
    });
  });
  tabBar.appendChild(tabTec);
  tabBar.appendChild(tabCli);
  ftr.appendChild(tabBar);

  tabTec.addEventListener('click', function() { setTab('tec'); });
  tabCli.addEventListener('click', function() { setTab('cli'); });

  var preview = document.createElement('div');
  Object.assign(preview.style, {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '7px',
    padding: '10px', fontSize: '12px', lineHeight: '1.7',
    whiteSpace: 'pre-wrap', color: '#111', display: 'none',
  });
  ftr.appendChild(preview);

  var confirmBox = document.createElement('div');
  Object.assign(confirmBox.style, {
    padding: '10px', background: '#fefce8', border: '1px solid #fde047',
    borderRadius: '7px', fontSize: '12px', color: '#854d0e',
    display: 'none', flexDirection: 'column', gap: '8px',
  });
  confirmBox.innerHTML = '<div><strong>Nota publica</strong><br>Esta nota ficara visivel para o cliente no Chatwoot. Confirma?</div>';
  var confirmActions = document.createElement('div');
  confirmActions.style.cssText = 'display:flex;gap:6px;';
  var confirmYes = mkBtn('Confirmar', { background: '#1F93FF', color: '#fff', flex: '1' });
  var confirmNo = mkBtn('Cancelar', { background: '#fff', color: '#374151', border: '1px solid #d1d5db', flex: '1' });
  confirmActions.appendChild(confirmYes);
  confirmActions.appendChild(confirmNo);
  confirmBox.appendChild(confirmActions);
  ftr.appendChild(confirmBox);
  confirmNo.addEventListener('click', function() { confirmBox.style.display = 'none'; });

  var statusEl = document.createElement('div');
  statusEl.style.cssText = 'font-size:12px;text-align:center;padding:4px;display:none;';
  ftr.appendChild(statusEl);

  var btnGerar = mkBtn('Gerar resumo', { background: '#1F93FF', color: '#fff' });
  ftr.appendChild(btnGerar);

  var actionBtns = document.createElement('div');
  actionBtns.style.cssText = 'display:none;flex-direction:column;gap:6px;';
  var btnCopy    = mkBtn('Copiar texto', { background: '#1F93FF', color: '#fff' });
  var btnReset   = mkBtn('Novo chamado', { background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', fontSize: '12px' });
  actionBtns.appendChild(btnCopy);
  actionBtns.appendChild(btnReset);
  ftr.appendChild(actionBtns);

  // --- Logica ---
  function toggleStep(label) {
    selectedSteps = selectedSteps.includes(label)
      ? selectedSteps.filter(function(s) { return s !== label; })
      : selectedSteps.concat([label]);
    renderSteps();
    resetResult();
  }

  function renderSteps() {
    modal.querySelectorAll('[data-label]').forEach(function(b) { updateStepBtn(b); });
    badge.style.display = selectedSteps.length ? 'inline' : 'none';
    badge.textContent = selectedSteps.length;
    selList.innerHTML = '';
    selSec.wrap.style.display = selectedSteps.length ? 'block' : 'none';
    selectedSteps.forEach(function(s, i) {
      var item = document.createElement('div');
      Object.assign(item.style, {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 8px', background: '#eff6ff', borderRadius: '5px',
        fontSize: '12px', color: '#1677d2',
      });
      item.draggable = true;
      item.dataset.idx = i;
      var drag = document.createElement('span');
      drag.textContent = '::';
      drag.style.cssText = 'cursor:grab;color:#93c5fd;flex-shrink:0;';
      var txt = document.createElement('span');
      txt.textContent = s;
      txt.style.flex = '1';
      var rm = document.createElement('button');
      rm.textContent = 'x';
      Object.assign(rm.style, { marginLeft: 'auto', background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '14px' });
      rm.addEventListener('click', function() { toggleStep(s); });
      item.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', i); });
      item.addEventListener('dragover', function(e) { e.preventDefault(); });
      item.addEventListener('drop', function(e) {
        e.preventDefault();
        var from = parseInt(e.dataTransfer.getData('text/plain'));
        if (from === i) return;
        var arr = selectedSteps.slice();
        var el = arr.splice(from, 1)[0];
        arr.splice(i, 0, el);
        selectedSteps = arr;
        renderSteps();
      });
      item.appendChild(drag);
      item.appendChild(txt);
      item.appendChild(rm);
      selList.appendChild(item);
    });
  }

  function renderDf() {
    dfGrid.querySelectorAll('button').forEach(function(b, i) {
      var sel = b.dataset.df === selectedDf;
      b.style.background = sel ? dfColors[i].bg : '#fff';
      b.style.borderColor = sel ? dfColors[i].border : '#e5e7eb';
      b.style.color = sel ? dfColors[i].color : '#374151';
    });
  }

  function setTabStyles(tab) {
    var on  = { background: '#eff6ff', borderColor: '#1F93FF', color: '#1F93FF', fontWeight: '600' };
    var off = { background: '#fff',    borderColor: '#e5e7eb', color: '#6b7280', fontWeight: '500' };
    Object.assign(tabTec.style, tab === 'tec' ? on : off);
    Object.assign(tabCli.style, tab === 'cli' ? on : off);
  }

  function setTab(tab) {
    activeTab = tab;
    setTabStyles(tab);
    var txt = tab === 'tec' ? resumoTec : resumoCli;
    if (txt) { preview.textContent = txt; preview.style.display = 'block'; }
    else preview.style.display = 'none';
    confirmBox.style.display = 'none';
    clearStatus();
  }

  function resetResult() {
    resumoTec = '';
    resumoCli = '';
    preview.style.display = 'none';
    btnGerar.style.display = 'flex';
    actionBtns.style.display = 'none';
    confirmBox.style.display = 'none';
    clearStatus();
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.style.color = type === 'ok' ? '#16a34a' : '#dc2626';
    statusEl.style.display = 'block';
  }
  function clearStatus() { statusEl.style.display = 'none'; }

  // Gerar resumo com IA embutida
  btnGerar.addEventListener('click', async function() {
    if (!selectedSteps.length) { showStatus('Selecione ao menos um passo.', 'err'); return; }
    var obs = obsInp.value.trim();
    var fim = fimInp.value.trim();

    // Gera base local imediatamente
    var baseTec = buildTec(selectedSteps, selectedDf, obs);
    var baseCli = buildCli(selectedSteps, selectedDf, obs, fim);
    resumoTec = baseTec;
    resumoCli = baseCli;
    preview.textContent = activeTab === 'tec' ? resumoTec : resumoCli;
    preview.style.display = 'block';
    btnGerar.style.display = 'none';
    actionBtns.style.display = 'flex';
    showStatus('Formatando com IA...', '');

    // Formata com IA em paralelo
    try {
      var promptTec = 'Reformule o resumo tecnico abaixo. REGRAS OBRIGATORIAS: (1) Mantenha TODOS os itens numerados separados, um por linha, comecando com 1. 2. 3. etc. NUNCA junte itens em um unico paragrafo. (2) Cada item deve comecar com verbo no passado em primeira pessoa do plural: Realizamos, Verificamos, Configuramos, Orientamos, Identificamos, Instalamos. (3) Mantenha a frase final exatamente como esta. (4) Mantenha o bloco de DESFECHO exatamente como esta. (5) Nao invente procedimentos. RESUMO ORIGINAL: ' + baseTec + ' Responda APENAS com os itens numerados e a frase final, sem introducao.';
      var promptCli = 'Voce e um assistente de comunicacao para uma empresa de suporte tecnico de restaurantes. Melhore o texto abaixo mantendo a estrutura de topicos com *, a introducao Ola! Segue o resumo... e a frase final. Torne cada item mais claro e humanizado para o dono do restaurante, sem usar termos tecnicos. TEXTO: ' + baseCli + ' Responda APENAS com o texto melhorado.';

      var results = await Promise.all([chamarIA(promptTec), chamarIA(promptCli)]);
      if (results[0]) resumoTec = results[0];
      if (results[1]) resumoCli = results[1];
      preview.textContent = activeTab === 'tec' ? resumoTec : resumoCli;
      showStatus('Resumo gerado!', 'ok');
      setTimeout(clearStatus, 2000);
    } catch(e) {
      showStatus('Resumo gerado (sem formatacao IA)', 'ok');
      setTimeout(clearStatus, 2000);
    }
  });

  btnCopy.addEventListener('click', function() {
    var txt = activeTab === 'tec' ? resumoTec : resumoCli;
    if (!txt) { showStatus('Nenhum resumo gerado.', 'err'); return; }
    var ta = document.createElement('textarea');
    ta.value = txt;
    Object.assign(ta.style, { position: 'fixed', top: '-9999px', left: '-9999px', width: '2px', height: '2px', opacity: '0' });
    document.documentElement.appendChild(ta);
    ta.focus();
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(e) {}
    document.documentElement.removeChild(ta);
    if (ok) {
      showStatus('Copiado!', 'ok');
      btnCopy.textContent = 'Copiado!';
      setTimeout(function() { btnCopy.textContent = 'Copiar texto'; }, 2000);
    } else {
      showStatus('Erro ao copiar. Selecione o texto manualmente.', 'err');
    }
  });

  confirmYes.addEventListener('click', function() {
    confirmBox.style.display = 'none';
  });

  btnReset.addEventListener('click', function() {
    selectedSteps = [];
    selectedDf = '';
    obsInp.value = '';
    customInp.value = '';
    convInp.value = '';
    renderSteps();
    renderDf();
    resetResult();
    catsWrap.querySelectorAll('[data-cat-content]').forEach(function(el) { el.style.display = 'none'; });
    catsWrap.querySelectorAll('[data-cat-arr]').forEach(function(el) { el.textContent = '>'; });
  });

  // --- Botao flutuante ---
  var toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'NEXOS';
  Object.assign(toggleBtn.style, {
    position: 'fixed', right: '0', top: '50%',
    transform: 'translateY(-50%)',
    zIndex: '2147483647',
    background: '#1F93FF', color: '#fff', border: 'none',
    borderRadius: '8px 0 0 8px', padding: '10px 6px',
    cursor: 'pointer', fontSize: '11px', fontWeight: '700',
    letterSpacing: '.05em', writingMode: 'vertical-rl',
    boxShadow: '-2px 0 8px rgba(0,0,0,.18)',
  });
  document.documentElement.appendChild(toggleBtn);

  function openModal() {
    applyTheme();
    overlay.style.display = 'flex';
    toggleBtn.style.display = 'none';
  }
  function closeModal() {
    overlay.style.display = 'none';
    toggleBtn.style.display = 'block';
  }

  toggleBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'n') overlay.style.display === 'none' ? openModal() : closeModal();
    if (e.key === 'Escape' && overlay.style.display !== 'none') closeModal();
  });

  // Detecta troca de conversa (SPA)
  var lastUrl = location.href;
  new MutationObserver(function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      resetResult();
      clearStatus();
    }
  }).observe(document.body, { childList: true, subtree: true });

})();
