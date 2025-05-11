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

//config mqtt e uso do mesmo
const client = new Paho.Client(
    "test.mosquitto.org",
    8081,
    "/mqtt",
    "clientId-" + Math.random()
  );

client.connect({
  useSSL: true,
  onSuccess: () => {
    console.log('Conectado ao broker MQTT!');
    client.subscribe("Resp_Node-RED");
  },
  onFailure: err => console.error('Falha ao conectar:', err.errorMessage)
});

// Função de teste
function testPublish() {
  if (!client.isConnected()) {
      console.error("Cliente MQTT não está conectado. Tente novamente mais tarde.");
      return;
  }

  const demo = {
      Latitude:   -23.55,
      Longitude:  -46.63,
      declinacao: 23.44,
      anguloHorario: 45.0,
      zenital:    60.5,
      azimute:    135.2,
      luminosidade: Math.floor(Math.random() * 10000)
  };
  const msg = new Paho.Message(JSON.stringify(demo));
  msg.destinationName = "Resp_ESP32";
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
  document.getElementById('luminosidade-valor').textContent = data.luminosidade;

  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(data.luminosidade);
  chart.update();
};

// Controle de Abas
function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
}
