/* chart.js corrigido - restaura lógica original de injeção do gráfico de linha */

/* Theme colors */
const COLOR_YELLOW = "#ffcc00";
const COLOR_BLACK = "#0c0c0c";

/* Data */
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
function formatLabel(label) { return isMobile() && label.length > 15 ? label.substring(0,15) + "..." : label; }

const shadowPlugin = {
  id: 'shadow',
  beforeDatasetsDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
  },
  afterDatasetsDraw(chart) {
    chart.ctx.restore();
  }
};
Chart.register(shadowPlugin);

let pieChart = null;
let barChart = null;
let lineChart = null;

function baseOptions() {
  return {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6
      }
    }
  };
}

function createPie() {
  const ctx = document.getElementById('pieChart').getContext('2d');

  const opts = Object.assign({}, baseOptions(), {
    plugins: {
      legend: {
        position: isMobile() ? 'bottom' : 'right',
        labels: { boxWidth: 12, font: { size: isMobile() ? 10 : 11 }, padding: 10 }
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            const value = ctx.raw;
            const total = complaintData.reduce((a,b)=>a+b,0);
            const perc = ((value/total)*100).toFixed(1);
            return `${ctx.label}: ${perc}%`;
          }
        }
      }
    }
  });

  return new Chart(ctx, {
    type: 'pie',
    data: { labels: categories, datasets: [{ data: complaintData, backgroundColor: backgroundColors, borderColor: '#fff', borderWidth: 1 }] },
    options: opts
  });
}

function createBar() {
  const ctx = document.getElementById('barChart').getContext('2d');

  const opts = Object.assign({}, baseOptions(), {
    scales: {
      x: { ticks: { color: '#222', font: { size: isMobile()?9:11 } }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: '#222', font: { size: isMobile()?9:11 } }, grid: { color: 'rgba(0,0,0,0.07)' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title(ctx) { return categories[ctx[0].dataIndex]; },
          label(ctx) { return `Resolvidos: ${ctx.parsed.y}`; }
        }
      }
    }
  });

  return new Chart(ctx, {
    type: 'bar',
    data: { labels: categories.map(formatLabel), datasets: [{ label: 'Resolvidos', data: resolvedData, backgroundColor: backgroundColors, borderRadius: 8, borderColor: backgroundColors.map(c=>c.replace('62%)','45%)')), borderWidth: 1, maxBarThickness: 60 }] },
    options: opts
  });
}

function createLine() {
  let lineEl = document.getElementById('lineChart');
  
  if (!lineEl) {
    const containerRow = document.querySelector('.container-chart .row') || document.querySelector('.container .row');
    if (containerRow) {
      const wrapper = document.createElement('div');
      wrapper.className = 'col-12 mt-4';
      wrapper.id = 'lineWrapper';
      wrapper.innerHTML = `
        <div class="chart-box bg-white p-4 rounded shadow-sm">
          <h5 class="mb-3 chart-title">Evolução Mensal de Relatos</h5>
          <canvas id="lineChart"></canvas>
        </div>`;
      containerRow.appendChild(wrapper);
      lineEl = document.getElementById('lineChart');
    } else {
      return null;
    }
  }

  const ctx = lineEl.getContext('2d');

  const opts = Object.assign({}, baseOptions(), {
    scales: {
      x: { ticks: { color: '#222' }, grid: { color: 'rgba(0,0,0,0.06)' } },
      y: { ticks: { color: '#222' }, grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true }
    },
    plugins: { legend: { display: false } }
  });

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      datasets: [{
        label: 'Relatos',
        data: monthlyData,
        borderColor: COLOR_YELLOW,
        backgroundColor: 'rgba(255,204,0,0.16)',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: COLOR_YELLOW,
        pointBorderColor: COLOR_BLACK,
        fill: true
      }]
    },
    options: opts
  });
}

function initAllCharts() {
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();

  pieChart = createPie();
  barChart = createBar();
  lineChart = createLine();
}

initAllCharts();

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initAllCharts, 300);
});
