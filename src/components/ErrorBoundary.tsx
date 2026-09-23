import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: any) { console.error('UI crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          background: 'var(--background)', color: 'var(--foreground)', padding: 24, textAlign: 'center'
        }}>
          <div style={{ fontSize: 48 }}>🎬</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>حدث خطأ غير متوقع</h2>
          <p style={{ maxWidth: 480, color: 'var(--muted-foreground)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            التطبيق واجه مشكلة في هذه الصفحة. حاول تحديث الصفحة أو العودة للرئيسية.<br/>
            <code style={{ fontSize: '0.7rem', opacity: 0.6 }}>{this.state.error?.message}</code>
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.hash = '#/'; window.location.reload(); }}
            style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            العودة للرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
