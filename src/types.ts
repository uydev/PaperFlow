export interface Page {
  pageId: string;
  thumbnail: string; // blob URL or data URL
  rotation: number; // 0, 90, 180, 270
  sourceDocumentId: string;
  pageNumber: number; // Original page number in source document
  pdfPage: any; // pdf-lib PDFPage reference
}

export interface Document {
  id: string;
  name: string;
  pages: Page[];
  pdfDoc: any; // pdf-lib PDFDocument reference
}

export interface WorkspaceState {
  documents: Document[];
  selectedPageIds: Set<string>;
  history: WorkspaceState[];
  future: WorkspaceState[];
}

export type WorkspaceAction =
  | { type: 'ADD_DOCUMENT'; document: Document }
  | { type: 'REORDER_PAGES'; pageIds: string[] }
  | { type: 'DELETE_PAGES'; pageIds: string[] }
  | { type: 'ROTATE_PAGE'; pageId: string; rotation: number }
  | { type: 'SELECT_PAGES'; pageIds: string[]; append?: boolean }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

