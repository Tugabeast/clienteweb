import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/QuestionsManagementPage.module.css';

const QuestionsManagementPage = () => {
  const [questions, setQuestions] = useState([]);
  const [studies, setStudies] = useState([]);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingStudies, setIsLoadingStudies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState('');
  const [questionsInfo, setQuestionsInfo] = useState('');
  const [studiesInfo, setStudiesInfo] = useState('');

  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const createErrTimer = useRef(null);
  const editErrTimer = useRef(null);
  const deleteErrTimer = useRef(null);

  const [form, setForm] = useState({
    question: '',
    content: '',
    inputType: 'radio',
    studyId: ''
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuestions();
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
    const totalPages = Math.max(1, Math.ceil(questions.length / itemsPerPage));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [questions.length, currentPage]);

  const setTimedError = (setter, timerRef, msg) => {
    setter(msg);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setter(''), 3000);
  };

  const resetForm = () => {
    setForm({
      question: '',
      content: '',
      inputType: 'radio',
      studyId: ''
    });
  };

  const fetchQuestions = async () => {
    const username = localStorage.getItem('username');

    if (!username) {
      setQuestions([]);
      setQuestionsInfo('');
      setPageError('Erro ao carregar perguntas.');
      return;
    }

    try {
      setIsLoadingQuestions(true);
      setPageError('');
      setQuestionsInfo('');

      const res = await api.get(`/questions?username=${encodeURIComponent(username)}`);

      setQuestions(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);

      if (Array.isArray(res.data) && res.data.length === 0) {
        setQuestionsInfo('Ainda não existem perguntas criadas.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setQuestions([]);
        setCurrentPage(1);
        setQuestionsInfo('Ainda não existem perguntas criadas.');
        return;
      }

      setQuestions([]);
      setQuestionsInfo('');
      setPageError('Erro ao carregar perguntas.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const fetchStudies = async () => {
    const username = localStorage.getItem('username');

    if (!username) {
      setStudies([]);
      setStudiesInfo('');
      setPageError('Erro ao carregar estudos.');
      return;
    }

    try {
      setIsLoadingStudies(true);
      setPageError('');
      setStudiesInfo('');

      const res = await api.get(`/studies?username=${encodeURIComponent(username)}`);

      setStudies(Array.isArray(res.data) ? res.data : []);

      if (Array.isArray(res.data) && res.data.length === 0) {
        setStudiesInfo('Ainda não existem estudos criados. Cria um estudo antes de criares perguntas.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStudies([]);
        setStudiesInfo('Ainda não existem estudos criados. Cria um estudo antes de criares perguntas.');
        return;
      }

      setStudies([]);
      setStudiesInfo('');
      setPageError('Erro ao carregar estudos.');
    } finally {
      setIsLoadingStudies(false);
    }
  };

  const openCreateModal = () => {
    if (studies.length === 0) {
      setStudiesInfo('Ainda não existem estudos criados. Cria um estudo antes de criares perguntas.');
      return;
    }

    resetForm();
    setCreateError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    resetForm();
  };

  const handleCreate = async () => {
    const { question, content, inputType, studyId } = form;

    if (!question.trim() || !content.trim() || !inputType || !studyId) {
      return setTimedError(setCreateError, createErrTimer, 'Preenche todos os campos.');
    }

    try {
      await api.post('/questions', {
        question: question.trim(),
        content: content.trim(),
        inputType,
        studyId: Number(studyId)
      });

      await fetchQuestions();
      closeCreateModal();
    } catch (err) {
      if (err.response?.status === 400) {
        setTimedError(
          setCreateError,
          createErrTimer,
          err.response?.data?.message || 'Dados inválidos.'
        );
      } else if (err.response?.status === 404) {
        setTimedError(setCreateError, createErrTimer, 'Estudo não encontrado.');
      } else if (err.response?.status === 409) {
        setTimedError(
          setCreateError,
          createErrTimer,
          'Já existe uma pergunta com esse nome neste estudo.'
        );
      } else {
        setTimedError(setCreateError, createErrTimer, 'Erro ao criar pergunta.');
      }
    }
  };

  const openEditModal = (question) => {
    setQuestionToEdit(question);

    setForm({
      question: question.question || '',
      content: question.content || '',
      inputType: question.inputType || 'radio',
      studyId: question.studyId || ''
    });

    setEditError('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
    setQuestionToEdit(null);
    resetForm();
  };

  const handleEdit = async () => {
    const { question, content, inputType, studyId } = form;

    if (!question.trim() || !content.trim() || !inputType || !studyId) {
      return setTimedError(setEditError, editErrTimer, 'Preenche todos os campos.');
    }

    if (!questionToEdit?.id) {
      return setTimedError(setEditError, editErrTimer, 'Pergunta não encontrada.');
    }

    try {
      await api.put(`/questions/${questionToEdit.id}`, {
        question: question.trim(),
        content: content.trim(),
        inputType,
        studyId: Number(studyId)
      });

      await fetchQuestions();
      closeEditModal();
    } catch (err) {
      if (err.response?.status === 400) {
        setTimedError(
          setEditError,
          editErrTimer,
          err.response?.data?.message || 'Dados inválidos.'
        );
      } else if (err.response?.status === 404) {
        setTimedError(setEditError, editErrTimer, 'Pergunta ou estudo não encontrado.');
      } else if (err.response?.status === 409) {
        setTimedError(
          setEditError,
          editErrTimer,
          'Já existe uma pergunta com esse nome neste estudo.'
        );
      } else {
        setTimedError(setEditError, editErrTimer, 'Erro ao atualizar pergunta.');
      }
    }
  };

  const confirmDeleteQuestion = (questionId) => {
    setDeleteError('');
    setQuestionToDelete(questionId);
  };

  const cancelDelete = () => {
    if (isDeleting) return;

    setDeleteError('');
    setQuestionToDelete(null);
  };

  const handleDelete = async () => {
    if (questionToDelete === null || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError('');

      await api.delete(`/questions/${questionToDelete}`);

      setQuestions((currentQuestions) =>
        currentQuestions.filter((question) => question.id !== questionToDelete)
      );

      setQuestionToDelete(null);
      await fetchQuestions();
    } catch (err) {
      if (err.response?.status === 404) {
        setQuestions((currentQuestions) =>
          currentQuestions.filter((question) => question.id !== questionToDelete)
        );

        setQuestionToDelete(null);
        await fetchQuestions();
        return;
      }

      if (err.response?.status === 409) {
        return setTimedError(
          setDeleteError,
          deleteErrTimer,
          err.response?.data?.message ||
            'Não é possível apagar esta pergunta porque existem categorias associadas.'
        );
      }

      setTimedError(setDeleteError, deleteErrTimer, 'Erro ao apagar pergunta.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(questions.length / itemsPerPage);

  const paginatedQuestions = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isLoading = isLoadingQuestions || isLoadingStudies;
  const canCreateQuestion = studies.length > 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <MenuHamburguer />

      <div className={styles.pageContainer}>
        <h2>Gestão de Perguntas</h2>

        <button
          className={styles.createBtn}
          onClick={openCreateModal}
          disabled={!canCreateQuestion || isLoadingStudies}
          title={
            !canCreateQuestion
              ? 'Cria primeiro um estudo antes de criares perguntas.'
              : 'Criar nova pergunta'
          }
        >
          + Nova Pergunta
        </button>

        {pageError && <p className={styles.errorMessage}>{pageError}</p>}

        {!pageError && isLoading && (
          <p className={styles.infoMessage}>A carregar dados...</p>
        )}

        {!pageError && !isLoading && studiesInfo && (
          <p className={styles.infoMessage}>{studiesInfo}</p>
        )}

        {!pageError && !isLoading && !studiesInfo && questionsInfo && (
          <p className={styles.infoMessage}>{questionsInfo}</p>
        )}

        {!isLoading && !pageError && questions.length > 0 && (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.questionTable}>
                <thead>
                  <tr>
                    <th>Pergunta</th>
                    <th>Descrição</th>
                    <th>Tipo de Input</th>
                    <th>Estudo</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedQuestions.map((question) => (
                    <tr key={question.id}>
                      <td>{question.question}</td>
                      <td>{question.content}</td>
                      <td>{question.inputType}</td>
                      <td>{question.studyName}</td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openEditModal(question)}
                        >
                          Editar
                        </button>

                        <button
                          className={styles.deleteBtn}
                          onClick={() => confirmDeleteQuestion(question.id)}
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
                  onClick={() => setCurrentPage(i + 1)}
                  className={i + 1 === currentPage ? styles.activePage : ''}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {questionToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>

              {deleteError && <div className={styles.modalError}>{deleteError}</div>}

              <p>Queres mesmo apagar esta pergunta?</p>

              <div className={styles.modalActions}>
                <button
                  className={styles.confirmBtn}
                  onClick={handleDelete}
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
              <h3>Criar Nova Pergunta</h3>

              {createError && <div className={styles.modalError}>{createError}</div>}

              <div className={styles.modalForm}>
                <label htmlFor="q-question">Pergunta</label>
                <input
                  id="q-question"
                  type="text"
                  placeholder="Pergunta"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  autoFocus
                />

                <label htmlFor="q-content">Descrição / Contexto</label>
                <textarea
                  id="q-content"
                  placeholder="Descrição / Contexto"
                  rows={3}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />

                <label htmlFor="q-inputType">Tipo de Input</label>
                <select
                  id="q-inputType"
                  value={form.inputType}
                  onChange={(e) => setForm({ ...form, inputType: e.target.value })}
                >
                  <option value="radio">Escolha Única (radio)</option>
                  <option value="checkbox">Múltiplas Escolhas (checkbox)</option>
                </select>

                <label htmlFor="q-study">Estudo</label>
                <select
                  id="q-study"
                  value={form.studyId}
                  onChange={(e) => setForm({ ...form, studyId: e.target.value })}
                >
                  <option value="" disabled>
                    Seleciona um estudo...
                  </option>

                  {studies.map((study) => (
                    <option key={study.id} value={study.id}>
                      {study.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreate}>
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
              <h3>Editar Pergunta</h3>

              {editError && <div className={styles.modalError}>{editError}</div>}

              <div className={styles.modalForm}>
                <label htmlFor="e-question">Pergunta</label>
                <input
                  id="e-question"
                  type="text"
                  placeholder="Pergunta"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                />

                <label htmlFor="e-content">Descrição / Contexto</label>
                <textarea
                  id="e-content"
                  placeholder="Descrição / Contexto"
                  rows={3}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />

                <label htmlFor="e-inputType">Tipo de Input</label>
                <select
                  id="e-inputType"
                  value={form.inputType}
                  onChange={(e) => setForm({ ...form, inputType: e.target.value })}
                >
                  <option value="radio">Escolha Única (radio)</option>
                  <option value="checkbox">Múltiplas Escolhas (checkbox)</option>
                </select>

                <label htmlFor="e-study">Estudo</label>
                <select
                  id="e-study"
                  value={form.studyId}
                  onChange={(e) => setForm({ ...form, studyId: e.target.value })}
                >
                  <option value="" disabled>
                    Seleciona um estudo...
                  </option>

                  {studies.map((study) => (
                    <option key={study.id} value={study.id}>
                      {study.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEdit}>
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

export default QuestionsManagementPage;