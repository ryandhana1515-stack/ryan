export default function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.2rem 1.5rem',
    }}>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em', color: '#F5EFE0' }}>
        ORYZO
      </div>
      <button style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'transparent', border: '1.5px dashed rgba(245,239,224,0.5)',
        borderRadius: '100px', padding: '0.5rem 1.1rem',
        color: '#F5EFE0', fontSize: '0.72rem', fontWeight: 600,
        letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'Space Grotesk',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF8539', display: 'inline-block' }} />
        MENU
      </button>
    </nav>
  )
}
