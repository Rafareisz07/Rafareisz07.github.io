class ChartManager {
    constructor() {
        this.charts = {};
        this.maxDataPoints = 50; // Limita o número de pontos para performance
        this.initializeCharts();
    }

    initializeCharts() {
        // Chart de Luminosidade
        this.charts.luminosidade = this.createChart('graficoLuminosidade', {
            label: 'Luminosidade (lx)',
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            beginAtZero: false
        });

        // Chart de Corrente
        this.charts.corrente = this.createChart('graficoCorrente', {
            label: 'Corrente (A)',
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            beginAtZero: true
        });

        // Chart de Tensão
        this.charts.tensao = this.createChart('graficoTensao', {
            label: 'Tensão (V)',
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            beginAtZero: true
        });

        // Chart de Potência
        this.charts.potencia = this.createChart('graficoPotencia', {
            label: 'Potência (W)',
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            beginAtZero: true
        });
    }

    createChart(canvasId, config) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: config.label,
                    data: [],
                    borderColor: config.borderColor,
                    backgroundColor: config.backgroundColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Tempo'
                        }
                    },
                    y: {
                        beginAtZero: config.beginAtZero,
                        title: {
                            display: true,
                            text: config.label
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                animation: {
                    duration: 300
                }
            }
        });
    }

    updateChart(chartName, value) {
        const chart = this.charts[chartName];
        if (!chart) return;

        const timestamp = new Date().toLocaleTimeString();
        
        // Adiciona novo ponto
        chart.data.labels.push(timestamp);
        chart.data.datasets[0].data.push(value);

        // Remove pontos antigos se exceder o limite
        if (chart.data.labels.length > this.maxDataPoints) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none'); // Update sem animação para melhor performance
    }

    clearAllCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.update();
        });
    }

    getChartData(chartName) {
        const chart = this.charts[chartName];
        return chart ? {
            labels: [...chart.data.labels],
            data: [...chart.data.datasets[0].data]
        } : null;
    }
}