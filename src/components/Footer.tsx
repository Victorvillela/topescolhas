import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm">🎰</div>
              <div className="text-white font-bold text-sm">Top Escolhas</div>
            </div>
            <p className="text-dark-400 text-xs leading-relaxed">
              Sua casa para as loterias nacionais e internacionais. Jogue online de forma segura e rápida.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Loterias</h4>
            <div className="flex flex-col gap-2">
              <Link href="/loterias/mega-sena" className="text-dark-400 text-xs hover:text-white transition-colors">Mega-Sena</Link>
              <Link href="/loterias/lotofacil" className="text-dark-400 text-xs hover:text-white transition-colors">Lotofácil</Link>
              <Link href="/loterias/powerball" className="text-dark-400 text-xs hover:text-white transition-colors">Powerball</Link>
              <Link href="/loterias/mega-millions" className="text-dark-400 text-xs hover:text-white transition-colors">Mega Millions</Link>
              <Link href="/loterias/euromilhoes" className="text-dark-400 text-xs hover:text-white transition-colors">EuroMilhões</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Informações</h4>
            <div className="flex flex-col gap-2">
              <Link href="/como-jogar" className="text-dark-400 text-xs hover:text-white transition-colors">Como Jogar</Link>
              <Link href="/resultados" className="text-dark-400 text-xs hover:text-white transition-colors">Resultados</Link>
              <Link href="/conta" className="text-dark-400 text-xs hover:text-white transition-colors">Minha Conta</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Pagamento</h4>
            <div className="flex flex-col gap-2 text-dark-400 text-xs">
              <span>💳 Cartão de Crédito</span>
              <span>📱 PIX</span>
              <span>🏦 Boleto Bancário</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs">© 2025 Top Escolhas da Net. Todos os direitos reservados.</p>
          <p className="text-dark-600 text-[10px]">Jogue com responsabilidade. +18</p>
        </div>
      </div>
    </footer>
  )
}
