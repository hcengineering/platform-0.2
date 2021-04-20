export function filter (row: any[], text: string, index: number): boolean {
  text = text.toLowerCase()
  for (const i in row) {
    if (
      row[i]
        .toString()
        .toLowerCase()
        .indexOf(text) > -1
    ) {
      return true
    }
  }
  return false
}
