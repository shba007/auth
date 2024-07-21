import JWT from 'jsonwebtoken'

interface JWTToken {
  id: string
  ita: number
  exp: number
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const { refreshToken } = await readBody<{ refreshToken: string }>(event)
    // Check if refresh token is available
    if (refreshToken == null)
      throw createError({
        statusCode: 404,
        statusMessage: 'Refresh Token not found',
      })

    // Check if refresh token is valid and not expired
    const { id } = JWT.verify(refreshToken, config.authRefreshSecret) as JWTToken
    // TODO: Check if refresh token is not in blocklist

    const accessToken = createJWTToken('access', id, config.authAccessSecret)

    return { accessToken }
  } catch (error: any) {
    console.error('Auth token PUT', error)

    if (error.statusCode === 404) throw error
    else if (error instanceof JWT.TokenExpiredError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Refresh Token Expired',
      })
    else if (error instanceof JWT.JsonWebTokenError)
      throw createError({
        statusCode: 400,
        statusMessage: 'Refresh Token is not valid',
      })

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
