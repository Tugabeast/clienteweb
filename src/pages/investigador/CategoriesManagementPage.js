import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/CategoriesManagementPage.module.css';

const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]); // sugestões

  // erros
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  // modais/estado
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState(null);

  const [form, setForm] = useState({ name: '', categoryType: '', questionId: '' });

  // paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
    fetchTypeOptions();
  }, []);

  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(''), 3000);
  };

  const fetchCategories = () => {
    const username = localStorage.getItem('username');
    api.get(`/categories?username=${username}`)
      .then(res => setCategories(res.data))
      .catch(() => setError('Erro ao carregar categorias.'));
  };

  const fetchQuestions = () => {
    const username = localStorage.getItem('username');
    api.get(`/questions?username=${username}`)
      .then(res => setQuestions(res.data))
      .catch(() => setError('Erro ao carregar perguntas.'));
  };

  const fetchTypeOptions = () => {
    const username = localStorage.getItem('username');
    api.get(`/categories/types?username=${username}`)
      .then(res => setTypeOptions(res.data || []))
      .catch(() => {}); // sugestões não são críticas
  };

  const handleCreateCategory = () => {
    if (!form.name || !form.categoryType || !form.questionId) {
      return flash(setCreateError, 'Preencha todos os campos.');
    }
    if (/\d/.test(form.categoryType)) {
      return flash(setCreateError, 'O tipo não pode conter números.');
    }

    api.post('/categories', { ...form, questionId: Number(form.questionId) })
      .then(() => {
        fetchCategories();
        fetchTypeOptions(); // refresca sugestões
        setShowCreateModal(false);
        resetForm();
      })
      .catch(err => {
        if (err.response?.status === 409) flash(setCreateError, 'Essa categoria já existe.');
        else if (err.response?.status === 400) flash(setCreateError, err.response.data?.message || 'Dados inválidos.');
        else flash(setCreateError, 'Erro ao criar categoria.');
      });
  };

  const confirmDeleteCategory = (categoryId) => setCategoryToDelete(categoryId);

  const handleDeleteConfirmed = () => {
    api.delete(`/categories/${categoryToDelete}`)
      .then(() => {
        fetchCategories();
        fetchTypeOptions(); // pode remover o último tipo
        setCategoryToDelete(null);
      })
      .catch(() => setError('Erro ao apagar categoria.'));
  };

  const cancelDelete = () => setCategoryToDelete(null);

  const openEditModal = (category) => {
    setEditCategoryData(category);
    setForm({
      name: category.name,
      categoryType: category.categoryType,
      questionId: category.questionId || ''
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditCategory = () => {
    if (!form.name || !form.categoryType || !form.questionId) {
      return flash(setEditError, 'Preencha todos os campos.');
    }
    if (/\d/.test(form.categoryType)) {
      return flash(setEditError, 'O tipo não pode conter números.');
    }

    api.put(`/categories/${editCategoryData.id}`, {
      ...form,
      questionId: Number(form.questionId)
    })
      .then(() => {
        fetchCategories();
        fetchTypeOptions(); // refresca sugestões
        setShowEditModal(false);
        resetForm();
      })
      .catch(err => {
        if (err.response?.status === 409) flash(setEditError, 'Já existe uma categoria com esse nome neste estudo.');
        else if (err.response?.status === 400) flash(setEditError, err.response.data?.message || 'Dados inválidos.');
        else flash(setEditError, 'Erro ao atualizar categoria.');
      });
  };

  const resetForm = () => setForm({ name: '', categoryType: '', questionId: '' });

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // pré-visualização (apenas informativa)
  const slugifyPreview = (s) =>
    String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/\d+/g, '') // tira dígitos na preview
      .slice(0, 30);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Categorias</h2>

        {/* datalist global para ambos os modais */}
        <datalist id="category-types">
          {typeOptions.map(t => <option key={t} value={t} />)}
        </datalist>

        <button className={styles.createBtn} onClick={() => { setShowCreateModal(true); setCreateError(''); }}>
          + Nova Categoria
        </button>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <table className={styles.categoryTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo de Categoria</th>
              <th>Pergunta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.categoryType}</td>
                <td>{category.questionName || category.questionId}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => openEditModal(category)} className={styles.editBtn}>Editar</button>
                  <button onClick={() => confirmDeleteCategory(category.id)} className={styles.deleteBtn}>Apagar</button>
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

        {/* Modal Apagar */}
        {categoryToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>
              <p>Queres mesmo apagar esta categoria?</p>
              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleDeleteConfirmed}>Confirmar</button>
                <button className={styles.cancelBtn} onClick={cancelDelete}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Criar */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Criar Nova Categoria</h3>

              {createError && <div className={styles.modalError}>{createError}</div>}

              <div className={styles.modalForm}>
                <label htmlFor="c-name">Nome</label>
                <input
                  id="c-name"
                  type="text"
                  placeholder="Nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />

                <label htmlFor="c-type">Tipo de Categoria</label>
                <input
                  id="c-type"
                  list="category-types"
                  placeholder="Ex.: tematicas, sentimento, opção..."
                  value={form.categoryType}
                  onChange={(e) =>
                    setForm({ ...form, categoryType: e.target.value.replace(/[0-9]/g, '') })
                  }
                  pattern="^[A-Za-zÀ-ÖØ-öø-ÿ _-]{2,30}$"
                  title="Apenas letras, espaços, hífen (-) e underscore (_)."
                />
                {form.categoryType && (
                  <small style={{ color: '#666' }}>
                    Vai ser guardado como: <code>{slugifyPreview(form.categoryType)}</code>
                  </small>
                )}

                <label htmlFor="c-question">Pergunta</label>
                <select
                  id="c-question"
                  value={form.questionId}
                  onChange={(e) => setForm({ ...form, questionId: e.target.value })}
                >
                  <option value="" disabled>Seleciona a pergunta</option>
                  {questions.map(q => <option key={q.id} value={q.id}>{q.question}</option>)}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreateCategory}>Criar</button>
                <button className={styles.cancelBtn} onClick={() => { setShowCreateModal(false); setCreateError(''); resetForm(); }}>
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
              <h3>Editar Categoria</h3>

              {editError && <div className={styles.modalError}>{editError}</div>}

              <div className={styles.modalForm}>
                <label htmlFor="e-name">Nome</label>
                <input
                  id="e-name"
                  type="text"
                  placeholder="Nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <label htmlFor="e-type">Tipo de Categoria</label>
                <input
                  id="e-type"
                  list="category-types"
                  placeholder="Ex.: tematicas, sentimento, alvo..."
                  value={form.categoryType}
                  onChange={(e) =>
                    setForm({ ...form, categoryType: e.target.value.replace(/[0-9]/g, '') })
                  }
                  pattern="^[A-Za-zÀ-ÖØ-öø-ÿ _-]{2,30}$"
                  title="Apenas letras, espaços, hífen (-) e underscore (_)."
                />
                {form.categoryType && (
                  <small style={{ color: '#666' }}>
                    Vai ser guardado como: <code>{slugifyPreview(form.categoryType)}</code>
                  </small>
                )}

                <label htmlFor="e-question">Pergunta</label>
                <select
                  id="e-question"
                  value={form.questionId}
                  onChange={(e) => setForm({ ...form, questionId: e.target.value })}
                >
                  <option value="" disabled>Seleciona a pergunta</option>
                  {questions.map(q => <option key={q.id} value={q.id}>{q.question}</option>)}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEditCategory}>Atualizar</button>
                <button className={styles.cancelBtn} onClick={() => { setShowEditModal(false); setEditError(''); resetForm(); }}>
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

export default CategoriesManagementPage;
