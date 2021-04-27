export function stringFilter (row: object, text: string): boolean {
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith('_')) continue // makes sure it not searching in the private fields
    if (typeof value === 'string' && value.toLowerCase().includes(text.toLowerCase())) {
      return true
    }
  }
  return false
}
