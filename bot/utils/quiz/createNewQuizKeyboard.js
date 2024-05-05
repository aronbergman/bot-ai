export const createNewQuizKeyboard = (res, chatId, t) => {
  const keyboard = []
  const keyboard2 = []

  if (res?.dataValues?.quiz_subs_available === 0 && res.dataValues?.quiz_token_available === 0) {
    keyboard.push({ text: t('new_quiz_after_week'), callback_data: `NO_ATTEMPTS` })
  } else {
    if (res?.dataValues?.quiz_subs_available !== 0)
      keyboard.push({
        text: `${t('btn_win_subs')} (${res.dataValues.quiz_subs_available})`,
        callback_data: `WIN_SUBS_${chatId}`
      })
    if (res?.dataValues?.quiz_token_available !== 0)
      keyboard2.push({
        text: `${t('btn_win_tokens')} (${res.dataValues.quiz_token_available})`,
        callback_data: `WIN_REQ_${chatId}`
      })
  }

  return [
    keyboard,
    keyboard2
  ]
}