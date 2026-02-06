-- ============================================
-- TOP ESCOLHAS DA NET - Schema Supabase
-- Execute este SQL no Editor SQL do Supabase
-- ============================================

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela de resultados das loterias
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_slug TEXT NOT NULL,
  lottery_name TEXT NOT NULL,
  numbers INTEGER[] NOT NULL,
  extras INTEGER[] DEFAULT '{}',
  jackpot TEXT DEFAULT '',
  prize_breakdown JSONB DEFAULT '[]',
  draw_date DATE NOT NULL,
  concurso TEXT DEFAULT '',
  accumulated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lottery_slug, concurso)
);

-- Tabela de apostas
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_slug TEXT NOT NULL,
  lottery_name TEXT NOT NULL,
  numbers INTEGER[] NOT NULL,
  extras INTEGER[] DEFAULT '{}',
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'won', 'lost')),
  draw_date DATE,
  concurso TEXT DEFAULT '',
  prize_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'prize')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_id TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de jackpots atuais
CREATE TABLE IF NOT EXISTS jackpots (
  lottery_slug TEXT PRIMARY KEY,
  lottery_name TEXT NOT NULL,
  amount TEXT NOT NULL DEFAULT '',
  next_draw TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_lottery ON bets(lottery_slug);
CREATE INDEX IF NOT EXISTS idx_results_lottery ON results(lottery_slug);
CREATE INDEX IF NOT EXISTS idx_results_date ON results(draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- RLS (Row Level Security) - Segurança
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE jackpots ENABLE ROW LEVEL SECURITY;

-- Políticas: Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas: Bets
CREATE POLICY "Users can view own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas: Transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas: Results (público)
CREATE POLICY "Anyone can view results" ON results FOR SELECT USING (true);

-- Políticas: Jackpots (público)
CREATE POLICY "Anyone can view jackpots" ON jackpots FOR SELECT USING (true);

-- Função para atualizar saldo do usuário
CREATE OR REPLACE FUNCTION update_user_balance(p_user_id UUID, p_amount DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  UPDATE profiles
  SET balance = balance + p_amount, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING balance INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
