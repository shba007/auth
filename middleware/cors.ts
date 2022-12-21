import cors from 'cors'

const config = useRuntimeConfig()

const corsOptions = {
  origin: config.corsURL,
  credentials: true,
}

export default fromNodeMiddleware(cors(corsOptions))

