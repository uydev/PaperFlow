import { useState, useEffect, useCallback } from 'react';
import { workspaceReducer, createWorkspaceStore } from './state/workspaceStore';
import type { WorkspaceState, WorkspaceAction, Document, Page } from './types';
import { UploadZone } from './components/UploadZone/UploadZone';
import { PageGrid } from './components/PageGrid/PageGrid';
import { Toolbar } from './components/Toolbar/Toolbar';
import { exportPDF, downloadPDF } from './pdf/exporter';

function App() {
  const [state, setState] = useState<WorkspaceState>(() => {
    const store = createWorkspaceStore();
    return store.getState();
  });

  const dispatch = useCallback((action: WorkspaceAction) => {
    setState(prevState => workspaceReducer(prevState, action));
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      } else if (e.key === 'Escape') {
        dispatch({ type: 'CLEAR_SELECTION' });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedPageIds.size > 0) {
          e.preventDefault();
          dispatch({
            type: 'DELETE_PAGES',
            pageIds: Array.from(state.selectedPageIds),
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, state.selectedPageIds]);

  const handleDocumentsLoaded = useCallback((documents: Document[]) => {
    documents.forEach(doc => {
      dispatch({ type: 'ADD_DOCUMENT', document: doc });
    });
  }, [dispatch]);

  const handleReorder = useCallback((pageIds: string[]) => {
    dispatch({ type: 'REORDER_PAGES', pageIds });
  }, [dispatch]);

  const handleSelect = useCallback((pageId: string, append: boolean) => {
    dispatch({ type: 'SELECT_PAGES', pageIds: [pageId], append });
  }, [dispatch]);

  const handleDelete = useCallback((pageId: string) => {
    dispatch({ type: 'DELETE_PAGES', pageIds: [pageId] });
  }, [dispatch]);

  const handleDeleteSelected = useCallback(() => {
    if (state.selectedPageIds.size > 0) {
      dispatch({
        type: 'DELETE_PAGES',
        pageIds: Array.from(state.selectedPageIds),
      });
    }
  }, [dispatch, state.selectedPageIds]);

  const handleRotate = useCallback((pageId: string) => {
    const workspacePages = state.documents.length > 0 ? state.documents[0].pages : [];
    const page = workspacePages.find(p => p.pageId === pageId);
    if (page) {
      const newRotation = (page.rotation + 90) % 360;
      dispatch({ type: 'ROTATE_PAGE', pageId, rotation: newRotation });
    }
  }, [dispatch, state.documents]);

  const handleExport = useCallback(async (selectedOnly: boolean = false) => {
    const workspacePages = state.documents.length > 0 ? state.documents[0].pages : [];
    let pagesToExport: Page[];

    if (selectedOnly) {
      pagesToExport = workspacePages.filter(p => state.selectedPageIds.has(p.pageId));
    } else {
      pagesToExport = workspacePages;
    }

    if (pagesToExport.length === 0) {
      alert('No pages to export.');
      return;
    }

    // Create a map of source documents
    const sourceDocsMap = new Map<string, any>();
    state.documents.forEach(doc => {
      sourceDocsMap.set(doc.id, doc.pdfDoc);
    });

    try {
      const blob = await exportPDF(pagesToExport, sourceDocsMap);
      const filename = selectedOnly
        ? `paperflow-selected-${Date.now()}.pdf`
        : `paperflow-${Date.now()}.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  }, [state]);

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  const handleClearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [dispatch]);

  // Get pages from workspace (first document)
  const allPages = state.documents.length > 0 ? state.documents[0].pages : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar
        state={state}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onDeleteSelected={handleDeleteSelected}
        onClearSelection={handleClearSelection}
      />

      <main className="max-w-7xl mx-auto">
        {allPages.length === 0 ? (
          <div className="p-6">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Paperflow
              </h1>
              <p className="text-gray-600">
                Professional PDF workspace for splitting, merging, and reordering
              </p>
            </div>
            <UploadZone onDocumentsLoaded={handleDocumentsLoaded} />
          </div>
        ) : (
          <>
            <PageGrid
              pages={allPages}
              selectedPageIds={state.selectedPageIds}
              onReorder={handleReorder}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onRotate={handleRotate}
            />
            {/* Floating upload button */}
            <div className="fixed bottom-6 right-6">
              <label
                htmlFor="add-pdf"
                className="cursor-pointer bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent-hover transition-fast"
                aria-label="Add more PDFs"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </label>
              <input
                type="file"
                id="add-pdf"
                accept=".pdf,application/pdf"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    // Parse and add documents
                    import('./pdf/parser').then(({ parseMultiplePDFs }) => {
                      parseMultiplePDFs(Array.from(files)).then(handleDocumentsLoaded);
                    });
                  }
                }}
                className="hidden"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
