export default defineEventHandler<{ status: string }>((event) => {
  return { status: 'OK' }
})
