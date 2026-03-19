import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const BrushIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z"/>
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
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const PALETTE = [
  '#1a1a2e','#6b5b95','#e8a0bf','#f7c5d5','#fddde6',
  '#c9b8f0','#a8d8ea','#87ceeb','#b5ead7','#ffd700',
  '#ffb347','#ff6b6b','#ffffff','#d4d4d4','#8b7355',
];
const FONTS = ['Georgia', 'Palatino', 'Courier New', 'Comic Sans MS', 'Arial', 'Times New Roman'];

// Minimal injected CSS — only for range input thumb which Tailwind cannot target
const thumbCSS = `
  input[type=range]{-webkit-appearance:none;height:4px;background:linear-gradient(to right,#c9b8f0,#f0b8d8);border-radius:4px;outline:none;cursor:pointer;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #c9b8f0;box-shadow:0 1px 4px rgba(180,140,220,.3);}
  .swatch:hover{transform:scale(1.25);}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hexToRgb = (hex) => ({
  r: parseInt(hex.slice(1,3),16),
  g: parseInt(hex.slice(3,5),16),
  b: parseInt(hex.slice(5,7),16),
});

// ─── ToolBtn ──────────────────────────────────────────────────────────────────
const ToolBtn = ({ active, disabled, onClick, title, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={[
      'w-[34px] h-[34px] rounded-[9px] border-0 flex items-center justify-center',
      'text-[13px] font-bold transition-all duration-150 cursor-pointer select-none',
      'disabled:opacity-30 disabled:cursor-not-allowed',
      active
        ? 'bg-gradient-to-br from-[#c9b8f0] to-[#f0b8d8] text-white shadow-[0_2px_8px_rgba(180,140,220,.3)]'
        : 'bg-transparent text-[#9b8ab4] hover:bg-[rgba(180,140,220,.12)] hover:text-[#6b5b95]',
      className,
    ].filter(Boolean).join(' ')}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[rgba(180,140,220,.2)] mx-1 shrink-0" />;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SketchbookCanvas() {
  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const [tool,       setTool]       = useState('pen');
  const [color,      setColor]      = useState('#6b5b95');
  const [thickness,  setThickness]  = useState(4);
  const [opacity,    setOpacity]    = useState(100);
  const [isBold,     setIsBold]     = useState(false);
  const [isItalic,   setIsItalic]   = useState(false);
  const [font,       setFont]       = useState('Georgia');
  const [fontSize,   setFontSize]   = useState(20);
  const [textInput,  setTextInput]  = useState(null);
  const [canUndo,    setCanUndo]    = useState(false);
  const [canRedo,    setCanRedo]    = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 660, h: 450 });

  const historyRef   = useRef([]);
  const redoStackRef = useRef([]);
  const isDrawing    = useRef(false);
  const lastPos      = useRef(null);

  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth - 48, 720);
      setCanvasSize({ w, h: Math.round(w * 0.65) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prevDataUrl = historyRef.current.at(-1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(prevDataUrl) {
        const img = new Image();
        img.src = prevDataUrl;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    } else { 
    saveSnapshot();
    }
  }, [canvasSize]);

  // ─── History ───────────────────────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL());
    redoStackRef.current = [];
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(false);
  }, []);

  const restoreSnapshot = (dataUrl) => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const img    = new Image();
    img.src      = dataUrl;
    img.onload   = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
  };

  const undo = () => {
    if (historyRef.current.length <= 1) return;
    redoStackRef.current.push(historyRef.current.pop());
    restoreSnapshot(historyRef.current.at(-1));
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(true);
  };

  const redo = () => {
    if (!redoStackRef.current.length) return;
    const next = redoStackRef.current.pop();
    historyRef.current.push(next);
    restoreSnapshot(next);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current   = [];
    redoStackRef.current = [];
    saveSnapshot();
    setCanUndo(false);
    setCanRedo(false);
  };

  // ─── Drawing ───────────────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const applyStrokeStyle = (ctx) => {
    const alpha = opacity / 100;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth   = thickness * 3;
    } else {
      const { r, g, b } = hexToRgb(color);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(${r},${g},${b},${tool==='brush' ? alpha*0.4 : alpha})`;
      ctx.lineWidth   = tool === 'brush' ? thickness * 3 : thickness;
    }
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
  };

  const startDraw = (e) => {
    if (tool === 'text') {
      const pos = getPos(e, canvasRef.current);
      setTextInput({ x: pos.x, y: pos.y, value: '' });
      return;
    }
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    lastPos.current = pos;
    applyStrokeStyle(ctx);
    if (tool !== 'eraser') {
      const { r, g, b } = hexToRgb(color);
      ctx.fillStyle = `rgba(${r},${g},${b},${opacity/100})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    applyStrokeStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    canvasRef.current.getContext('2d').globalCompositeOperation = 'source-over';
    saveSnapshot();
  };

  // ─── Text ──────────────────────────────────────────────────────────────────
  const commitText = () => {
    if (!textInput?.value.trim()) { setTextInput(null); return; }
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const { r, g, b } = hexToRgb(color);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(${r},${g},${b},${opacity/100})`;
    ctx.font      = `${isItalic?'italic ':''} ${isBold?'bold ':''} ${fontSize}px ${font}`;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    setTextInput(null);
    saveSnapshot();
  };

  // ─── Image import ──────────────────────────────────────────────────────────
  const handleImageImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img  = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');
        const scale  = Math.min(canvas.width/img.width, canvas.height/img.height, 1);
        const [w, h] = [img.width*scale, img.height*scale];
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, (canvas.width-w)/2, (canvas.height-h)/2, w, h);
        saveSnapshot();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getCursor = () => tool==='eraser' ? 'cell' : tool==='text' ? 'text' : 'crosshair';

  // ─── Sliders config ────────────────────────────────────────────────────────
  const sliders = [
    { label:'Size',      min:1,  max:40,  value:thickness, set:setThickness, display:String(thickness) },
    { label:'Opacity',   min:5,  max:100, value:opacity,   set:setOpacity,   display:`${opacity}%` },
    ...(tool==='text' ? [{ label:'Font size', min:10, max:72, value:fontSize, set:setFontSize, display:String(fontSize) }] : []),
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{thumbCSS}</style>

      {/* Page */}
      <div className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br rounded-2xl from-[#fce4f3] via-[#ede4ff] to-[#daf0ff]">
        {/* Card */}
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
          <div className="flex items-center gap-1 flex-wrap
                          bg-white/80 rounded-2xl px-3 py-2 mb-2
                          shadow-[0_2px_12px_rgba(180,140,220,.10)]">

            <ToolBtn active={tool==='pen'}    onClick={()=>setTool('pen')}    title="Pen">    <PenIcon/></ToolBtn>
            <ToolBtn active={tool==='brush'}  onClick={()=>setTool('brush')}  title="Brush">  <BrushIcon/></ToolBtn>
            <ToolBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} title="Eraser"> <EraserIcon/></ToolBtn>
            <ToolBtn active={tool==='text'}   onClick={()=>setTool('text')}   title="Text">   <TextIcon/></ToolBtn>

            <Divider/>

            <ToolBtn active={isBold}   onClick={()=>setIsBold(b=>!b)}   title="Bold"   className="!font-bold !text-sm">B</ToolBtn>
            <ToolBtn active={isItalic} onClick={()=>setIsItalic(i=>!i)} title="Italic" className="!italic !text-sm">I</ToolBtn>

            <Divider/>

            <ToolBtn onClick={undo}        disabled={!canUndo} title="Undo"><UndoIcon/></ToolBtn>
            <ToolBtn onClick={redo}        disabled={!canRedo} title="Redo"><RedoIcon/></ToolBtn>
            <ToolBtn onClick={clearCanvas}                     title="Clear all"><TrashIcon/></ToolBtn>

            <Divider/>

            <ToolBtn onClick={()=>fileInputRef.current.click()} title="Import image"><ImageIcon/></ToolBtn>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageImport}/>

            <Divider/>

            {/* Active color dot */}
            <div
              className="w-[26px] h-[26px] rounded-full shrink-0 border-[2.5px] border-white/90 shadow-[0_2px_8px_rgba(0,0,0,.15)]"
              style={{ background: color }}
            />
          </div>

          {/* Date + Title */}
          <div className="mb-2">
            <p className="text-[11px] font-semibold tracking-wide text-[#b8a8d4]">{today}</p>
            <p className="font-serif text-[22px] font-semibold tracking-tight text-[#4a3a6a]">Doodle</p>
          </div>

          {/* ── Canvas ── */}
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden bg-white
                       shadow-[inset_0_0_0_1px_rgba(180,140,220,.15),0_4px_20px_rgba(180,140,220,.10)]"
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.w * 2}
              height={canvasSize.h * 2}
              style={{ cursor: getCursor(), width: '100%', height: canvasSize.h, display: 'block', touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />

            {/* Text input overlay */}
            {textInput && (
              <textarea
                autoFocus
                value={textInput.value}
                className="absolute bg-transparent border-0 outline-none resize-none min-w-[120px] min-h-[32px] z-10 caret-[#6b5b95] p-0"
                style={{
                  left:    textInput.x / 2,
                  top:     textInput.y / 2,
                  font:    `${isItalic?'italic ':''} ${isBold?'bold ':''} ${fontSize}px ${font}`,
                  color:   color,
                  opacity: opacity / 100,
                }}
                onChange={e => setTextInput(t => ({...t, value: e.target.value}))}
                onKeyDown={e => {
                  if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                  if (e.key==='Escape') setTextInput(null);
                }}
                onBlur={commitText}
              />
            )}
          </div>

          {/* ── Sliders ── */}
          <div className="flex items-center gap-4 flex-wrap mt-3">
            {sliders.map(({ label, min, max, value, set, display }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold whitespace-nowrap text-[#b8a8d4]">{label}</span>
                <input
                  type="range" min={min} max={max} value={value}
                  style={{ width: label==='Font size' ? 70 : 80 }}
                  onChange={e => set(Number(e.target.value))}
                />
                <span className="text-[11px] font-semibold text-[#b8a8d4] min-w-[28px] text-right">{display}</span>
              </div>
            ))}
          </div>

          {/* ── Font picker (text mode) ── */}
          {tool === 'text' && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <span className="text-[11px] font-semibold text-[#b8a8d4]">Font</span>
              {FONTS.map(f => (
                <button
                  key={f}
                  onClick={() => setFont(f)}
                  className={[
                    'px-2.5 h-[34px] rounded-[9px] border-0 text-xs cursor-pointer transition-all duration-150',
                    font===f
                      ? 'bg-gradient-to-br from-[#c9b8f0] to-[#f0b8d8] text-white shadow-[0_2px_8px_rgba(180,140,220,.3)]'
                      : 'bg-transparent text-[#9b8ab4] hover:bg-[rgba(180,140,220,.12)] hover:text-[#6b5b95]',
                  ].join(' ')}
                  style={{ fontFamily: f }}
                >
                  {f.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* ── Color palette ── */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            {PALETTE.map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                className={[
                  'swatch w-5 h-5 rounded-full cursor-pointer shrink-0 border-2 transition-all duration-150',
                  color===c ? 'border-[#6b5b95] shadow-[0_0_0_2px_rgba(107,91,149,.3)]' : 'border-transparent',
                ].join(' ')}
                style={{
                  background: c,
                  boxShadow: c==='#ffffff' ? 'inset 0 0 0 1px #e0d8f0' : undefined,
                }}
              />
            ))}

            {/* Custom colour */}
            <label
              title="Custom color"
              className="w-5 h-5 rounded-full border-2 border-dashed border-[#c9b8f0] cursor-pointer shrink-0"
              style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }}
            >
              <input type="color" className="hidden" value={color} onChange={e => setColor(e.target.value)}/>
            </label>
          </div>

        </div>
      </div>
    </>
  );
}