# 🎰 Top Escolhas da Net

Site completo de loterias online estilo TheLotter, construído com Next.js 14, Supabase e Mercado Pago.

## 🚀 Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **Next.js 14** | Frontend + Backend (App Router) |
| **React 18** | Interface do usuário |
| **Tailwind CSS** | Estilização |
| **Supabase** | Banco de dados + Autenticação |
| **Mercado Pago** | Pagamentos (PIX, Cartão) |
| **Zustand** | Gerenciamento de estado |
| **Vercel** | Hospedagem (gratuita) |
| **API Caixa** | Resultados automáticos das loterias BR |

## 📁 Estrutura

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx            # Homepage com grid de loterias
│   ├── loterias/[slug]/    # Página de cada loteria (seletor de números)
│   ├── resultados/         # Resultados estilo TheLotter
│   ├── carrinho/           # Carrinho de apostas
│   ├── checkout/           # Pagamento (PIX, Cartão, Saldo)
│   ├── conta/              # Área do usuário
│   │   ├── apostas/        # Minhas apostas
│   │   └── depositar/      # Depositar saldo
│   ├── auth/
│   │   ├── login/          # Login
│   │   └── registro/       # Cadastro
│   └── api/
│       ├── payment/        # API de pagamento
│       ├── results/        # API de resultados (sync com Caixa)
│       ├── lotteries/      # API de loterias
│       └── webhook/        # Webhook do Mercado Pago
├── components/             # Componentes reutilizáveis
│   ├── Header.tsx          # Cabeçalho com nav + carrinho + user
│   ├── Footer.tsx          # Rodapé
│   ├── LotteryCard.tsx     # Card de loteria para grid
│   ├── NumberSelector.tsx  # Seletor de números (o principal!)
│   ├── ResultBalls.tsx     # Bolinhas de resultado TheLotter
│   └── CountdownTimer.tsx  # Countdown para próximo sorteio
├── lib/
│   ├── lotteries.ts        # Dados de todas as 13 loterias
│   └── supabase.ts         # Cliente Supabase + tipos
└── store/
    ├── cartStore.ts        # Estado do carrinho (Zustand + persist)
    └── authStore.ts        # Estado de autenticação
```

## ⚡ Setup Rápido (10 minutos)

### 1. Clone e instale

```bash
git clone <seu-repo>
cd topescolhas
npm install
```

### 2. Configure o Supabase (grátis)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute o arquivo `supabase-schema.sql`
3. Em **Settings > API**, copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure o Mercado Pago

1. Acesse [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Em **Credenciais**, copie:
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`

### 4. Crie o .env.local

```bash
cp .env.example .env.local
# Edite com suas credenciais
```

### 5. Rode!

```bash
npm run dev
```

Acesse `http://localhost:3000` 🎉

## 🌐 Deploy na Vercel (grátis)

1. Suba o código no GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Adicione as variáveis de ambiente (do .env.local)
5. Deploy! ✅

Seu site estará em `https://seusite.vercel.app`

Para domínio próprio (topescolhasdanet.com.br):
- Na Vercel: Settings > Domains > Adicione seu domínio
- No registro do domínio: aponte DNS para Vercel

## 🎯 Funcionalidades

### 🏠 Homepage
- Grid de loterias com cards coloridos
- Jackpots em destaque
- Seção "Como Funciona"
- Trust badges

### 🔢 Seletor de Números
- Grid interativo de números
- "Surpresinha" (números aleatórios)
- Resumo visual dos números escolhidos
- Adicionar ao carrinho com animação

### 📊 Resultados
- Tabela estilo TheLotter
- Bolinhas coloridas por tipo de loteria
- Filtro Brasil/Internacional
- Design responsivo (tabela → cards no mobile)

### 🛒 Carrinho & Checkout
- Persistência (localStorage via Zustand)
- Resumo das apostas com bolinhas
- 3 formas de pagamento: PIX, Cartão, Saldo

### 👤 Área do Usuário
- Cadastro/Login via Supabase Auth
- Saldo da conta
- Histórico de apostas com status
- Depósito via PIX/Cartão

### 🔄 Sync Automático
- API da Caixa (gratuita) para loterias brasileiras
- Endpoint `/api/results?sync=true` atualiza tudo
- Configure um cron job na Vercel para rodar automaticamente

## 🔧 Cron Job (Vercel)

Crie `vercel.json` na raiz:

```json
{
  "crons": [{
    "path": "/api/results?sync=true",
    "schedule": "0 */2 * * *"
  }]
}
```

Isso sincroniza resultados a cada 2 horas automaticamente.

## 💳 Integração Mercado Pago (Produção)

O código já tem a estrutura preparada. Para ativar pagamentos reais:

1. Use credenciais de **produção** do Mercado Pago
2. No `api/payment/route.ts`, descomente o código do Mercado Pago
3. Configure o webhook URL no painel do Mercado Pago: `https://seusite.com/api/webhook`
4. Teste com a [documentação do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)

## 📱 Loterias Disponíveis

### 🇧🇷 Brasileiras (7)
Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte

### 🌍 Internacionais (6)
Powerball, Mega Millions, EuroMilhões, EuroJackpot, SuperEnalotto, UK Lotto

## 📄 Licença

Projeto privado - Top Escolhas da Net © 2025
