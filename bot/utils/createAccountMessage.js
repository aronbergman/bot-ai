export const createAccountMessage = (token, days) => {
  return `
Текущий режим: 🤌🏻Lite version

TOKENS: ${token}
or
PAID DAYS: ${days}

Вам доступно:
😄10 запросов в день для GPT-3.5 (далее очередь в живом порядке)
😄2 запроса в день для Midjourney 
😄3 конвертирования файла в день

📎PaperClip PRO📎 350р/мес

😎100 запросов  GPT-4 
😎40 запросов Midjourney
😎20 запросов Dalle - 3
😎Конвертирование файла
😎Сжатие файла 
😎Голос в текст
`
}