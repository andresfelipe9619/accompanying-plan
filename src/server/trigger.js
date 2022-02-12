const timeColumns = [6, 7, 8, 9]
const durationColumn = 10

function onSpreadSheetEdit (e) {
  Logger.log(JSON.stringify(e, null, 4))
  const range = e.range
  mLog('Value:', range.getValue())
  mLog('Column:', range.getColumn())
  checkEditedCell(range)
}

function checkEditedCell (range) {
  const col = +range.getColumn()
  if (!timeColumns.includes(col)) return
  const sheet = getActiveSheet()
  const sheetValues = sheet.getSheetValues(
    range.getRow(),
    timeColumns[0],
    1,
    timeColumns.length
  )
  mLog('Sheet Values:', sheetValues)
  let [rawData] = sheetValues
  if (!rawData) return
  if (rawData.some(v => !v)) return

  rawData = rawData.map(valueToNumber)
  mLog('Raw Data:', rawData)
  handleDurationChange(rawData, range)
}

function handleDurationChange (data, range) {
  const half = 2
  const a = data.slice(0, half)
  const b = data.slice(-half)

  const { totalDurationInMinutes } = getDurationFromHours(a, b)
  mLog('Duration In Minutes:', totalDurationInMinutes)
  const durationRange = getDurationRange(range)
  durationRange.setValue(totalDurationInMinutes)
}

function getDurationRange (eventRange) {
  const sheet = getActiveSheet()
  const durationRange = sheet.getRange(eventRange.getRow(), durationColumn)
  return durationRange
}

function getDurationFromHours (a, b) {
  mLog('a:', a)
  mLog('b:', b)

  const [aHours, aMinutes] = a
  const [bHours, bMinutes] = b

  const today = new Date()
  const endDate = new Date()
  today.setHours(aHours, aMinutes, 0)
  endDate.setHours(bHours, bMinutes, 0)

  mLog('today:', today)
  mLog('endDate:', endDate)

  const days = parseInt((endDate - today) / (1000 * 60 * 60 * 24))
  const hours = parseInt((Math.abs(endDate - today) / (1000 * 60 * 60)) % 24)
  const minutes = parseInt(
    (Math.abs(endDate.getTime() - today.getTime()) / (1000 * 60)) % 60
  )
  const seconds = parseInt(
    (Math.abs(endDate.getTime() - today.getTime()) / 1000) % 60
  )

  const totalDurationInMinutes = hours * 60 + minutes

  return { days, hours, minutes, seconds, totalDurationInMinutes }
}

function getActiveSheet () {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  return sheet
}

function valueToNumber (value) {
  return +value
}

function mLog (message, value) {
  Logger.log(message)
  Logger.log(value)
}
