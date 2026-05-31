import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/StudiesManagementPage.module.css';

const StudiesManagementPage = () => {
  const [studies, setStudies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState('');
  const [pageInfo, setPageInfo] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const createErrTimer = useRef(null);
  const editErrTimer = useRef(null);
  const deleteErrTimer = useRef(null);

  const setTimedError = (setter, timerRef, msg) => {
    setter(msg);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setter(''), 3000);
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState(null);

  const [form, setForm] = useState({
    name: '',
    obs: '',
    minClassificationsPerPost: '',
    maxClassificationsPerUser: '',
    validationAgreementPercent: '',
    finishedAt: ''
  });

  const [editStudyData, setEditStudyData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = 10;

  useEffect(() => {
    fetchStudies();

    return () => {
      [createErrTimer, editErrTimer, deleteErrTimer].forEach((ref) => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      });
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStudies((currentStudies) => [...currentStudies]);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(studies.length / studiesPerPage));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [studies.length, currentPage]);

  const fetchStudies = async () => {
    const username = localStorage.getItem('username');

    if (!username) {
      setStudies([]);
      setPageInfo('');
      setPageError('Erro ao carregar estudos.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setPageError('');
      setPageInfo('');

      const res = await api.get(`/studies?username=${encodeURIComponent(username)}`);

      setStudies(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);

      if (Array.isArray(res.data) && res.data.length === 0) {
        setPageInfo('Ainda não existem estudos criados. Cria um novo estudo para começar.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStudies([]);
        setCurrentPage(1);
        setPageError('');
        setPageInfo('Ainda não existem estudos criados. Cria um novo estudo para começar.');
        return;
      }

      setStudies([]);
      setPageInfo('');
      setPageError('Erro ao carregar estudos.');
    } finally {
      setIsLoading(false);
    }
  };

  const toLocalInput = (dt) => {
    if (!dt) return '';

    try {
      const d = new Date(dt);

      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
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

    if (days > 0) {
      return `Ativo (acaba em ${days}d ${hhmmss})`;
    }

    return `Ativo (acaba em ${hhmmss})`;
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      return '-';
    }

    return numberValue.toFixed(2);
  };

  const resetForm = () => {
    setForm({
      name: '',
      obs: '',
      minClassificationsPerPost: '',
      maxClassificationsPerUser: '',
      validationAgreementPercent: '',
      finishedAt: ''
    });
  };

  const handleCreateStudy = async () => {
    const {
      name,
      obs,
      minClassificationsPerPost,
      maxClassificationsPerUser,
      validationAgreementPercent
    } = form;

    if (
      !name.trim() ||
      !obs.trim() ||
      minClassificationsPerPost === '' ||
      maxClassificationsPerUser === '' ||
      validationAgreementPercent === ''
    ) {
      return setTimedError(setCreateError, createErrTimer, 'Todos os campos são obrigatórios.');
    }

    const minCls = Number(minClassificationsPerPost);
    const maxClsUser = Number(maxClassificationsPerUser);
    const agree = Number(validationAgreementPercent);

    if (!Number.isFinite(minCls) || minCls <= 0) {
      return setTimedError(
        setCreateError,
        createErrTimer,
        'O mínimo de classificações por post deve ser um número positivo.'
      );
    }

    if (!Number.isFinite(maxClsUser) || maxClsUser <= 0) {
      return setTimedError(
        setCreateError,
        createErrTimer,
        'O máximo de classificações por utilizador deve ser um número positivo.'
      );
    }

    if (!Number.isFinite(agree) || agree < 0 || agree > 100) {
      return setTimedError(
        setCreateError,
        createErrTimer,
        'A percentagem de validação deve estar entre 0 e 100.'
      );
    }

    try {
      await api.post('/studies', {
        ...form,
        addedBy: localStorage.getItem('username')
      });

      await fetchStudies();
      closeCreateModal();
    } catch (err) {
      if (err.response?.status === 409) {
        setTimedError(setCreateError, createErrTimer, 'Já existe um estudo com esse nome.');
      } else if (err.response?.status === 404) {
        setTimedError(setCreateError, createErrTimer, 'Investigador não encontrado.');
      } else {
        setTimedError(setCreateError, createErrTimer, 'Erro ao criar estudo.');
      }
    }
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

  const confirmDeleteStudy = (studyId) => {
    setDeleteError('');
    setStudyToDelete(studyId);
  };

  const handleDeleteConfirmed = async () => {
    if (studyToDelete === null || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError('');

      await api.delete(`/studies/${studyToDelete}`);

      setStudies((currentStudies) =>
        currentStudies.filter((study) => study.id !== studyToDelete)
      );

      setStudyToDelete(null);
      await fetchStudies();
    } catch (err) {
      if (err.response?.status === 404) {
        setStudies((currentStudies) =>
          currentStudies.filter((study) => study.id !== studyToDelete)
        );

        setStudyToDelete(null);
        await fetchStudies();
        return;
      }

      if (err.response?.status === 409) {
        return setTimedError(
          setDeleteError,
          deleteErrTimer,
          err.response?.data?.message ||
            'Não é possível apagar este estudo porque existem dados associados.'
        );
      }

      setTimedError(setDeleteError, deleteErrTimer, 'Erro ao apagar estudo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;

    setDeleteError('');
    setStudyToDelete(null);
  };

  const openEditModal = (study) => {
    setEditError('');
    setEditStudyData(study);

    setForm({
      name: study.name || '',
      obs: study.obs || '',
      minClassificationsPerPost: study.minClassificationsPerPost ?? '',
      maxClassificationsPerUser: study.maxClassificationsPerUser ?? '',
      validationAgreementPercent: study.validationAgreementPercent ?? '',
      finishedAt: toLocalInput(study.finishedAt)
    });

    setShowEditModal(true);
  };

  const handleEditStudy = async () => {
    const {
      name,
      minClassificationsPerPost,
      maxClassificationsPerUser,
      validationAgreementPercent
    } = form;

    if (
      !name.trim() ||
      minClassificationsPerPost === '' ||
      maxClassificationsPerUser === '' ||
      validationAgreementPercent === ''
    ) {
      return setTimedError(
        setEditError,
        editErrTimer,
        'Os campos Nome, Mínimo, Máximo e Percentagem são obrigatórios.'
      );
    }

    const minCls = Number(minClassificationsPerPost);
    const maxClsUser = Number(maxClassificationsPerUser);
    const agree = Number(validationAgreementPercent);

    if (!Number.isFinite(minCls) || minCls <= 0) {
      return setTimedError(
        setEditError,
        editErrTimer,
        'O mínimo de classificações por post deve ser um número positivo.'
      );
    }

    if (!Number.isFinite(maxClsUser) || maxClsUser <= 0) {
      return setTimedError(
        setEditError,
        editErrTimer,
        'O máximo de classificações por utilizador deve ser um número positivo.'
      );
    }

    if (!Number.isFinite(agree) || agree < 0 || agree > 100) {
      return setTimedError(
        setEditError,
        editErrTimer,
        'A percentagem de validação deve estar entre 0 e 100.'
      );
    }

    try {
      await api.put(`/studies/${editStudyData.id}`, {
        ...form,
        updatedBy: localStorage.getItem('username')
      });

      await fetchStudies();
      closeEditModal();
    } catch (err) {
      if (err.response?.status === 409) {
        setTimedError(setEditError, editErrTimer, 'Já existe outro estudo com esse nome.');
      } else if (err.response?.status === 404) {
        setTimedError(setEditError, editErrTimer, 'Estudo não encontrado.');
      } else {
        setTimedError(setEditError, editErrTimer, 'Erro ao atualizar estudo.');
      }
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
    setEditStudyData(null);
    resetForm();
  };

  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = studies.slice(indexOfFirstStudy, indexOfLastStudy);
  const totalPages = Math.ceil(studies.length / studiesPerPage);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <MenuHamburguer />

      <div className={styles.pageContainer}>
        <h2>Gestão de Estudos</h2>

        <button className={styles.createBtn} onClick={openCreateModal}>
          + Novo Estudo
        </button>

        {pageError && <p className={styles.errorMessage}>{pageError}</p>}

        {!pageError && isLoading && (
          <p className={styles.infoMessage}>A carregar estudos...</p>
        )}

        {!pageError && !isLoading && pageInfo && (
          <p className={styles.infoMessage}>{pageInfo}</p>
        )}

        {!isLoading && !pageError && studies.length > 0 && (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.studyTable}>
                <thead>
                  <tr>
                    <th>Nome do Estudo</th>
                    <th>Observações</th>
                    <th>Classificações Mínimas</th>
                    <th>Classificações Máximas</th>
                    <th>Percentagem Validação (%)</th>
                    <th>Estado</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {currentStudies.map((study) => (
                    <tr key={study.id}>
                      <td>{study.name}</td>
                      <td>{study.obs}</td>
                      <td>{study.minClassificationsPerPost}</td>
                      <td>{study.maxClassificationsPerUser}</td>
                      <td>{formatPercent(study.validationAgreementPercent)}</td>
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
                        <button
                          onClick={() => openEditModal(study)}
                          className={styles.editBtn}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => confirmDeleteStudy(study.id)}
                          className={styles.deleteBtn}
                        >
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          </>
        )}

        {studyToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>

              {deleteError && <div className={styles.modalError}>{deleteError}</div>}

              <p>Queres mesmo apagar este estudo?</p>

              <div className={styles.modalActions}>
                <button
                  className={styles.confirmBtn}
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'A apagar...' : 'Confirmar'}
                </button>

                <button
                  className={styles.cancelBtn}
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

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

                <label>Máximo de classificações por utilizador</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Máximo de classificações por utilizador"
                  value={form.maxClassificationsPerUser}
                  onChange={(e) =>
                    setForm({ ...form, maxClassificationsPerUser: e.target.value })
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
                  onChange={(e) =>
                    setForm({ ...form, validationAgreementPercent: e.target.value })
                  }
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

                <label>Máximo de classificações por utilizador</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Máximo de classificações por utilizador"
                  value={form.maxClassificationsPerUser}
                  onChange={(e) =>
                    setForm({ ...form, maxClassificationsPerUser: e.target.value })
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
                  onChange={(e) =>
                    setForm({ ...form, validationAgreementPercent: e.target.value })
                  }
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