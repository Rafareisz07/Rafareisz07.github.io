// Configuração MQTT
const client = new Paho.MQTT.Client("wss://test.mosquitto.org:8081", "clientId-" + Math.random());

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

// Conexão MQTT
client.connect({
    onSuccess: () => {
        client.subscribe("careca"); // Tópico do ESP32
    }
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
  msg.destinationName = "Resp_Node-RED";
  client.send(msg);
  console.log("Mensagem de teste enviada:", demo);
}

// Processamento de Mensagens
client.onMessageArrived = (message) => {
    const data = JSON.parse(message.payloadString);
    
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
