export function formatGeneratedAt(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
  
    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  
    if (isToday) return `Updated today at ${time}`
  
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return `Updated yesterday at ${time}`
  
    return `Updated ${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`
  }