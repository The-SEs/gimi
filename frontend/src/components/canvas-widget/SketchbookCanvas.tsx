import React, { useState, useRef, useEffect, useCallback } from 'react';
import { canvasService } from '../../services/canvasService';

// Types 
interface StrokeObj {
  id: number; type: 'stroke';
  color: string; opacity: number; lineWidth: number;
  points: number[]; dx: number; dy: number;
}
interface TextObj {
  id: number; type: 'text';
  text: string; font: string; fontSize: number; bold: boolean; italic: boolean;
  color: string; opacity: number;
  x: number; y: number; dx: number; dy: number;
}
interface ImageObj {
  id: number; type: 'image';
  img: HTMLImageElement; _src: string;
  x: number; y: number; w: number; h: number; dx: number; dy: number;
}
type CanvasObj = StrokeObj | TextObj | ImageObj;

interface Bounds { x: number; y: number; w: number; h: number; }
interface Pos    { x: number; y: number; }

interface SelectState {
  mode:          'idle' | 'lasso' | 'moving';
  lassoStart:    Pos | null;
  lassoRect:     Bounds | null;
  dragStart:     Pos | null;
  origPositions: Record<number, { dx: number; dy: number }> | null;
}

interface PlacingText {
  text: string; font: string; fontSize: number; bold: boolean; italic: boolean;
}

//  Icons 
const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const BrushIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08"/>
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z"/>
  </svg>
);
const EraserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l10-10 7 7-1.5 1.5"/><path d="M6.5 17.5l5-5"/>
  </svg>
);
const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);
const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);
const SelectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M4 2l16 10-7 1.5-4 7z"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

//  Constants 
const PALETTE = [
  '#1a1a2e','#6b5b95','#e8a0bf','#f7c5d5','#fddde6',
  '#c9b8f0','#a8d8ea','#87ceeb','#b5ead7','#ffd700',
  '#ffb347','#ff6b6b','#ffffff','#d4d4d4','#8b7355',
];
const FONTS = ['Georgia', 'Palatino', 'Courier New', 'Comic Sans MS', 'Arial', 'Times New Roman'];

const thumbCSS = `
  input[type=range]{-webkit-appearance:none;height:4px;background:linear-gradient(to right,#c9b8f0,#f0b8d8);border-radius:4px;outline:none;cursor:pointer;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #c9b8f0;box-shadow:0 1px 4px rgba(180,140,220,.3);}
  .swatch:hover{transform:scale(1.25);}
`;

//  Pure helpers 
const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1,3),16),
  g: parseInt(hex.slice(3,5),16),
  b: parseInt(hex.slice(5,7),16),
});

function getStrokeBounds(points: number[]): Bounds | null {
  if (!points || points.length < 2) return null;
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  for (let i=0; i<points.length; i+=2) {
    minX=Math.min(minX,points[i]);   minY=Math.min(minY,points[i+1]);
    maxX=Math.max(maxX,points[i]);   maxY=Math.max(maxY,points[i+1]);
  }
  return { x:minX, y:minY, w:maxX-minX, h:maxY-minY };
}

function ptInRect(px:number,py:number,rx:number,ry:number,rw:number,rh:number,pad=0) {
  return px>=rx-pad && px<=rx+rw+pad && py>=ry-pad && py<=ry+rh+pad;
}

function rectsOverlap(ax:number,ay:number,aw:number,ah:number,bx:number,by:number,bw:number,bh:number) {
  return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
}

// Sub-components 
const ToolBtn = ({
  active=false, disabled=false, onClick, title, children, className='',
}: {
  active?: boolean; disabled?: boolean; onClick?: () => void;
  title?: string; children: React.ReactNode; className?: string;
}) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className={[
      'w-8.5 h-8.5 rounded-[9px] border-0 flex items-center justify-center',
      'text-[13px] font-bold transition-all duration-150 cursor-pointer select-none',
      'disabled:opacity-30 disabled:cursor-not-allowed',
      active
        ? 'bg-linear-to-br from-[#c9b8f0] to-[#f0b8d8] text-white shadow-[0_2px_8px_rgba(180,140,220,.3)]'
        : 'bg-transparent text-[#9b8ab4] hover:bg-[rgba(180,140,220,.12)] hover:text-[#6b5b95]',
      className,
    ].filter(Boolean).join(' ')}>
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[rgba(180,140,220,.2)] mx-1 shrink-0" />;

const StyleBtn = ({
  active, onClick, children, className='',
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) => (
  <button onClick={onClick}
    className={[
      'w-7 h-7 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0',
      active
        ? 'bg-linear-to-br from-[#c9b8f0] to-[#f0b8d8] text-white border-transparent'
        : 'border-[rgba(180,140,220,.3)] text-[#9b8ab4] bg-transparent hover:bg-[rgba(180,140,220,.08)]',
      className,
    ].join(' ')}>
    {children}
  </button>
);

//  Main Component 
export default function SketchbookCanvas() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool,        setTool]        = useState<string>('pen');
  const [color,       setColor]       = useState<string>('#6b5b95');
  const [thickness,   setThickness]   = useState<number>(4);
  const [opacity,     setOpacity]     = useState<number>(100);
  const [isBold,      setIsBold]      = useState<boolean>(false);
  const [isItalic,    setIsItalic]    = useState<boolean>(false);
  const [font,        setFont]        = useState<string>('Georgia');
  const [fontSize,    setFontSize]    = useState<number>(20);
  const [canUndo,     setCanUndo]     = useState<boolean>(false);
  const [canRedo,     setCanRedo]     = useState<boolean>(false);
  const [canvasSize,  setCanvasSize]  = useState<{ w:number; h:number }>({ w:660, h:450 });
  const [textPopup,   setTextPopup]   = useState<boolean>(false);
  const [pendingText, setPendingText] = useState<string>('');
  const [objects,     setObjects]     = useState<CanvasObj[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Save state 
  const [drawingId,    setDrawingId]    = useState<number | null>(null);
  const [drawingTitle, setDrawingTitle] = useState<string>('');
  const [isSaving,     setIsSaving]     = useState<boolean>(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);


  // Refs that don't need to trigger re-renders 
  const selectState   = useRef<SelectState>({ mode:'idle', lassoStart:null, lassoRect:null, dragStart:null, origPositions:null });
  const historyRef    = useRef<string[]>([]);
  const redoStackRef  = useRef<string[]>([]);
  const isDrawing     = useRef<boolean>(false);
  const currentStroke = useRef<StrokeObj | null>(null);
  const placingText   = useRef<PlacingText | null>(null);

  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  // Resize 
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const w = Math.min(window.innerWidth - 48, 720);
        setCanvasSize({ w, h: Math.round(w * 0.65) });
      }, 150);
    };
    update();
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  }, []);

  useEffect(() => { renderAll(); }, [objects, selectedIds, canvasSize]);

  // Render all objects to canvas 
  const renderAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.dx, obj.dy);

      if (obj.type === 'stroke') {
        const {r,g,b} = hexToRgb(obj.color);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = `rgba(${r},${g},${b},${obj.opacity})`;
        ctx.lineWidth   = obj.lineWidth;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        for (let i=0; i<obj.points.length; i+=2) {
          i===0 ? ctx.moveTo(obj.points[i],obj.points[i+1])
                : ctx.lineTo(obj.points[i],obj.points[i+1]);
        }
        ctx.stroke();
      } else if (obj.type === 'text') {
        const {r,g,b} = hexToRgb(obj.color);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(${r},${g},${b},${obj.opacity})`;
        ctx.font = `${obj.italic?'italic ':''} ${obj.bold?'bold ':''} ${obj.fontSize}px ${obj.font}`;
        ctx.fillText(obj.text, obj.x, obj.y);
      } else if (obj.type === 'image') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
      }

      ctx.restore();
    });

    // Selection outlines
    if (tool === 'select' && selectedIds.size > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(107,91,149,0.7)';
      ctx.lineWidth   = 2;
      ctx.setLineDash([6,3]);
      selectedIds.forEach(id => {
        const obj = objects.find(o => o.id === id);
        if (!obj) return;
        const b = getObjBounds(obj);
        if (!b) return;
        const pad = 6;
        ctx.strokeRect(b.x-pad, b.y-pad, b.w+pad*2, b.h+pad*2);
      });
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Lasso rect
    const ss = selectState.current;
    if (ss.lassoRect) {
      const {x,y,w,h} = ss.lassoRect;
      ctx.save();
      ctx.strokeStyle = 'rgba(107,91,149,0.6)';
      ctx.fillStyle   = 'rgba(201,184,240,0.12)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([5,3]);
      ctx.fillRect(x,y,w,h);
      ctx.strokeRect(x,y,w,h);
      ctx.setLineDash([]);
      ctx.restore();
    }
  }, [objects, selectedIds, tool]);

  //  Save drawing to backend 
  const serializeCanvasData = useCallback(() => {
    // Strip non-serializable HTMLImageElement
    return objects.map(o => {
      if (o.type === 'image') {
        const { img, ...rest } = o;
        return rest;
      }
      return o;
    });
  }, [objects]);

  const handleSaveDrawing = async (title: string) => {
    if (!title.trim()) {
      setSaveError('Title cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const canvasData = serializeCanvasData();
      const result = await canvasService.saveDrawing(title, canvasData, drawingId || undefined);

      // Validate response structure
      if (!result || typeof result.id !== 'number') {
        throw new Error('Invalid response from server');
      }

      // Update the drawing ID if this was a new drawing
      if (!drawingId) {
        setDrawingId(result.id);
      }

      // Reset title and close modal after successful save
      setDrawingTitle('');
      setShowSaveModal(false);

      // Show success notification (via console for now)
      console.log(`✓ Drawing saved successfully${drawingId ? ' (updated)' : ' (created)'}`);
    } catch (err) {
      let message = 'Failed to save drawing';
      if (err instanceof Error) {
        if (err.message.includes('401')) message = 'Not authenticated. Please log in';
        else if (err.message.includes('400')) message = 'Invalid data. Please check your input';
        else if (err.message.includes('500')) message = 'Server error. Please try again later';
        else message = err.message;
      }
      setSaveError(message);
      console.error('Failed to save drawing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  function getObjBounds(obj: CanvasObj): Bounds | null {
    const dx=obj.dx, dy=obj.dy;
    if (obj.type==='stroke') {
      const b = getStrokeBounds(obj.points);
      if (!b) return null;
      const pad = obj.lineWidth;
      return { x:b.x+dx-pad, y:b.y+dy-pad, w:b.w+pad*2, h:b.h+pad*2 };
    }
    if (obj.type==='text') {
      const canvas = canvasRef.current;
      const ctx    = canvas?.getContext('2d');
      if (!ctx) return null;
      ctx.font = `${obj.italic?'italic ':''} ${obj.bold?'bold ':''} ${obj.fontSize}px ${obj.font}`;
      const m = ctx.measureText(obj.text);
      return { x:obj.x+dx, y:obj.y+dy-obj.fontSize, w:m.width, h:obj.fontSize*1.3 };
    }
    if (obj.type==='image') {
      return { x:obj.x+dx, y:obj.y+dy, w:obj.w, h:obj.h };
    }
    return null;
  }

  // History 
  const saveSnapshot = useCallback((objs: CanvasObj[]) => {
    // Strip non-serialisable HTMLImageElement before JSON
    const serialisable = objs.map(o =>
      o.type==='image' ? { ...o, img: undefined } : o
    );
    historyRef.current.push(JSON.stringify(serialisable));
    redoStackRef.current = [];
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(false);
  }, []);

  function restoreImageObj(o: CanvasObj): CanvasObj {
    if (o.type === 'image' && o._src) {
      const img = new Image();
      img.src = o._src;
      return { ...o, img };
    }
    return o;
  }

  const undo = () => {
    if (historyRef.current.length <= 1) return;
    const popped = historyRef.current.pop()!;
    redoStackRef.current.push(popped);
    const prev: CanvasObj[] = JSON.parse(historyRef.current.at(-1)!);
    setObjects(prev.map(restoreImageObj));
    setSelectedIds(new Set());
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(true);
  };

  const redo = () => {
    if (!redoStackRef.current.length) return;
    const next = redoStackRef.current.pop()!;
    historyRef.current.push(next);
    const parsed: CanvasObj[] = JSON.parse(next);
    setObjects(parsed.map(restoreImageObj));
    setSelectedIds(new Set());
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const clearCanvas = () => {
    setObjects([]);
    setSelectedIds(new Set());
    historyRef.current   = [];
    redoStackRef.current = [];
    saveSnapshot([]);
    setCanUndo(false);
    setCanRedo(false);
  };

  const handleDownloadDrawing = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  try {
    // Create a new canvas with the same dimensions as the displayed canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw ALL objects manually to ensure they're captured correctly
    // This is more reliable than copying the canvas since the canvas might not be fully rendered
    objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.dx, obj.dy);

      if (obj.type === 'stroke') {
        const { r, g, b } = hexToRgb(obj.color);
        ctx.strokeStyle = `rgba(${r},${g},${b},${obj.opacity})`;
        ctx.lineWidth = obj.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < obj.points.length; i += 2) {
          i === 0 
            ? ctx.moveTo(obj.points[i], obj.points[i + 1])
            : ctx.lineTo(obj.points[i], obj.points[i + 1]);
        }
        ctx.stroke();
      } else if (obj.type === 'text') {
        const { r, g, b } = hexToRgb(obj.color);
        ctx.fillStyle = `rgba(${r},${g},${b},${obj.opacity})`;
        ctx.font = `${obj.italic ? 'italic ' : ''}${obj.bold ? 'bold ' : ''}${obj.fontSize}px ${obj.font}`;
        ctx.fillText(obj.text, obj.x, obj.y);
      } else if (obj.type === 'image') {
        ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
      }

      ctx.restore();
    });

    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        return;
      }
      
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Doodle-${today.replace(/,?\s+/g, '-')}.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    }, 'image/png', 1.0);
    
  } catch (error) {
    console.error('Error downloading drawing:', error);
    setSaveError('Failed to download drawing');
  }
}, [objects, today]);

  //  Canvas coordinate helper 
  const getPos = (e: React.MouseEvent | React.TouchEvent): Pos => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = 'touches' in e ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  // Hit test 
  function hitTest(x: number, y: number): number | null {
    for (let i = objects.length-1; i >= 0; i--) {
      const b = getObjBounds(objects[i]);
      if (b && ptInRect(x,y,b.x,b.y,b.w,b.h,4)) return objects[i].id;
    }
    return null;
  }

  // Pointer down 
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    const ss  = selectState.current;

    if (tool === 'select') {
      const hitId = hitTest(pos.x, pos.y);
      if (hitId !== null) {
        const shiftHeld = 'shiftKey' in e ? e.shiftKey : false;
        const newSel: Set<number> = shiftHeld
          ? new Set([...selectedIds, hitId])
          : selectedIds.has(hitId) ? new Set(selectedIds) : new Set([hitId]);
        setSelectedIds(newSel);
        ss.mode          = 'moving';
        ss.dragStart     = pos;
        ss.origPositions = {};
        newSel.forEach(id => {
          const obj = objects.find(o => o.id===id);
          if (obj) ss.origPositions![id] = { dx:obj.dx, dy:obj.dy };
        });
      } else {
        const shiftHeld = 'shiftKey' in e ? e.shiftKey : false;
        if (!shiftHeld) setSelectedIds(new Set());
        ss.mode       = 'lasso';
        ss.lassoStart = pos;
        ss.lassoRect  = { x:pos.x, y:pos.y, w:0, h:0 };
      }
      return;
    }

    if (tool === 'eraser') {
      isDrawing.current = true;
      eraseAt(pos.x, pos.y);
      return;
    }

    // Pen / brush
    isDrawing.current = true;
    const alpha = opacity / 100;
    const stroke: StrokeObj = {
      id:        Date.now(),
      type:      'stroke',
      color,
      opacity:   tool==='brush' ? alpha*0.4 : alpha,
      lineWidth: tool==='brush' ? thickness*3 : thickness,
      points:    [pos.x, pos.y],
      dx: 0, dy: 0,
    };
    currentStroke.current = stroke;
    setObjects(prev => [...prev, stroke]);
  };

  // Pointer move 
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    const ss  = selectState.current;

    if (tool === 'select') {
      if (ss.mode === 'lasso' && ss.lassoStart) {
        ss.lassoRect = {
          x: Math.min(ss.lassoStart.x, pos.x),
          y: Math.min(ss.lassoStart.y, pos.y),
          w: Math.abs(pos.x - ss.lassoStart.x),
          h: Math.abs(pos.y - ss.lassoStart.y),
        };
        renderAll();
        return;
      }
      if (ss.mode === 'moving' && ss.dragStart && ss.origPositions) {
        const ddx = pos.x - ss.dragStart.x;
        const ddy = pos.y - ss.dragStart.y;
        setObjects(prev => prev.map(obj => {
          if (!selectedIds.has(obj.id)) return obj;
          const orig = ss.origPositions![obj.id] ?? { dx:0, dy:0 };
          return { ...obj, dx: orig.dx+ddx, dy: orig.dy+ddy };
        }));
        return;
      }
      return;
    }

    if (!isDrawing.current) return;
    if ('preventDefault' in e) e.preventDefault();

    if (tool === 'eraser') { eraseAt(pos.x, pos.y); return; }

    const stroke = currentStroke.current;
    if (!stroke) return;

    const updated: StrokeObj = {
      ...stroke,
      points: [...stroke.points, pos.x, pos.y],
    };
    currentStroke.current = updated;
    setObjects(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  // Pointer up 
  const handleMouseUp = (e?: React.MouseEvent | React.TouchEvent) => {
    const ss = selectState.current;

    if (tool === 'select') {
      if (ss.mode === 'lasso' && ss.lassoRect) {
        const {x,y,w,h} = ss.lassoRect;
        if (w > 4 || h > 4) {
          const shiftHeld = e && 'shiftKey' in e ? e.shiftKey : false;
          const hits = objects
            .filter(obj => { const b=getObjBounds(obj); return b && rectsOverlap(x,y,w,h,b.x,b.y,b.w,b.h); })
            .map(o => o.id);
          setSelectedIds(prev => new Set([...(shiftHeld ? prev : []), ...hits]));
        }
        ss.lassoRect = null;
        renderAll();
      }
      if (ss.mode === 'moving') {
        setObjects(prev => { saveSnapshot(prev); return prev; });
      }
      ss.mode = 'idle';
      return;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (tool === 'eraser') return;

    currentStroke.current = null;
    setObjects(prev => { saveSnapshot(prev); return prev; });
  };

  // Eraser 
  function eraseAt(x: number, y: number) {
    setObjects(prev => prev.filter(obj => {
      const b = getObjBounds(obj);
      return !(b && ptInRect(x,y,b.x,b.y,b.w,b.h,thickness*2));
    }));
  }

  // Delete key 
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key==='Delete' || e.key==='Backspace') &&
          tool==='select' && selectedIds.size>0 &&
          (document.activeElement as HTMLElement)?.tagName !== 'INPUT' &&
          (document.activeElement as HTMLElement)?.tagName !== 'TEXTAREA') {
        setObjects(prev => {
          const next = prev.filter(o => !selectedIds.has(o.id));
          saveSnapshot(next);
          return next;
        });
        setSelectedIds(new Set());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, selectedIds, saveSnapshot]);

  // Text placement 
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'text' && placingText.current) {
      const pos = getPos(e);
      const pt  = placingText.current;
      const newObj: TextObj = {
        id: Date.now(), type: 'text',
        text: pt.text, font: pt.font, fontSize: pt.fontSize,
        bold: pt.bold, italic: pt.italic,
        color, opacity: opacity/100,
        x: pos.x, y: pos.y, dx: 0, dy: 0,
      };
      placingText.current = null;
      setObjects(prev => { const next=[...prev, newObj]; saveSnapshot(next); return next; });
      setTool('pen');
    }
  };

  // Image import 
  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const scale  = Math.min(canvas.width/img.width, canvas.height/img.height, 1);
        const w = img.width*scale, h = img.height*scale;
        const newObj: ImageObj = {
          id: Date.now(), type: 'image', img, _src: src,
          x: (canvas.width-w)/2, y: (canvas.height-h)/2, w, h, dx:0, dy:0,
        };
        setObjects(prev => { const next=[...prev, newObj]; saveSnapshot(next); return next; });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cursor 
  const getCursor = (): string => {
    if (tool==='eraser') return 'cell';
    if (tool==='select') return selectState.current.mode==='moving' ? 'grabbing' : 'default';
    if (tool==='text' && placingText.current) return 'crosshair';
    if (tool==='text') return 'text';
    return 'crosshair';
  };

  const sliders = [
    { label:'Size',    min:1,  max:40,  value:thickness, set:setThickness, display:String(thickness) },
    { label:'Opacity', min:5,  max:100, value:opacity,   set:setOpacity,   display:`${opacity}%` },
  ];

  // Render 
  return (
    <>
      <style>{thumbCSS}</style>

      <div className="w-full flex items-center justify-center p-6 bg-linear-to-br from-[#fce4f3] via-[#ede4ff] to-[#daf0ff]">
        <div className="w-full max-w-190 rounded-3xl p-5 border border-white/90
                        bg-white/70 backdrop-blur-xl
                        shadow-[0_8px_40px_rgba(180,140,220,.18),0_2px_8px_rgba(180,140,220,.10)]">

          {/* Window dots */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className="w-2.75 h-2.75 rounded-full bg-[#ff7eb3]" />
            <span className="w-2.75 h-2.75 rounded-full bg-[#ffd97d]" />
            <span className="w-2.75 h-2.75 rounded-full bg-[#aaf0c4]" />
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center gap-1 flex-wrap bg-white/80 rounded-2xl px-3 py-2 mb-2 shadow-[0_2px_12px_rgba(180,140,220,.10)]">
            <ToolBtn active={tool==='select'} onClick={()=>{ setTool('select'); setSelectedIds(new Set()); }} title="Select & Move">
              <SelectIcon/>
            </ToolBtn>
            <ToolBtn active={tool==='pen'}    onClick={()=>setTool('pen')}    title="Pen">    <PenIcon/></ToolBtn>
            <ToolBtn active={tool==='brush'}  onClick={()=>setTool('brush')}  title="Brush">  <BrushIcon/></ToolBtn>
            <ToolBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} title="Eraser"> <EraserIcon/></ToolBtn>
            <ToolBtn active={tool==='text'}   onClick={()=>{ setTool('text'); setTextPopup(true); }} title="Text">
              <TextIcon/>
            </ToolBtn>

            <Divider/>

            <ToolBtn active={isBold}   onClick={()=>setIsBold(b=>!b)}   title="Bold"   className="font-bold! text-sm!">B</ToolBtn>
            <ToolBtn active={isItalic} onClick={()=>setIsItalic(i=>!i)} title="Italic" className="italic! text-sm!">I</ToolBtn>

            <Divider/>

            <ToolBtn onClick={undo}        disabled={!canUndo} title="Undo"><UndoIcon/></ToolBtn>
            <ToolBtn onClick={redo}        disabled={!canRedo} title="Redo"><RedoIcon/></ToolBtn>
            <ToolBtn onClick={clearCanvas}                     title="Clear all"><TrashIcon/></ToolBtn>
            <ToolBtn onClick={() => setShowSaveModal(true)} title="Save drawing"><SaveIcon/></ToolBtn>
            <ToolBtn onClick={handleDownloadDrawing} title="Download as image"><DownloadIcon/></ToolBtn>

            <Divider/>

            <ToolBtn onClick={()=>fileInputRef.current?.click()} title="Import image"><ImageIcon/></ToolBtn>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageImport}/>

            <Divider/>

            <div className="w-6.5 h-6.5 rounded-full shrink-0 border-[2.5px] border-white/90 shadow-[0_2px_8px_rgba(0,0,0,.15)]"
                 style={{ background: color }} />
          </div>

          {/* Status hint */}
          {tool==='select' && (
            <p className="text-[11px] text-[#b8a8d4] font-medium mb-1 pl-1">
              {selectedIds.size > 0
                ? `${selectedIds.size} object${selectedIds.size>1?'s':''} selected — drag to move · Delete to remove`
                : 'Click to select · Drag empty area to lasso · Shift+click to multi-select'}
            </p>
          )}
          {tool==='text' && placingText.current && (
            <p className="text-[11px] text-[#b8a8d4] font-medium mb-1 pl-1">
              Click on the canvas to place your text
            </p>
          )}

          {/* Date + Title */}
          <div className="mb-2">
            <p className="text-[11px] font-semibold tracking-wide text-[#b8a8d4]">{today}</p>
            <p className="font-['Helvetica'] text-[28px] font-semibold tracking-wide text-[#4a3a6a]">DOODLE</p>
          </div>

          {/* ── Canvas ── */}
          <div ref={containerRef}
               className="relative rounded-2xl overflow-hidden bg-white shadow-[inset_0_0_0_1px_rgba(180,140,220,.15),0_4px_20px_rgba(180,140,220,.10)]">
            <canvas
              ref={canvasRef}
              width={canvasSize.w*2}
              height={canvasSize.h*2}
              style={{ cursor:getCursor(), width:'100%', height:canvasSize.h, display:'block', touchAction:'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => handleMouseUp()}
              onClick={handleCanvasClick}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={() => handleMouseUp()}
            />
          </div>

          {/* ── Sliders ── */}
          <div className="flex items-center gap-4 flex-wrap mt-3">
            {sliders.map(({ label, min, max, value, set, display }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold whitespace-nowrap text-[#b8a8d4]">{label}</span>
                <input type="range" min={min} max={max} value={value} style={{ width:80 }}
                       onChange={e => set(Number(e.target.value))} />
                <span className="text-[11px] font-semibold text-[#b8a8d4] min-w-7 text-right">{display}</span>
              </div>
            ))}
          </div>

          {/* ── Color palette ── */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            {PALETTE.map(c => (
              <div key={c} onClick={()=>setColor(c)}
                   className={['swatch w-5 h-5 rounded-full cursor-pointer shrink-0 border-2 transition-all duration-150',
                     color===c ? 'border-[#6b5b95] shadow-[0_0_0_2px_rgba(107,91,149,.3)]' : 'border-transparent'].join(' ')}
                   style={{ background:c, boxShadow:c==='#ffffff'?'inset 0 0 0 1px #e0d8f0':undefined }} />
            ))}
            <label title="Custom color"
                   className="w-5 h-5 rounded-full border-2 border-dashed border-[#c9b8f0] cursor-pointer shrink-0"
                   style={{ background:'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }}>
              <input type="color" className="hidden" value={color} onChange={e=>setColor(e.target.value)}/>
            </label>
          </div>

          {/* ── Text Popup ── */}
          {textPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(180,140,220,.3)] border border-white/90 p-5 w-[320px] flex flex-col gap-3">

                <p className="text-[13px] font-semibold text-[#6b5b95]">Add Text</p>

                <textarea
                  autoFocus
                  value={pendingText}
                  onChange={e=>setPendingText(e.target.value)}
                  placeholder="Type something..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[rgba(180,140,220,.3)] bg-white/80 px-3 py-2 text-sm text-[#4a3a6a] outline-none focus:border-[#c9b8f0] placeholder:text-[#c9b8f0] transition-colors"
                  style={{ fontFamily:font, fontWeight:isBold?'bold':'normal', fontStyle:isItalic?'italic':'normal', fontSize }}
                />

                {/* Controls: font + size + B + I on one line */}
                <div className="flex items-center gap-1.5 w-full">
                  <select value={font} onChange={e=>setFont(e.target.value)}
                          className="text-[11px] rounded-lg border border-[rgba(180,140,220,.3)] px-1.5 py-1.5 text-[#6b5b95] bg-white/80 outline-none cursor-pointer flex-1 min-w-0">
                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily:f }}>{f.split(' ')[0]}</option>)}
                  </select>
                  <input type="range" min={10} max={72} value={fontSize}
                         onChange={e=>setFontSize(Number(e.target.value))}
                         style={{ width:60 }} className="shrink-0" />
                  <span className="text-[11px] text-[#b8a8d4] font-semibold w-5 text-right shrink-0">{fontSize}</span>
                  <StyleBtn active={isBold}   onClick={()=>setIsBold(b=>!b)}>B</StyleBtn>
                  <StyleBtn active={isItalic} onClick={()=>setIsItalic(i=>!i)} className="italic">I</StyleBtn>
                </div>

                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={()=>{ setTextPopup(false); setPendingText(''); setTool('pen'); }}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#9b8ab4] hover:bg-[rgba(180,140,220,.1)] transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button
                    onClick={()=>{
                      if (pendingText.trim()) {
                        placingText.current = { text:pendingText, font, fontSize, bold:isBold, italic:isItalic };
                      }
                      setTextPopup(false);
                      setPendingText('');
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-linear-to-br from-[#c9b8f0] to-[#f0b8d8] text-white shadow-[0_2px_8px_rgba(180,140,220,.3)] hover:opacity-90 transition-all cursor-pointer">
                    Place on Canvas ›
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Save Modal ── */}
          {showSaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(180,140,220,.3)] border border-white/90 p-5 w-[320px] flex flex-col gap-3">

                <p className="text-[13px] font-semibold text-[#6b5b95]">Save Drawing</p>

                <input
                  autoFocus
                  type="text"
                  value={drawingTitle}
                  onChange={e=>setDrawingTitle(e.target.value)}
                  placeholder={`Doodle - ${today}`}
                  className="w-full rounded-xl border border-[rgba(180,140,220,.3)] bg-white/80 px-3 py-2 text-sm text-[#4a3a6a] outline-none focus:border-[#c9b8f0] placeholder:text-[#c9b8f0] transition-colors"
                />

                {saveError && (
                  <p className="text-[12px] text-red-500 font-medium">{saveError}</p>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={()=>{ setShowSaveModal(false); setSaveError(null); setDrawingTitle(''); }}
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#9b8ab4] hover:bg-[rgba(180,140,220,.1)] transition-all cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                  <button
                    onClick={()=>handleSaveDrawing(drawingTitle || `Doodle - ${today}`)}
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-linear-to-br from-[#c9b8f0] to-[#f0b8d8] text-white shadow-[0_2px_8px_rgba(180,140,220,.3)] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                    {isSaving ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Saving...
                      </>
                    ) : (
                      <>Save Drawing</> 
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}