/* chart.js - Corrigido, Restaurado e com Travamento de Tamanho */

const COLOR_YELLOW = "#ffcc00";
const COLOR_BLACK = "#0c0c0c";

const categories = [
  'Acessibilidade','Ciclismo','Comércio e Fiscalização','Corrupção e Má Gestão',
  'Drenagem','Educação','Habitação','Infraestrutura','Limpeza Urbana e Lixo',
  'Meio Ambiente','Obras','Redes Elétricas/Luz','Saúde Pública','Segurança',
  'Transporte','Outros'
];
const complaintData = [12,5,7,8,15,10,9,6,4,5,8,6,14,7,5,2];
const resolvedData  = [45,18,25,30,55,35,32,22,15,18,28,22,50,25,20,5];
const monthlyData = [55,60,72,65,80,75,95,120,110,105,130,140];

const backgroundColors = categories.map((_, i) => `hsl(${Math.round(i*360/categories.length)},78%,62%)`);

function isMobile() { return window.innerWidth <= 768; }

/* CONFIGURAÇÃO PARA NÃO CRESCER */
function baseOptions() {
  return {
    maintainAspectRatio: false, /* ESSENCIAL */
    responsive: true,
    plugins: {
      legend: {
        display: !isMobile(), /* Esconde legenda no celular */
        position: 'right',
        labels: { boxWidth: 12, padding: 10 }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    }
  };
}

let pieChart = null;
let barChart = null;
let lineChart = null;

function initAllCharts() {
  // Limpeza
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  // 1. PIZZA
  const pieCtx = document.getElementById('pieChart');
  if (pieCtx) {
      pieChart = new Chart(pieCtx.getContext('2d'), {
        type: 'pie',
        data: { labels: categories, datasets: [{ data: complaintData, backgroundColor: backgroundColors, borderWidth: 1 }] },
        options: baseOptions()
      });
  }

  // 2. BARRAS
  const barCtx = document.getElementById('barChart');
  if (barCtx) {
      barChart = new Chart(barCtx.getContext('2d'), {
        type: 'bar',
        data: { labels: categories, datasets: [{ label: 'Resolvidos', data: resolvedData, backgroundColor: backgroundColors, borderRadius: 4 }] },
        options: Object.assign({}, baseOptions(), {
            scales: {
                x: { display: !isMobile() },
                y: { beginAtZero: true }
            },
            plugins: { legend: { display: false } }
        })
      });
  }

  // 3. LINHA (RESTAURADO)
  const lineCtx = document.getElementById('lineChart');
  if (lineCtx) {
      lineChart = new Chart(lineCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
            datasets: [{
                label: 'Relatos por Mês',
                data: monthlyData,
                borderColor: COLOR_YELLOW,
                backgroundColor: 'rgba(255,204,0,0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: Object.assign({}, baseOptions(), {
            scales: {
                y: { beginAtZero: true }
            },
            plugins: { legend: { display: false } }
        })
      });
  }
}

document.addEventListener('DOMContentLoaded', initAllCharts);
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initAllCharts, 300);
});