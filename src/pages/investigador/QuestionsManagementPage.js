import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/QuestionsManagementPage.module.css';

const QuestionsManagementPage = () => {
  const [questions, setQuestions] = useState([]);
  const [studies, setStudies] = useState([]);
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
    api.post('/questions', form)
      .then(() => {
        fetchQuestions();
        setShowCreateModal(false);
        resetForm();
      })
      .catch(err => console.error(err));
  };

  const handleEdit = () => {
    api.put(`/questions/${questionToEdit.id}`, form)
      .then(() => {
        fetchQuestions();
        setShowEditModal(false);
        resetForm();
      })
      .catch(err => console.error(err));
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
    setForm({
      question: '',
      content: '',
      inputType: 'radio',
      studyId: '',
    });
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
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>+ Nova Pergunta</button>

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
                  <button className={styles.editBtn} onClick={() => {
                    setQuestionToEdit(q);
                    setForm({
                      question: q.question,
                      content: q.content,
                      inputType: q.inputType,
                      studyId: q.studyId,
                    });
                    setShowEditModal(true);
                  }}>Editar</button>
                  <button className={styles.deleteBtn} onClick={() => setQuestionToDelete(q.id)}>Apagar</button>
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
              <p>Queres mesmo apagar esta pergunta?</p>
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
              <input
                type="text"
                placeholder="Pergunta"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
              />
              <textarea
                placeholder="Descrição / Contexto"
                rows={3}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
              <select
                value={form.inputType}
                onChange={e => setForm({ ...form, inputType: e.target.value })}
              >
                <option value="radio">Escolha Única (radio)</option>
                <option value="checkbox">Múltiplas Escolhas (checkbox)</option>
              </select>
              <select
                value={form.studyId}
                onChange={e => setForm({ ...form, studyId: e.target.value })}
              >
                <option value="">Selecione um estudo...</option>
                {studies.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreate}>Criar</button>
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
              <h3>Editar Pergunta</h3>
              <input
                type="text"
                placeholder="Pergunta"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
              />
              <textarea
                placeholder="Descrição / Contexto"
                rows={3}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
              <select
                value={form.inputType}
                onChange={e => setForm({ ...form, inputType: e.target.value })}
              >
                <option value="radio">Escolha Única (radio)</option>
                <option value="checkbox">Múltiplas Escolhas (checkbox)</option>
              </select>
              <select
                value={form.studyId}
                onChange={e => setForm({ ...form, studyId: e.target.value })}
              >
                <option value="">Selecione um estudo...</option>
                {studies.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEdit}>Atualizar</button>
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

export default QuestionsManagementPage;
