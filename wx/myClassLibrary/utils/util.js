const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate()
  const hour = formatNumber(date.getHours())
  const minute = formatNumber(date.getMinutes())
  const second = formatNumber(date.getSeconds())

  return { year,month,day,hour,minute,second }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}
