import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/QuestionsManagementPage.module.css';

const QuestionsManagementPage = () => {
  const [questions, setQuestions] = useState([]);
  const [studies, setStudies] = useState([]);

  // ⬇️ NOVO: erros por modal
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  const [form, setForm] = useState({
    question: '',
    content: '',
    inputType: 'radio',
    studyId: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchQuestions();
    fetchStudies();
  }, []);

  // ⬇️ NOVO: helper c/ timeout 3s
  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(''), 3000);
  };

  const fetchQuestions = () => {
    api.get(`/questions?username=${username}`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err));
  };

  const fetchStudies = () => {
    api.get(`/studies?username=${username}`)
      .then(res => setStudies(res.data))
      .catch(err => console.error(err));
  };

  const handleCreate = () => {
    // ⬇️ NOVO: validação + erro no modal
    const { question, content, inputType, studyId } = form;
    if (!question.trim() || !content.trim() || !inputType || !studyId) {
      return flash(setCreateError, 'Preencha todos os campos.');
    }

    api.post('/questions', { ...form, studyId: Number(studyId) || null })
      .then(() => {
        fetchQuestions();
        setShowCreateModal(false);
        setCreateError('');
        resetForm();
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          flash(setCreateError, 'Já existe uma pergunta com esse nome neste estudo.');
        } else {
          flash(setCreateError, 'Erro ao criar pergunta.');
        }
      });
  };

  const handleEdit = () => {
    // ⬇️ NOVO: validação + erro no modal
    const { question, content, inputType, studyId } = form;
    if (!question.trim() || !content.trim() || !inputType || !studyId) {
      return flash(setEditError, 'Preencha todos os campos.');
    }

    api.put(`/questions/${questionToEdit.id}`, { ...form, studyId: Number(studyId) || null })
      .then(() => {
        fetchQuestions();
        setShowEditModal(false);
        setEditError('');
        resetForm();
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          flash(setEditError, 'Já existe uma pergunta com esse nome neste estudo.');
        } else {
          flash(setEditError, 'Erro ao atualizar pergunta.');
        }
      });
  };

  const handleDelete = () => {
    api.delete(`/questions/${questionToDelete}`)
      .then(() => {
        fetchQuestions();
        setQuestionToDelete(null);
      })
      .catch(err => console.error(err));
  };

  const resetForm = () => {
    setForm({ question: '', content: '', inputType: 'radio', studyId: '' });
  };

  const totalPages = Math.ceil(questions.length / itemsPerPage);
  const paginatedQuestions = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Perguntas</h2>
        <button
          className={styles.createBtn}
          onClick={() => { setShowCreateModal(true); setCreateError(''); }}
        >
          + Nova Pergunta
        </button>

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
            {paginatedQuestions.map(q => (
              <tr key={q.id}>
                <td>{q.question}</td>
                <td>{q.content}</td>
                <td>{q.inputType}</td>
                <td>{q.studyName}</td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setQuestionToEdit(q);
                      setForm({
                        question: q.question,
                        content: q.content,
                        inputType: q.inputType,
                        studyId: q.studyId,
                      });
                      setEditError('');
                      setShowEditModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setQuestionToDelete(q.id)}
                  >
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
              onClick={() => setCurrentPage(i + 1)}
              className={i + 1 === currentPage ? styles.activePage : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {questionToDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>
              <p>Quer mesmo apagar esta pergunta?</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleDelete}>Confirmar</button>
                <button className={styles.cancelBtn} onClick={() => setQuestionToDelete(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Criar Nova Pergunta</h3>

              {/* ⬇️ NOVO: erro dentro do modal */}
              {createError && <div className={styles.modalError}>{createError}</div>}

              <div className={styles.modalForm}>
                <label htmlFor="q-question">Pergunta</label>
                <input
                  id="q-question"
                  type="text"
                  placeholder="Pergunta"
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  autoFocus
                />

                <label htmlFor="q-content">Descrição / Contexto</label>
                <textarea
                  id="q-content"
                  placeholder="Descrição / Contexto"
                  rows={3}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />

                <label htmlFor="q-inputType">Tipo de Input</label>
                <select
                  id="q-inputType"
                  value={form.inputType}
                  onChange={e => setForm({ ...form, inputType: e.target.value })}
                >
                  <option value="radio">Escolha Única (radio)</option>
                  <option value="checkbox">Múltiplas Escolhas (checkbox)</option>
                </select>

                <label htmlFor="q-study">Estudo</label>
                <select
                  id="q-study"
                  value={form.studyId}
                  onChange={e => setForm({ ...form, studyId: e.target.value })}
                >
                  <option value="" disabled>Selecione um estudo...</option>
                  {studies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreate}>Criar</button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => { setShowCreateModal(false); setCreateError(''); resetForm(); }}
                >
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

              {/* ⬇️ NOVO: erro dentro do modal */}
              {editError && <div className={styles.modalError}>{editError}</div>}

              <div className={styles.modalForm}>
                <label htmlFor="e-question">Pergunta</label>
                <input
                  id="e-question"
                  type="text"
                  placeholder="Pergunta"
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                />

                <label htmlFor="e-content">Descrição / Contexto</label>
                <textarea
                  id="e-content"
                  placeholder="Descrição / Contexto"
                  rows={3}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />

                <label htmlFor="e-inputType">Tipo de Input</label>
                <select
                  id="e-inputType"
                  value={form.inputType}
                  onChange={e => setForm({ ...form, inputType: e.target.value })}
                >
                  <option value="radio">Escolha Única (radio)</option>
                  <option value="checkbox">Múltiplas Escolhas (checkbox)</option>
                </select>

                <label htmlFor="e-study">Estudo</label>
                <select
                  id="e-study"
                  value={form.studyId}
                  onChange={e => setForm({ ...form, studyId: e.target.value })}
                >
                  <option value="" disabled>Selecione um estudo...</option>
                  {studies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEdit}>Atualizar</button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => { setShowEditModal(false); setEditError(''); resetForm(); }}
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

export default QuestionsManagementPage;
