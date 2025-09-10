import React, { useEffect, useState, useRef } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/UserStatisticsPage.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const UserStatisticsPage = () => {
  const [userStats, setUserStats] = useState({ validated: 0, not_validated: 0 });
  const [generalStats, setGeneralStats] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get('/stats/user')
      .then(res => setUserStats(res.data))
      .catch(err => console.error('Erro ao buscar stats individuais:', err));

    api.get('/stats/general')
      .then(res => setGeneralStats(res.data))
      .catch(err => console.error('Erro ao buscar stats gerais:', err));
  }, []);

  const pieData = {
    labels: ['Validadas', 'Por Validar'],
    datasets: [
      {
        data: [userStats.validated, userStats.not_validated],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverOffset: 4,
      },
    ],
  };

  const barData = {
    labels: generalStats.map(item => item.anonymizedUser),
    datasets: [
      {
        label: 'Validadas',
        data: generalStats.map(item => item.validated),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Por validar',
        data: generalStats.map(item => item.not_validated),
        backgroundColor: '#FF6384',
      },
    ],
  };

  return (
    <div className={styles.container}>
      <MenuHamburguer />

      <div className={styles.content}>
        <h1>Estatísticas de Classificação</h1>

        <div className={styles.chartContainer}>
          <div className={styles.chartSection}>
            <h2>As tuas classificações</h2>
            <div className={styles.pieChart}>
              <Pie data={pieData} />
            </div>
          </div>

          <div className={styles.chartSection}>
            <h2>Classificações Gerais</h2>
            <div className={styles.chartScrollWrapper} ref={scrollRef}>
              <div
                className={styles.barChart}
                style={{ minWidth: `${Math.max(generalStats.length, 7) * 100}px` }}
              >
                <Bar
                  data={barData}
                  options={{
                    indexAxis: 'x',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                    },
                    scales: {
                      x: {
                        ticks: {
                          autoSkip: false,
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                  }}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsPage;
