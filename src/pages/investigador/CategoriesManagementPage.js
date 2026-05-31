import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/CategoriesManagementPage.module.css';

const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState('');
  const [categoriesInfo, setCategoriesInfo] = useState('');
  const [questionsInfo, setQuestionsInfo] = useState('');

  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const createErrTimer = useRef(null);
  const editErrTimer = useRef(null);
  const deleteErrTimer = useRef(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState(null);

  const [form, setForm] = useState({
    name: '',
    categoryType: '',
    questionId: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
    fetchTypeOptions();

    return () => {
      [createErrTimer, editErrTimer, deleteErrTimer].forEach((ref) => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      });
    };
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [categories.length, currentPage]);

  const setTimedError = (setter, timerRef, msg) => {
    setter(msg);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setter(''), 3000);
  };

  const resetForm = () => {
    setForm({
      name: '',
      categoryType: '',
      questionId: ''
    });
  };

  const fetchCategories = async () => {
    const username = localStorage.getItem('username');

    if (!username) {
      setCategories([]);
      setCategoriesInfo('');
      setPageError('Erro ao carregar categorias.');
      return;
    }

    try {
      setIsLoadingCategories(true);
      setPageError('');
      setCategoriesInfo('');

      const res = await api.get(`/categories?username=${encodeURIComponent(username)}`);

      setCategories(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);

      if (Array.isArray(res.data) && res.data.length === 0) {
        setCategoriesInfo('Ainda não existem categorias criadas.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCategories([]);
        setCurrentPage(1);
        setCategoriesInfo('Ainda não existem categorias criadas.');
        return;
      }

      setCategories([]);
      setCategoriesInfo('');
      setPageError('Erro ao carregar categorias.');
    } finally {
      setIsLoadingCategories(false);
    }
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

      if (Array.isArray(res.data) && res.data.length === 0) {
        setQuestionsInfo('Ainda não existem perguntas criadas. Cria uma pergunta antes de criares categorias.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setQuestions([]);
        setQuestionsInfo('Ainda não existem perguntas criadas. Cria uma pergunta antes de criares categorias.');
        return;
      }

      setQuestions([]);
      setQuestionsInfo('');
      setPageError('Erro ao carregar perguntas.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const fetchTypeOptions = async () => {
    const username = localStorage.getItem('username');

    if (!username) {
      setTypeOptions([]);
      return;
    }

    try {
      const res = await api.get(`/categories/types?username=${encodeURIComponent(username)}`);
      setTypeOptions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTypeOptions([]);
    }
  };

  const slugifyPreview = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/\d+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);

  const openCreateModal = () => {
    if (questions.length === 0) {
      setQuestionsInfo('Ainda não existem perguntas criadas. Cria uma pergunta antes de criares categorias.');
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

  const handleCreateCategory = async () => {
    if (!form.name.trim() || !form.categoryType.trim() || !form.questionId) {
      return setTimedError(setCreateError, createErrTimer, 'Preenche todos os campos.');
    }

    if (/\d/.test(form.categoryType)) {
      return setTimedError(setCreateError, createErrTimer, 'O tipo não pode conter números.');
    }

    try {
      await api.post('/categories', {
        name: form.name.trim(),
        categoryType: form.categoryType.trim(),
        questionId: Number(form.questionId)
      });

      await fetchCategories();
      await fetchTypeOptions();

      closeCreateModal();
    } catch (err) {
      if (err.response?.status === 409) {
        setTimedError(setCreateError, createErrTimer, 'Já existe uma categoria com esse nome neste estudo.');
      } else if (err.response?.status === 404) {
        setTimedError(setCreateError, createErrTimer, 'Pergunta não encontrada.');
      } else if (err.response?.status === 400) {
        setTimedError(setCreateError, createErrTimer, err.response?.data?.message || 'Dados inválidos.');
      } else {
        setTimedError(setCreateError, createErrTimer, 'Erro ao criar categoria.');
      }
    }
  };

  const confirmDeleteCategory = (categoryId) => {
    setDeleteError('');
    setCategoryToDelete(categoryId);
  };

  const handleDeleteConfirmed = async () => {
    if (categoryToDelete === null || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError('');

      await api.delete(`/categories/${categoryToDelete}`);

      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryToDelete)
      );

      setCategoryToDelete(null);

      await fetchCategories();
      await fetchTypeOptions();
    } catch (err) {
      if (err.response?.status === 404) {
        setCategories((currentCategories) =>
          currentCategories.filter((category) => category.id !== categoryToDelete)
        );

        setCategoryToDelete(null);

        await fetchCategories();
        await fetchTypeOptions();
        return;
      }

      if (err.response?.status === 409) {
        return setTimedError(
          setDeleteError,
          deleteErrTimer,
          err.response?.data?.message ||
            'Não é possível apagar esta categoria porque existem dados associados.'
        );
      }

      setTimedError(setDeleteError, deleteErrTimer, 'Erro ao apagar categoria.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;

    setDeleteError('');
    setCategoryToDelete(null);
  };

  const openEditModal = (category) => {
    setEditCategoryData(category);

    setForm({
      name: category.name || '',
      categoryType: category.categoryType || '',
      questionId: category.questionId || ''
    });

    setEditError('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
    setEditCategoryData(null);
    resetForm();
  };

  const handleEditCategory = async () => {
    if (!form.name.trim() || !form.categoryType.trim() || !form.questionId) {
      return setTimedError(setEditError, editErrTimer, 'Preenche todos os campos.');
    }

    if (/\d/.test(form.categoryType)) {
      return setTimedError(setEditError, editErrTimer, 'O tipo não pode conter números.');
    }

    try {
      await api.put(`/categories/${editCategoryData.id}`, {
        name: form.name.trim(),
        categoryType: form.categoryType.trim(),
        questionId: Number(form.questionId)
      });

      await fetchCategories();
      await fetchTypeOptions();

      closeEditModal();
    } catch (err) {
      if (err.response?.status === 409) {
        setTimedError(setEditError, editErrTimer, 'Já existe uma categoria com esse nome neste estudo.');
      } else if (err.response?.status === 404) {
        setTimedError(setEditError, editErrTimer, 'Categoria ou pergunta não encontrada.');
      } else if (err.response?.status === 400) {
        setTimedError(setEditError, editErrTimer, err.response?.data?.message || 'Dados inválidos.');
      } else {
        setTimedError(setEditError, editErrTimer, 'Erro ao atualizar categoria.');
      }
    }
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isLoading = isLoadingCategories || isLoadingQuestions;
  const canCreateCategory = questions.length > 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <MenuHamburguer />

      <div className={styles.pageContainer}>
        <h2>Gestão de Categorias</h2>

        <datalist id="category-types">
          {typeOptions.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>

        <button
          className={styles.createBtn}
          onClick={openCreateModal}
          disabled={!canCreateCategory || isLoadingQuestions}
          title={
            !canCreateCategory
              ? 'Cria primeiro uma pergunta antes de criares categorias.'
              : 'Criar nova categoria'
          }
        >
          + Nova Categoria
        </button>

        {pageError && <p className={styles.errorMessage}>{pageError}</p>}

        {!pageError && isLoading && (
          <p className={styles.infoMessage}>A carregar dados...</p>
        )}

        {!pageError && !isLoading && questionsInfo && (
          <p className={styles.infoMessage}>{questionsInfo}</p>
        )}

        {!pageError && !isLoading && !questionsInfo && categoriesInfo && (
          <p className={styles.infoMessage}>{categoriesInfo}</p>
        )}

        {!isLoading && !pageError && categories.length > 0 && (
          <>
            <div className={styles.tableWrapper}>
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
                  {paginatedCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.categoryType}</td>
                      <td>{category.questionName || category.questionId}</td>
                      <td className={styles.actionsCell}>
                        <button
                          onClick={() => openEditModal(category)}
                          className={styles.editBtn}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => confirmDeleteCategory(category.id)}
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
                  onClick={() => setCurrentPage(i + 1)}
                  className={i + 1 === currentPage ? styles.activePage : ''}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {categoryToDelete !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar eliminação</h3>

              {deleteError && <div className={styles.modalError}>{deleteError}</div>}

              <p>Queres mesmo apagar esta categoria?</p>

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
                  placeholder="Ex.: tematicas, sentimento, alvo..."
                  value={form.categoryType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoryType: e.target.value.replace(/[0-9]/g, '')
                    })
                  }
                  pattern="^[A-Za-zÀ-ÖØ-öø-ÿ _-]{2,30}$"
                  title="Apenas letras, espaços, hífen (-) e underscore (_)."
                />

                {form.categoryType && (
                  <small className={styles.previewText}>
                    Vai ser guardado como: <code>{slugifyPreview(form.categoryType)}</code>
                  </small>
                )}

                <label htmlFor="c-question">Pergunta</label>
                <select
                  id="c-question"
                  value={form.questionId}
                  onChange={(e) => setForm({ ...form, questionId: e.target.value })}
                >
                  <option value="" disabled>
                    Seleciona a pergunta
                  </option>

                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.question}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleCreateCategory}>
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
                    setForm({
                      ...form,
                      categoryType: e.target.value.replace(/[0-9]/g, '')
                    })
                  }
                  pattern="^[A-Za-zÀ-ÖØ-öø-ÿ _-]{2,30}$"
                  title="Apenas letras, espaços, hífen (-) e underscore (_)."
                />

                {form.categoryType && (
                  <small className={styles.previewText}>
                    Vai ser guardado como: <code>{slugifyPreview(form.categoryType)}</code>
                  </small>
                )}

                <label htmlFor="e-question">Pergunta</label>
                <select
                  id="e-question"
                  value={form.questionId}
                  onChange={(e) => setForm({ ...form, questionId: e.target.value })}
                >
                  <option value="" disabled>
                    Seleciona a pergunta
                  </option>

                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.question}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmBtn} onClick={handleEditCategory}>
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

export default CategoriesManagementPage;