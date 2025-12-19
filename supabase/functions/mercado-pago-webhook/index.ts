import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // 1. Conecta ao seu banco de dados Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const body = await req.json()
    console.log("Vigia HireMall recebeu notificação:", body)

    // 2. Extrai o ID do usuário (enviado anteriormente no external_reference)
    const userId = body.external_reference || body.data?.external_reference
    const type = body.type || body.entity // payment ou preapproval (assinatura)

    // 3. Verifica se temos o ID do usuário para saber quem atualizar
    if (userId && (type === 'payment' || type === 'preapproval')) {
      
      // 4. Atualiza a tabela 'profiles' mudando o 'plano' para 'lojista_premium'
      const { error } = await supabase
        .from('profiles')
        .update({ plano: 'lojista_premium' }) 
        .eq('id', userId) // Filtra pelo ID do usuário (ex: user_1766021810705)

      if (error) {
        console.error("Erro ao atualizar banco:", error)
      } else {
        console.log(`Sucesso! O plano do usuário ${userId} foi ativado.`)
      }
    }

    // 5. Responde 200 OK para o Mercado Pago parar de enviar a mesma notificação
    return new Response(JSON.stringify({ message: "Recebido pelo HireMall" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})