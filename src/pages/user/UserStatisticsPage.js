import React, { useEffect, useState, useRef } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import api from '../../services/api';
import MenuHamburguer from '../../components/MenuHamburguer';
import styles from '../../styles/UserStatisticsPage.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const UserStatisticsPage = () => {
  const [userStats, setUserStats] = useState({ validated: 0, not_validated: 0 });
  const [generalStats, setGeneralStats] = useState([]);
  const [timelineStats, setTimelineStats] = useState([]);
  
  // --- ESTADO PARA EXPANDIR APENAS O GRÁFICO DE BARRAS ---
  const [isBarExpanded, setIsBarExpanded] = useState(false);

  const scrollRef = useRef(null);
  const tooltipText = "Dica: Clica na legenda (cores) para ocultar/mostrar Validadas ou Por Validar.";

  useEffect(() => {
    // Stats Individuais
    api.get('/stats/user')
      .then(res => setUserStats(res.data))
      .catch(err => console.error('Erro stats user:', err));

    // Stats Gerais (Com ordenação: User logado no início)
    api.get('/stats/general')
      .then(res => {
        let data = res.data;
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const userObj = JSON.parse(storedUser);
            const myUsername = userObj.username;

            if (myUsername) {
                const myIndex = data.findIndex(
                    item => item.anonymizedUser.toLowerCase() === myUsername.toLowerCase()
                );
                if (myIndex !== -1) {
                    const [myData] = data.splice(myIndex, 1);
                    data.unshift(myData);
                }
            }
          } catch (e) {
            console.error("Erro ao ordenar gráfico de barras:", e);
          }
        }
        setGeneralStats(data);
      })
      .catch(err => console.error('Erro stats general:', err));

    api.get('/stats/timeline')
      .then(res => setTimelineStats(res.data))
      .catch(err => console.error('Erro stats timeline:', err));
  }, []);


  useEffect(() => {
    const timeout = setTimeout(() => {
      const sidebar = document.querySelector('.css-1wvake5');
      if (sidebar) sidebar.style.position = 'fixed';
    }, 100); 
    return () => {
      clearTimeout(timeout);
      const sidebar = document.querySelector('.css-1wvake5');
      if (sidebar) sidebar.style.position = '';
    };
  }, []);


  // --- DADOS DOS GRÁFICOS ---
  const pieData = {
    labels: ['Validadas', 'Por Validar'],
    datasets: [{
      data: [userStats.validated, userStats.not_validated],
      backgroundColor: ['#36A2EB', '#FF6384'],
      hoverOffset: 4,
    }],
  };

  const barData = {
    labels: generalStats.map(item => item.anonymizedUser),
    datasets: [
      { label: 'Validadas', data: generalStats.map(item => item.validated), backgroundColor: '#36A2EB' },
      { label: 'Por validar', data: generalStats.map(item => item.not_validated), backgroundColor: '#FF6384' },
    ],
  };

 
  const lineData = {
    labels: timelineStats.map(item => item.date), 
    datasets: [
      {
        label: 'Classificações Diárias',
        data: timelineStats.map(item => item.count),
        borderColor: '#FF6384', 
        backgroundColor: 'rgba(255, 99, 132, 0.2)', 
        tension: 0.4, 
        fill: true,   
        pointBackgroundColor: '#FF6384',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#FF6384'
      }
    ]
  };

  const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          intersect: false, 
          mode: 'index',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Nº de Classificações' },
          ticks: {
            stepSize: 1, 
            precision: 0  
          }
        },
        x: {
          title: { display: true, text: 'Data das Classificações' }
        }
      }
    };

    // --- OPÇÕES DO GRÁFICO DE BARRAS (DINÂMICAS + STACKED) ---
    const barOptions = {
        indexAxis: isBarExpanded ? 'y' : 'x', 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { position: 'top' } 
        },
        scales: {
            // Eixo X
            x: { 
                stacked: true, // <--- ADICIONADO: Empilha as barras
                ticks: { 
                    autoSkip: false, 
                    maxRotation: isBarExpanded ? 0 : 45, 
                    minRotation: isBarExpanded ? 0 : 45 
                },
                
                ...(isBarExpanded && {
                    title: { display: true, text: 'Nº de Classificações' },
                    ticks: { stepSize: 1, precision: 0 }
                })
            },
            // Eixo Y
            y: {
                stacked: true, // <--- ADICIONADO: Empilha as barras
                beginAtZero: true,
                
                ...(!isBarExpanded && {
                    title: { display: true, text: 'Nº de Classificações' },
                    ticks: { stepSize: 1, precision: 0 }
                })
            }
        },
    };

  return (
    <div className={styles.container}>
      <MenuHamburguer />

      <div className={styles.content}>
        <h1>Estatísticas de Classificação</h1>

        <section className={styles.chartContainer}>
          
          {/* GRÁFICO 1: PIE CHART */}
          <div className={styles.chartSection}>
            <div className={styles.chartTitleWrapper}>
              <h2>As tuas classificações</h2>
              <span className={styles.infoIcon} data-tooltip={tooltipText}>?</span>
            </div>
            <div className={styles.pieChart}>
              <Pie data={pieData} />
            </div>
          </div>

          {/* GRÁFICO 2: GRÁFICO DE LINHAS (INTOCADO) */}
          <div className={styles.chartSection}>
            <div className={styles.chartTitleWrapper}>
              <h2>Evolução Diária</h2>
              <span className={styles.infoIcon} data-tooltip="Mostra quantas classificações fizeste em cada dia.">?</span>
            </div>
            <div className={styles.barChart}> 
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* GRÁFICO 3: GRÁFICO DE BARRAS (STACKED) */}
          <div className={`${styles.chartSection} ${isBarExpanded ? styles.expandedChart : ''}`}>
            <div className={styles.chartTitleWrapper}>
              <h2>Classificações Gerais</h2>
              <span className={styles.infoIcon} data-tooltip={tooltipText}>?</span>
              
              {/* BOTÃO PARA EXPANDIR */}
              <button 
                className={styles.expandBtn}
                onClick={() => setIsBarExpanded(!isBarExpanded)}
              >
                {isBarExpanded ? '✕' : '⤢'}
              </button>
            </div>
            
            <div className={styles.chartScrollWrapper} ref={scrollRef}>
              <div
                className={styles.barChart}
                
                style={isBarExpanded ? { width: '100%', height: '100%' } : { minWidth: `${Math.max(generalStats.length, 7) * 100}px` }}
              >
                <Bar
                  data={barData}
                  options={barOptions} 
                  
                />
              </div>
            </div>
          </div>

        </section>
      </div>

      {/* Fundo preto atrás quando expandido */}
      {isBarExpanded && (
        <div 
            className={styles.overlayBackdrop} 
            onClick={() => setIsBarExpanded(false)}
        ></div>
      )}
    </div>
  );
};


export default UserStatisticsPage;
