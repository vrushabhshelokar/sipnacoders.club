import { useEffect, useState } from 'react';
import { Icon } from '../site/Icons';

export default function AdminAnalytics() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({ total: null, unique: null, updatedAt: null });
  const [refreshing, setRefreshing] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Check existing session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/admin/analytics', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAuthenticated(true);
            setStats({
              total: typeof data.total === 'number' ? data.total : null,
              unique: typeof data.unique === 'number' ? data.unique : null,
              updatedAt: data.updatedAt || new Date().toISOString(),
            });
          }
        } else {
          if (isMounted) {
            setAuthenticated(false);
          }
        }
      } catch {
        if (isMounted) {
          setAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ action: 'login', password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.authenticated) {
        setAuthenticated(true);
        setPassword('');
        fetchStats();
      } else {
        setLoginError(data.error || 'Invalid admin credentials.');
      }
    } catch {
      setLoginError('Authentication service unreachable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // Ignore
    } finally {
      setAuthenticated(false);
      setStats({ total: null, unique: null, updatedAt: null });
    }
  };

  const fetchStats = async () => {
    setRefreshing(true);
    setStatsError('');

    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setStats({
        total: typeof data.total === 'number' ? data.total : null,
        unique: typeof data.unique === 'number' ? data.unique : null,
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    } catch {
      setStatsError('Failed to fetch updated statistics.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'number') return num.toLocaleString('en-US');
    return '—';
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  if (checkingAuth) {
    return (
      <div className="s-container s-analytics-wrap">
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          Checking authorization...
        </div>
      </div>
    );
  }

  return (
    <div className="s-container s-analytics-wrap">
      {!authenticated ? (
        <div className="s-login-card">
          <div className="s-analytics-tag">RESTRICTED</div>
          <h2>ADMIN ACCESS</h2>
          <p>Enter the admin secret key to access visitor analytics.</p>
          <form className="s-login-form" onSubmit={handleLogin}>
            <input
              type="password"
              className="s-login-input"
              placeholder="Admin Secret Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoFocus
              required
            />
            <button
              type="submit"
              className="s-btn s-btn-light"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Authenticating...' : 'Unlock Analytics'}
            </button>
            {loginError && <div className="s-login-error">{loginError}</div>}
          </form>
        </div>
      ) : (
        <>
          <div className="s-analytics-header">
            <div className="s-analytics-tag">PRIVATE DASHBOARD</div>
            <h1 className="s-analytics-title">VISITOR ANALYTICS</h1>
            <p className="s-analytics-sub">
              Persistent website traffic analytics stored securely in Upstash Redis.
            </p>
          </div>

          {statsError && (
            <div style={{ padding: '12px 18px', background: 'rgba(234, 67, 53, 0.1)', border: '1px solid rgba(234, 67, 53, 0.3)', borderRadius: 10, color: '#ff8a80', marginBottom: 20, fontSize: 14 }}>
              {statsError}
            </div>
          )}

          <div className="s-analytics-grid">
            <div className="s-analytics-card">
              <div className="s-analytics-card-label">TOTAL VISITORS</div>
              <div className="s-analytics-card-value">{formatNumber(stats.total)}</div>
              <p className="s-analytics-card-desc">
                Cumulative page visits across all sessions.
              </p>
            </div>

            <div className="s-analytics-card">
              <div className="s-analytics-card-label">UNIQUE VISITORS</div>
              <div className="s-analytics-card-value">{formatNumber(stats.unique)}</div>
              <p className="s-analytics-card-desc">
                Distinct anonymous browser identifiers tracked.
              </p>
            </div>
          </div>

          <div className="s-analytics-bar">
            <div className="s-analytics-time">
              Last Updated: <b>{formatTimestamp(stats.updatedAt)}</b>
            </div>

            <div className="s-analytics-actions">
              <button
                type="button"
                className="s-btn s-btn-light s-btn-refresh"
                onClick={fetchStats}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>

              <button
                type="button"
                className="s-btn s-btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
