import * as JWT from 'jsonwebtoken'

enum TokenType {
  'auth' = '30m',
  'refresh' = '',
  'access' = '3m',
}

export function createJWTToken(type: 'auth' | 'refresh' | 'access', id: string, secret: string) {
  const expiresIn = TokenType[type]
  if (expiresIn.length) return JWT.sign({ id }, secret, { expiresIn })
  else return JWT.sign({ id }, secret)
}

const user = {
  id: '18031c43-d574-4f56-9c01-29e355e0154e',
}
const authRefreshSecret = '2hI_0r8L5macNPeWG5uePEjzHL8LCojpoLETkgvM-TgYaOPhbL2pFqY1V_pamzux1Z2GRkZHTcGJMSZvp11sFGs_EPhIdF7jhOCmcsAXh8OybcVSTeO-FU6qdGG1vcjDMHib_EgdiS4t31aRRnCbhcrcaw9zfgLJuONWhtn0-pk'
const refreshToken = createJWTToken('refresh', user.id, authRefreshSecret)

console.log({ refreshToken })
