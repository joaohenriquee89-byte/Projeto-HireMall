import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  try {
    const { userId, valor } = await req.json()
    const token = Deno.env.get('MERCADO_PAGO_TOKEN')

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        items: [{ title: "Assinatura HireMall", quantity: 1, unit_price: valor, currency_id: "BRL" }],
        external_reference: userId, 
        back_urls: { success: "https://seu-site.com/sucesso" },
        auto_return: "approved",
      }),
    })

    const data = await response.json()
    return new Response(JSON.stringify({ url: data.init_point }), { 
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})