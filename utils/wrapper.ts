import JWT from "jsonwebtoken";

export function defineProtectedEventHandler<T>(
  handler: (event: CompatibilityEvent, user: {
    name: string | null,
    image: string | null,
    email: string | null,
    phone: string
  }) => T | Promise<T>
) {
  return defineEventHandler<T>(async (event) => {
    try {
      const config = useRuntimeConfig()
      const authHeader = event.node.req.headers['authorization']
      const token = authHeader && authHeader.split(" ")[1]
      if (token == null)
        throw createError({ statusCode: 401, statusMessage: "Token Not found" })

      try {
        const { id: userId } = JWT.verify(token, config.private.authSecret) as { id: string }
        const user = await useStorage().getItem(`user:${userId}`)
        console.log({ user });

        return handler(event, user)
      } catch (error) {
        throw createError({ statusCode: 403, statusMessage: "Invalid Token" })
      }
    } catch (err: any) {
      sendError(event, err)
    }
  })
}
