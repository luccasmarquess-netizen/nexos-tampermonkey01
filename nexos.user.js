// ==UserScript==
// @name         Nexos
// @namespace    https://github.com/luccasmarquess-netizen/nexos-tampermonkey01
// @version      1.2.0
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
    { g: 'Instalação e Sistema', a: ['Acesso remoto estabelecido (RustDesk)','Consumer aberto e versão verificada','Atualização do Consumer executada','Consumer reiniciado','Bloqueio de antivírus/UAC verificado','Ativação/licença verificada','Backup realizado antes da intervenção','Reinstalação do Consumer realizada'] },
    { g: 'Rede e Conectividade', a: ['Teste de conectividade com a internet','IP fixo verificado/configurado no servidor','Versão rede verificada entre computadores','VPN (Hamachi/Radmin) configurada','Reconexão entre PC servidor e PC cliente realizada','Alteração de métricas de rede realizada'] },
    { g: 'Impressoras e Hardware', a: ['Impressora instalada e configurada no Consumer','Driver da impressora reinstalado','Local de produção vinculado aos produtos','Teste de impressão realizado com resultado positivo','Gaveta de dinheiro verificada','Balança instalada e configurada no Consumer'] },
    { g: 'Fiscal', a: ['Módulo fiscal verificado (NFC-e/NF-e)','Emissor fiscal componente configurado','Certificado digital verificado/atualizado','Rejeição de cupom fiscal identificada e corrigida','Validação e testes de emissão fiscal realizados com resultado positivo','Emissão de cupom fiscal em lote realizada','Arquivos XML exportados ao contador','Cancelamento de NFC-e/NF-e realizado'] },
    { g: 'Pedidos e Integrações', a: ['Módulo Mobile instalado e validado','Integração iFood verificada','Integração 99Food verificada','Integração Keeta verificada','Bot WhatsApp verificado','App do Entregador verificado','Monitor de Preparo verificado','Recebimento via PIX configurado','Totem verificado/configurado','Integração via API do parceiro configurada','SmartPOS verificado/configurado','Serviços logísticos verificados'] },
    { g: 'MenuDino', a: ['MenuDino configurado e validado','Chave Google Maps configurada no Consumer','Recebimento via PIX configurado','Produtos em destaque no MenuDino configurados','Conta Google Play Developer criada/configurada','Ponto central de localização do estabelecimento ajustado'] },
    { g: 'Firebird', a: ['Firebird reinstalado do zero','Serviço do Firebird reiniciado','Firebird padrão reinstalado','Firebird exclusivo removido','Comunicação do Firebird com o Consumer validada','Recuperação do banco de dados realizada'] },
    { g: 'Orientação', a: ['Responsável orientado quanto ao procedimento','Responsável orientado sobre possíveis impactos e prevenção','Manual do Consumer indicado ao cliente','Consumer Connect (relatórios online) demonstrado','CRM verificado e orientações repassadas ao cliente','Cliente orientado a solicitar visita de técnico local / suporte próprio'] },
  ];

  const DESFECHOS = [
    { l: 'Resolvido',   bloco: '✅ DESFECHO: Resolvido\nTodos os procedimentos foram concluídos com êxito e o problema foi resolvido durante o atendimento.' },
    { l: 'Parcial',     bloco: '⚠️ DESFECHO: Parcial\nO problema foi parcialmente resolvido. Pendências identificadas serão acompanhadas em novo contato.' },
    { l: 'Análise Q.A', bloco: '🔍 DESFECHO: Encaminhado para Q.A\nO chamado foi encaminhado para análise pela equipe de qualidade para investigação aprofundada.' },
    { l: 'Ag. cliente', bloco: '⏳ DESFECHO: Aguardando cliente\nAtendimento suspenso. Aguardando retorno do responsável pelo estabelecimento para continuidade.' },
  ];

  const FRASE_FINAL = 'Todos os procedimentos e testes foram realizados na presença do responsável pelo estabelecimento.';

  const TRADUCOES = [
    [/acesso remoto estabelecido/i,              '• Realizamos o atendimento de forma remota'],
    [/atualização do consumer executada/i,        '• Atualizamos o sistema para a versão mais recente'],
    [/consumer reiniciado/i,                      '• Reiniciamos o sistema'],
    [/reinstalação do consumer realizada/i,       '• Reinstalamos o sistema completo'],
    [/backup realizado/i,                         '• Realizamos uma cópia de segurança dos dados'],
    [/bloqueio de antivírus.*verificado/i,        '• Verificamos as permissões de segurança do computador'],
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
    [/validação e testes de emissão fiscal/i,     '• Realizamos testes de emissão fiscal com resultado positivo'],
    [/emissão de cupom fiscal em lote/i,          '• Emitimos os cupons fiscais pendentes em lote'],
    [/arquivos xml exportados/i,                  '• Exportamos os arquivos fiscais para o contador'],
    [/cancelamento de nfc-e/i,                    '• Realizamos o cancelamento das notas fiscais solicitadas'],
    [/integração ifood verificada/i,              '• Verificamos o recebimento de pedidos pelo iFood'],
    [/integração 99food verificada/i,             '• Verificamos o recebimento de pedidos pelo 99Food'],
    [/integração keeta verificada/i,              '• Verificamos o recebimento de pedidos pelo Keeta'],
    [/bot whatsapp.*validado/i,                   '• Configuramos e testamos o Bot do WhatsApp'],
    [/bot whatsapp verificado/i,                  '• Verificamos o funcionamento do Bot do WhatsApp'],
    [/app do entregador verificado/i,             '• Verificamos o funcionamento do App do Entregador'],
    [/monitor de preparo verificado/i,            '• Verificamos o funcionamento do Monitor de Preparo'],
    [/recebimento via pix configurado/i,          '• Configuramos o recebimento de pagamentos via PIX'],
    [/totem verificado/i,                         '• Verificamos e configuramos o totem de autoatendimento'],
    [/módulo mobile instalado/i,                  '• Instalamos e validamos o módulo de atendimento pelo celular'],
    [/máquina tef verificada/i,                   '• Verificamos e integramos a maquininha de cartão'],
    [/integração via api do parceiro/i,           '• Configuramos a integração com o sistema do parceiro'],
    [/menudino configurado/i,                     '• Configuramos e validamos o cardápio online'],
    [/chave google maps configurada/i,            '• Configuramos a integração com o mapa para entregas'],
    [/firebird.*reinstalado.*zero/i,              '• Reinstalamos o banco de dados do sistema do zero'],
    [/firebird padrão reinstalado/i,              '• Restauramos o banco de dados do sistema'],
    [/firebird exclusivo removido/i,              '• Removemos a versão exclusiva do banco de dados'],
    [/serviço do firebird reiniciado/i,           '• Reiniciamos o serviço de banco de dados'],
    [/comunicação do firebird.*validada/i,        '• Validamos a comunicação do banco de dados com o sistema'],
    [/recuperação do banco de dados/i,            '• Recuperamos o banco de dados do sistema'],
    [/responsável orientado quanto/i,             '• Orientamos o responsável sobre os procedimentos realizados'],
    [/responsável orientado sobre.*impactos/i,    '• Orientamos o responsável sobre possíveis impactos e prevenção'],
    [/manual do consumer indicado/i,              '• Indicamos o manual do sistema para consulta'],
    [/consumer connect.*demonstrado/i,            '• Apresentamos o portal de relatórios online'],
    [/crm verificado/i,                           '• Verificamos o CRM e repassamos orientações'],
    [/cliente orientado.*visita/i,                '• Orientamos o cliente a solicitar suporte técnico presencial'],
  ];

  function buildTec(steps, df, obs) {
    let txt = steps.map((s, i) => `${i+1}. ${s}`).join('\n');
    txt += '\n' + FRASE_FINAL;
    if (obs) txt += '\n\nObservação: ' + obs;
    const d = DESFECHOS.find(x => x.l === df);
    if (d) txt += '\n\n' + d.bloco;
    return txt;
  }

  function buildCli(steps, df, obs) {
    const itens = [];
    for (const step of steps) {
      for (const [re, texto] of TRADUCOES) {
        if (re.test(step) && !itens.includes(texto)) { itens.push(texto); break; }
      }
    }
    if (!itens.length) itens.push('• Realizamos os procedimentos necessários para resolver o problema');
    if (obs) itens.push('• ' + obs);
    const dm = {
      'Resolvido':   '\nO problema foi resolvido durante este atendimento.',
      'Parcial':     '\nO problema foi parcialmente resolvido. Entraremos em contato para continuidade.',
      'Análise Q.A': '\nO caso foi encaminhado para análise aprofundada da nossa equipe.',
      'Ag. cliente': '\nO atendimento está aguardando seu retorno para continuidade.',
    };
    let txt = itens.join('\n');
    if (df && dm[df]) txt += dm[df];
    txt += '\n\nCaso tenha qualquer dúvida, estamos à disposição.';
    return txt;
  }

  // ─── Estado ──────────────────────────────────────────────────────────────
  let selectedSteps = [];
  let selectedDf = '';
  let activeTab = 'tec';
  let resumoTec = '';
  let resumoCli = '';
  let showConfirm = false;

  // ─── Overlay + Modal (injetados no document.documentElement) ─────────────
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.5)',
    zIndex: '2147483640',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: '#fff',
    borderRadius: '12px',
    width: '520px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: '13px',
    color: '#111',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  });

  // Header
  const hdr = document.createElement('div');
  Object.assign(hdr.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', background: '#1F93FF', color: '#fff', flexShrink: '0',
  });
  hdr.innerHTML = '<span style="font-size:15px;font-weight:700;">🔗 Nexos</span>';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  Object.assign(closeBtn.style, {
    background: 'none', border: 'none', color: '#fff',
    fontSize: '22px', cursor: 'pointer', lineHeight: '1', padding: '0 4px',
  });
  hdr.appendChild(closeBtn);
  modal.appendChild(hdr);

  // Body (scrollável)
  const body = document.createElement('div');
  Object.assign(body.style, {
    flex: '1', overflowY: 'auto', padding: '14px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  });
  modal.appendChild(body);

  // Footer
  const ftr = document.createElement('div');
  Object.assign(ftr.style, {
    padding: '12px 14px', borderTop: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column', gap: '6px',
    flexShrink: '0', background: '#f9fafb',
  });
  modal.appendChild(ftr);

  overlay.appendChild(modal);
  document.documentElement.appendChild(overlay);

  // ─── Helpers de estilo ────────────────────────────────────────────────────
  function sec(title) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' });
    const t = document.createElement('div');
    Object.assign(t.style, {
      fontSize: '11px', fontWeight: '700', color: '#6b7280',
      textTransform: 'uppercase', letterSpacing: '.06em',
      padding: '8px 10px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
    });
    t.textContent = title;
    const b = document.createElement('div');
    b.style.padding = '8px 10px';
    wrap.appendChild(t); wrap.appendChild(b);
    return { wrap, title: t, body: b };
  }

  function btn(text, style = {}) {
    const b = document.createElement('button');
    b.textContent = text;
    Object.assign(b.style, {
      padding: '9px 12px', borderRadius: '7px', border: 'none',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      width: '100%', fontFamily: 'inherit', ...style,
    });
    return b;
  }

  function inp(placeholder, type = 'text') {
    const i = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') i.type = type;
    i.placeholder = placeholder;
    Object.assign(i.style, {
      width: '100%', padding: '7px 8px', border: '1px solid #e5e7eb',
      borderRadius: '6px', fontSize: '12px', color: '#111',
      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    });
    i.addEventListener('focus', () => i.style.borderColor = '#1F93FF');
    i.addEventListener('blur', () => i.style.borderColor = '#e5e7eb');
    return i;
  }

  function stepBtn(label) {
    const b = document.createElement('button');
    b.dataset.label = label;
    Object.assign(b.style, {
      textAlign: 'left', padding: '6px 8px', borderRadius: '6px',
      border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer',
      fontSize: '12px', color: '#374151', display: 'flex',
      alignItems: 'center', gap: '6px', width: '100%',
    });
    const chk = document.createElement('span');
    Object.assign(chk.style, {
      width: '14px', height: '14px', borderRadius: '3px',
      border: '1.5px solid #d1d5db', flexShrink: '0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px',
    });
    const lbl = document.createElement('span');
    lbl.textContent = label;
    b.appendChild(chk); b.appendChild(lbl);
    b.addEventListener('click', () => toggleStep(label));
    return b;
  }

  function updateStepBtn(b) {
    const sel = selectedSteps.includes(b.dataset.label);
    b.style.background = sel ? '#eff6ff' : '#fff';
    b.style.borderColor = sel ? '#1F93FF' : '#e5e7eb';
    b.style.color = sel ? '#1F93FF' : '#374151';
    const chk = b.querySelector('span');
    chk.textContent = sel ? '✓' : '';
    chk.style.background = sel ? '#1F93FF' : '#fff';
    chk.style.borderColor = sel ? '#1F93FF' : '#d1d5db';
    chk.style.color = '#fff';
  }

  // ─── Seção Token ─────────────────────────────────────────────────────────
  const tokenSec = sec('🔑 Token do Chatwoot');
  const tokenRow = document.createElement('div');
  tokenRow.style.cssText = 'display:flex;gap:6px;';
  const tokenInp = inp('Cole seu token de acesso...', 'password');
  tokenInp.style.flex = '1';
  tokenInp.value = GM_getValue('nexos_token', '');
  const tokenSaveBtn = document.createElement('button');
  tokenSaveBtn.textContent = 'Salvar';
  Object.assign(tokenSaveBtn.style, {
    padding: '7px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
    background: '#fff', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
  });
  const tokenHint = document.createElement('div');
  tokenHint.style.cssText = 'font-size:11px;color:#9ca3af;margin-top:5px;';
  tokenHint.textContent = 'Chatwoot → Configurações → Perfil → Token de acesso';
  const tokenStatus = document.createElement('div');
  tokenStatus.style.cssText = 'font-size:11px;color:#16a34a;margin-top:4px;display:none;';
  tokenSaveBtn.addEventListener('click', () => {
    const v = tokenInp.value.trim();
    GM_setValue('nexos_token', v);
    tokenStatus.textContent = v ? '✓ Token salvo' : '✓ Token removido';
    tokenStatus.style.display = 'block';
    setTimeout(() => tokenStatus.style.display = 'none', 2000);
  });
  tokenRow.appendChild(tokenInp); tokenRow.appendChild(tokenSaveBtn);
  tokenSec.body.appendChild(tokenRow);
  tokenSec.body.appendChild(tokenHint);
  tokenSec.body.appendChild(tokenStatus);
  body.appendChild(tokenSec.wrap);

  // ─── Seção Passos ─────────────────────────────────────────────────────────
  const stepsSec = sec('📋 Passos realizados');
  const badge = document.createElement('span');
  Object.assign(badge.style, {
    background: '#1F93FF', color: '#fff', borderRadius: '99px',
    fontSize: '10px', fontWeight: '700', padding: '1px 7px', display: 'none',
  });
  stepsSec.title.style.display = 'flex';
  stepsSec.title.style.justifyContent = 'space-between';
  stepsSec.title.style.alignItems = 'center';
  stepsSec.title.appendChild(badge);

  const favLabel = document.createElement('div');
  favLabel.style.cssText = 'font-size:11px;font-weight:600;color:#6b7280;margin-bottom:6px;';
  favLabel.textContent = '⭐ Mais usados';
  stepsSec.body.appendChild(favLabel);

  const favGrid = document.createElement('div');
  favGrid.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
  FAV.forEach(l => favGrid.appendChild(stepBtn(l)));
  stepsSec.body.appendChild(favGrid);

  const catsLabel = document.createElement('div');
  catsLabel.style.cssText = 'font-size:11px;font-weight:600;color:#6b7280;margin:10px 0 4px;';
  catsLabel.textContent = '📂 Outras ações';
  stepsSec.body.appendChild(catsLabel);

  const catsWrap = document.createElement('div');
  CATS.forEach(cat => {
    const catBtn2 = document.createElement('button');
    Object.assign(catBtn2.style, {
      width: '100%', textAlign: 'left', padding: '7px 10px',
      border: 'none', borderBottom: '1px solid #e5e7eb',
      background: '#f3f4f6', cursor: 'pointer', fontSize: '12px',
      fontWeight: '600', color: '#374151', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
    });
    const arr = document.createElement('span');
    arr.textContent = '▸';
    catBtn2.appendChild(document.createTextNode(cat.g));
    catBtn2.appendChild(arr);

    const content = document.createElement('div');
    content.style.cssText = 'display:none;flex-direction:column;gap:4px;padding:8px 10px;border-bottom:1px solid #e5e7eb;';
    cat.a.forEach(l => content.appendChild(stepBtn(l)));

    catBtn2.addEventListener('click', () => {
      const open = content.style.display !== 'none';
      catsWrap.querySelectorAll('[data-content]').forEach(el => { el.style.display = 'none'; });
      catsWrap.querySelectorAll('[data-arr]').forEach(el => { el.textContent = '▸'; });
      if (!open) { content.style.display = 'flex'; arr.textContent = '▾'; }
    });

    content.dataset.content = '1';
    arr.dataset.arr = '1';
    catsWrap.appendChild(catBtn2);
    catsWrap.appendChild(content);
  });
  stepsSec.body.appendChild(catsWrap);

  const customRow = document.createElement('div');
  customRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
  const customInp = inp('Ação personalizada...');
  customInp.style.flex = '1';
  const customAddBtn = document.createElement('button');
  customAddBtn.textContent = '+ Adicionar';
  Object.assign(customAddBtn.style, {
    padding: '7px 10px', borderRadius: '6px',
    border: '1px solid #1F93FF', background: '#eff6ff',
    color: '#1F93FF', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  });
  customAddBtn.addEventListener('click', addCustom);
  customInp.addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
  function addCustom() {
    const v = customInp.value.trim();
    if (!v) return;
    toggleStep(v);
    customInp.value = '';
  }
  customRow.appendChild(customInp); customRow.appendChild(customAddBtn);
  stepsSec.body.appendChild(customRow);
  body.appendChild(stepsSec.wrap);

  // ─── Seção Selecionados ───────────────────────────────────────────────────
  const selSec = sec('✅ Passos selecionados');
  selSec.wrap.style.display = 'none';
  const selList = document.createElement('div');
  selList.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
  selSec.body.appendChild(selList);
  body.appendChild(selSec.wrap);

  // ─── Seção Desfecho ───────────────────────────────────────────────────────
  const dfSec = sec('🏁 Desfecho');
  const dfGrid = document.createElement('div');
  dfGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
  const dfCls = [
    { sel: 'bg:#dcfce7;border:1px solid #16a34a;color:#15803d;', def: '' },
    { sel: 'bg:#fef9c3;border:1px solid #ca8a04;color:#a16207;', def: '' },
    { sel: 'bg:#eff6ff;border:1px solid #1F93FF;color:#1677d2;', def: '' },
    { sel: 'bg:#f3f4f6;border:1px solid #6b7280;color:#374151;', def: '' },
  ];
  DESFECHOS.forEach((d, i) => {
    const b = document.createElement('button');
    b.textContent = d.l;
    b.dataset.df = d.l;
    Object.assign(b.style, {
      padding: '7px', borderRadius: '6px', border: '1px solid #e5e7eb',
      background: '#fff', cursor: 'pointer', fontSize: '12px',
      fontWeight: '500', color: '#374151', textAlign: 'center',
    });
    b.addEventListener('click', () => {
      selectedDf = selectedDf === d.l ? '' : d.l;
      renderDf();
      resetResult();
    });
    dfGrid.appendChild(b);
  });
  dfSec.body.appendChild(dfGrid);
  body.appendChild(dfSec.wrap);

  // ─── Seção Observação ─────────────────────────────────────────────────────
  const obsSec = sec('📝 Observação adicional (opcional)');
  const obsInp = inp('Ex: cliente orientado sobre certificado digital', 'textarea');
  obsInp.rows = 2;
  obsInp.style.resize = 'vertical';
  obsSec.body.appendChild(obsInp);
  body.appendChild(obsSec.wrap);

  // ─── Footer ───────────────────────────────────────────────────────────────
  // Tabs
  const tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;gap:4px;';
  const tabTec = document.createElement('button');
  const tabCli = document.createElement('button');
  [tabTec, tabCli].forEach((t, i) => {
    t.textContent = i === 0 ? 'Resumo técnico' : 'Para o cliente';
    Object.assign(t.style, {
      flex: '1', padding: '6px', borderRadius: '6px',
      border: '1px solid #e5e7eb', background: '#fff',
      fontSize: '12px', fontWeight: '500', cursor: 'pointer', color: '#6b7280',
    });
  });
  tabTec.style.background = '#eff6ff';
  tabTec.style.borderColor = '#1F93FF';
  tabTec.style.color = '#1F93FF';
  tabTec.style.fontWeight = '600';
  tabBar.appendChild(tabTec); tabBar.appendChild(tabCli);
  ftr.appendChild(tabBar);

  tabTec.addEventListener('click', () => setTab('tec'));
  tabCli.addEventListener('click', () => setTab('cli'));

  // Preview
  const preview = document.createElement('div');
  Object.assign(preview.style, {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '7px',
    padding: '10px', fontSize: '12px', lineHeight: '1.7',
    whiteSpace: 'pre-wrap', color: '#111', maxHeight: '160px',
    overflowY: 'auto', display: 'none',
  });
  ftr.appendChild(preview);

  // Confirm box
  const confirmBox = document.createElement('div');
  Object.assign(confirmBox.style, {
    padding: '10px', background: '#fefce8', border: '1px solid #fde047',
    borderRadius: '7px', fontSize: '12px', color: '#854d0e',
    display: 'none', flexDirection: 'column', gap: '8px',
  });
  confirmBox.innerHTML = '<div><strong>⚠️ Nota pública</strong><br>Esta nota ficará visível para o cliente no Chatwoot. Confirma?</div>';
  const confirmActions = document.createElement('div');
  confirmActions.style.cssText = 'display:flex;gap:6px;';
  const confirmYes = btn('Confirmar', { background: '#1F93FF', color: '#fff', flex: '1' });
  const confirmNo = btn('Cancelar', { background: '#fff', color: '#374151', border: '1px solid #d1d5db', flex: '1' });
  confirmActions.appendChild(confirmYes); confirmActions.appendChild(confirmNo);
  confirmBox.appendChild(confirmActions);
  ftr.appendChild(confirmBox);

  confirmNo.addEventListener('click', () => { confirmBox.style.display = 'none'; });
  confirmYes.addEventListener('click', () => { confirmBox.style.display = 'none'; sendNote(false); });

  // Status
  const statusEl = document.createElement('div');
  statusEl.style.cssText = 'font-size:12px;text-align:center;padding:4px;display:none;';
  ftr.appendChild(statusEl);

  // Botão gerar
  const btnGerar = btn('Gerar resumo', { background: '#1F93FF', color: '#fff' });
  ftr.appendChild(btnGerar);

  // Action btns
  const actionBtns = document.createElement('div');
  actionBtns.style.cssText = 'display:none;flex-direction:column;gap:6px;';
  const btnCopy    = btn('📋 Copiar texto', { background: '#fff', color: '#374151', border: '1px solid #d1d5db' });
  const btnPrivate = btn('🔒 Enviar nota privada', { background: '#fff', color: '#374151', border: '1px solid #d1d5db' });
  const btnPublic  = btn('👁 Enviar ao cliente (nota pública)', { background: '#fff', color: '#dc2626', border: '1px solid #fca5a5' });
  const btnReset   = btn('↺ Novo chamado', { background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', fontSize: '12px' });
  [btnCopy, btnPrivate, btnPublic, btnReset].forEach(b => actionBtns.appendChild(b));
  ftr.appendChild(actionBtns);

  // ─── Lógica ───────────────────────────────────────────────────────────────
  function toggleStep(label) {
    selectedSteps = selectedSteps.includes(label)
      ? selectedSteps.filter(s => s !== label)
      : [...selectedSteps, label];
    renderSteps();
    resetResult();
  }

  function renderSteps() {
    document.querySelectorAll('[data-label]').forEach(b => updateStepBtn(b));
    badge.style.display = selectedSteps.length ? 'inline' : 'none';
    badge.textContent = selectedSteps.length;
    selList.innerHTML = '';
    selSec.wrap.style.display = selectedSteps.length ? 'block' : 'none';
    selectedSteps.forEach((s, i) => {
      const item = document.createElement('div');
      Object.assign(item.style, {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 8px', background: '#eff6ff', borderRadius: '5px',
        fontSize: '12px', color: '#1677d2',
      });
      item.draggable = true;
      item.dataset.idx = i;
      const drag = document.createElement('span');
      drag.textContent = '⠿'; drag.style.cssText = 'cursor:grab;color:#93c5fd;flex-shrink:0;';
      const txt = document.createElement('span');
      txt.textContent = s; txt.style.flex = '1';
      const rm = document.createElement('button');
      rm.textContent = '×';
      Object.assign(rm.style, { marginLeft: 'auto', background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '16px' });
      rm.addEventListener('click', () => toggleStep(s));
      item.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', i));
      item.addEventListener('dragover', e => e.preventDefault());
      item.addEventListener('drop', e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('text/plain'));
        if (from === i) return;
        const arr = [...selectedSteps];
        const [el] = arr.splice(from, 1); arr.splice(i, 0, el);
        selectedSteps = arr; renderSteps();
      });
      item.appendChild(drag); item.appendChild(txt); item.appendChild(rm);
      selList.appendChild(item);
    });
  }

  function renderDf() {
    const colors = [
      { bg: '#dcfce7', border: '#16a34a', color: '#15803d' },
      { bg: '#fef9c3', border: '#ca8a04', color: '#a16207' },
      { bg: '#eff6ff', border: '#1F93FF',  color: '#1677d2' },
      { bg: '#f3f4f6', border: '#6b7280',  color: '#374151' },
    ];
    dfGrid.querySelectorAll('button').forEach((b, i) => {
      const sel = b.dataset.df === selectedDf;
      b.style.background = sel ? colors[i].bg : '#fff';
      b.style.borderColor = sel ? colors[i].border : '#e5e7eb';
      b.style.color = sel ? colors[i].color : '#374151';
    });
  }

  function setTab(tab) {
    activeTab = tab;
    const on = { background: '#eff6ff', borderColor: '#1F93FF', color: '#1F93FF', fontWeight: '600' };
    const off = { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280', fontWeight: '500' };
    Object.assign(tabTec.style, tab === 'tec' ? on : off);
    Object.assign(tabCli.style, tab === 'cli' ? on : off);
    const txt = tab === 'tec' ? resumoTec : resumoCli;
    if (txt) { preview.textContent = txt; preview.style.display = 'block'; }
    else preview.style.display = 'none';
    confirmBox.style.display = 'none';
    clearStatus();
  }

  function resetResult() {
    resumoTec = ''; resumoCli = '';
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

  btnGerar.addEventListener('click', () => {
    if (!selectedSteps.length) { showStatus('Selecione ao menos um passo.', 'err'); return; }
    const obs = obsInp.value.trim();
    resumoTec = buildTec(selectedSteps, selectedDf, obs);
    resumoCli = buildCli(selectedSteps, selectedDf, obs);
    preview.textContent = activeTab === 'tec' ? resumoTec : resumoCli;
    preview.style.display = 'block';
    btnGerar.style.display = 'none';
    actionBtns.style.display = 'flex';
    clearStatus();
  });

  btnCopy.addEventListener('click', () => {
    const txt = activeTab === 'tec' ? resumoTec : resumoCli;
    navigator.clipboard.writeText(txt)
      .then(() => showStatus('✓ Copiado!', 'ok'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = txt;
        Object.assign(ta.style, { position: 'fixed', top: '0', left: '0', width: '1px', height: '1px', opacity: '0' });
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        showStatus('✓ Copiado!', 'ok');
      });
  });

  btnPrivate.addEventListener('click', () => sendNote(true));
  btnPublic.addEventListener('click', () => { confirmBox.style.display = 'flex'; clearStatus(); });

  function sendNote(isPrivate) {
    const token = GM_getValue('nexos_token', '').trim();
    if (!token) { showStatus('Configure o token do Chatwoot primeiro.', 'err'); return; }
    const ids = getIdsFromUrl();
    if (!ids) { showStatus('Não foi possível identificar a conversa.', 'err'); return; }
    const content = isPrivate ? resumoTec : resumoCli;
    btnPrivate.disabled = true; btnPublic.disabled = true;
    showStatus('Enviando...', '');
    GM_xmlhttpRequest({
      method: 'POST',
      url: `https://app.chatwoot.com/api/v1/accounts/${ids.accountId}/conversations/${ids.conversationId}/messages`,
      headers: { 'Content-Type': 'application/json', 'api_access_token': token },
      data: JSON.stringify({ content, message_type: 'outgoing', private: isPrivate }),
      onload: r => {
        btnPrivate.disabled = false; btnPublic.disabled = false;
        showStatus(r.status >= 200 && r.status < 300
          ? (isPrivate ? '✓ Nota privada enviada!' : '✓ Nota pública enviada ao cliente!')
          : 'Erro ao enviar. Verifique o token.', r.status >= 200 && r.status < 300 ? 'ok' : 'err');
      },
      onerror: () => { btnPrivate.disabled = false; btnPublic.disabled = false; showStatus('Erro ao enviar.', 'err'); },
    });
  }

  btnReset.addEventListener('click', () => {
    selectedSteps = []; selectedDf = '';
    obsInp.value = ''; customInp.value = '';
    renderSteps(); renderDf(); resetResult();
    catsWrap.querySelectorAll('[data-content]').forEach(el => el.style.display = 'none');
    catsWrap.querySelectorAll('[data-arr]').forEach(el => el.textContent = '▸');
  });

  // ─── Botão flutuante ──────────────────────────────────────────────────────
  const toggleBtn = document.createElement('button');
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
    overlay.style.display = 'flex';
    toggleBtn.style.display = 'none';
  }
  function closeModal() {
    overlay.style.display = 'none';
    toggleBtn.style.display = 'block';
  }

  toggleBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'n') overlay.style.display === 'none' ? openModal() : closeModal();
    if (e.key === 'Escape' && overlay.style.display !== 'none') closeModal();
  });

})();
