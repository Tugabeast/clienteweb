import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/UserManagementPage.module.css';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);

  // erro global (lista)
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [userToDelete, setUserToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  // erros dos modals (com timer)
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    type: 'user',
  });

  // helper para mostrar erro e limpar em 3s
  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(''), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => flash(setError, 'Erro ao carregar utilizadores.'));
  };

  const confirmDeleteUser = (userId) => setUserToDelete(userId);

  const handleDeleteConfirmed = () => {
    api.delete(`/users/${userToDelete}`)
      .then(() => {
        fetchUsers();
        setUserToDelete(null);
      })
      .catch(() => flash(setError, 'Erro ao apagar utilizador.'));
  };

  const cancelDelete = () => setUserToDelete(null);

  const resetForm = () =>
    setForm({ username: '', email: '', password: '', type: 'user' });

  // --------- CRIAR
  const handleCreateUser = () => {
    if (!form.username || !form.email || !form.password) {
      flash(setCreateError, 'Preencha username, email e password.');
      return;
    }

    api.post('/users', { ...form, createdBy: 'admin' })
      .then(() => {
        fetchUsers();
        setShowCreateModal(false);
        resetForm();
        setCreateError('');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Erro ao criar utilizador.';
        flash(setCreateError, msg);
      });
  };

  // --------- EDITAR
  const openEditModal = (user) => {
    setEditUserData(user);
    setForm({
      username: user.username,
      email: user.email,
      password: '',
      type: user.type,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditUser = () => {
    if (!form.username || !form.email) {
      flash(setEditError, 'Username e email são obrigatórios.');
      return;
    }

    api.put(`/users/${editUserData.id}`, { ...form, updatedBy: 'admin' })
      .then(() => {
        fetchUsers();
        setShowEditModal(false);
        resetForm();
        setEditError('');
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || 'Erro ao atualizar utilizador.';
        flash(setEditError, msg);
      });
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const currentUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const loggedUsername = localStorage.getItem('username');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Utilizadores</h2>

        <button
          className={styles.createBtn}
          onClick={() => {
            resetForm();
            setCreateError('');
            setShowCreateModal(true);
          }}
        >
          + Novo Utilizador
        </button>

        {/* erro global da lista com timer */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Tipo de Utilizador</th>
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
                  <button
                    onClick={() => openEditModal(user)}
                    className={styles.editBtn}
                  >
                    Editar
                  </button>

                  {user.username !== loggedUsername ? (
                    <button
                      onClick={() => confirmDeleteUser(user.id)}
                      className={styles.deleteBtn}
                    >
                      Apagar
                    </button>
                  ) : (
                    <span className={styles.selfInfo}>
                      Não pode apagar a sua própria conta
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
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

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Seguinte
        </button>
        </div>

        {/* Modal de confirmação de apagar */}
        {userToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>
              <p>Queres mesmo apagar este utilizador?</p>
              <div className={styles.modalActions}>
                <button
                  className={styles.confirmBtn}
                  onClick={handleDeleteConfirmed}
                >
                  Confirmar
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={cancelDelete}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Criar */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Criar Novo Utilizador</h3>

              {/* erro dentro do modal com timer */}
              {createError && (
                <div className={styles.modalError}>{createError}</div>
              )}

              <div className={styles.modalForm}>
                <label htmlFor="c-username">Username</label>
                <input
                  id="c-username"
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />

                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <label htmlFor="c-password">Password</label>
                <input
                  id="c-password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <label htmlFor="c-type">Tipo de Utilizador</label>
                <select
                  id="c-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="investigator">Investigator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreateUser}>
                  Criar
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Editar Utilizador</h3>

              {/* erro dentro do modal com timer */}
              {editError && (
                <div className={styles.modalError}>{editError}</div>
              )}

              <div className={styles.modalForm}>
                <label htmlFor="e-username">Username</label>
                <input
                  id="e-username"
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />

                <label htmlFor="e-email">Email</label>
                <input
                  id="e-email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <label htmlFor="e-password">Nova Password (opcional)</label>
                <input
                  id="e-password"
                  type="password"
                  placeholder="Nova Password (opcional)"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <label htmlFor="e-type">Tipo de Utilizador</label>
                <select
                  id="e-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="investigator">Investigator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEditUser}>
                  Atualizar
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditError('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagementPage;
