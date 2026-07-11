import React, { useState } from 'react';
import { UserOnboarding } from '../components/auth/UserOnboarding';
import { HostOnboarding } from '../components/auth/HostOnboarding';
import { Ticket, Storefront, ArrowRight, CaretLeft } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

type AuthRole = 'none' | 'user' | 'host' | 'login';

const LoginView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginMock } = useUserContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await loginMock(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 'var(--spacing-hero) var(--spacing-medium)'
    }}>
      <div className="card-padding animate-fade-in-up" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
        <button onClick={onBack} className="btn-ghost" style={{ padding: 0, marginBottom: 'var(--spacing-base)', color: 'var(--text-secondary)' }}>
          <CaretLeft size={20} /> Back
        </button>
        <h2 className="text-section" style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome Back</h2>
        <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-large)' }}>Log in to access your saved events.</p>
        {errorMsg && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: 'var(--spacing-base)', fontSize: '14px', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
          <div>
            <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary hover-scale" style={{ width: '100%', marginTop: 'var(--spacing-base)', justifyContent: 'center' }}>
            {loading ? 'Logging in...' : <><span style={{ marginRight: '4px' }}>Log In</span> <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export const Auth: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AuthRole>('none');

  if (selectedRole === 'user') {
    return <UserOnboarding onBack={() => setSelectedRole('none')} />;
  }

  if (selectedRole === 'login') {
    return <LoginView onBack={() => setSelectedRole('none')} />;
  }

  if (selectedRole === 'host') {
    return <HostOnboarding onBack={() => setSelectedRole('none')} />;
  }

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 'var(--spacing-hero) var(--spacing-medium)'
    }}>
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xlarge)' }}>
        <h1 className="text-hero" style={{ fontSize: '40px', marginBottom: 'var(--spacing-base)' }}>Join FindIt</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          Are you here to discover amazing experiences, or to create them?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-large)', width: '100%', maxWidth: '800px' }}>
        
        {/* Attendee Option */}
        <button 
          onClick={() => setSelectedRole('user')}
          className="card-padding hover-lift animate-fade-in-up" 
          style={{ 
            animationDelay: '0.1s',
            backgroundColor: 'var(--bg-card)', 
            borderRadius: 'var(--radius-card)', 
            border: '2px solid transparent',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--spacing-base)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-pin-orange)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255, 87, 34, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-pin-orange)' }}>
            <Ticket size={32} weight="fill" />
          </div>
          <div>
            <h3 className="text-card-title" style={{ marginBottom: '4px' }}>I'm an Attendee</h3>
            <p className="text-caption">Discover events, buy tickets, and connect with people.</p>
          </div>
        </button>

        {/* Host Option */}
        <button 
          onClick={() => setSelectedRole('host')}
          className="card-padding hover-lift animate-fade-in-up" 
          style={{ 
            animationDelay: '0.2s',
            backgroundColor: 'var(--bg-card)', 
            borderRadius: 'var(--radius-card)', 
            border: '2px solid transparent',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--spacing-base)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-pin-orange)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255, 87, 34, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-pin-orange)' }}>
            <Storefront size={32} weight="fill" />
          </div>
          <div>
            <h3 className="text-card-title" style={{ marginBottom: '4px' }}>I'm an Organizer</h3>
            <p className="text-caption">Host events, sell tickets, and manage your audience.</p>
          </div>
        </button>

      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', marginTop: 'var(--spacing-xlarge)', color: 'var(--text-secondary)' }}>
        Already have an account? <button onClick={() => setSelectedRole('login')} className="btn-ghost" style={{ color: 'var(--color-pin-orange)', fontWeight: 600, padding: 0 }}>Log In</button>
      </div>
    </div>
  );
};
