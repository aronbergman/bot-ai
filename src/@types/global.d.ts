export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number
      APP_URL: string
      TELEGRAM_API_KEY: string
      OPENAI_API_KEY: string,
      SUDO_USER: string,
      MONGO_DB: string,
      SALAI_TOKEN: string,
    }
  }
}
