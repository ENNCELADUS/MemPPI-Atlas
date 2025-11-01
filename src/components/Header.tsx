interface HeaderProps {
  title?: string;
}

export default function Header({ title = "MemPPI-Atlas" }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Network Icon SVG */}
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="MemPPI-Atlas Logo"
        >
          {/* Central node */}
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          {/* Surrounding nodes */}
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
          <circle cx="6" cy="18" r="1.5" fill="currentColor" />
          <circle cx="18" cy="18" r="1.5" fill="currentColor" />
          {/* Connecting lines */}
          <line x1="12" y1="12" x2="6" y2="6" strokeWidth="1.5" />
          <line x1="12" y1="12" x2="18" y2="6" strokeWidth="1.5" />
          <line x1="12" y1="12" x2="6" y2="18" strokeWidth="1.5" />
          <line x1="12" y1="12" x2="18" y2="18" strokeWidth="1.5" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
