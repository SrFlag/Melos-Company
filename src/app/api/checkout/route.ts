import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    // --- AJUSTE PARA DEPLOY (VERCEL) ---
    // Pega a URL de onde o pedido veio (localhost ou vercel.app)
    const { origin } = new URL(request.url);
    
    const body = await request.json();
    const { orderId, items, payer } = body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.id.toString(),
          title: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          picture_url: item.image_url,
          currency_id: 'BRL',
        })),
        payer: {
          email: payer.email,
          name: payer.name,
          identification: {
            type: "CPF",
            number: payer.cpf.replace(/\D/g, ''),
          },
        },
        external_reference: orderId.toString(),
        
        // Define as URLs de retorno dinamicamente
        back_urls: {
          success: `${origin}/success?order=${orderId}`, // Vamos criar essa página já já!
          failure: `${origin}/checkout`,
          pending: `${origin}/checkout`,
        },
        // auto_return removido para evitar erros de validação
      }
    });

    return NextResponse.json({ 
      url: result.init_point, 
      id: result.id 
    });

  } catch (error: any) {
    console.error("ERRO MP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}