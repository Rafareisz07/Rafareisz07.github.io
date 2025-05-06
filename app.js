// Inicializa o Chart.js
const ctx = document.getElementById('graficoLuminosidade').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{ label: 'Luminosidade', data: [], borderColor: '#3498db' }]
  },
  options: {
    scales: { x: { display: true }, y: { beginAtZero: true } }
  }
});

// Configuração e Conexão MQTT
var client = new Paho.MQTT.Client('test.mosquitto.org', 8081, 'clientId-' + Math.random());
client.connect({
  useSSL: true,
  onSuccess: () => {
    console.log('Conectado ao broker MQTT!');
    client.subscribe('careca');
  },
  onFailure: err => console.error('Falha ao conectar:', err.errorMessage)
});

// Função de teste
function testPublish() {
  const demo = {
    Latitude: -23.55,
    Longitude: -46.64,
    zenital: 60.0,
    azimute: 132.0,
    luminosidade: Math.floor(Math.random() * 10000)
  };
  const msg = new Paho.MQTT.Message(JSON.stringify(demo));
  msg.destinationName = 'bazingasaas';
  client.send(msg);
  console.log('Mensagem de teste enviada:', demo);
}

// Processamento de Mensagens
client.onMessageArrived = message => {
  const data = JSON.parse(message.payloadString);
  console.log('MQTT chegou:', data);

  document.getElementById('latitude').textContent = data.Latitude.toFixed(4);
  document.getElementById('longitude').textContent = data.Longitude.toFixed(4);
  document.getElementById('zenital').textContent = `${data.zenital.toFixed(1)}°`;
  document.getElementById('azimutal').textContent = `${data.azimute.toFixed(1)}°`;
  document.getElementById('luminosidadeAtual').textContent = data.luminosidade;

  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(data.luminosidade);
  chart.update();
};

// Controle de Abas
function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
}
