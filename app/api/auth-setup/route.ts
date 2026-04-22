import { NextResponse } from 'next/server'
import { google } from 'googleapis'

// Rota temporária — gera a URL de autorização OAuth e redireciona o usuário
// Acesse: /api/auth-setup

export async function GET(request: Request) {
  const origin = new URL(request.url).origin

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/api/auth-setup/callback`,
  )

  const url = client.generateAuthUrl({
    access_type: 'offline',   // necessário para obter refresh_token
    prompt: 'consent',        // força Google a devolver novo refresh_token mesmo se já autorizado
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })

  console.log('[auth-setup] redirect_uri usada:', `${origin}/api/auth-setup/callback`)
  console.log('[auth-setup] redirecionando para URL de autorização Google...')

  return NextResponse.redirect(url)
}
