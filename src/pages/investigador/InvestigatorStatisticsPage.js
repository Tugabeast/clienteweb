import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/InvestigatorStatisticsPage.module.css';

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const InvestigatorStatisticsPage = () => {
  const [generalStats, setGeneralStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [statsInfo, setStatsInfo] = useState('');

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchGeneralStats();
  }, []);

  const fetchGeneralStats = async () => {
    try {
      setIsLoading(true);
      setStatsError('');
      setStatsInfo('');
      setGeneralStats([]);

      const res = await api.get('/stats/general');

      const data = Array.isArray(res.data) ? res.data : [];

      if (data.length === 0) {
        setGeneralStats([]);
        setStatsInfo('Ainda não existem estatísticas para os seus estudos.');
        return;
      }

      setGeneralStats(data);
    } catch (err) {
      setGeneralStats([]);

      if (err.response?.status === 404) {
        setStatsError('');
        setStatsInfo('Ainda não existem estatísticas para os seus estudos.');
        return;
      }

      setStatsInfo('');
      setStatsError('Erro ao carregar estatísticas.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchedIndex =
    searchTerm.trim() !== ''
      ? generalStats.findIndex((item) =>
          item.anonymizedUser.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : -1;

  useEffect(() => {
    if (scrollRef.current && searchedIndex >= 0 && searchTerm.trim() !== '') {
      const scrollTo = searchedIndex * 100 - scrollRef.current.clientWidth / 2 + 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [searchedIndex, searchTerm]);

  const barData = {
    labels: generalStats.map((item) => item.anonymizedUser),
    datasets: [
      {
        label: 'Validadas',
        data: generalStats.map((item) => Number(item.validated) || 0),
        backgroundColor: generalStats.map((_, index) =>
          index === searchedIndex ? '#0056b3' : '#36A2EB'
        ),
      },
      {
        label: 'Por validar',
        data: generalStats.map((item) => Number(item.not_validated) || 0),
        backgroundColor: generalStats.map((_, index) =>
          index === searchedIndex ? '#b3004b' : '#FF6384'
        ),
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 14, weight: 'bold' },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nº de Classificações',
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <MenuHamburguer />

      <div className={styles.content}>
        <h1>Estatísticas de Classificação</h1>

        {statsError && <p className={styles.errorMessage}>{statsError}</p>}

        {!statsError && isLoading && (
          <p className={styles.infoMessage}>A carregar estatísticas...</p>
        )}

        {!statsError && !isLoading && statsInfo && (
          <p className={styles.infoMessage}>{statsInfo}</p>
        )}

        {!isLoading && !statsError && generalStats.length > 0 && (
          <>
            <div className={styles.controls}>
              <label htmlFor="search">
                <span role="img" aria-label="search">🔍</span> Pesquisar por nome:
              </label>

              <input
                id="search"
                type="text"
                placeholder="Pesquisar por nome do utilizador"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm.trim() !== '' && searchedIndex === -1 && (
              <p className={styles.infoMessage}>
                Nenhum utilizador encontrado com esse nome.
              </p>
            )}

            <div className={styles.chartContainer}>
              <h2 style={{ textAlign: 'center' }}>Classificações Gerais</h2>

              <div className={styles.chartScrollWrapper} ref={scrollRef}>
                <div
                  className={styles.barChart}
                  style={{ minWidth: `${Math.max(generalStats.length, 7) * 100}px` }}
                >
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvestigatorStatisticsPage;