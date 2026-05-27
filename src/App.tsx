import { useState, useRef, useEffect, useCallback } from 'react';
import { Editor, Room } from './lib/editor';
import { ROOM_TYPES, ROOM_CATEGORIES, getRoomType } from './lib/roomTypes';
import { TEMPLATES, PRESETS, Template, Preset } from './lib/templates';
import { Home, LayoutGrid as Layout, Plus, Trash2, Copy, Download, Sparkles, Lightbulb, X, Ruler, Type, Building2, Warehouse, UtensilsCrossed, Palette } from 'lucide-react';

type ViewMode = 'landing' | 'editor';

function App() {
  const [view, setView] = useState<ViewMode>('landing');
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const initEditor = useCallback(() => {
    if (canvasRef.current) {
      if (editorInstance) {
        editorInstance.destroy();
      }
      const ed = new Editor('main');
      ed.setCallbacks(
        (room: Room | null) => setSelectedRoom(room),
        (roomList: Room[]) => setRooms(roomList)
      );
      ed.mount(canvasRef.current);
      setEditorInstance(ed);
      return ed;
    }
    return null;
  }, []);

  const handleTemplateSelect = (template: Template) => {
    setView('editor');
    setTimeout(() => {
      const ed = initEditor();
      if (ed) {
        ed.loadTemplate(template);
      }
    }, 50);
  };

  const handlePresetSelect = (preset: Preset) => {
    setView('editor');
    setTimeout(() => {
      const ed = initEditor();
      if (ed) {
        ed.loadPreset(preset.rooms);
      }
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, []);

  const handleExportSVG = () => {
    if (!editorInstance) return;
    const svgContent = editorInstance.exportSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prodesign-floorplan.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiAction = async (action: 'spec' | 'suggest') => {
    if (!editorInstance) return;
    setAiLoading(action);
    setAiResult(null);
    setShowAiModal(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
      const endpoint = action === 'spec' ? '/api/ai/spec' : '/api/ai/suggest';
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rooms }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const data = await response.json();
      setAiResult(data.result || data.message || 'No result returned');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setAiResult(`Error: ${msg}. Make sure the Spring Boot backend is running.`);
    } finally {
      setAiLoading(null);
    }
  };

  if (view === 'landing') {
    return <LandingPage onTemplateSelect={handleTemplateSelect} onPresetSelect={handlePresetSelect} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              editorInstance?.destroy();
              setEditorInstance(null);
              setView('landing');
              setSelectedRoom(null);
              setRooms([]);
            }}
            className="flex items-center gap-2 text-slate-800 font-semibold text-lg hover:text-slate-600 transition-colors"
          >
            <Layout size={22} className="text-sky-600" />
            <span>Prodesign</span>
          </button>
          <span className="text-slate-400 text-sm hidden sm:block">Floor Plan Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Export SVG"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export SVG</span>
          </button>
          <button
            onClick={() => handleAiAction('spec')}
            disabled={rooms.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Generate specification"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Specification</span>
          </button>
          <button
            onClick={() => handleAiAction('suggest')}
            disabled={rooms.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Design suggestions"
          >
            <Lightbulb size={15} />
            <span className="hidden sm:inline">Suggestions</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Room types */}
        <aside className="w-56 bg-white border-r border-slate-200 overflow-y-auto shrink-0 hidden md:block">
          <div className="p-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add Rooms</h3>
          </div>
          {ROOM_CATEGORIES.map(cat => (
            <div key={cat.id} className="px-3 py-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{cat.label}</p>
              <div className="space-y-0.5">
                {ROOM_TYPES.filter(rt => rt.category === cat.id).map(rt => (
                  <button
                    key={rt.id}
                    onClick={() => editorInstance?.addRoom(rt.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left"
                  >
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: rt.color }} />
                    <span>{rt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Canvas + properties */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
            <button
              onClick={() => editorInstance?.duplicateSelected()}
              disabled={!selectedRoom}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Duplicate"
            >
              <Copy size={13} /> Duplicate
            </button>
            <button
              onClick={() => editorInstance?.deleteSelected()}
              disabled={!selectedRoom}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Delete"
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              onClick={() => editorInstance?.clearAll()}
              disabled={rooms.length === 0}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Clear all"
            >
              <X size={13} /> Clear all
            </button>
            <div className="flex-1" />
            <span className="text-xs text-slate-400">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div
              ref={canvasRef}
              className="mx-auto shadow-sm border border-slate-200 rounded-lg bg-white"
              style={{ minWidth: 700, minHeight: 500 }}
            />
          </div>

          {/* Properties panel */}
          {selectedRoom && (
            <PropertiesPanel
              room={selectedRoom}
              onChangeName={name => editorInstance?.updateSelected({ name })}
              onChangeWidth={w => editorInstance?.updateSelected({ width: w })}
              onChangeHeight={h => editorInstance?.updateSelected({ height: h })}
              onChangeColor={color => editorInstance?.updateSelected({ color })}
            />
          )}
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowAiModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">
                {aiLoading === 'spec'
                  ? 'Architectural Specification'
                  : aiLoading === 'suggest'
                  ? 'Design Suggestions'
                  : 'AI Assistant'}
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="animate-spin w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full" />
                  <span className="text-sm">
                    Generating {aiLoading === 'spec' ? 'specification' : 'suggestions'}...
                  </span>
                </div>
              ) : aiResult ? (
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                  {aiResult}
                </pre>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Mobile room add FAB */}
      <MobileRoomDrawer editor={editorInstance} />
    </div>
  );
}

function PropertiesPanel({
  room,
  onChangeName,
  onChangeWidth,
  onChangeHeight,
  onChangeColor,
}: {
  room: Room;
  onChangeName: (v: string) => void;
  onChangeWidth: (v: number) => void;
  onChangeHeight: (v: number) => void;
  onChangeColor: (v: string) => void;
}) {
  const rt = getRoomType(room.type);
  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
            <Type size={11} /> Name
          </label>
          <input
            type="text"
            value={room.name}
            onChange={e => onChangeName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
          />
        </div>
        <div className="w-24">
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
            <Ruler size={11} /> Width
          </label>
          <input
            type="number"
            value={Math.round(room.width)}
            onChange={e => onChangeWidth(parseInt(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
          />
        </div>
        <div className="w-24">
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
            <Ruler size={11} /> Height
          </label>
          <input
            type="number"
            value={Math.round(room.height)}
            onChange={e => onChangeHeight(parseInt(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
          />
        </div>
        <div className="w-20">
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
            <Palette size={11} /> Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={room.color}
              onChange={e => onChangeColor(e.target.value)}
              className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
            />
            <span className="text-xs text-slate-500">{rt.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileRoomDrawer({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-30">
      {open && (
        <div className="absolute bottom-14 right-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 max-h-[60vh] overflow-y-auto">
          {ROOM_CATEGORIES.map(cat => (
            <div key={cat.id} className="px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {cat.label}
              </p>
              <div className="space-y-0.5">
                {ROOM_TYPES.filter(rt => rt.category === cat.id).map(rt => (
                  <button
                    key={rt.id}
                    onClick={() => {
                      editor?.addRoom(rt.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-slate-700 hover:bg-slate-100 text-left"
                  >
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: rt.color }}
                    />
                    <span>{rt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-sky-600 text-white shadow-lg flex items-center justify-center hover:bg-sky-700 transition-colors"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

function LandingPage({
  onTemplateSelect,
  onPresetSelect,
}: {
  onTemplateSelect: (t: Template) => void;
  onPresetSelect: (p: Preset) => void;
}) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-10 sm:py-16">
          <div className="flex items-center gap-3 mb-6">
            <Layout size={32} className="text-sky-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Prodesign
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
            Professional floor plan editor. Choose a template to customize, or
            start from scratch with a preset layout.
          </p>
        </div>
      </header>

      {/* Templates section */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-1">
          Template library
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Select a template to load into the editor and customize freely.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onTemplateSelect(t)}
              onMouseEnter={() => setHoveredTemplate(t.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-sky-400 hover:shadow-md transition-all group"
            >
              <div
                className="mb-3 rounded-lg overflow-hidden bg-slate-50 border border-slate-100"
                style={{ height: 180 }}
              >
                <TemplatePreview
                  template={t}
                  highlighted={hoveredTemplate === t.id}
                />
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
              <p className="text-xs text-slate-400 mt-1">
                {t.rooms.length} rooms
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Presets section */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold text-slate-800 mb-1">
          Start from scratch
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose a building type to begin with a starter layout.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESETS.map(p => {
            const icon = getPresetIcon(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onPresetSelect(p)}
                className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-sky-400 hover:shadow-md transition-all group flex flex-col items-center gap-2"
              >
                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                  {icon}
                </span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-sky-700 transition-colors">
                  {p.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {p.rooms.length === 0 ? 'Empty' : `${p.rooms.length} rooms`}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function getPresetIcon(id: string) {
  switch (id) {
    case 'residential':
      return <Home size={20} className="text-sky-600" />;
    case 'commercial':
      return <Building2 size={20} className="text-sky-600" />;
    case 'apartment':
      return <Layout size={20} className="text-sky-600" />;
    case 'warehouse':
      return <Warehouse size={20} className="text-sky-600" />;
    case 'restaurant':
      return <UtensilsCrossed size={20} className="text-sky-600" />;
    default:
      return <Layout size={20} className="text-sky-600" />;
  }
}

function TemplatePreview({
  template,
  highlighted,
}: {
  template: Template;
  highlighted: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    let maxX = 0;
    let maxY = 0;
    for (const r of template.rooms) {
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }
    const pad = 10;
    svg.setAttribute('viewBox', `${-pad} ${-pad} ${maxX + pad * 2} ${maxY + pad * 2}`);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', String(-pad));
    bg.setAttribute('y', String(-pad));
    bg.setAttribute('width', String(maxX + pad * 2));
    bg.setAttribute('height', String(maxY + pad * 2));
    bg.setAttribute('fill', '#F8FAFC');
    svg.appendChild(bg);

    for (const r of template.rooms) {
      const rt = getRoomType(r.type);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(r.x));
      rect.setAttribute('y', String(r.y));
      rect.setAttribute('width', String(r.width));
      rect.setAttribute('height', String(r.height));
      rect.setAttribute('fill', rt.color);
      rect.setAttribute('fill-opacity', highlighted ? '0.4' : '0.25');
      rect.setAttribute('stroke', highlighted ? '#1E293B' : '#94A3B8');
      rect.setAttribute('stroke-width', highlighted ? '1.5' : '0.75');
      rect.setAttribute('rx', '2');
      svg.appendChild(rect);

      if (r.width > 60 && r.height > 40) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(r.x + r.width / 2));
        text.setAttribute('y', String(r.y + r.height / 2 + 3));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        text.setAttribute('font-size', '8');
        text.setAttribute('fill', '#475569');
        text.setAttribute('pointer-events', 'none');
        text.textContent = r.name;
        svg.appendChild(text);
      }
    }
  }, [template, highlighted]);

  return <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} />;
}

export default App;
