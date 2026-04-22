import { NextResponse } from 'next/server'
import { google } from 'googleapis'

// Rota temporária — recebe o authorization code do Google e troca por refresh token
// Esta rota é chamada automaticamente pelo Google após o usuário autorizar

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('[auth-callback] usuário negou autorização ou ocorreu erro:', error)
    return NextResponse.json({ error: `Autorização negada: ${error}` }, { status: 400 })
  }

  if (!code) {
    console.error('[auth-callback] authorization code ausente na URL')
    return NextResponse.json({ error: 'Authorization code não recebido' }, { status: 400 })
  }

  console.log('[auth-callback] authorization code recebido, trocando por tokens...')

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/api/auth-setup/callback`,
  )

  try {
    const { tokens } = await client.getToken(code)

    console.log('='.repeat(60))
    console.log('[auth-callback] ✅ TOKENS OBTIDOS COM SUCESSO')
    console.log('[auth-callback] access_token :', tokens.access_token?.slice(0, 30) + '...')
    console.log('[auth-callback] token_type   :', tokens.token_type)
    console.log('[auth-callback] expiry_date  :', tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'N/A')
    console.log('[auth-callback] scope        :', tokens.scope)
    console.log('-'.repeat(60))
    console.log('[auth-callback] 🔑 REFRESH_TOKEN (copie este valor para o Vercel):')
    console.log(tokens.refresh_token ?? '⚠️  AUSENTE — veja instrução abaixo')
    console.log('='.repeat(60))

    if (!tokens.refresh_token) {
      console.warn('[auth-callback] ⚠️  O Google não devolveu refresh_token.')
      console.warn('[auth-callback]    Isso acontece quando o app já foi autorizado antes.')
      console.warn('[auth-callback]    Acesse /api/auth-setup novamente — o parâmetro prompt=consent')
      console.warn('[auth-callback]    deve forçar um novo consentimento e gerar novo refresh_token.')
    }

    return NextResponse.json({
      ok: true,
      message: tokens.refresh_token
        ? 'Refresh token obtido! Veja o valor nos logs do Vercel (Functions → Runtime Logs) e salve em GOOGLE_REFRESH_TOKEN.'
        : 'Access token obtido, mas refresh_token veio vazio. Revogue o acesso em myaccount.google.com/permissions e tente novamente via /api/auth-setup.',
      access_token_preview: tokens.access_token?.slice(0, 30) + '...',
      refresh_token: tokens.refresh_token ?? null,
      expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    })
  } catch (err: unknown) {
    const e = err as { message?: string; response?: { status?: number; data?: unknown } }
    console.error('[auth-callback] ❌ ERRO ao trocar code por tokens')
    console.error('[auth-callback] message     :', e?.message)
    console.error('[auth-callback] http status :', e?.response?.status)
    console.error('[auth-callback] resposta    :', JSON.stringify(e?.response?.data))
    return NextResponse.json(
      {
        error: 'Falha ao trocar authorization code por tokens',
        detail: e?.message,
        google: e?.response?.data,
      },
      { status: 500 }
    )
  }
}
