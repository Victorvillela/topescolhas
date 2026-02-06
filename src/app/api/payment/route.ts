import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/payment
// Handles: bet purchases, deposits
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, method, userId, amount, items, total } = body
    const supabase = createServerClient()

    // ========== DEPÓSITO ==========
    if (type === 'deposit') {
      if (!userId || !amount || amount < 5) {
        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
      }

      // Se for PIX, gera código (em produção, usa Mercado Pago API)
      if (method === 'pix') {
        // Em produção: criar preferência no Mercado Pago
        // const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
        // const payment = await new Payment(mp).create({ ... })

        const pixCode = `00020126580014BR.GOV.BCB.PIX0136${generateUUID()}5204000053039865802BR5924TOP ESCOLHAS DA NET6009SAO PAULO62070503***6304`

        // Registra transação pendente
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'deposit',
          amount: amount,
          description: `Depósito via PIX - R$ ${amount.toFixed(2)}`,
          status: 'pending',
          payment_method: 'pix',
        })

        return NextResponse.json({ pixCode, status: 'pending' })
      }

      // Se for cartão ou saldo imediato (simulação)
      // Em produção: processar via Mercado Pago
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount: amount,
        description: `Depósito via ${method} - R$ ${amount.toFixed(2)}`,
        status: 'completed',
        payment_method: method,
      })

      if (!txError) {
        // Atualiza saldo
        await supabase.rpc('update_user_balance', { p_user_id: userId, p_amount: amount })
      }

      return NextResponse.json({ success: true })
    }

    // ========== COMPRA DE APOSTAS ==========
    if (items && items.length > 0) {
      if (!userId) {
        return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
      }

      const paymentTotal = total || items.reduce((s: number, i: any) => s + i.price, 0)

      if (method === 'pix') {
        const pixCode = `00020126580014BR.GOV.BCB.PIX0136${generateUUID()}5204000053039865802BR5924TOP ESCOLHAS DA NET6009SAO PAULO62070503***6304`

        // Registra transação pendente
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'bet',
          amount: paymentTotal,
          description: `Compra de ${items.length} aposta(s)`,
          status: 'pending',
          payment_method: 'pix',
        })

        return NextResponse.json({ pixCode, status: 'pending' })
      }

      // Pagamento com saldo
      if (method === 'balance') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single()

        if (!profile || profile.balance < paymentTotal) {
          return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
        }

        // Debita saldo
        await supabase.rpc('update_user_balance', { p_user_id: userId, p_amount: -paymentTotal })
      }

      // Registra as apostas
      const bets = items.map((item: any) => ({
        user_id: userId,
        lottery_slug: item.lotterySlug,
        lottery_name: item.lotteryName,
        numbers: item.numbers,
        extras: item.extras || [],
        amount: item.price,
        status: 'confirmed',
      }))

      await supabase.from('bets').insert(bets)

      // Registra transação
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'bet',
        amount: paymentTotal,
        description: `Compra de ${items.length} aposta(s)`,
        status: 'completed',
        payment_method: method || 'card',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
