const uiChange = new CustomEvent(
  'uiChange',
  {
    detail: {time: new Date()},
    bubbles: true,
    cancelable: true
  })

module.exports = uiChange
