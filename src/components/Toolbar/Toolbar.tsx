import type { WorkspaceState } from '../../types';

interface ToolbarProps {
  state: WorkspaceState;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (selectedOnly?: boolean) => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export function Toolbar({
  state,
  onUndo,
  onRedo,
  onExport,
  onDeleteSelected,
  onClearSelection,
}: ToolbarProps) {
  // Get pages from workspace (first document)
  const allPages = state.documents.length > 0 ? state.documents[0].pages : [];
  const hasSelection = state.selectedPageIds.size > 0;
  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-fast
                ${canUndo
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label="Undo"
            >
              Undo
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-fast
                ${canRedo
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label="Redo"
            >
              Redo
            </button>

            {hasSelection && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button
                  onClick={onDeleteSelected}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-fast"
                >
                  Delete Selected ({state.selectedPageIds.size})
                </button>
                <button
                  onClick={onClearSelection}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-fast"
                >
                  Clear Selection
                </button>
              </>
            )}
          </div>

          {/* Right: Export */}
          <div className="flex items-center gap-2">
            {hasSelection && (
              <button
                onClick={() => onExport(true)}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-fast"
              >
                Export Selected
              </button>
            )}
            <button
              onClick={() => onExport(false)}
              disabled={allPages.length === 0}
              className={`
                px-6 py-2 rounded-lg font-semibold text-sm transition-fast
                ${allPages.length > 0
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="mt-2 text-sm text-gray-500">
          {allPages.length > 0 && (
            <span>
              {allPages.length} page{allPages.length !== 1 ? 's' : ''}
              {hasSelection && ` • ${state.selectedPageIds.size} selected`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

