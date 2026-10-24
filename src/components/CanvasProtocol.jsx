import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import './canvasProtocol.css';

/**
 * Canvas Protocol: actionable data cards can only activate their registered
 * effects after a compatible drop on an action zone. No button-click fallback.
 */
const CanvasContext = createContext(null);

export const CANVAS_ZONES = [
  { id: 'focus', icon: '🎯', title: 'CHOOSE', help: 'Activity card' },
  { id: 'discover', icon: '🔎', title: 'DISCOVER', help: 'Matcher card' },
  { id: 'save', icon: '♡', title: 'SAVE', help: 'Workspace card' },
  { id: 'compare', icon: '⚖', title: 'COMPARE', help: 'Workspace card' },
  { id: 'book', icon: '🎟', title: 'BOOK', help: 'Workspace / pass' },
  { id: 'publish', icon: '✎', title: 'PUBLISH', help: 'Review / check-in' },
  { id: 'remove', icon: '✕', title: 'REMOVE', help: 'Saved / booked card' },
];

export function canvasZoneForLabel(value = '') {
  const label = String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  if (/cancel reservation|delete|remove from|unsave|saved in shortlist/.test(label)) return 'remove';
  if (/post review|submit check|submit report|publish|send review/.test(label)) return 'publish';
  if (/reserve|book(?!ings)|confirm reservation|confirm booking|confirm visit/.test(label)) return 'book';
  if (/compare/.test(label)) return 'compare';
  if (/save|shortlist|favorite/.test(label)) return 'save';
  if (/find my space|find matching|start guided matcher|start match|show matches|search spaces/.test(label)) return 'discover';
  return null;
}

export function CanvasProvider({ children }) {
  const registry = useRef(new Map());
  const [dragInfo, setDragInfo] = useState(null);
  const [hoverZone, setHoverZone] = useState(null);
  const [message, setMessage] = useState('Drag a data card to an Action Zone to perform an action.');
  const [keyboardCardId, setKeyboardCardId] = useState(null);

  const register = useCallback((id, record) => {
    registry.current.set(id, record);
    return () => {
      // Only discard when this instance is still the latest registration.
      if (registry.current.get(id) === record) registry.current.delete(id);
    };
  }, []);

  const activate = useCallback((zoneId, id) => {
    const record = registry.current.get(id);
    if (!record) {
      setMessage('That card is no longer available. Try dragging it again.');
      return;
    }
    const callback = record.actions[zoneId];
    if (typeof callback !== 'function') {
      const available = Object.keys(record.actions).join(', ');
      setMessage(`Wrong Action Zone for ${record.label}. Use: ${available}.`);
      return;
    }
    try {
      callback();
      const zoneLabel = CANVAS_ZONES.find(zone => zone.id === zoneId)?.title || zoneId;
      setMessage(`✓ ${zoneLabel}: ${record.label}`);
    } catch (error) {
      setMessage(`Couldn't complete action: ${error.message}`);
    }
  }, []);

  const onDrop = useCallback((event, zoneId) => {
    event.preventDefault();
    event.stopPropagation();
    const id = event.dataTransfer.getData('application/x-quiet-canvas')
      || event.dataTransfer.getData('text/plain')
      || keyboardCardId;
    if (id) activate(zoneId, id);
    setDragInfo(null);
    setHoverZone(null);
    setKeyboardCardId(null);
  }, [activate, keyboardCardId]);

  const value = useMemo(() => ({
    register,
    setDragInfo,
    setMessage,
    keyboardCardId,
    setKeyboardCardId,
    activate,
    setHoverZone,
  }), [register, keyboardCardId, activate]);

  return (
    <CanvasContext.Provider value={value}>
      {children}
      <aside className="canvas-dock" aria-label="Canvas Protocol Action Zones">
        <div className="canvas-dock-head">
          <strong>🎨 THE CANVAS PROTOCOL</strong>
          <span>Drag → Drop → Done</span>
        </div>
        <div className="canvas-dock-zones">
          {CANVAS_ZONES.map(zone => {
            const compatible = dragInfo?.actions.includes(zone.id);
            return (
              <div
                key={zone.id}
                data-canvas-zone={zone.id}
                tabIndex={0}
                role="region"
                aria-label={`Drop ${zone.help} here to ${zone.title.toLowerCase()}`}
                className={`canvas-zone ${hoverZone === zone.id ? 'canvas-zone-over' : ''} ${dragInfo && !compatible ? 'canvas-zone-dim' : ''} ${compatible ? 'canvas-zone-ready' : ''}`}
                onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setHoverZone(zone.id); }}
                onDragLeave={() => setHoverZone(null)}
                onDrop={event => onDrop(event, zone.id)}
                onKeyDown={event => {
                  if ((event.key === 'Enter' || event.key === ' ') && keyboardCardId) {
                    event.preventDefault();
                    activate(zone.id, keyboardCardId);
                    setKeyboardCardId(null);
                  }
                }}
              >
                <span className="canvas-zone-icon" aria-hidden="true">{zone.icon}</span>
                <span className="canvas-zone-name">{zone.title}</span>
              </div>
            );
          })}
        </div>
        <div className="canvas-dock-status" role="status" aria-live="polite">{message}</div>
      </aside>
    </CanvasContext.Provider>
  );
}

function useCanvasRegistration(label, actions) {
  const context = useContext(CanvasContext);
  const reactId = useId();
  const id = `tqp-${reactId.replace(/[^a-zA-Z0-9-]/g, '')}`;
  const actionRef = useRef(actions);
  actionRef.current = actions;
  const record = useMemo(() => ({
    label,
    get actions() { return actionRef.current; },
  }), [label]);
  useEffect(() => context?.register(id, record), [context?.register, id, record]);
  return { context, id };
}


// Native HTML drag-and-drop works on desktop. This pointer bridge adds actual
// drag-to-zone gestures on touchscreens rather than requiring any tap buttons.
function touchDragStart(event, context, id, label, actions, disabled = false) {
  if (disabled || event.pointerType === 'mouse' || !context) return;
  const startX = event.clientX;
  const startY = event.clientY;
  let moved = false;
  const allowed = Object.keys(actions);
  const findZone = (x, y) => document.elementFromPoint(x, y)?.closest('[data-canvas-zone]')?.dataset.canvasZone;
  const onMove = moveEvent => {
    const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
    if (distance < 12 && !moved) return;
    moved = true;
    moveEvent.preventDefault();
    context.setDragInfo({ label, actions: allowed });
    context.setHoverZone(findZone(moveEvent.clientX, moveEvent.clientY) || null);
  };
  const onEnd = endEvent => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onEnd);
    document.removeEventListener('pointercancel', onCancel);
    if (moved) {
      const zone = findZone(endEvent.clientX, endEvent.clientY);
      if (zone) context.activate(zone, id);
    }
    context.setHoverZone(null);
    context.setDragInfo(null);
  };
  const onCancel = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onEnd);
    document.removeEventListener('pointercancel', onCancel);
    context.setHoverZone(null);
    context.setDragInfo(null);
  };
  document.addEventListener('pointermove', onMove, { passive: false });
  document.addEventListener('pointerup', onEnd);
  document.addEventListener('pointercancel', onCancel);
}

export function CanvasAction({
  children,
  label,
  actionType,
  onAction,
  className = '',
  disabled = false,
  type,
  title,
  ...props
}) {
  const tokenRef = useRef(null);
  const text = label || title || (typeof children === 'string' ? children : 'Action card');
  const actions = { [actionType]: () => {
    if (type === 'submit' && !onAction) {
      tokenRef.current?.closest('form')?.requestSubmit();
    } else {
      onAction?.();
    }
  }};
  const { context, id } = useCanvasRegistration(text, actions);
  const zoneTitle = CANVAS_ZONES.find(z => z.id === actionType)?.title || actionType;

  return (
    <div
      {...props}
      ref={tokenRef}
      className={`canvas-action canvas-draggable ${className} ${disabled ? 'canvas-disabled' : ''}`}
      role="listitem"
      tabIndex={disabled ? -1 : 0}
      draggable={!disabled}
      aria-label={`${text}. Drag to ${zoneTitle} Action Zone`}
      title={`Drag to ${zoneTitle} Action Zone`}
      onPointerDown={event => touchDragStart(event, context, id, text, actions, disabled)}
      onDragStart={event => {
        if (disabled) { event.preventDefault(); return; }
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-quiet-canvas', id);
        event.dataTransfer.setData('text/plain', id);
        context?.setDragInfo({ label: text, actions: [actionType] });
        context?.setMessage(`Dragging ${text}. Drop it in ${zoneTitle}.`);
      }}
      onDragEnd={() => context?.setDragInfo(null)}
      onKeyDown={event => {
        if ((event.key === ' ' || event.key === 'Enter') && !disabled) {
          event.preventDefault();
          context?.setKeyboardCardId(id);
          context?.setMessage(`Picked up ${text}. Focus the ${zoneTitle} zone and press Enter to drop.`);
        }
      }}
    >
      <span className="canvas-action-label">{children}</span>
      <span className="canvas-drag-hint">⠿ drag to {zoneTitle.toLowerCase()}</span>
    </div>
  );
}

export function CanvasPlaceToken({ place, onSave, onRemove, onCompare, onBook, className = '' }) {
  const actions = {};
  if (onSave) actions.save = onSave;
  if (onRemove) actions.remove = onRemove;
  if (onCompare) actions.compare = onCompare;
  if (onBook) actions.book = onBook;
  const { context, id } = useCanvasRegistration(place.name, actions);
  const allowed = Object.keys(actions);
  return (
    <div
      className={`canvas-place-card canvas-draggable ${className}`}
      draggable
      tabIndex={0}
      role="listitem"
      aria-label={`Drag ${place.name} to an Action Zone: ${allowed.join(', ')}`}
      onPointerDown={event => touchDragStart(event, context, id, place.name, actions)}
      onDragStart={event => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-quiet-canvas', id);
        event.dataTransfer.setData('text/plain', id);
        context?.setDragInfo({ label: place.name, actions: allowed });
        context?.setMessage(`Dragging ${place.name}. Drop in ${allowed.join(', ')}.`);
      }}
      onDragEnd={() => context?.setDragInfo(null)}
      onKeyDown={event => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          context?.setKeyboardCardId(id);
          context?.setMessage(`Picked up ${place.name}. Focus an Action Zone and press Enter to drop.`);
        }
      }}
    >
      <span className="canvas-place-grip" aria-hidden="true">⠿</span>
      <div>
        <strong>{place.name}</strong>
        <small>{place.area} · {place.cost === 0 ? 'Free' : place.cost == null ? 'Price unverified' : `₹${place.cost}/visit`}</small>
      </div>
      <span className="canvas-place-tag">DRAG CARD</span>
    </div>
  );
}
