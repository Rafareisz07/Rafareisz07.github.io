// Gráfico de Luminosidade
const ctx = document.getElementById('graficoLuminosidade').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Luminosidade',
            data: [],
            borderColor: '#3498db'
        }]
    }
});

//config mqtt e uso do mesmo
const client = new Paho.MQTT.Client(
  "test.mosquitto.org",
    8081,
    "/mqtt",
    "clientId-" + Math.random()
  );

client.connect({
  useSSL: true,
  onSuccess: () => {
    console.log("Conectado ao broker MQTT!");
    client.subscribe("careca", { qos: 0 });
  },
  onFailure: err => console.error("Falha ao conectar:", err.errorMessage)
});


function testPublish() {
  const demo = {
    Latitude:   -23.55,
    Longitude:  -46.63,
    declinacao: 23.44,
    anguloHorario: 45.0,
    zenital:    60.5,
    azimute:    135.2,
    luminosidade: Math.floor(Math.random()*10000)
  };
  const msg = new Paho.MQTT.Message(JSON.stringify(demo));
  msg.destinationName = "careca";
  client.send(msg);
  console.log("Mensagem de teste enviada:", demo);
}

// Processamento de Mensagens
client.onMessageArrived = (message) => {
    const data = JSON.parse(message.payloadString);
    console.log("MQTT chegou:", message.payloadString);

    
    // Atualização da UI
    document.getElementById("latitude").textContent = data.Latitude.toFixed(4);
    document.getElementById("longitude").textContent = data.Longitude.toFixed(4);
    document.getElementById("zenital").textContent = `${data.zenital.toFixed(1)}°`;
    document.getElementById("azimutal").textContent = `${data.azimute.toFixed(1)}°`;
    document.getElementById("luminosidadeAtual").textContent = data.luminosidade;

    // Atualização do Gráfico
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(data.luminosidade);
    chart.update();
};

// Controle de Tabs
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

function testPublish() {
    const demo = {
      Latitude:   -23.55,
      Longitude:  -46.64,
      declinacao: 13.5,
      anguloHorario: 50.2,
      zenital:    60.0,
      azimute:    132.0,
      luminosidade: Math.floor(Math.random()*10000)
    };
    const msg = new Paho.MQTT.Message(JSON.stringify(demo));
    msg.destinationName = "careca";
    client.send(msg);
    console.log("Mensagem de teste enviada:", demo);
  }
  