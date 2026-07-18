import * as XLSX from 'xlsx'

/**
 * Export data to Excel (.xlsx) and trigger download.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1',
): void {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Print a DOM element by its ID using window.print().
 * Temporarily hides everything outside the target element.
 */
export function printElement(elementId: string, title?: string): void {
  const el = document.getElementById(elementId)
  if (!el) {
    alert('Tidak dapat menemukan konten untuk dicetak.')
    return
  }

  const originalTitle = document.title
  if (title) document.title = title

  const style = document.createElement('style')
  style.id = 'print-style'
  style.textContent = `
    @media print {
      body > *:not(#print-wrapper) { display: none !important; }
      #print-wrapper { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
    }
  `

  const wrapper = document.createElement('div')
  wrapper.id = 'print-wrapper'
  wrapper.innerHTML = el.innerHTML

  document.head.appendChild(style)
  document.body.appendChild(wrapper)

  window.print()

  // Cleanup
  document.body.removeChild(wrapper)
  document.head.removeChild(style)
  document.title = originalTitle
}

/**
 * Format date for report headers.
 */
export function formatReportDate(): string {
  const now = new Date()
  return now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
