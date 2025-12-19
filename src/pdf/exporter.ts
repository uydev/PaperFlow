import { PDFDocument, degrees } from 'pdf-lib';
import type { Page } from '../types';

export async function exportPDF(pages: Page[], sourceDocuments: Map<string, any>): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  
  for (const page of pages) {
    const sourceDoc = sourceDocuments.get(page.sourceDocumentId);
    if (!sourceDoc) continue;
    
    try {
      // Copy the page from source document
      const [copiedPage] = await pdfDoc.copyPages(sourceDoc, [page.pageNumber - 1]);
      const newPage = pdfDoc.addPage(copiedPage);
      
      // Apply rotation
      if (page.rotation !== 0) {
        const rotationAngle = page.rotation as 0 | 90 | 180 | 270;
        newPage.setRotation(degrees(rotationAngle));
      }
    } catch (error) {
      console.error(`Error exporting page ${page.pageId}:`, error);
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export function downloadPDF(blob: Blob, filename: string = 'merged.pdf'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

