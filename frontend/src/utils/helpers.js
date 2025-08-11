export function intcomma(value, separator = ",") {
  if (value === null || value === undefined) {
    return value
  }

  const str = String(value)
  const parts = str.split(".")
  const integerPart = parts[0]
  const decimalPart = parts[1] ? "." + parts[1] : ""

  const isNegative = integerPart.startsWith("-")
  const digits = isNegative ? integerPart.slice(1) : integerPart

  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  return (isNegative ? "-" : "") + withCommas + decimalPart
}

export function intword(value) {
  try {
    value = Number.parseInt(value)
  } catch (error) {
    return value
  }

  if (isNaN(value)) {
    return value
  }

  const absValue = Math.abs(value)
  if (absValue < 1000000) {
    return value
  }

  const intwordConverters = [
    [9, "billion"],
    [6, "million"],
    [3, "thousand"],
  ]

  for (const [exponent, word] of intwordConverters) {
    const largeNumber = Math.pow(10, exponent)
    if (absValue < largeNumber * 1000) {
      const newValue = value / largeNumber
      const rounded = Number.parseFloat(newValue.toFixed(1))
      return `${rounded} ${word}`
    }
  }

  return value
}

export function naturaltime(value) {
  if (!(value instanceof Date)) {
    try {
      value = new Date(value)
    } catch (error) {
      return value
    }
  }

  if (isNaN(value.getTime())) {
    return value
  }

  const now = new Date()
  const diff = now.getTime() - value.getTime()
  const absDiff = Math.abs(diff)
  const isPast = diff > 0

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  let result

  if (absDiff < 1000) {
    return "now"
  } else if (seconds < 60) {
    result = seconds === 1 ? "a second" : `${seconds} seconds`
  } else if (minutes < 60) {
    result = minutes === 1 ? "a minute" : `${minutes} minutes`
  } else if (hours < 24) {
    result = hours === 1 ? "an hour" : `${hours} hours`
  } else if (days < 7) {
    result = days === 1 ? "1 day" : `${days} days`
  } else if (weeks < 4) {
    result = weeks === 1 ? "1 week" : `${weeks} weeks`
  } else if (months < 12) {
    result = months === 1 ? "1 month" : `${months} months`
  } else {
    result = years === 1 ? "1 year" : `${years} years`
  }

  return isPast ? `${result} ago` : `${result} from now`
}

export function formatDate(date, format) {
  const map = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    HH: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0"),
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match])
}
