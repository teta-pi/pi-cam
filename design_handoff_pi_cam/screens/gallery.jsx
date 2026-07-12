// Gallery Screen — S-06. Grid, filters, selection mode.

function GalleryScreen({ onOpenPhoto, onOpenCamera }) {
  const t = useTheme();
  const [filter, setFilter] = React.useState('all');
  const [selected, setSelected] = React.useState(new Set());
  const selecting = selected.size > 0;
  const items = PHOTOS.filter(p => filter === 'all' || (filter === 'device' && p.status === 'device') || (filter === 'ca' && p.status === 'ca'));

  const toggle = (id) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.text, display: 'flex', flexDirection: 'column', fontFamily: FONT_STACK }}>
      {/* Header */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: `0.5px solid ${t.border}`, background: t.bg,
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Pi CAM Gallery</div>
        <button onClick={onOpenCamera} style={{
          background: t.lavender, border: 'none', width: 36, height: 36, borderRadius: 18,
          display: 'grid', placeItems: 'center', cursor: 'pointer', color: t.purple,
        }}>
          <IconPlus size={20} color={t.purple} stroke={2.4}/>
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflow: 'auto' }}>
        {[
          { id: 'all', label: `All · ${PHOTOS.length}` },
          { id: 'device', label: 'Device', dot: '#F5A623' },
          { id: 'ca', label: 'Pi Verified', dot: '#27AE60' },
        ].map((f) => {
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              height: 32, padding: '0 14px', borderRadius: 9999, border: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: active ? t.purple : t.lavender,
              color: active ? '#fff' : t.purple,
              fontFamily: FONT_STACK, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              flexShrink: 0,
            }}>
              {f.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.dot }}/>}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {items.map((p) => {
            const isSel = selected.has(p.id);
            return (
              <button key={p.id}
                onContextMenu={(e) => { e.preventDefault(); toggle(p.id); }}
                onClick={() => selecting ? toggle(p.id) : onOpenPhoto?.(p)}
                style={{
                  position: 'relative', aspectRatio: '1', padding: 0, border: 'none',
                  background: 'transparent', cursor: 'pointer', overflow: 'hidden',
                }}>
                <FauxPhoto photo={p} style={{ width: '100%', height: '100%' }}/>
                {/* status pip */}
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 22, height: 22, borderRadius: '50%',
                  background: p.status === 'ca' ? '#27AE60' : '#F5A623',
                  display: 'grid', placeItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}>
                  {p.status === 'ca'
                    ? <IconShieldCheck size={12} color="#fff" stroke={2.6}/>
                    : <IconShield size={12} color="#fff" stroke={2.6}/>}
                </div>
                {/* selection state */}
                {selecting && (
                  <div style={{
                    position: 'absolute', bottom: 6, right: 6, width: 22, height: 22,
                    borderRadius: '50%', background: isSel ? t.purple : 'rgba(255,255,255,0.95)',
                    border: isSel ? 'none' : `1.5px solid rgba(0,0,0,0.15)`,
                    display: 'grid', placeItems: 'center',
                  }}>
                    {isSel && <IconCheck size={14} color="#fff" stroke={3}/>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {items.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: t.textMuted }}>
            <IconCamera size={48} color={t.grayLt}/>
            <div style={{ marginTop: 12, fontSize: 15 }}>No matching photos</div>
          </div>
        )}
      </div>

      {/* Selection action bar */}
      {selecting && (
        <div style={{
          padding: '12px 16px', display: 'flex', gap: 10, background: t.bg,
          borderTop: `0.5px solid ${t.border}`, animation: 'pic-fade-in 200ms',
        }}>
          <SecondaryButton fullWidth>Share · {selected.size}</SecondaryButton>
          <SecondaryButton fullWidth>Export</SecondaryButton>
          <button onClick={() => setSelected(new Set())} style={{
            width: 48, height: 48, borderRadius: 20, border: `1.5px solid ${t.alert}`,
            background: 'transparent', color: t.alert, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <IconTrash size={18}/>
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { GalleryScreen });
