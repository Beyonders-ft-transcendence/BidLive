# FE-008 — Plano de Testes / Certificação (Integração LiveKit nos Leilões)

Este documento certifica a issue **FE-008**. Cada teste mapeia para um item do
_Checklist_ ou dos _Entregáveis_ da issue #16. Marque `[x]` conforme validar.

> Não há framework de testes automatizados no projeto (`npm test` não existe).
> A certificação é feita por: (A) verificações estáticas automatizadas + (B)
> testes funcionais manuais com o backend + servidor LiveKit a correr.

---

## 0. Pré-requisitos de ambiente (LEIA PRIMEIRO)

Sem isto, os testes funcionais (Parte 3+) não passam — o vídeo nunca liga.

- [ ] **Backend Django a correr** (branch `backend`) com LiveKit configurado:
      `LIVEKIT_API_KEY` e `LIVEKIT_API_SECRET` definidos (senão o endpoint
      `/livekit-token/` devolve 403 "LiveKit is not configured").
- [ ] **Servidor LiveKit a correr** e **acessível pelo browser**.
      ⚠️ **Gotcha nº1:** o backend devolve o campo `url` do token a partir de
      `LIVEKIT_PUBLIC_URL`. No `.env` do backend isso vem como
      `ws://livekit:7880` (hostname interno do Docker) — o **browser no host não
      resolve `livekit`**. Para testar a partir do teu PC, define no backend
      `LIVEKIT_PUBLIC_URL=ws://localhost:7880` (ou o IP/host correto).
- [ ] **`frontend/.env`** preenchido (copiar de `.env.example`):
      `VITE_API_URL`, `VITE_API_BASE_URL`, `VITE_WS_BASE_URL` e
      `VITE_LIVEKIT_URL` (fallback usado se o token não trouxer `url`).
- [ ] **Duas contas** de utilizador: uma **vendedora** (dona do leilão) e uma
      **segunda conta** (participante/licitante), ambas com login.
- [ ] **Um leilão** cujo dono é a conta vendedora, com estado **LIVE** ou
      **SCHEDULED** (só estes aparecem na Central de Transmissão).
- [ ] Browser com permissão de **câmara/microfone** e, de preferência, servido
      em **`localhost` ou HTTPS** (o `getUserMedia` é bloqueado em http remoto).

---

## A) Verificações estáticas (automatizadas) — já passam

Correr a partir de `frontend/`:

- [ ] **Pacotes instalados** (checklist nº1):
      ```bash
      npm ls livekit-client @livekit/components-react
      ```
      Esperado: `livekit-client@2.20.x` e `@livekit/components-react@2.9.x`,
      sem `UNMET DEPENDENCY`.
- [ ] **Build + type-check** (compila e passa o `tsc`):
      ```bash
      npm run build
      ```
      Esperado: `✓ built` e **zero** erros de TypeScript.
- [ ] **Lint dos ficheiros novos** (sem erros):
      ```bash
      npx eslint src/hooks/useLiveKit.ts \
        src/components/livestream/LiveStreamViewerPlayer.tsx \
        src/components/livestream/BroadcasterStage.tsx
      ```
      Esperado: sem output (0 problemas).
- [ ] **Commit presente no branch da issue**:
      ```bash
      git log --oneline -1
      ```
      Esperado: `feat: integrate LiveKit live streaming into auctions (FE-008)`.

---

## B) Testes funcionais manuais

### 1. Requisição de token LiveKit — checklist nº2

Endpoint: `POST /api/auctions/:id/streams/:pk/livekit-token/`

- [ ] Abrir DevTools → **Network**. Como **vendedor**, entrar em
      _Dashboard → Central de Transmissão Ao Vivo_ e selecionar o leilão.
- [ ] Confirmar a chamada `livekit-token/` com **`role: "broadcaster"`** no
      corpo do pedido.
- [ ] A resposta contém `token`, `url`, `room_name`, `identity`, `role` e
      `can_publish: true`.
- [ ] Como **participante**, abrir a página do leilão (com a live já iniciada) e
      confirmar outra chamada `livekit-token/` com **`role: "viewer"`** e
      `can_publish: false`.

### 2. Interface do Leiloeiro (Broadcaster) — checklist nº4 + Entregável

Onde: _Dashboard → Central de Transmissão Ao Vivo_ (conta **vendedora**).

- [ ] Se ainda não existir sala: preencher o formulário e **"Gerar Credenciais
      de Live"** — cria o stream em estado `READY`.
- [ ] Com o stream `READY`, aparece o **estúdio** (`BroadcasterStage`) com o
      badge **OFFLINE**. Pode surgir "Conectando ao estúdio..." por instantes.
- [ ] Clicar no botão da **câmara** → o browser pede permissão → aparece o
      **preview espelhado** da câmara (sinal de que está a publicar de verdade,
      não é mais o `<video>` local antigo).
- [ ] Alternar **microfone** e **câmara** liga/desliga sem erros (o ícone muda
      entre ativo/vermelho).
- [ ] Clicar **"Iniciar Transmissão"** → chamada `POST .../start/` → badge muda
      para **AO VIVO** (vermelho a pulsar) e o botão passa a **"Parar
      Transmissão"**.
- [ ] "Trocar Chave de Stream" fica **desativado** enquanto está AO VIVO.
- [ ] Clicar **"Parar Transmissão"** → chamada `POST .../end/` → volta a
      **OFFLINE** e o painel mostra "A transmissão está encerrada".

### 3. Player do Participante (Viewer) — checklist nº3 + Entregável

Onde: **página de detalhes do leilão** (`/leiloes/:id`), conta **participante**,
com a live **iniciada** pelo vendedor (passo 2).

- [ ] Na página do leilão aparece o separador **"Transmissão Ao Vivo (LIVE)"**.
      (Se acabou de iniciar, pode levar até ~15s a aparecer — o estado do stream
      é re-sondado periodicamente, não precisa de F5.)
- [ ] Ao abrir a aba da live: mostra **"Conectando à transmissão..."** e depois
      **reproduz o vídeo** do leiloeiro dentro da própria página.
- [ ] O **áudio** funciona; se o browser bloquear o autoplay, aparece o botão
      **"Clique para ativar o áudio"** — clicar ativa o som.
- [ ] Se o leiloeiro tiver a câmara **desligada**, o player mostra
      **"Aguardando vídeo do leiloeiro"** (e não uma tela preta sem contexto).
- [ ] Quando o vendedor faz **"Parar Transmissão"**, o participante deixa de ver
      a live e volta automaticamente à **galeria de fotos** (sala desligada).

### 4. Número de espectadores — checklist nº5

Endpoint: `GET /api/auctions/:id/streams/:pk/viewers/`

- [ ] **No estúdio do vendedor:** o cartão **"Espectadores Logados (N)"** lista
      os participantes ligados e a contagem `N`.
- [ ] **Na página do participante:** o badge **"N assistindo"** aparece sobre o
      vídeo.
- [ ] Abrir a live numa **terceira sessão** (outra conta/aba anónima autenticada)
      → a contagem **sobe** em ambos os lados dentro de poucos segundos
      (polling de 5s no estúdio, 10s na página do leilão).
- [ ] Fechar essa sessão → a contagem **desce**.

### 5. Visualização diferenciada leiloeiro vs. participante — Entregável

- [ ] Para o **mesmo stream**, o **vendedor** vê o **estúdio** (controlos de
      câmara/mic, iniciar/parar, chave RTMP) e o **participante** vê apenas o
      **player** (assistir + áudio). Confirma que os papéis não se misturam.

---

## C) Casos de erro / robustez (recomendado)

- [ ] **LiveKit em baixo / URL errado:** parar o servidor LiveKit (ou usar o
      `url` interno `ws://livekit:7880`). O player mostra **"Não foi possível
      carregar a live"** com botão **"Tentar Novamente"**; o estúdio mostra
      **"Falha ao conectar ao estúdio"**. Não deve haver ecrã em branco/crash.
- [ ] **Permissão de câmara negada:** recusar o pedido do browser → aparece um
      _toast_ **"Permissão negada. Autorize o acesso no seu navegador."** e a
      app continua funcional.
- [ ] **Stream ainda não LIVE:** como participante, tentar ver antes de o
      vendedor iniciar → o backend recusa o token de `viewer` (stream não LIVE) e
      a aba de live não fica disponível (só aparece quando está LIVE).
- [ ] **Reconexão:** cortar brevemente a rede durante a live → o player mostra
      **"Reconectando..."** e recupera quando a ligação volta.

---

## Resumo de cobertura

| Item da issue | Certificado por |
|---|---|
| nº1 Instalar pacotes LiveKit | A) `npm ls` + `build` |
| nº2 Requisição de tokens `/livekit-token/` | B.1 |
| nº3 Player do participante (Viewer) | B.3 |
| nº4 Interface do leiloeiro (`/start`, `/end`) | B.2 |
| nº5 Número de espectadores (`/viewers`) | B.4 |
| Entregável: live dentro da página de detalhes | B.3 |
| Entregável: visualização diferenciada | B.5 |
