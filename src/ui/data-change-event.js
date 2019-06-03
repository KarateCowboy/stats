const dataChange = new CustomEvent(
  'dataChange',
  {
    detail: {time: new Date()},
    bubbles: true,
    cancelable: true
  })

module.exports = dataChange
