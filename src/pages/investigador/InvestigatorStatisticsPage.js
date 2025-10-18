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
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get('/stats/general')
      .then(res => setGeneralStats(res.data))
      .catch(err => console.error('Erro ao buscar estatísticas gerais:', err));
  }, []);

  const searchedIndex = generalStats.findIndex(item =>
    item.anonymizedUser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (scrollRef.current && searchedIndex >= 0) {
      const scrollTo = searchedIndex * 100 - scrollRef.current.clientWidth / 2 + 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [searchedIndex]);

  const barData = {
    labels: generalStats.map(item => item.anonymizedUser),
    datasets: [
      {
        label: 'Validadas',
        data: generalStats.map(item => item.validated),
        backgroundColor: generalStats.map((_, index) =>
          index === searchedIndex ? '#0056b3' : '#36A2EB'
        ),
      },
      {
        label: 'Por validar',
        data: generalStats.map(item => item.not_validated),
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
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 14, weight: 'bold' },
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <MenuHamburguer />
      <div className={styles.content}>
        <h1>Estatísticas de Classificação</h1>

        <div className={styles.controls}>
          <label htmlFor="search">
            <span role="img" aria-label="search">🔍</span> Pesquisar por nome:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Pesquisar por nome do utilizador"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

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
      </div>
    </div>
  );
};

export default InvestigatorStatisticsPage;
