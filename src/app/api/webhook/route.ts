import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/webhook - Mercado Pago payment notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServerClient()

    // Mercado Pago envia notificação quando pagamento é aprovado
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id

      // Em produção: verificar pagamento no Mercado Pago
      // const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
      // const payment = await new Payment(mp).get({ id: paymentId })

      // Simula verificação - em produção, verificar payment.status === 'approved'
      // if (payment.status === 'approved') {
      //   // Encontra transação pendente pelo payment_id
      //   const { data: tx } = await supabase
      //     .from('transactions')
      //     .select('*')
      //     .eq('payment_id', paymentId)
      //     .eq('status', 'pending')
      //     .single()
      //
      //   if (tx) {
      //     // Atualiza transação para completa
      //     await supabase.from('transactions')
      //       .update({ status: 'completed' })
      //       .eq('id', tx.id)
      //
      //     // Se for depósito, credita saldo
      //     if (tx.type === 'deposit') {
      //       await supabase.rpc('update_user_balance', {
      //         p_user_id: tx.user_id,
      //         p_amount: tx.amount,
      //       })
      //     }
      //
      //     // Se for aposta, confirma as apostas
      //     if (tx.type === 'bet') {
      //       await supabase.from('bets')
      //         .update({ status: 'confirmed' })
      //         .eq('user_id', tx.user_id)
      //         .eq('status', 'pending')
      //     }
      //   }
      // }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
