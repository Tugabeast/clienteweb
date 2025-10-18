import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import { AuthContext } from '../../context/AuthContext';
import styles from '../../styles/ProfilePage.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const currentUsername = localStorage.getItem('username');

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    if (!newUsername && !newPassword) {
      setError('Tens de preencher pelo menos um campo.');
      clearMessages();
      return;
    }

    if (newUsername && newUsername === currentUsername) {
      setError('O novo username não pode ser igual ao atual.');
      clearMessages();
      return;
    }

    api.put('/profile', {
      currentUsername,
      newUsername: newUsername || null,
      currentPassword,
      newPassword: newPassword || null,
    })
      .then((response) => {
        if (newUsername) {
          localStorage.setItem('username', newUsername);
        }
        setSuccess(response.data.message);
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        clearMessages();
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
        clearMessages();
      });
  };

  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h3 className={styles.welcomeText}>Bem-vindo {currentUsername}</h3>
        <div className={styles.profileContainer}>
          <div className={styles.profileForm}>
            <h1>Perfil do Utilizador</h1>

            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>{success}</p>}

            <form onSubmit={handleUpdateProfile}>
              <h3>Atualizar Perfil</h3>

              <label>Novo Username (opcional)</label>
              <input
                type="text"
                placeholder="Novo Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={styles.profileInput}
              />

              <label>Password Atual (obrigatória para alterar password)</label>
              <div className={styles.passwordField}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Password Atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.profileInput}
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <label>Nova Password (opcional)</label>
              <div className={styles.passwordField}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nova Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.profileInput}
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button type="submit" className={styles.btnPrimary}>Atualizar Perfil</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
