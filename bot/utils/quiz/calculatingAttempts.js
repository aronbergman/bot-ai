export const calculatingAttempts = (subscriber, quizType) => {
  if (subscriber.quiz_type_available === 'X2'
    || subscriber.quiz_type_available === null
  || subscriber.quiz_type_available === "") {
    if (quizType === 'REQUESTS') {
      if (subscriber.quiz_type_available === 'X2') {
        return 6
      } else {
        return 3
      }
    }
    if (quizType === 'SUBSCRIBE') {
      if (subscriber.quiz_type_available === 'X2') {
        return 10
      } else {
        return 5
      }
    }
  } else {
    return subscriber.quiz_available
  }
}