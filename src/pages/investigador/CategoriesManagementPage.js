import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/CategoriesManagementPage.module.css';

const CategoriesManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [form, setForm] = useState({
        name: '',
        categoryType: '',
        questionId: ''
    });
    const [editCategoryData, setEditCategoryData] = useState(null);
    const addedBy = localStorage.getItem('username');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCategories();
        fetchQuestions();
    }, []);

    const fetchCategories = () => {
        const username = localStorage.getItem('username');
        api.get(`/categories?username=${username}`)
            .then((res) => setCategories(res.data))
            .catch(() => setError('Erro ao carregar categorias.'));
    };

    const fetchQuestions = () => {
        const username = localStorage.getItem('username');
        api.get(`/questions?username=${username}`)
            .then((res) => setQuestions(res.data))
            .catch(() => setError('Erro ao carregar perguntas.'));
    };

    const handleCreateCategory = () => {
        if (!form.name || !form.categoryType || !form.questionId) {
            setError('Preenche todos os campos.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        api.post('/categories', {
            ...form,
            questionId: Number(form.questionId),
        })
            .then(() => {
                fetchCategories();
                setShowCreateModal(false);
                resetForm();
            })
            .catch((err) => {
                if (err.response && err.response.status === 409) {
                    setError('Essa categoria já existe.');
                } else {
                    setError('Erro ao criar categoria.');
                }
                setTimeout(() => setError(''), 3000);
            });
    };

    const confirmDeleteCategory = (categoryId) => {
        setCategoryToDelete(categoryId);
    };

    const handleDeleteConfirmed = () => {
        api.delete(`/categories/${categoryToDelete}`)
            .then(() => {
                fetchCategories();
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
        setShowEditModal(true);
    };

    const handleEditCategory = () => {
        if (!form.name || !form.categoryType || !form.questionId) {
            setError('Preenche todos os campos.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        api.put(`/categories/${editCategoryData.id}`, {
            ...form,
            questionId: Number(form.questionId),
            updatedBy: addedBy
        })
            .then(() => {
                fetchCategories();
                setShowEditModal(false);
                resetForm();
            })
            .catch(() => {
                setError('Erro ao atualizar categoria.');
                setTimeout(() => setError(''), 3000);
            });
    };

    const resetForm = () => {
        setForm({ name: '', categoryType: '', questionId: '' });
    };

    const totalPages = Math.ceil(categories.length / itemsPerPage);
    const paginatedCategories = categories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <MenuHamburguer />
            <div className={styles.pageContainer}>
                <h2>Gestão de Categorias</h2>
                <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                    + Nova Categoria
                </button>
                {error && <p className={styles.errorMessage}>{error}</p>}

                <table className={styles.categoryTable}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
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

                {showCreateModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>Criar Nova Categoria</h3>
                            <div className={styles.modalForm}>
                                <input
                                    type="text"
                                    placeholder="Nome"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                                <select
                                    value={form.categoryType}
                                    onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Seleciona o tipo</option>
                                    <option value="tematicas">Temáticas</option>
                                    <option value="sentimento">Sentimento</option>
                                </select>
                                <select
                                    value={form.questionId}
                                    onChange={(e) => setForm({ ...form, questionId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Seleciona a pergunta</option>
                                    {questions.map((question) => (
                                        <option key={question.id} value={question.id}>
                                            {question.question}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.confirmBtn} onClick={handleCreateCategory}>Criar</button>
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
                            <h3>Editar Categoria</h3>
                            <div className={styles.modalForm}>
                                <input
                                    type="text"
                                    placeholder="Nome"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                <select
                                    value={form.categoryType}
                                    onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
                                >
                                    <option value="tematicas">Temáticas</option>
                                    <option value="sentimento">Sentimento</option>
                                </select>
                                <select
                                    value={form.questionId}
                                    onChange={(e) => setForm({ ...form, questionId: e.target.value })}
                                >
                                    <option value="" disabled>Seleciona a pergunta</option>
                                    {questions.map((question) => (
                                        <option key={question.id} value={question.id}>
                                            {question.question}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.confirmBtn} onClick={handleEditCategory}>Atualizar</button>
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

export default CategoriesManagementPage;
