import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { PageTile } from '../PageTile/PageTile';
import type { Page } from '../../types';

interface PageGridProps {
  pages: Page[];
  selectedPageIds: Set<string>;
  onReorder: (pageIds: string[]) => void;
  onSelect: (pageId: string, append: boolean) => void;
  onDelete: (pageId: string) => void;
  onRotate: (pageId: string) => void;
}

interface SortablePageTileProps {
  page: Page;
  index: number;
  isSelected: boolean;
  onSelect: (pageId: string, append: boolean) => void;
  onDelete: (pageId: string) => void;
  onRotate: (pageId: string) => void;
}

function SortablePageTile({
  page,
  index,
  isSelected,
  onSelect,
  onDelete,
  onRotate,
}: SortablePageTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.pageId });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PageTile
        page={page}
        index={index}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
        onRotate={onRotate}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

export function PageGrid({
  pages,
  selectedPageIds,
  onReorder,
  onSelect,
  onDelete,
  onRotate,
}: PageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const pageIds = useMemo(() => pages.map(p => p.pageId), [pages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pageIds.indexOf(active.id as string);
      const newIndex = pageIds.indexOf(over.id as string);
      const newPageIds = arrayMove(pageIds, oldIndex, newIndex);
      onReorder(newPageIds);
    }
  };

  if (pages.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pageIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
          {pages.map((page, index) => (
            <SortablePageTile
              key={page.pageId}
              page={page}
              index={index}
              isSelected={selectedPageIds.has(page.pageId)}
              onSelect={onSelect}
              onDelete={onDelete}
              onRotate={onRotate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

