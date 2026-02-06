import { LOTTERIES } from '@/lib/lotteries'
import Link from 'next/link'

export default function ComoJogarPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-white font-bold text-3xl mb-2">Como Jogar</h1>
        <p className="text-dark-400 text-base">Tudo o que você precisa saber para começar a apostar</p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {[
          { n: '1', emoji: '📝', title: 'Crie sua conta', desc: 'Cadastro grátis em menos de 1 minuto' },
          { n: '2', emoji: '🎯', title: 'Escolha a loteria', desc: 'Navegue entre dezenas de opções nacionais e internacionais' },
          { n: '3', emoji: '🔢', title: 'Selecione números', desc: 'Escolha seus números da sorte ou use a Surpresinha' },
          { n: '4', emoji: '💰', title: 'Pague e concorra', desc: 'PIX, cartão ou saldo. Prêmios creditados automaticamente!' },
        ].map((step, i) => (
          <div key={i} className="bg-dark-900/50 border border-white/5 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">{step.emoji}</div>
            <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center mx-auto mb-2">
              {step.n}
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{step.title}</h3>
            <p className="text-dark-400 text-xs leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Lottery Details */}
      <h2 className="text-white font-bold text-xl mb-6">Detalhes de Cada Loteria</h2>
      <div className="space-y-4">
        {LOTTERIES.map(lot => (
          <div key={lot.slug} className="bg-dark-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: lot.gradient }}>
                {lot.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-base">{lot.flag} {lot.name}</h3>
                  <span className="text-dark-500 text-xs">{lot.country}</span>
                </div>
                <p className="text-dark-300 text-sm mb-3">{lot.howToPlay}</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="text-dark-400">Números: <span className="text-white font-semibold">{lot.mainNumbers} de {lot.mainRange[0]}-{lot.mainRange[1]}</span></span>
                  {lot.extraNumbers > 0 && (
                    <span className="text-dark-400">{lot.extraName}: <span className="text-white font-semibold">{lot.extraNumbers} de {lot.extraRange[0]}-{lot.extraRange[1]}</span></span>
                  )}
                  <span className="text-dark-400">Preço: <span className="text-white font-semibold">R$ {lot.pricePerBet.toFixed(2)}</span></span>
                  <span className="text-dark-400">Probabilidade: <span className="text-white font-semibold">{lot.odds}</span></span>
                </div>
                <Link href={`/loterias/${lot.slug}`}
                  className="inline-flex mt-3 px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: lot.gradient }}>
                  Jogar Agora →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
