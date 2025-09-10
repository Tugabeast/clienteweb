import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Register.module.css';
import '../../styles/AuthBackground.css';
import api from '../../services/api';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-background');
    return () => {
      document.body.classList.remove('auth-background');
    };
  }, []);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password && value !== password) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    api
      .post('/auth/register', { username, email, password })
      .then((response) => {
        setMessage(response.data.message);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        navigate('/');
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || 'Erro ao registar utilizador');
      });
  };

  return (
    <div className={styles.registerContainer}>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <h1 className={styles.registerTitle}>Socialsfy</h1>
        <h2 className={styles.registerSubtitle}>Criar conta</h2>
        {message && <p className={styles.successMessage}>{message}</p>}
        <label className={styles.registerLabel}>Username</label>
        <input
          type="text"
          className={styles.registerInput}
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className={styles.registerLabel}>Email</label>
        <input
          type="email"
          className={styles.registerInput}
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={styles.registerLabel}>Password</label>
        <input
          type="password"
          className={styles.registerInput}
          placeholder="Enter Password"
          value={password}
          onChange={handlePasswordChange}
          required
        />

        <label className={styles.registerLabel}>Confirm Password</label>
        <input
          type="password"
          className={styles.registerInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
        />

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button type="submit" className={styles.registerBtnPrimary}>Registar</button>
        <button type="button" className={styles.registerBtnSecondary} onClick={() => navigate('/')}>
          Já tem conta?
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
