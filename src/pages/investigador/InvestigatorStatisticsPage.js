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

  // Lógica de pesquisa para scroll automático
  const searchedIndex = generalStats.findIndex(item =>
    item.anonymizedUser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (scrollRef.current && searchedIndex >= 0 && searchTerm !== '') {
      // 100 é a largura estimada da barra + margem
      const scrollTo = searchedIndex * 100 - scrollRef.current.clientWidth / 2 + 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [searchedIndex, searchTerm]);

  // --- DADOS DO GRÁFICO ---
  const barData = {
    labels: generalStats.map(item => item.anonymizedUser),
    datasets: [
      {
        label: 'Validadas',
        data: generalStats.map(item => item.validated),
        // Mantém a lógica de destacar a cor se for o utilizador pesquisado
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

  // --- OPÇÕES ATUALIZADAS PARA STACKED ---
  const chartOptions = {
    indexAxis: 'x', // Barras verticais
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
      // Tooltip unificado para mostrar ambos os valores ao passar o rato
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true, // <--- ISTO EMPILHA AS BARRAS NO EIXO X
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 14, weight: 'bold' },
        },
      },
      y: {
        stacked: true, // <--- ISTO EMPILHA AS BARRAS NO EIXO Y (Soma os valores)
        beginAtZero: true,
        title: {
            display: true,
            text: 'Nº de Classificações'
        }
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
              // Largura dinâmica para permitir scroll horizontal se houver muitos users
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