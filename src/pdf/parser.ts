import { PDFDocument } from 'pdf-lib';
import type { Document, Page } from '../types';
import { generateThumbnail } from './thumbnails';

export async function parsePDF(file: File): Promise<Document> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const documentPages: Page[] = [];

  for (let i = 0; i < pages.length; i++) {
    const pdfPage = pages[i];
    const pageId = `${documentId}-page-${i}`;
    
    // Generate thumbnail using original PDF bytes
    const thumbnail = await generateThumbnail(pdfPage, arrayBuffer, i);
    
    documentPages.push({
      pageId,
      thumbnail,
      rotation: 0,
      sourceDocumentId: documentId,
      pageNumber: i + 1,
      pdfPage,
    });
  }

  return {
    id: documentId,
    name: file.name,
    pages: documentPages,
    pdfDoc,
  };
}

export async function parseMultiplePDFs(files: File[]): Promise<Document[]> {
  const documents = await Promise.all(files.map(parsePDF));
  return documents;
}

