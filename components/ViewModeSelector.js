'use client';

export default function ViewModeSelector({ viewMode, onChange }) {
  const modes = [
    { id: 'cards', icon: '▦', label: 'Cartes' },
    { id: 'list', icon: '☰', label: 'Liste' },
    { id: 'icons', icon: '⚏', label: 'Icônes' },
  ];

  return (
    <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            viewMode === mode.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={mode.label}
        >
          <span className="md:hidden">{mode.icon}</span>
          <span className="hidden md:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}