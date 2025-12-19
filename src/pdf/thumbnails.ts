import { PDFPage, PDFDocument } from 'pdf-lib';

const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 280; // A4 aspect ratio

// Initialize PDF.js worker once
let workerInitialized = false;

async function initializePDFJSWorker() {
  if (workerInitialized) return;
  
  const pdfjsLib = await import('pdfjs-dist');
  // Use the worker from public directory (copied from node_modules)
  // This works reliably in both dev and production
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  workerInitialized = true;
}

// Helper function to clone an ArrayBuffer (handles both ArrayBuffer and SharedArrayBuffer)
function cloneArrayBuffer(buffer: ArrayBuffer | SharedArrayBuffer): ArrayBuffer {
  const cloned = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(cloned).set(new Uint8Array(buffer));
  return cloned;
}

export async function generateThumbnail(
  _pdfPage: PDFPage,
  pdfData: ArrayBuffer | PDFDocument,
  pageIndex: number
): Promise<string> {
  try {
    await initializePDFJSWorker();
    
    let arrayBuffer: ArrayBuffer;
    
    // If pdfData is a PDFDocument, save it to bytes
    if (pdfData instanceof PDFDocument) {
      const pdfBytes = await pdfData.save();
      // Create a new ArrayBuffer from the Uint8Array
      // pdfBytes is a Uint8Array, so we clone it properly
      arrayBuffer = cloneArrayBuffer(pdfBytes.buffer);
    } else {
      // Clone the ArrayBuffer to avoid detachment issues
      // PDF.js may transfer/detach the buffer, so we need a fresh copy for each page
      arrayBuffer = cloneArrayBuffer(pdfData);
    }
    
    // Use PDF.js for rendering directly from array buffer
    return await renderPDFPageToCanvas(arrayBuffer, pageIndex, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Return a placeholder
    return createPlaceholderThumbnail();
  }
}

async function renderPDFPageToCanvas(
  pdfData: ArrayBuffer,
  pageIndex: number,
  width: number,
  height: number
): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Load the PDF document from array buffer
  const loadingTask = pdfjsLib.getDocument({ 
    data: pdfData,
    verbosity: 0, // Suppress warnings
  });
  
  const pdf = await loadingTask.promise;
  
  // Get the specific page (pageIndex is 0-based, PDF.js uses 1-based)
  const page = await pdf.getPage(pageIndex + 1);
  
  // Calculate scale to fit within thumbnail dimensions
  const viewport = page.getViewport({ scale: 1.0 });
  const scale = Math.min(width / viewport.width, height / viewport.height);
  const scaledViewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: false });
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }
  
  // Fill white background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  
  // Center the PDF page on canvas
  const xOffset = (width - scaledViewport.width) / 2;
  const yOffset = (height - scaledViewport.height) / 2;
  
  // Render the page with transform to center it
  const renderContext = {
    canvasContext: context,
    viewport: scaledViewport,
    transform: [1, 0, 0, 1, xOffset, yOffset],
  };
  
  await page.render(renderContext).promise;
  
  return canvas.toDataURL('image/png');
}

function createPlaceholderThumbnail(): string {
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Preview', canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL('image/png');
}

