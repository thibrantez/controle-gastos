'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Props {
  filename: string
  title: string
  headers: string[]
  rows: string[][]
  footerRow?: string[]
}

export default function PdfExportButton({
  filename,
  title,
  headers,
  rows,
  footerRow,
}: Props) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text(title, 40, 40)

      doc.setFontSize(10)
      doc.setTextColor(140, 140, 140)
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 40, 58)

      const body = footerRow ? [...rows, footerRow] : rows

      autoTable(doc, {
        head: [headers],
        body,
        startY: 72,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 250] },
        didParseCell: (data) => {
          if (footerRow && data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [240, 240, 246]
          }
        },
        margin: { top: 72, left: 40, right: 40 },
      })

      doc.save(`${filename}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50"
    >
      <Download size={15} />
      {loading ? 'Gerando…' : 'Exportar PDF'}
    </button>
  )
}
