import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/UserManagementPage.module.css';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [userToDelete, setUserToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    type: 'user',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Erro ao carregar utilizadores.'));
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
  };

  const handleDeleteConfirmed = () => {
    api.delete(`/users/${userToDelete}`)
      .then(() => {
        fetchUsers();
        setUserToDelete(null);
      })
      .catch(() => setError('Erro ao apagar utilizador.'));
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  const handleCreateUser = () => {
    api.post('/users', { ...form, createdBy: 'admin' })
      .then(() => {
        fetchUsers();
        setShowCreateModal(false);
        setForm({ username: '', email: '', password: '', type: 'user' });
      })
      .catch(() => setError('Erro ao criar utilizador.'));
  };

  const openEditModal = (user) => {
    setEditUserData(user);
    setForm({ username: user.username, email: user.email, password: '', type: user.type });
    setShowEditModal(true);
  };

  const handleEditUser = () => {
    api.put(`/users/${editUserData.id}`, { ...form, updatedBy: 'admin' })
      .then(() => {
        fetchUsers();
        setShowEditModal(false);
        setForm({ username: '', email: '', password: '', type: 'user' });
      })
      .catch(() => setError('Erro ao atualizar utilizador.'));
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const currentUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Utilizadores</h2>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          + Novo Utilizador
        </button>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.type}</td>
                <td>
                  {user.username !== localStorage.getItem('username') ? (
                    <>
                      <button onClick={() => openEditModal(user)} className={styles.editBtn}>Editar</button>
                      <button onClick={() => confirmDeleteUser(user.id)} className={styles.deleteBtn}>Apagar</button>
                    </>
                  ) : (
                    <span style={{ color: '#333', fontSize: '16px' }}>Não pode apagar a sua própria conta</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? styles.activePage : ''}
            >
              {i + 1}
            </button>
          ))}

          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Seguinte
          </button>
        </div>

        {userToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>
              <p>Queres mesmo apagar este utilizador?</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleDeleteConfirmed}>Confirmar</button>
                <button className={styles.cancelBtn} onClick={cancelDelete}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {/* modal para criar user */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Criar Novo Utilizador</h3>

              <div className={styles.modalForm}>
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="investigator">Investigator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreateUser}>Criar</button>
                <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {/* modal para editar user */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Editar Utilizador</h3>

              <div className={styles.modalForm}>
                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Nova Password (opcional)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="investigator">Investigator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEditUser}>Atualizar</button>
                <button className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UsersManagementPage;
