import { useState, useEffect, useRef } from 'react';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const menuPosition = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 200)
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#eaeae9] border border-[rgba(18,18,18,0.12)] rounded-lg shadow-lg py-2 min-w-[200px]"
      style={menuPosition}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`menu-item w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[rgba(18,18,18,0.05)] transition-colors cursor-pointer ${
            item.danger ? 'text-red-600' : 'text-[#121212]'
          }`}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const showContextMenu = (e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items
    });
  };

  const hideContextMenu = () => {
    setContextMenu(null);
  };

  const ContextMenuComponent = contextMenu ? (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      items={contextMenu.items}
      onClose={hideContextMenu}
    />
  ) : null;

  return {
    showContextMenu,
    hideContextMenu,
    ContextMenuComponent
  };
}
