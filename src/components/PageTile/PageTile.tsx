import { useState } from 'react';
import type { Page } from '../../types';

interface PageTileProps {
  page: Page;
  index: number;
  isSelected: boolean;
  onSelect: (pageId: string, append: boolean) => void;
  onDelete: (pageId: string) => void;
  onRotate: (pageId: string) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export function PageTile({
  page,
  index,
  isSelected,
  onSelect,
  onDelete,
  onRotate,
  dragHandleProps,
  isDragging = false,
}: PageTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      onSelect(page.pageId, true);
    } else {
      onSelect(page.pageId, false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(page.pageId);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRotate(page.pageId);
  };

  const rotationClass = page.rotation === 90 ? 'rotate-90' :
                       page.rotation === 180 ? 'rotate-180' :
                       page.rotation === 270 ? 'rotate-[270deg]' : '';

  return (
    <div
      className={`
        relative group bg-white rounded-lg shadow-sm border-2 transition-fast
        ${isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isHovered ? 'shadow-md' : ''}
        cursor-pointer
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[200/280] overflow-hidden rounded-t-lg bg-gray-100">
        <img
          src={page.thumbnail}
          alt={`Page ${page.pageNumber}`}
          className={`w-full h-full object-contain transition-transform duration-150 ${rotationClass}`}
        />
        
        {/* Overlay actions */}
        {(isHovered || isSelected) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <button
              onClick={handleRotate}
              className="p-2 bg-white/90 rounded hover:bg-white transition-fast"
              aria-label="Rotate page"
              title="Rotate"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-white/90 rounded hover:bg-white transition-fast"
              aria-label="Delete page"
              title="Delete"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Page number and drag handle */}
      <div className="p-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Page {index + 1}
        </span>
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            aria-label="Drag to reorder"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

