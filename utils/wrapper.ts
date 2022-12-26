import JWT from "jsonwebtoken";
import { UserInfo } from "./models";

export function defineProtectedEventHandler<T>(
  handler: (event: CompatibilityEvent, user: UserInfo) => T | Promise<T>
) {
  return defineEventHandler<T>(async (event) => {
    try {
      const config = useRuntimeConfig()
      const authHeader = event.node.req.headers['authorization']
      const token = authHeader && authHeader.split(" ")[1]
      if (token == null)
        throw createError({ statusCode: 401, statusMessage: "Token Not found" })

      try {
        const { id: userId } = JWT.verify(token, config.authSecret) as { id: string }
        const user = await useStorage().getItem(`user:${userId}`)

        return handler(event, user)
      } catch (error) {
        throw createError({ statusCode: 403, statusMessage: "Invalid Token" })
      }
    } catch (error: any) {
      sendError(event, error)
    }
  })
}
