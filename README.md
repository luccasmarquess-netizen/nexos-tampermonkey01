# Nexos — Tampermonkey

Resumo de atendimento técnico direto no Chatwoot, sem IA, sem dados externos.

## O que faz

- Painel lateral injetado na página do Chatwoot
- Seleção de passos realizados (lista completa do N2)
- Desfecho (Resolvido / Parcial / Análise Q.A / Ag. cliente)
- Observação adicional
- Gera resumo técnico (interno) e resumo para o cliente por template local
- Envia como nota privada ou nota pública diretamente na conversa
- Confirmação obrigatória antes de enviar nota pública
- Drag-and-drop para reordenar passos selecionados
- Atalho `Alt+N` para abrir/fechar
- Detecta troca de conversa automaticamente (SPA)
- Zero chamadas externas — tudo roda no browser

## Instalação

1. Instale a extensão [Tampermonkey](https://www.tampermonkey.net/) no Chrome
2. Clique no link abaixo:

**[⬇️ Instalar Nexos](https://raw.githubusercontent.com/luccasmarquess/nexos-tampermonkey/main/nexos.user.js)**

3. Clique em **Instalar** na tela do Tampermonkey
4. Acesse qualquer conversa no Chatwoot — o botão **NEXOS** aparece na lateral direita

## Configuração do token

Ao abrir o painel pela primeira vez, cole seu token de acesso pessoal do Chatwoot:

> Chatwoot → Configurações → Perfil → Token de acesso

O token fica salvo localmente via `GM_setValue` — nunca sai do seu computador.

## Atualizações

O Tampermonkey verifica atualizações automaticamente via `@updateURL`. Para forçar uma verificação: Tampermonkey → painel → verificar atualizações.

## Estrutura

```
nexos-tampermonkey/
├── nexos.user.js   ← script principal
└── README.md
```

## Diferença em relação ao Nexos web

| | Nexos web | Nexos Tampermonkey |
|---|---|---|
| IA | ✅ Groq / Gemini | ❌ Sem IA |
| Dados externos | Passos + conversa Chatwoot saem para IA | Zero — tudo local |
| Login | Google OAuth | Não necessário |
| Histórico | localStorage | Não — Chatwoot já tem |
| Instalação | Acessar URL | Tampermonkey |
| N1 e QA | ✅ | ❌ Só N2 |

## Desenvolvido por

Luccas Marques — Programaconsumer
