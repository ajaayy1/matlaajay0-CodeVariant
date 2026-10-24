import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import './canvasProtocol.css';

/**
 * Canvas Protocol: actionable cards can only run their registered effects
 * after a compatible drop on an Action Zone. There is no click fallback.
 *
 * The dock is contextual and magnetic: while a card is held, zones that can
 * accept it grow and lean toward the pointer; zones that can't, shrink away.
 * Works with mouse (native DnD), touch/pen (pointer bridge) and keyboard
 * (pick up with Enter/Space, arrow between zones, Enter to drop, Esc to cancel).
 */
const CanvasContext = createContext(null);
const ID_PREFIX = 'tqp-';

export const CANVAS_ZONES = [
  { id: 'focus', icon: '🎯', title: 'Choose', verb: 'choose', help: 'Activity card' },
  { id: 'discover', icon: '🔎', title: 'Discover', verb: 'search with', help: 'Search or matcher card' },
  { id: 'save', icon: '♡', title: 'Save', verb: 'save', help: 'Workspace card' },
  { id: 'compare', icon: '⚖', title: 'Compare', verb: 'compare', help: 'Workspace card' },
  { id: 'book', icon: '🎟', title: 'Book', verb: 'book', help: 'Workspace or pass card' },
  { id: 'publish', icon: '✎', title: 'Publish', verb: 'publish', help: 'Review or check-in card' },
  { id: 'remove', icon: '✕', title: 'Remove', verb: 'remove', help: 'Saved or booked card' },
];
const zoneById = id => CANVAS_ZONES.find(zone => zone.id === id);
const zoneTitles = ids => ids.map(id => zoneById(id)?.title || id).join(' or ');

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

const reduceMotion = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function CanvasProvider({ children }) {
  const registry = useRef(new Map());
  const zoneRefs = useRef({});
  const ghostRef = useRef(null);
  const previewRef = useRef(null);
  const landedTimer = useRef(null);
  const [dragInfo, setDragInfo] = useState(null);
  const [hoverZone, setHoverZone] = useState(null);
  const [status, setStatus] = useState({ text: 'Drag any card with a ⠿ grip onto a zone to act on it.', tone: 'idle' });
  const [keyboardCardId, setKeyboardCardId] = useState(null);
  const [landed, setLanded] = useState(null);

  const setMessage = useCallback((text, tone = 'info') => setStatus({ text, tone }), []);

  const register = useCallback((id, record) => {
    registry.current.set(id, record);
    return () => {
      if (registry.current.get(id) === record) registry.current.delete(id);
    };
  }, []);

  const flash = useCallback((zoneId, ok) => {
    clearTimeout(landedTimer.current);
    setLanded({ zone: zoneId, ok, key: Date.now() });
    landedTimer.current = setTimeout(() => setLanded(null), ok ? 900 : 650);
    if (ok) navigator.vibrate?.(18); else navigator.vibrate?.([30, 40, 30]);
  }, []);

  // Magnetic pull: compatible zones scale/lean toward the pointer by proximity.
  const magnet = useCallback((x, y, allowed) => {
    const still = reduceMotion();
    Object.entries(zoneRefs.current).forEach(([zoneId, el]) => {
      if (!el) return;
      if (x == null || !allowed?.includes(zoneId)) {
        el.style.setProperty('--pull', '0');
        el.style.setProperty('--lean-x', '0px');
        el.style.setProperty('--lean-y', '0px');
        return;
      }
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(x - cx, y - cy);
      const pull = Math.max(0, Math.min(1, 1 - distance / 340));
      el.style.setProperty('--pull', pull.toFixed(3));
      el.style.setProperty('--lean-x', still ? '0px' : `${((x - cx) * pull * 0.08).toFixed(1)}px`);
      el.style.setProperty('--lean-y', still ? '0px' : `${Math.max(-10, (y - cy) * pull * 0.08).toFixed(1)}px`);
    });
  }, []);

  const endDrag = useCallback(() => {
    setDragInfo(null);
    setHoverZone(null);
    magnet(null);
    if (ghostRef.current) ghostRef.current.dataset.on = 'false';
  }, [magnet]);

  const activate = useCallback((zoneId, id) => {
    const record = registry.current.get(id);
    if (!record) {
      setMessage('That card is no longer on screen. Drag it again from the page.', 'error');
      return false;
    }
    const callback = record.actions[zoneId];
    const zoneTitle = zoneById(zoneId)?.title || zoneId;
    if (typeof callback !== 'function') {
      flash(zoneId, false);
      setMessage(`Nothing happened — “${record.label}” can’t go in ${zoneTitle}. Drop it on ${zoneTitles(Object.keys(record.actions))}.`, 'error');
      return false;
    }
    try {
      callback();
      flash(zoneId, true);
      setMessage(`${zoneTitle}: ${record.label}`, 'success');
      return true;
    } catch (error) {
      flash(zoneId, false);
      setMessage(`${zoneTitle} didn’t complete: ${error.message}`, 'error');
      return false;
    }
  }, [flash, setMessage]);

  // Start of any drag (mouse, touch or keyboard). Shared so every card behaves alike.
  const beginDrag = useCallback((id, label, allowed, mode) => {
    setDragInfo({ id, label, actions: allowed, mode });
    setMessage(`Holding “${label}”. Drop it on ${zoneTitles(allowed)}.`, 'info');
  }, [setMessage]);

  const nativePreview = useCallback((event, label, allowed) => {
    const el = previewRef.current;
    if (!el || !event.dataTransfer?.setDragImage) return;
    el.querySelector('strong').textContent = label;
    el.querySelector('small').textContent = `→ ${zoneTitles(allowed)}`;
    event.dataTransfer.setDragImage(el, 18, 18);
  }, []);

  const moveGhost = useCallback((x, y, label, allowed) => {
    const el = ghostRef.current;
    if (!el) return;
    if (label) {
      el.querySelector('strong').textContent = label;
      el.querySelector('small').textContent = `→ ${zoneTitles(allowed)}`;
    }
    el.dataset.on = 'true';
    el.style.transform = `translate(${x + 14}px, ${y - 46}px)`;
  }, []);

  // While a native drag is active, follow the pointer for the magnet effect.
  useEffect(() => {
    if (!dragInfo || dragInfo.mode !== 'native') return undefined;
    const onOver = event => magnet(event.clientX, event.clientY, dragInfo.actions);
    document.addEventListener('dragover', onOver);
    return () => document.removeEventListener('dragover', onOver);
  }, [dragInfo, magnet]);

  // Keyboard pickup: jump focus to the first compatible zone.
  useEffect(() => {
    if (!dragInfo || dragInfo.mode !== 'keyboard') return;
    const first = dragInfo.actions.map(id => zoneRefs.current[id]).find(Boolean);
    requestAnimationFrame(() => first?.focus());
  }, [dragInfo]);

  const cancelKeyboard = useCallback(() => {
    setKeyboardCardId(null);
    endDrag();
    setMessage('Put the card back. Nothing changed.', 'idle');
  }, [endDrag, setMessage]);

  const onDrop = useCallback((event, zoneId) => {
    event.preventDefault();
    event.stopPropagation();
    const raw = event.dataTransfer.getData('application/x-quiet-canvas')
      || event.dataTransfer.getData('text/plain');
    // Only cards from this app can trigger actions; dropped text, links or images are ignored.
    if (raw && raw.startsWith(ID_PREFIX)) activate(zoneId, raw);
    else setMessage('Only cards with a ⠿ grip can be dropped here.', 'error');
    endDrag();
  }, [activate, endDrag, setMessage]);

  const value = useMemo(() => ({
    register, setDragInfo, setMessage, keyboardCardId, setKeyboardCardId,
    activate, setHoverZone, beginDrag, endDrag, magnet, moveGhost, nativePreview, cancelKeyboard,
  }), [register, setMessage, keyboardCardId, activate, beginDrag, endDrag, magnet, moveGhost, nativePreview, cancelKeyboard]);

  const holding = Boolean(dragInfo);

  return (
    <CanvasContext.Provider value={value}>
      {children}
      <div ref={previewRef} className="canvas-preview" aria-hidden="true"><span>⠿</span><div><strong /><small /></div></div>
      <div ref={ghostRef} className="canvas-ghost" data-on="false" aria-hidden="true"><span>⠿</span><div><strong /><small /></div></div>
      <aside className={`canvas-dock ${holding ? 'canvas-dock-holding' : ''}`} aria-label="Action Zones">
        <div className="canvas-dock-head">
          <strong>Action Zones</strong>
          <span className={`canvas-dock-status canvas-status-${status.tone}`} role="status" aria-live="polite">{status.text}</span>
        </div>
        <div className="canvas-dock-zones">
          {CANVAS_ZONES.map((zone, index) => {
            const compatible = dragInfo?.actions.includes(zone.id);
            const over = hoverZone === zone.id;
            const landedHere = landed?.zone === zone.id;
            const cls = [
              'canvas-zone',
              holding && compatible ? 'canvas-zone-ready' : '',
              holding && !compatible ? 'canvas-zone-dim' : '',
              over && compatible ? 'canvas-zone-over' : '',
              over && holding && !compatible ? 'canvas-zone-reject' : '',
              landedHere && landed.ok ? 'canvas-zone-landed' : '',
              landedHere && !landed.ok ? 'canvas-zone-shake' : '',
            ].join(' ');
            return (
              <div
                key={zone.id + (landedHere ? landed.key : '')}
                ref={el => { zoneRefs.current[zone.id] = el; }}
                data-canvas-zone={zone.id}
                tabIndex={keyboardCardId ? 0 : -1}
                role="button"
                aria-disabled={!keyboardCardId}
                aria-label={`${zone.title} zone. Accepts: ${zone.help}.${keyboardCardId ? ' Press Enter to drop the held card here.' : ''}`}
                className={cls}
                onDragEnter={event => { event.preventDefault(); setHoverZone(zone.id); }}
                onDragOver={event => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  if (hoverZone !== zone.id) setHoverZone(zone.id);
                }}
                onDragLeave={event => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setHoverZone(null);
                }}
                onDrop={event => onDrop(event, zone.id)}
                onKeyDown={event => {
                  if (!keyboardCardId) return;
                  const zones = Object.values(zoneRefs.current).filter(Boolean);
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate(zone.id, keyboardCardId);
                    setKeyboardCardId(null);
                    endDrag();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    cancelKeyboard();
                  } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    const step = event.key === 'ArrowRight' ? 1 : -1;
                    zones[(index + step + zones.length) % zones.length]?.focus();
                  }
                }}
                onFocus={() => keyboardCardId && setHoverZone(zone.id)}
                onBlur={() => setHoverZone(current => (current === zone.id ? null : current))}
              >
                <span className="canvas-zone-icon" aria-hidden="true">{landedHere && landed.ok ? '✓' : zone.icon}</span>
                <span className="canvas-zone-name">{zone.title}</span>
                <span className="canvas-zone-hint" aria-hidden="true">
                  {holding && compatible ? `Drop to ${zone.verb}` : zone.help}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
    </CanvasContext.Provider>
  );
}

function useCanvasRegistration(label, actions) {
  const context = useContext(CanvasContext);
  const reactId = useId();
  const id = `${ID_PREFIX}${reactId.replace(/[^a-zA-Z0-9-]/g, '')}`;
  const actionRef = useRef(actions);
  actionRef.current = actions;
  const record = useMemo(() => ({
    label,
    get actions() { return actionRef.current; },
  }), [label]);
  useEffect(() => context?.register(id, record), [context?.register, id, record]);
  return { context, id };
}

// Touch / pen bridge: real drag-to-zone gestures, with a ghost under the finger.
function touchDragStart(event, context, id, label, allowed, disabled = false) {
  if (disabled || event.pointerType === 'mouse' || !context) return;
  const startX = event.clientX;
  const startY = event.clientY;
  let moved = false;
  const findZone = (x, y) => document.elementFromPoint(x, y)?.closest('[data-canvas-zone]')?.dataset.canvasZone;
  const cleanup = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onEnd);
    document.removeEventListener('pointercancel', onCancel);
  };
  const onMove = moveEvent => {
    const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
    if (distance < 10 && !moved) return;
    moveEvent.preventDefault();
    if (!moved) context.beginDrag(id, label, allowed, 'touch');
    context.moveGhost(moveEvent.clientX, moveEvent.clientY, moved ? null : label, allowed);
    moved = true;
    context.magnet(moveEvent.clientX, moveEvent.clientY, allowed);
    context.setHoverZone(findZone(moveEvent.clientX, moveEvent.clientY) || null);
  };
  const onEnd = endEvent => {
    cleanup();
    if (moved) {
      const zone = findZone(endEvent.clientX, endEvent.clientY);
      if (zone) context.activate(zone, id);
      else context.setMessage('Dropped outside the zones. Nothing changed.', 'idle');
    }
    context.endDrag();
  };
  const onCancel = () => { cleanup(); context.endDrag(); };
  document.addEventListener('pointermove', onMove, { passive: false });
  document.addEventListener('pointerup', onEnd);
  document.addEventListener('pointercancel', onCancel);
}

function useDraggable({ label, actions, disabled = false, stopPropagation = false }) {
  const { context, id } = useCanvasRegistration(label, actions);
  const allowed = Object.keys(actions);
  const held = context?.keyboardCardId === id;
  const handlers = {
    draggable: !disabled,
    tabIndex: disabled ? -1 : 0,
    'aria-pressed': held,
    'data-held': held ? 'true' : undefined,
    onPointerDown: event => touchDragStart(event, context, id, label, allowed, disabled),
    onDragStart: event => {
      if (disabled) { event.preventDefault(); return; }
      if (stopPropagation) event.stopPropagation();
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-quiet-canvas', id);
      event.dataTransfer.setData('text/plain', id);
      context?.nativePreview(event, label, allowed);
      context?.beginDrag(id, label, allowed, 'native');
    },
    onDragEnd: event => {
      if (event.dataTransfer?.dropEffect === 'none') context?.setMessage('Dropped outside the zones. Nothing changed.', 'idle');
      context?.endDrag();
    },
    onKeyDown: event => {
      if (disabled || !context) return;
      if (event.key === 'Escape' && held) { event.preventDefault(); context.cancelKeyboard(); return; }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        context.setKeyboardCardId(id);
        context.beginDrag(id, label, allowed, 'keyboard');
        context.setMessage(`Picked up “${label}”. Arrow keys move between zones, Enter drops, Esc cancels.`, 'info');
      }
    },
  };
  return { handlers, allowed };
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
      const form = tokenRef.current?.closest('form');
      if (form && !form.checkValidity()) {
        form.reportValidity();
        throw new Error('fill in the required fields first');
      }
      form?.requestSubmit();
    } else {
      onAction?.();
    }
  }};
  const { handlers } = useDraggable({ label: text, actions, disabled });
  const zoneTitle = zoneById(actionType)?.title || actionType;

  return (
    <div
      {...props}
      {...handlers}
      ref={tokenRef}
      className={`canvas-action canvas-draggable ${className} ${disabled ? 'canvas-disabled' : ''}`}
      role="button"
      aria-label={`${text}. Drag to the ${zoneTitle} zone, or press Enter to pick up`}
      title={`Drag to ${zoneTitle}`}
    >
      <span className="canvas-action-label">{children}</span>
      <span className="canvas-drag-hint" aria-hidden="true">⠿ drag to {zoneTitle.toLowerCase()}</span>
    </div>
  );
}

export function CanvasPlaceToken({ place, onSave, onRemove, onCompare, onBook, className = '' }) {
  const actions = {};
  if (onSave) actions.save = onSave;
  if (onRemove) actions.remove = onRemove;
  if (onCompare) actions.compare = onCompare;
  if (onBook) actions.book = onBook;
  const { handlers, allowed } = useDraggable({ label: place.name, actions, stopPropagation: true });
  return (
    <div
      {...handlers}
      className={`canvas-place-card canvas-draggable ${className}`}
      role="button"
      aria-label={`${place.name}. Drag to ${zoneTitles(allowed)}, or press Enter to pick up`}
    >
      <span className="canvas-place-grip" aria-hidden="true">⠿</span>
      <div>
        <strong>{place.name}</strong>
        <small>{place.area} · {place.cost === 0 ? 'Free' : place.cost == null ? 'Price unverified' : `₹${place.cost}/visit`}</small>
      </div>
      <span className="canvas-place-tag" aria-hidden="true">
        {allowed.map(id => <i key={id} title={zoneById(id)?.title}>{zoneById(id)?.icon}</i>)}
      </span>
    </div>
  );
}
