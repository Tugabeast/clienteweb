import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/StudiesManagementPage.module.css';

const StudiesManagementPage = () => {
  const [studies, setStudies] = useState([]);

  // Erros
  const [pageError, setPageError] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Timers para auto-hide de erros (3s)
  const pageErrTimer = useRef(null);
  const createErrTimer = useRef(null);
  const editErrTimer = useRef(null);
  const deleteErrTimer = useRef(null);

  const setTimedError = (setter, timerRef, msg) => {
    setter(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setter(''), 3000);
  };

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
    return () => {
      // limpa timers ao desmontar
      [pageErrTimer, createErrTimer, editErrTimer, deleteErrTimer].forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  // Atualiza a contagem decrescente a cada SEGUNDO para mostrar segundos
  useEffect(() => {
    const t = setInterval(() => {
      setStudies(s => [...s]);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const fetchStudies = () => {
    const username = localStorage.getItem('username');
    api
      .get(`/studies?username=${username}`)
      .then((res) => setStudies(res.data))
      .catch(() => setTimedError(setPageError, pageErrTimer, 'Erro ao carregar estudos.'));
  };

  // --------- Helpers ---------
  const toLocalInput = (dt) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16); // YYYY-MM-DDTHH:mm
    } catch {
      return '';
    }
  };

  const isActive = (finishedAt) => {
    if (!finishedAt) return true;
    const end = new Date(finishedAt);
    return end.getTime() > Date.now();
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  // Agora com segundos
  const formatRemainingTime = (finishedAt) => {
    if (!finishedAt) return 'Ativo (sem data limite)';
    const end = new Date(finishedAt).getTime();
    const now = Date.now();
    if (end <= now) return 'Concluído';

    const diff = end - now;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    const hhmmss = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    if (days > 0) return `Ativo (acaba em ${days}d ${hhmmss})`;
    return `Ativo (acaba em ${hhmmss})`;
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

  // --------- Create ---------
  const handleCreateStudy = () => {
    const { name, obs, minClassificationsPerPost, validationAgreementPercent } = form;

    if (
      !name.trim() ||
      !obs.trim() ||
      minClassificationsPerPost === '' ||
      validationAgreementPercent === ''
    ) {
      return setTimedError(setCreateError, createErrTimer, 'Todos os campos são obrigatórios.');
    }

    const minCls = Number(minClassificationsPerPost);
    const agree = Number(validationAgreementPercent);

    if (!Number.isFinite(minCls) || minCls <= 0) {
      return setTimedError(
        setCreateError,
        createErrTimer,
        'O mínimo de classificações por post deve ser um número positivo.'
      );
    }
    if (!Number.isFinite(agree) || agree < 0 || agree > 100) {
      return setTimedError(
        setCreateError,
        createErrTimer,
        'A percentagem de validação deve estar entre 0 e 100.'
      );
    }

    api
      .post('/studies', {
        ...form,
        addedBy: localStorage.getItem('username')
      })
      .then(() => {
        fetchStudies();
        closeCreateModal();
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setTimedError(setCreateError, createErrTimer, 'Já existe um estudo com esse nome.');
        } else {
          setTimedError(setCreateError, createErrTimer, 'Erro ao criar estudo.');
        }
      });
  };

  const openCreateModal = () => {
    resetForm();
    setCreateError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    resetForm();
  };

  // --------- Delete ---------
  const confirmDeleteStudy = (studyId) => {
    setDeleteError('');
    setStudyToDelete(studyId);
  };

  const handleDeleteConfirmed = () => {
    api
      .delete(`/studies/${studyToDelete}`)
      .then(() => {
        fetchStudies();
        setStudyToDelete(null);
      })
      .catch(() => setTimedError(setDeleteError, deleteErrTimer, 'Erro ao apagar estudo.'));
  };

  const cancelDelete = () => {
    setDeleteError('');
    setStudyToDelete(null);
  };

  // --------- Edit ---------
  const openEditModal = (study) => {
    setEditError('');
    setEditStudyData(study);
    setForm({
      name: study.name || '',
      obs: study.obs || '',
      minClassificationsPerPost: study.minClassificationsPerPost ?? '',
      validationAgreementPercent: study.validationAgreementPercent ?? '',
      finishedAt: toLocalInput(study.finishedAt)
    });
    setShowEditModal(true);
  };

  const handleEditStudy = () => {
    const agree = Number(form.validationAgreementPercent);
    if (!Number.isFinite(agree) || agree < 0 || agree > 100) {
      return setTimedError(
        setEditError,
        editErrTimer,
        'A percentagem de validação deve estar entre 0 e 100.'
      );
    }

    api
      .put(`/studies/${editStudyData.id}`, {
        ...form,
        updatedBy: localStorage.getItem('username')
      })
      .then(() => {
        fetchStudies();
        closeEditModal();
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setTimedError(setEditError, editErrTimer, 'Já existe outro estudo com esse nome.');
        } else {
          setTimedError(setEditError, editErrTimer, 'Erro ao atualizar estudo.');
        }
      });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
    setEditStudyData(null);
    resetForm();
  };

  // --------- Pagination ---------
  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = studies.slice(indexOfFirstStudy, indexOfLastStudy);
  const totalPages = Math.ceil(studies.length / studiesPerPage);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Estudos</h2>

        <button className={styles.createBtn} onClick={openCreateModal}>
          + Novo Estudo
        </button>

        {/* Erro de página */}
        {pageError && <p className={styles.errorMessage}>{pageError}</p>}

        <table className={styles.studyTable}>
          <thead>
            <tr>
              {/*<th>ID</th>*/}
              <th>Nome do Estudo</th>
              <th>Observações</th>
              <th>Classificações Mínimas</th>
              <th>Percentagem Validação (%)</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentStudies.map((study) => (
              <tr key={study.id}>
                {/*<td>{study.id}</td>*/}
                <td>{study.name}</td>
                <td>{study.obs}</td>
                <td>{study.minClassificationsPerPost}</td>
                <td>{Number(study.validationAgreementPercent).toFixed(2)}</td>
                <td>
                  {isActive(study.finishedAt) ? (
                    <span className={styles.statusActive}>
                      {formatRemainingTime(study.finishedAt)}
                    </span>
                  ) : (
                    <span className={styles.statusFinished}>Concluído</span>
                  )}
                </td>
                <td className={styles.actionsCell}>
                  <button onClick={() => openEditModal(study)} className={styles.editBtn}>
                    Editar
                  </button>
                  <button onClick={() => confirmDeleteStudy(study.id)} className={styles.deleteBtn}>
                    Apagar
                  </button>
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

        {/* Modal de apagar */}
        {studyToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>

              {deleteError && <div className={styles.modalError}>{deleteError}</div>}

              <p>Queres mesmo apagar este estudo?</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleDeleteConfirmed}>
                  Confirmar
                </button>
                <button className={styles.cancelBtn} onClick={cancelDelete}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de criar */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Criar Novo Estudo</h3>

              {createError && <div className={styles.modalError}>{createError}</div>}

              <div className={styles.modalForm}>
                <label>Nome do Estudo</label>
                <input
                  type="text"
                  placeholder="Nome do Estudo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <label>Observações</label>
                <textarea
                  placeholder="Observações"
                  value={form.obs}
                  onChange={(e) => setForm({ ...form, obs: e.target.value })}
                  rows={3}
                  required
                />

                <label>Mínimo de classificações por post</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Mínimo classificações por post"
                  value={form.minClassificationsPerPost}
                  onChange={(e) =>
                    setForm({ ...form, minClassificationsPerPost: e.target.value })
                  }
                  required
                />

                <label>Percentagem de validação (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Percentagem validação (%)"
                  value={form.validationAgreementPercent}
                  onChange={(e) => setForm({ ...form, validationAgreementPercent: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreateStudy}>
                  Criar
                </button>
                <button className={styles.cancelBtn} onClick={closeCreateModal}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de editar */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Editar Estudo</h3>

              {editError && <div className={styles.modalError}>{editError}</div>}

              <div className={styles.modalForm}>
                <label>Nome do Estudo</label>
                <input
                  type="text"
                  placeholder="Nome do Estudo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <label>Observações</label>
                <textarea
                  placeholder="Observações"
                  value={form.obs}
                  onChange={(e) => setForm({ ...form, obs: e.target.value })}
                  rows={3}
                />

                <label>Mínimo de classificações por post</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Mínimo classificações por post"
                  value={form.minClassificationsPerPost}
                  onChange={(e) =>
                    setForm({ ...form, minClassificationsPerPost: e.target.value })
                  }
                />

                <label>Percentagem de validação (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Percentagem validação (%)"
                  value={form.validationAgreementPercent}
                  onChange={(e) => setForm({ ...form, validationAgreementPercent: e.target.value })}
                />

                <label>Terminar estudo em (opcional)</label>
                <input
                  type="datetime-local"
                  value={form.finishedAt}
                  onChange={(e) => setForm({ ...form, finishedAt: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEditStudy}>
                  Atualizar
                </button>
                <button className={styles.cancelBtn} onClick={closeEditModal}>
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

export default StudiesManagementPage;
