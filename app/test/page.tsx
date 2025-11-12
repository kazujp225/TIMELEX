export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', color: '#6EC5FF' }}>✅ 動作確認OK</h1>
      <p style={{ fontSize: '24px', color: '#666' }}>サーバーは正常に動作しています</p>
      <div style={{ marginTop: '40px' }}>
        <a
          href="/"
          style={{
            padding: '16px 32px',
            backgroundColor: '#6EC5FF',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px'
          }}
        >
          トップページへ
        </a>
      </div>
    </div>
  )
}
