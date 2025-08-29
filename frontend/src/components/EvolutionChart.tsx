// src/components/EvolutionChart.tsx
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import * as api from '../services/api';
import { type EvolutionDataPoint } from '../types';

// Registra os componentes necessários do Chart.js, incluindo o 'Filler' para a área preenchida.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Função para formatar a data para o padrão brasileiro (DD/MM)
const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  // Adiciona 1 dia para corrigir problemas de fuso horário que podem fazer a data "voltar" um dia
  date.setDate(date.getDate() + 1); 
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};

const EvolutionChart = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    api.getEvolutionData().then((data: EvolutionDataPoint[]) => {
      // Agora os labels são as datas formatadas
      const labels = data.map(p => formatDateLabel(p.date));
      const profitData = data.map(p => p.cumulative_profit);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Lucro Acumulado (R$)',
            data: profitData,
            borderColor: 'rgb(34, 116, 165)',
            backgroundColor: 'rgba(34, 116, 165, 0.2)', // Cor da área sob a linha
            fill: true,
            tension: 0.1,
          },
        ],
      });
    });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Evolução da Banca (Lucro Acumulado por Dia)' },
    },
    scales: {
        y: {
            ticks: {
                // Adiciona "R$" aos valores do eixo Y
                callback: function(value: any) {
                    return 'R$ ' + value.toFixed(2);
                }
            }
        }
    }
  };

  if (!chartData) {
    return <p>Carregando gráfico de evolução...</p>;
  }

  return <Line options={options} data={chartData} />;
};

export default EvolutionChart;