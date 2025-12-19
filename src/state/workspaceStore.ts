import type { Page, WorkspaceState, WorkspaceAction } from '../types';

const MAX_HISTORY_SIZE = 50;

function createInitialState(): WorkspaceState {
  return {
    documents: [],
    selectedPageIds: new Set(),
    history: [],
    future: [],
  };
}

function cloneState(state: WorkspaceState): WorkspaceState {
  return {
    documents: [...state.documents],
    selectedPageIds: new Set(state.selectedPageIds),
    history: [...state.history],
    future: [...state.future],
  };
}

function getAllPages(state: WorkspaceState): Page[] {
  return state.documents.flatMap(doc => doc.pages);
}


function saveToHistory(state: WorkspaceState): WorkspaceState {
  const newState = cloneState(state);
  const historyState = {
    documents: state.documents.map(doc => ({
      ...doc,
      pages: doc.pages.map(page => ({
        ...page,
        // Keep thumbnails - they're data URLs (strings) so they're serializable
        // This preserves thumbnails through undo/redo operations
      })),
    })),
    selectedPageIds: new Set(state.selectedPageIds),
    history: [],
    future: [],
  };

  newState.history = [...state.history, historyState].slice(-MAX_HISTORY_SIZE);
  newState.future = []; // Clear redo stack on new action
  return newState;
}

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case 'ADD_DOCUMENT': {
      const newState = saveToHistory(state);
      // Add source document for export reference
      newState.documents.push(action.document);
      
      // If this is the first document, it becomes the workspace
      // Otherwise, merge pages into the first document (workspace)
      if (newState.documents.length === 1) {
        // First document - it's the workspace
        return newState;
      } else {
        // Merge pages into workspace (first document)
        const workspaceDoc = newState.documents[0];
        workspaceDoc.pages.push(...action.document.pages);
        // Keep source document separate for export
        return newState;
      }
    }

    case 'REORDER_PAGES': {
      const newState = saveToHistory(state);
      const allPages = getAllPages(newState);
      const pageMap = new Map(allPages.map(p => [p.pageId, p]));
      
      // Reorder pages across all documents
      const reorderedPages: Page[] = [];
      const seenIds = new Set<string>();
      
      for (const pageId of action.pageIds) {
        const page = pageMap.get(pageId);
        if (page && !seenIds.has(pageId)) {
          reorderedPages.push(page);
          seenIds.add(pageId);
        }
      }
      
      // Add any remaining pages
      for (const page of allPages) {
        if (!seenIds.has(page.pageId)) {
          reorderedPages.push(page);
        }
      }
      
      // Update workspace (first document) with reordered pages
      // Keep all source documents intact for export
      if (newState.documents.length > 0) {
        newState.documents[0] = { ...newState.documents[0], pages: reorderedPages };
      }
      
      return newState;
    }

    case 'DELETE_PAGES': {
      const newState = saveToHistory(state);
      const idsToDelete = new Set(action.pageIds);
      
      // Only delete from workspace (first document)
      // Keep source documents intact
      if (newState.documents.length > 0) {
        newState.documents[0].pages = newState.documents[0].pages.filter(
          p => !idsToDelete.has(p.pageId)
        );
      }
      
      // Remove deleted pages from selection
      action.pageIds.forEach(id => newState.selectedPageIds.delete(id));
      
      return newState;
    }

    case 'ROTATE_PAGE': {
      const newState = saveToHistory(state);
      // Update rotation in workspace (first document)
      if (newState.documents.length > 0) {
        const page = newState.documents[0].pages.find(p => p.pageId === action.pageId);
        if (page) {
          page.rotation = action.rotation;
        }
      }
      return newState;
    }

    case 'SELECT_PAGES': {
      const newState = cloneState(state);
      if (action.append) {
        action.pageIds.forEach(id => newState.selectedPageIds.add(id));
      } else {
        newState.selectedPageIds = new Set(action.pageIds);
      }
      return newState;
    }

    case 'CLEAR_SELECTION': {
      const newState = cloneState(state);
      newState.selectedPageIds.clear();
      return newState;
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const newState = cloneState(state);
      const previousState = newState.history.pop()!;
      newState.future.unshift({
        documents: state.documents.map(doc => ({
          ...doc,
          pages: doc.pages.map(page => ({
            ...page,
            // Keep thumbnails - preserve them in future stack for redo
          })),
        })),
        selectedPageIds: new Set(state.selectedPageIds),
        history: [],
        future: [],
      });
      return {
        ...previousState,
        history: newState.history,
        future: newState.future,
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const newState = cloneState(state);
      const nextState = newState.future.shift()!;
      newState.history.push({
        documents: state.documents.map(doc => ({
          ...doc,
          pages: doc.pages.map(page => ({
            ...page,
            // Keep thumbnails - preserve them in history stack for undo
          })),
        })),
        selectedPageIds: new Set(state.selectedPageIds),
        history: [],
        future: [],
      });
      return {
        ...nextState,
        history: newState.history,
        future: newState.future,
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}

export function createWorkspaceStore() {
  let state = createInitialState();
  
  return {
    getState: () => state,
    dispatch: (action: WorkspaceAction) => {
      state = workspaceReducer(state, action);
      return state;
    },
  };
}

