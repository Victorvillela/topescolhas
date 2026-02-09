-- ============================================
-- TABELA DE RESULTADOS DE LOTERIAS
-- Execute no Supabase SQL Editor
-- ============================================

-- Cria a tabela
CREATE TABLE IF NOT EXISTS lottery_results (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  numbers INTEGER[] NOT NULL DEFAULT '{}',
  extras INTEGER[] NOT NULL DEFAULT '{}',
  draw_date DATE,
  prize TEXT DEFAULT '',
  concurso TEXT DEFAULT '',
  next_prize TEXT,
  next_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único para evitar duplicatas (slug + concurso)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lottery_results_slug_concurso
  ON lottery_results (slug, concurso);

-- Índice para buscar por data
CREATE INDEX IF NOT EXISTS idx_lottery_results_date
  ON lottery_results (draw_date DESC);

-- Índice para buscar por slug
CREATE INDEX IF NOT EXISTS idx_lottery_results_slug
  ON lottery_results (slug);

-- Habilita RLS (Row Level Security)
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;

-- Permite leitura pública (resultados são públicos)
CREATE POLICY "Resultados são públicos"
  ON lottery_results
  FOR SELECT
  USING (true);

-- Permite insert/update via service key (cron job)
CREATE POLICY "Cron pode inserir resultados"
  ON lottery_results
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Cron pode atualizar resultados"
  ON lottery_results
  FOR UPDATE
  USING (true);

-- ============================================
-- PRONTO! A tabela está criada.
-- O cron job vai popular automaticamente.
-- ============================================
