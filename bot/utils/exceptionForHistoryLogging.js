export const exceptionForHistoryLogging = (fromId, message) => {
  const exceptionIds = [
    963869223, // PiraJoke
    6221051172 // aronbergman
  ]

  if (exceptionIds.find((i) => i === fromId) != -1)
    return `${message.length} CONFIDENTIAL`
  else
    return `${message.length} ${message}`
}