import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Login.module.css';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/AuthBackground.css'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  useEffect(() => {
    document.body.classList.add('auth-background');
    return () => {
      document.body.classList.remove('auth-background');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post('/auth/login', { email, password })
      .then((response) => {
        const { token, type, userId, username } = response.data;
        login(token, type, username, userId);
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        navigate('/home');
      })
      .catch((err) => {
        console.error('Erro ao realizar login:', err);
        setMessage(err.response?.data?.message || 'Erro ao realizar login');
      });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.loginTitle}>Socialsfy</h1>
        <h2 className={styles.loginTitle}>Login</h2>
        {message && <p className={styles.loginError}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <label className={styles.loginLabel}>Email</label>
          <input
            type="email"
            className={styles.loginInput}
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className={styles.loginLabel}>Password</label>
          <input
            type="password"
            className={styles.loginInput}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.loginBtnPrimary}>Login</button>
          <button
            type="button"
            className={styles.loginBtnSecondary}
            onClick={() => navigate('/register')}
          >
            Criar Conta
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
