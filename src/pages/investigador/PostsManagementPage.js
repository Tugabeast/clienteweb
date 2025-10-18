import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/PostsManagementPage.module.css';

const PostsManagementPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedPosts, setParsedPosts] = useState([]);
  const [studyId, setStudyId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [studies, setStudies] = useState([]);
  const [selectedStudyFilter, setSelectedStudyFilter] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);

  const postsPerPage = 7;

  useEffect(() => {
    fetchPosts();
    fetchStudies();
  }, []);

  const fetchPosts = () => {
    api.get(`/posts/investigador`)
      .then((res) => {
        setPosts(res.data.posts);
      })
      .catch((err) => {
        console.error('Erro ao buscar posts:', err);
      });
  };

  const fetchStudies = () => {
    const username = localStorage.getItem('username');
    if (!username) return;

    api.get(`/studies?username=${username}`)
      .then(res => setStudies(res.data))
      .catch(err => console.error('Erro ao buscar estudos:', err));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        setParsedPosts(json);
      } catch {
        alert('Erro ao ler ficheiro JSON.');
      }
    }
  };

  const handleImportJSON = async () => {
    if (!parsedPosts.length || !studyId) {
      alert('Seleciona um ficheiro JSON válido e um estudo.');
      return;
    }

    setIsImporting(true);
    try {
      await api.post('/posts', { posts: parsedPosts, studyId });
      alert('Importação concluída com sucesso.');
      setSelectedFile(null);
      setParsedPosts([]);
      setStudyId('');
      fetchPosts();
    } catch (err) {
      console.error('Erro ao importar JSON:', err);
      alert('Erro ao importar o ficheiro JSON.');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.pageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStudy = selectedStudyFilter ? post.studyId === parseInt(selectedStudyFilter) : true;
    return matchesSearch && matchesStudy;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <MenuHamburguer />
      <div className={styles.pageContainer}>
        <h2>Gestão de Publicações</h2>

        <div className={styles.actionsBar}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>📂 Escolhe o ficheiro JSON:</label>
            <input type="file" accept="application/json" onChange={handleFileChange} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>🧪 Seleciona o estudo ao qual associar os posts:</label>
            <select value={studyId} onChange={(e) => setStudyId(e.target.value)}>
              <option value="" disabled>Seleciona um estudo</option>
              {studies.map(study => (
                <option key={study.id} value={study.id}>{study.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>📤 Importar os dados do ficheiro:</label>
            <button className={styles.importBtn} onClick={handleImportJSON} disabled={isImporting}>
              {isImporting ? 'A importar...' : 'Importar JSON'}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>🔍 Pesquisar por nome ou conteúdo:</label>
            <input
              type="text"
              placeholder="Pesquisar por nome ou detalhes"
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>🗂️ Filtrar por estudo (posts já importados):</label>
            <select
              value={selectedStudyFilter}
              onChange={(e) => setSelectedStudyFilter(e.target.value)}
              className={styles.studyFilter}
            >
              <option value="">Todos os estudos</option>
              {studies.map(study => (
                <option key={study.id} value={study.id}>{study.name}</option>
              ))}
            </select>
          </div>
        </div>

        <table className={styles.postsTable}>
          <thead>
            <tr>
              <th>Nome da Página</th>
              <th>Detalhes</th>
              <th>Likes</th>
              <th>Comentários</th>
              <th>Partilhas</th>
              <th>Estudo</th>
              <th>Imagem</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.map(post => (
              <tr key={post.id}>
                <td>{post.pageName}</td>
                <td>{post.details}</td>
                <td>{post.likesCount}</td>
                <td>{post.commentsCount}</td>
                <td>{post.sharesCount}</td>
                <td>{studies.find(s => s.id === post.studyId)?.name || `ID: ${post.studyId}`}</td>
                <td>
                  {post.images?.length > 0 ? (
                    <img
                      src={`data:image/jpeg;base64,${post.images[0].image_data}`}
                      alt="Post"
                      className={styles.thumbnail}
                      onClick={() => setExpandedImage(post.images[0].image_data)}
                    />
                  ) : 'Sem imagem'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← prev
          </button>

          {currentPage > 2 && (
            <>
              <button onClick={() => setCurrentPage(1)}>1</button>
              {currentPage > 3 && <span>...</span>}
            </>
          )}

          {currentPage > 1 && (
            <button onClick={() => setCurrentPage(currentPage - 1)}>
              {currentPage - 1}
            </button>
          )}

          <button className={styles.activePage}>{currentPage}</button>

          {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(currentPage + 1)}>
              {currentPage + 1}
            </button>
          )}

          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && <span>...</span>}
              <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            next →
          </button>

          <span style={{ marginLeft: '10px' }}>
            {currentPage} - {totalPages}
          </span>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= totalPages) {
                setCurrentPage(value);
              }
            }}
            style={{ width: '40px', marginLeft: '10px' }}
          />

          <button onClick={() => setCurrentPage(currentPage)}>Go</button>
        </div>

        {expandedImage && (
          <div className={styles.modalOverlay} onClick={() => setExpandedImage(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <img
                src={`data:image/jpeg;base64,${expandedImage}`}
                alt="Imagem expandida"
                className={styles.expandedImage}
              />
              <button className={styles.closeButton} onClick={() => setExpandedImage(null)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsManagementPage;
