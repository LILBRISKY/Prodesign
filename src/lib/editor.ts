import { getRoomType } from './roomTypes';
import { Template, TemplateRoom } from './templates';

export interface Room {
  id: number;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const GRID_SIZE = 20;
const HANDLE_SIZE = 8;
const MIN_ROOM_SIZE = 30;

export class Editor {
  private instanceId: string;
  private container: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private rooms: Room[] = [];
  private nextId = 1;
  private selectedId: number | null = null;
  private canvasWidth = 700;
  private canvasHeight = 500;

  // Drag state
  private dragMode: 'none' | 'move' | 'resize' = 'none';
  private dragRoomId: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOrigX = 0;
  private dragOrigY = 0;
  private dragOrigW = 0;
  private dragOrigH = 0;

  // Callbacks
  private onSelectionChange?: (room: Room | null) => void;
  private onRoomsChange?: (rooms: Room[]) => void;

  // Bound handlers for cleanup
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor(instanceId: string) {
    this.instanceId = instanceId;
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  setCallbacks(onSelectionChange: (room: Room | null) => void, onRoomsChange: (rooms: Room[]) => void) {
    this.onSelectionChange = onSelectionChange;
    this.onRoomsChange = onRoomsChange;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('viewBox', `0 0 ${this.canvasWidth} ${this.canvasHeight}`);
    this.svg.style.cursor = 'default';
    this.svg.style.background = '#F8FAFC';
    this.svg.style.borderRadius = '8px';

    this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
    container.appendChild(this.svg);
    this.redraw();
  }

  destroy() {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.svg && this.container?.contains(this.svg)) {
      this.container.removeChild(this.svg);
    }
    this.svg = null;
    this.container = null;
  }

  getRooms(): Room[] {
    return [...this.rooms];
  }

  getSelectedRoom(): Room | null {
    if (this.selectedId === null) return null;
    return this.rooms.find(r => r.id === this.selectedId) ?? null;
  }

  loadTemplate(template: Template) {
    this.rooms = [];
    this.nextId = 1;
    this.selectedId = null;
    const bounds = this.computeBounds(template.rooms);
    this.canvasWidth = Math.max(700, bounds.maxX + 40);
    this.canvasHeight = Math.max(500, bounds.maxY + 40);
    if (this.svg) {
      this.svg.setAttribute('viewBox', `0 0 ${this.canvasWidth} ${this.canvasHeight}`);
    }
    for (const tr of template.rooms) {
      const rt = getRoomType(tr.type);
      this.rooms.push({
        id: this.nextId++,
        type: tr.type,
        name: tr.name,
        x: tr.x,
        y: tr.y,
        width: tr.width,
        height: tr.height,
        color: rt.color,
      });
    }
    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  loadPreset(rooms: TemplateRoom[]) {
    this.rooms = [];
    this.nextId = 1;
    this.selectedId = null;
    if (rooms.length > 0) {
      const bounds = this.computeBounds(rooms);
      this.canvasWidth = Math.max(700, bounds.maxX + 40);
      this.canvasHeight = Math.max(500, bounds.maxY + 40);
    } else {
      this.canvasWidth = 700;
      this.canvasHeight = 500;
    }
    if (this.svg) {
      this.svg.setAttribute('viewBox', `0 0 ${this.canvasWidth} ${this.canvasHeight}`);
    }
    for (const tr of rooms) {
      const rt = getRoomType(tr.type);
      this.rooms.push({
        id: this.nextId++,
        type: tr.type,
        name: tr.name,
        x: tr.x,
        y: tr.y,
        width: tr.width,
        height: tr.height,
        color: rt.color,
      });
    }
    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  addRoom(typeId: string) {
    const rt = getRoomType(typeId);
    const offset = this.rooms.length * 20;
    const room: Room = {
      id: this.nextId++,
      type: typeId,
      name: rt.label,
      x: 20 + (offset % 200),
      y: 20 + Math.floor(offset / 200) * 30,
      width: rt.defaultWidth,
      height: rt.defaultHeight,
      color: rt.color,
    };
    this.rooms.push(room);
    this.selectedId = room.id;
    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  duplicateSelected() {
    const sel = this.getSelectedRoom();
    if (!sel) return;
    const dup: Room = {
      id: this.nextId++,
      type: sel.type,
      name: sel.name + ' copy',
      x: sel.x + 20,
      y: sel.y + 20,
      width: sel.width,
      height: sel.height,
      color: sel.color,
    };
    this.rooms.push(dup);
    this.selectedId = dup.id;
    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  deleteSelected() {
    if (this.selectedId === null) return;
    this.rooms = this.rooms.filter(r => r.id !== this.selectedId);
    this.selectedId = null;
    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  clearAll() {
    this.rooms = [];
    this.nextId = 1;
    this.selectedId = null;
    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  updateSelected(patch: Partial<Pick<Room, 'name' | 'width' | 'height' | 'color'>>) {
    const sel = this.getSelectedRoom();
    if (!sel) return;
    if (patch.name !== undefined) sel.name = patch.name;
    if (patch.width !== undefined) sel.width = Math.max(MIN_ROOM_SIZE, Math.round(patch.width));
    if (patch.height !== undefined) sel.height = Math.max(MIN_ROOM_SIZE, Math.round(patch.height));
    if (patch.color !== undefined) sel.color = patch.color;
    this.redraw();
    this.notifyRoomsChange();
  }

  selectNone() {
    this.selectedId = null;
    this.redraw();
    this.notifySelectionChange();
  }

  exportSVG(): string {
    const rooms = this.rooms.map(r => {
      const fillColor = r.color;
      const strokeColor = this.selectedId === r.id ? '#1E293B' : '#475569';
      const strokeWidth = this.selectedId === r.id ? 2.5 : 1;
      const isSelected = this.selectedId === r.id;

      let roomSvg = `  <rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${fillColor}" fill-opacity="0.35" stroke="${strokeColor}" stroke-width="${strokeWidth}" rx="3"/>\n`;

      const nameX = r.x + r.width / 2;
      const nameY = r.y + r.height / 2 - 8;
      roomSvg += `  <text x="${nameX}" y="${nameY}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" fill="#1E293B">${this.escapeXml(r.name)}</text>\n`;

      const dimX = r.x + r.width / 2;
      const dimY = r.y + r.height / 2 + 10;
      roomSvg += `  <text x="${dimX}" y="${dimY}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#64748B">${r.width} x ${r.height}</text>\n`;

      if (isSelected) {
        const hs = HANDLE_SIZE;
        roomSvg += `  <rect x="${r.x + r.width - hs / 2}" y="${r.y + r.height - hs / 2}" width="${hs}" height="${hs}" fill="#1E293B" rx="1"/>\n`;
      }

      return roomSvg;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${this.canvasWidth}" height="${this.canvasHeight}" viewBox="0 0 ${this.canvasWidth} ${this.canvasHeight}">
  <defs>
    <pattern id="grid" width="${GRID_SIZE}" height="${GRID_SIZE}" patternUnits="userSpaceOnUse">
      <circle cx="${GRID_SIZE / 2}" cy="${GRID_SIZE / 2}" r="0.8" fill="#CBD5E1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#F8FAFC"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
${rooms}</svg>`;
  }

  // ---- Private methods ----

  private computeBounds(rooms: TemplateRoom[]) {
    let maxX = 0, maxY = 0;
    for (const r of rooms) {
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }
    return { maxX, maxY };
  }

  private redraw() {
    if (!this.svg) return;

    // Clear
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    // Grid pattern
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', `grid-${this.instanceId}`);
    pattern.setAttribute('width', String(GRID_SIZE));
    pattern.setAttribute('height', String(GRID_SIZE));
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(GRID_SIZE / 2));
    dot.setAttribute('cy', String(GRID_SIZE / 2));
    dot.setAttribute('r', '0.8');
    dot.setAttribute('fill', '#CBD5E1');
    pattern.appendChild(dot);
    defs.appendChild(pattern);
    this.svg.appendChild(defs);

    // Background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', String(this.canvasWidth));
    bgRect.setAttribute('height', String(this.canvasHeight));
    bgRect.setAttribute('fill', '#F8FAFC');
    this.svg.appendChild(bgRect);

    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridRect.setAttribute('width', String(this.canvasWidth));
    gridRect.setAttribute('height', String(this.canvasHeight));
    gridRect.setAttribute('fill', `url(#grid-${this.instanceId})`);
    this.svg.appendChild(gridRect);

    // Rooms (non-selected first, then selected on top)
    const sorted = [...this.rooms].sort((a, b) => {
      if (a.id === this.selectedId) return 1;
      if (b.id === this.selectedId) return -1;
      return 0;
    });

    for (const room of sorted) {
      this.drawRoom(room);
    }
  }

  private drawRoom(room: Room) {
    if (!this.svg) return;
    const isSelected = room.id === this.selectedId;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-room-id', String(room.id));
    g.style.cursor = 'move';

    // Room rect
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(room.x));
    rect.setAttribute('y', String(room.y));
    rect.setAttribute('width', String(room.width));
    rect.setAttribute('height', String(room.height));
    rect.setAttribute('fill', room.color);
    rect.setAttribute('fill-opacity', isSelected ? '0.45' : '0.3');
    rect.setAttribute('stroke', isSelected ? '#1E293B' : '#475569');
    rect.setAttribute('stroke-width', isSelected ? '2.5' : '1');
    rect.setAttribute('rx', '3');
    g.appendChild(rect);

    // Name label
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', String(Math.round(room.x + room.width / 2)));
    nameText.setAttribute('y', String(Math.round(room.y + room.height / 2 - 8)));
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    nameText.setAttribute('font-size', '12');
    nameText.setAttribute('font-weight', '600');
    nameText.setAttribute('fill', '#1E293B');
    nameText.setAttribute('pointer-events', 'none');
    nameText.textContent = room.name;
    g.appendChild(nameText);

    // Dimension label
    const dimText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    dimText.setAttribute('x', String(Math.round(room.x + room.width / 2)));
    dimText.setAttribute('y', String(Math.round(room.y + room.height / 2 + 10)));
    dimText.setAttribute('text-anchor', 'middle');
    dimText.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    dimText.setAttribute('font-size', '10');
    dimText.setAttribute('fill', '#64748B');
    dimText.setAttribute('pointer-events', 'none');
    dimText.textContent = `${Math.round(room.width)} x ${Math.round(room.height)}`;
    g.appendChild(dimText);

    // Resize handle if selected
    if (isSelected) {
      const hs = HANDLE_SIZE;
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      handle.setAttribute('x', String(Math.round(room.x + room.width - hs / 2)));
      handle.setAttribute('y', String(Math.round(room.y + room.height - hs / 2)));
      handle.setAttribute('width', String(hs));
      handle.setAttribute('height', String(hs));
      handle.setAttribute('fill', '#1E293B');
      handle.setAttribute('rx', '1');
      handle.setAttribute('data-handle', 'se');
      handle.style.cursor = 'nwse-resize';
      g.appendChild(handle);
    }

    this.svg!.appendChild(g);
  }

  private handleMouseDown(e: MouseEvent) {
    if (!this.svg) return;
    const pt = this.svgPoint(e);
    const target = e.target as SVGElement;

    // Check for resize handle click
    if (target.hasAttribute('data-handle')) {
      const g = target.closest('g[data-room-id]') as SVGGElement;
      if (g) {
        const roomId = parseInt(g.getAttribute('data-room-id')!, 10);
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
          this.dragMode = 'resize';
          this.dragRoomId = roomId;
          this.dragStartX = pt.x;
          this.dragStartY = pt.y;
          this.dragOrigW = room.width;
          this.dragOrigH = room.height;
          this.dragOrigX = room.x;
          this.dragOrigY = room.y;
          e.preventDefault();
          document.addEventListener('mousemove', this.boundMouseMove);
          document.addEventListener('mouseup', this.boundMouseUp);
          return;
        }
      }
    }

    // Check for room click
    const g = target.closest('g[data-room-id]') as SVGGElement | null;
    if (g) {
      const roomId = parseInt(g.getAttribute('data-room-id')!, 10);
      const room = this.rooms.find(r => r.id === roomId);
      if (room) {
        this.selectedId = roomId;
        this.dragMode = 'move';
        this.dragRoomId = roomId;
        this.dragStartX = pt.x;
        this.dragStartY = pt.y;
        this.dragOrigX = room.x;
        this.dragOrigY = room.y;
        this.dragOrigW = room.width;
        this.dragOrigH = room.height;
        e.preventDefault();
        this.redraw();
        this.notifySelectionChange();
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        return;
      }
    }

    // Click on empty area
    this.selectedId = null;
    this.redraw();
    this.notifySelectionChange();
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.svg || this.dragMode === 'none') return;
    const pt = this.svgPoint(e);
    const dx = pt.x - this.dragStartX;
    const dy = pt.y - this.dragStartY;
    const room = this.rooms.find(r => r.id === this.dragRoomId);
    if (!room) return;

    if (this.dragMode === 'move') {
      room.x = Math.round(Math.max(0, this.dragOrigX + dx));
      room.y = Math.round(Math.max(0, this.dragOrigY + dy));
      // Keep room within canvas bounds
      room.x = Math.min(room.x, this.canvasWidth - room.width);
      room.y = Math.min(room.y, this.canvasHeight - room.height);
    } else if (this.dragMode === 'resize') {
      room.width = Math.max(MIN_ROOM_SIZE, Math.round(this.dragOrigW + dx));
      room.height = Math.max(MIN_ROOM_SIZE, Math.round(this.dragOrigH + dy));
      // Keep within canvas
      if (room.x + room.width > this.canvasWidth) {
        room.width = this.canvasWidth - room.x;
      }
      if (room.y + room.height > this.canvasHeight) {
        room.height = this.canvasHeight - room.y;
      }
    }

    this.redraw();
    this.notifyRoomsChange();
    this.notifySelectionChange();
  }

  private handleMouseUp(_e: MouseEvent) {
    this.dragMode = 'none';
    this.dragRoomId = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  private svgPoint(e: MouseEvent): { x: number; y: number } {
    if (!this.svg) return { x: 0, y: 0 };
    const pt = this.svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private notifySelectionChange() {
    this.onSelectionChange?.(this.getSelectedRoom());
  }

  private notifyRoomsChange() {
    this.onRoomsChange?.(this.getRooms());
  }
}
