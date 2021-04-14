export function sortString (rows: any[], dir: string, key: string): any[] {
  return rows.sort((a, b) =>
    dir === 'asc'
      ? (a[key].toString()).localeCompare(b[key])
      : (b[key].toString()).localeCompare(a[key])
  )
}

export function sortNumber (rows: any[], dir: string, key: string): any[] {
  return rows.sort((a, b) =>
    dir === 'asc' ? a[key] - b[key] : b[key] - a[key]
  )
}

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
