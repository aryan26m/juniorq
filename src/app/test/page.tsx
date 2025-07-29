export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the routing is working!</p>
      <div style={{ 
        width: '200px', 
        height: '200px', 
        backgroundColor: '#4CAF50',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20px',
        borderRadius: '8px'
      }}>
        This is a test box
      </div>
    </div>
  );
}
