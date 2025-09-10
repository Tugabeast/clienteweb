import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/GroupsManagementPage.module.css';

const GroupsManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [studies, setStudies] = useState([]);
  const [selectedStudyId, setSelectedStudyId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [associations, setAssociations] = useState([]);
  const [editingAssociation, setEditingAssociation] = useState(null); // { userId, oldStudyId }
  const [newStudyForEdit, setNewStudyForEdit] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const associationsPerPage = 10;

  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchUsers();
    fetchStudies();
  }, []);

  useEffect(() => {
    if (studies.length > 0) fetchAllAssociations();
  }, [studies]);

  const fetchUsers = () => {
    api.get('/users')
      .then(res => setUsers(res.data.filter(u => u.type === 'user')))
      .catch(err => console.error('Erro ao buscar utilizadores:', err));
  };

  const fetchStudies = () => {
    api.get(`/studies?username=${username}`)
      .then(res => setStudies(res.data))
      .catch(err => console.error('Erro ao buscar estudos:', err));
  };

  const fetchAllAssociations = async () => {
    try {
      const userList = await api.get('/users');
      const allAssociations = [];

      for (const user of userList.data) {
        const response = await api.get(`/users/${user.id}/studies`);
        response.data.forEach(study => {
          allAssociations.push({
            userId: user.id,
            username: user.username,
            studyId: study.id,
            studyName: study.name
          });
        });
      }

      setAssociations(allAssociations);
    } catch (error) {
      console.error('Erro ao buscar associações:', error);
    }
  };

  const handleAssociate = () => {
    if (!selectedUserId || !selectedStudyId) {
      alert('Seleciona um utilizador e um estudo.');
      return;
    }

    api.post(`/users/${selectedUserId}/studies`, { studyId: selectedStudyId })
      .then(() => {
        alert('Utilizador associado com sucesso!');
        fetchAllAssociations();
      })
      .catch(err => {
        if (err.response?.status === 409) {
          alert('Esta associação já existe.');
        } else {
          alert('Erro ao associar utilizador.');
        }
        console.error('Erro:', err);
      });
  };

  const handleEdit = (userId, oldStudyId) => {
    setEditingAssociation({ userId, oldStudyId });
    setNewStudyForEdit('');
  };

  const confirmEdit = () => {
    const { userId, oldStudyId } = editingAssociation;

    if (!newStudyForEdit || isNaN(newStudyForEdit)) return;

    api.delete(`/users/${userId}/studies/${oldStudyId}`)
      .then(() => api.post(`/users/${userId}/studies`, { studyId: newStudyForEdit }))
      .then(() => {
        alert('Estudo alterado com sucesso.');
        setEditingAssociation(null);
        fetchAllAssociations();
      })
      .catch(err => {
        console.error('Erro ao editar associação:', err);
        alert('Erro ao editar associação.');
      });
  };

  const handleRemove = (userId, studyId) => {
    if (!window.confirm('Tens a certeza que queres remover esta associação?')) return;

    api.delete(`/users/${userId}/studies/${studyId}`)
      .then(() => {
        alert('Associação removida.');
        fetchAllAssociations();
      })
      .catch(err => {
        console.error('Erro ao remover associação:', err);
        alert('Erro ao remover associação.');
      });
  };

  // Paginação
  const indexOfLastAssociation = currentPage * associationsPerPage;
  const indexOfFirstAssociation = indexOfLastAssociation - associationsPerPage;
  const filteredAssociations = associations.filter(a => studies.some(s => s.id === a.studyId));
  const currentAssociations = filteredAssociations.slice(indexOfFirstAssociation, indexOfLastAssociation);
  const totalPages = Math.ceil(filteredAssociations.length / associationsPerPage);

  return (
    <div className={styles.container}>
      <MenuHamburguer />
      <div className={styles.content}>
        <h2>Associação de Utilizadores a Estudos</h2>

        <div className={styles.controls}>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
            <option value="" disabled>Seleciona um utilizador</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>

          <select value={selectedStudyId} onChange={e => setSelectedStudyId(e.target.value)}>
            <option value="" disabled>Seleciona um estudo</option>
            {studies.map(study => (
              <option key={study.id} value={study.id}>
                {study.name}
              </option>
            ))}
          </select>

          <button onClick={handleAssociate}>Associar</button>
        </div>

        <h3>Associações Existentes</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Estudo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentAssociations.map(a => (
              <tr key={`${a.userId}-${a.studyId}`}>
                <td>{a.username}</td>
                <td>{a.studyName}</td>
                <td>
                  <button onClick={() => handleEdit(a.userId, a.studyId)}>Editar</button>
                  <button onClick={() => handleRemove(a.userId, a.studyId)}>Remover</button>
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
      </div>

      {editingAssociation && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Editar Estudo</h3>
            <select value={newStudyForEdit} onChange={e => setNewStudyForEdit(e.target.value)}>
              <option value="" disabled>Seleciona novo estudo</option>
              {studies.map(study => (
                <option key={study.id} value={study.id}>
                  {study.name}
                </option>
              ))}
            </select>
            <div className={styles.modalActions}>
              <button onClick={confirmEdit}>Confirmar</button>
              <button onClick={() => setEditingAssociation(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagementPage;