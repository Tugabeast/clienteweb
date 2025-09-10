import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/StudiesManagementPage.module.css';

const StudiesManagementPage = () => {
  const [studies, setStudies] = useState([]);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState(null);
  const [form, setForm] = useState({
    name: '',
    obs: '',
    minClassificationsPerPost: '',
    validationAgreementPercent: '',
    finishedAt: ''
  });
  const [editStudyData, setEditStudyData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = 10;

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = () => {
    const username = localStorage.getItem('username');
    api.get(`/studies?username=${username}`)
      .then((res) => setStudies(res.data))
      .catch(() => setError('Erro ao carregar estudos.'));
  };

  const handleCreateStudy = () => {
    if (Number(form.validationAgreementPercent) > 100) {
      setError('A percentagem de validação não pode ser superior a 100%.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    api.post('/studies', {
      ...form,
      addedBy: localStorage.getItem('username')
    })
      .then(() => {
        fetchStudies();
        setShowCreateModal(false);
        resetForm();
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setError('Já existe um estudo com esse nome.');
        } else {
          setError('Erro ao criar estudo.');
        }
        setTimeout(() => setError(''), 3000);
      });
  };

  const confirmDeleteStudy = (studyId) => {
    setStudyToDelete(studyId);
  };

  const handleDeleteConfirmed = () => {
    api.delete(`/studies/${studyToDelete}`)
      .then(() => {
        fetchStudies();
        setStudyToDelete(null);
      })
      .catch(() => setError('Erro ao apagar estudo.'));
  };

  const cancelDelete = () => setStudyToDelete(null);

  const openEditModal = (study) => {
    setEditStudyData(study);
    setForm({
      name: study.name,
      obs: study.obs,
      minClassificationsPerPost: study.minClassificationsPerPost,
      validationAgreementPercent: study.validationAgreementPercent,
      finishedAt: ''
    });
    setShowEditModal(true);
  };

  const handleEditStudy = () => {
    if (Number(form.validationAgreementPercent) > 100) {
      setError('A percentagem de validação não pode ser superior a 100%.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    api.put(`/studies/${editStudyData.id}`, {
      ...form,
      updatedBy: localStorage.getItem('username')
    })
      .then(() => {
        fetchStudies();
        setShowEditModal(false);
        resetForm();
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setError('Já existe outro estudo com esse nome.');
        } else {
          setError('Erro ao atualizar estudo.');
        }
        setTimeout(() => setError(''), 3000);
      });
  };

  const resetForm = () => {
    setForm({
      name: '',
      obs: '',
      minClassificationsPerPost: '',
      validationAgreementPercent: '',
      finishedAt: ''
    });
  };

  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = studies.slice(indexOfFirstStudy, indexOfLastStudy);
  const totalPages = Math.ceil(studies.length / studiesPerPage);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Estudos</h2>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          + Novo Estudo
        </button>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <table className={styles.studyTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Estudo</th>
              <th>Observações</th>
              <th>Classificações Mínimas</th>
              <th>Percentagem Validação (%)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentStudies.map((study) => (
              <tr key={study.id}>
                <td>{study.id}</td>
                <td>{study.name}</td>
                <td>{study.obs}</td>
                <td>{study.minClassificationsPerPost}</td>
                <td>{study.validationAgreementPercent}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => openEditModal(study)} className={styles.editBtn}>Editar</button>
                  <button onClick={() => confirmDeleteStudy(study.id)} className={styles.deleteBtn}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={i + 1 === currentPage ? styles.activePage : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {studyToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>
              <p>Queres mesmo apagar este estudo?</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleDeleteConfirmed}>Confirmar</button>
                <button className={styles.cancelBtn} onClick={cancelDelete}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Criar Novo Estudo</h3>
              <div className={styles.modalForm}>
                <input
                  type="text"
                  placeholder="Nome do Estudo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Observações"
                  value={form.obs}
                  onChange={(e) => setForm({ ...form, obs: e.target.value })}
                  rows={3}
                  required
                />
                <input
                  type="number"
                  placeholder="Mínimo classificações por post"
                  value={form.minClassificationsPerPost}
                  onChange={(e) => setForm({ ...form, minClassificationsPerPost: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Percentagem validação (%)"
                  value={form.validationAgreementPercent}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value > 100) value = 100;
                    if (value < 0) value = 0;
                    setForm({ ...form, validationAgreementPercent: value });
                  }}
                />
              </div>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreateStudy}>Criar</button>
                <button className={styles.cancelBtn} onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Editar Estudo</h3>
              <div className={styles.modalForm}>
                <input
                  type="text"
                  placeholder="Nome do Estudo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <textarea
                  placeholder="Observações"
                  value={form.obs}
                  onChange={(e) => setForm({ ...form, obs: e.target.value })}
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Mínimo classificações por post"
                  value={form.minClassificationsPerPost}
                  onChange={(e) => setForm({ ...form, minClassificationsPerPost: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Percentagem validação (%)"
                  value={form.validationAgreementPercent}
                  onChange={(e) => setForm({ ...form, validationAgreementPercent: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={form.finishedAt}
                  onChange={(e) => setForm({ ...form, finishedAt: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEditStudy}>Atualizar</button>
                <button className={styles.cancelBtn} onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudiesManagementPage;
