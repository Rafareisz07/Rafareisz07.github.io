 // Instâncias globais
let chartManager;
let mqttClient;
let gaugeController;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Inicializa os componentes
    chartManager = new ChartManager();
    gaugeController = new GaugeController();
    mqttClient = new MQTTClient();

    // Configura callbacks
    mqttClient.setMessageCallback(handleMQTTMessage);
    mqttClient.setConnectionStatusCallback(updateConnectionStatusUI);

    // Conecta ao MQTT
    mqttClient.connect();

    // Inicializa a primeira aba
    openTab('posicao');

    console.log('Dashboard inicializado com sucesso!');
}

function handleMQTTMessage(data) {
    try {
        // Atualiza elementos da interface
        updateUIElements(data);

        // Atualiza gráficos
        updateCharts(data);

        // Atualiza gauge de luminosidade
        gaugeController.updateLuminosidadeGauge(data.luz);

    } catch (error) {
        console.error('Erro ao processar dados MQTT:', error);
    }
}
function decimalToTime(decimal) {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    // Garante dois dígitos para horas e minutos
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
} 
 
function updateUIElements(data) {
    const elements = {
        'dia': data.dia,
        'mes': data.mes,
        'latitude': data.Latitude?.toFixed(4) || '0.0000',
        'longitude': data.Longitude?.toFixed(4) || '0.0000',
        'horarioLocal': new Date().toLocaleTimeString(),
        'longitudeF': data.LongitudeF?.toFixed(2) || '0.00',
        'Luminosidade': `${data.luz} lumens`,
        'potencia': `${data.Potencia?.toFixed(2) || '0.00'} mW`,
        'corrente': `${data.Corrente?.toFixed(2) || '0.00'} mA`,
        'volts': `${data.Volts?.toFixed(2) || '0.00'} V`
    };
    // atualizar os status dos sensores
    elements['statusLumen'] = data.Status_INA % 2 === 0 ? 'ERROR' : 'OK';
    elements['statusGiroscopio'] = data.Status_INA % 3 ===  0 ? 'ERROR' : 'OK';
    elements['statusMotor'] = data.Status_INA % 5 === 0 ? ' ERROR' : 'OK';
    elements['statusINA'] = data.Status_INA % 7 === 0 ? ' ERROR' : 'OK';

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    // Atualiza status dos sensores com cores
    updateSensorStatus('statusINA', data.Status_INA);

    if (data.Status_INA === 0) {
        updateSensorStatus('statusINA', 'OK');
    }
    else if (data.Status_INA > 0) {
        updateSensorStatus('statusINA', 'ERROR');
    }

    if (data.Status_INA % 2 === 0) {
        updateSensorStatus('statusLumen', 'ERROR');
    } else {
        updateSensorStatus('statusLumen', 'OK');
    }

    if (data.Status_INA % 3 === 0) {
        updateSensorStatus('statusGiroscopio', 'ERROR');
    } else {
        updateSensorStatus('statusGiroscopio', 'OK');
    }

    if (data.Status_INA % 5 === 0) {
        updateSensorStatus('statusMotor', 'ERROR');
    } else {
        updateSensorStatus('statusMotor', 'OK');
    }
}

function updateSensorStatus(elementId, status) {
    const element = document.getElementById(elementId);
    const card = element?.closest('.status-card');

    if (card) {
        card.classList.remove('ok', 'warning');
        if (status === 'OK') {
            card.classList.add('ok');
        } else {
            card.classList.add('warning');
        }
    }
}

function updateCharts(data) {
    chartManager.updateChart('luminosidade', data.luz);
    chartManager.updateChart('corrente', data.Corrente);
    chartManager.updateChart('tensao', data.Volts);
    chartManager.updateChart('potencia', data.Potencia);
}

function updateConnectionStatusUI(status) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    if (!statusIndicator || !statusText) return;

    statusIndicator.className = 'status-indicator';

    switch (status) {
        case 'connected':
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Conectado';
            break;
        case 'connecting':
            statusIndicator.classList.add('connecting');
            statusText.textContent = 'Conectando...';
            break;
        case 'disconnected':
            statusText.textContent = 'Desconectado';
            break;
        case 'failed':
            statusText.textContent = 'Falha na conexão';
            break;
    }
}

// Controle de Abas
function openTab(tabName) {
    // Remove active de todas as abas e conteúdos
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Ativa a aba selecionada
    document.getElementById(tabName).classList.add('active');

    // Ativa o botão da aba correspondente
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes(tabName.toLowerCase()) ||
            (tabName === 'posicao' && button.textContent.includes('Posição')) ||
            (tabName === 'status' && button.textContent.includes('Status')) ||
            (tabName === 'luminosidade' && button.textContent.includes('Luminosidade')) ||
            (tabName === 'medidas' && button.textContent.includes('Medidas'))) {
            button.classList.add('active');
        }
    });
}

// Função para teste MQTT
function testPublish() {
    if (mqttClient) {
        const success = mqttClient.publishTestMessage();
        if (success) {
            console.log('Teste MQTT enviado com sucesso');
        } else {
            console.log('Falha ao enviar teste MQTT');
        }
    }
}

// Função para limpar gráficos
function clearCharts() {
    if (chartManager) {
        chartManager.clearAllCharts();
        console.log('Gráficos limpos');
    }
}

// Função para exportar dados (opcional)
function exportData() {
    if (!chartManager) return;

    const data = {
        luminosidade: chartManager.getChartData('luminosidade'),
        corrente: chartManager.getChartData('corrente'),
        tensao: chartManager.getChartData('tensao'),
        potencia: chartManager.getChartData('potencia'),
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solarimetria-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}



//calculo aux

function transformarEmRad(graus) {
    return (graus * Math.PI) / 180.0;
}
function transformarEmGraus(rad) {
    return (rad * 180.0) / Math.PI;
}
function declinacaoSolarRad(dia) {
    var anguloGraus = (360.0 / 365.0) * (284 + dia);
    return transformarEmRad(23.45 * Math.sin(transformarEmRad(anguloGraus)));
}
function equacaoDoTempo(dia) {
    var B = transformarEmRad((360.0 / 365.0) * (dia - 81));
    return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);  // em minutos
}
function horarioSolarVerdadeiro(horaLocal, longitudeReal, longitudeFuso, dia) {
    var EoT = equacaoDoTempo(dia);                                // minutos
    var correcaoLongitude = 4 * (longitudeReal - longitudeFuso);  // minutos
    var minutosSolares = (horaLocal * 60.0) + EoT + correcaoLongitude;
    return minutosSolares / 60.0;  // horas solares verdadeiras
}
function anguloHorarioEmRad(horarioSolarHoras) {
    return transformarEmRad((horarioSolarHoras - 12.0) * 15.0);
}
function anguloAltitudeRad(declinacao, latitudeRad, anguloHorario) {
    return Math.asin(Math.sin(declinacao) * Math.sin(latitudeRad) + Math.cos(declinacao) * Math.cos(latitudeRad) * Math.cos(anguloHorario));
}
function anguloAzimuteRad(declinacao, latitudeRad, anguloHorario, altitude) {
    var numerador = Math.sin(declinacao) - Math.sin(altitude) * Math.sin(latitudeRad);
    var denominador = Math.cos(altitude) * Math.cos(latitudeRad);
    var azimute = Math.acos(numerador / denominador);
    if (anguloHorario > 0) {
        azimute = 2 * Math.PI - azimute;
    }
    return azimute;
}

//Função para o cálculo auxiliar
function calculo_aux() {
    const CorrecaoMes = [0, 1, -1, 0, 0, 1, 1, 2, 3, 3, 4, 4];
    var agora = new Date;
    var ano = agora.getFullYear();
    var mes = agora.getMonth() + 1; // Começa no mês 0 e vai até o mês 11
    var dia = agora.getDate();
    var minutos = agora.getMinutes();
    var horaLocal = agora.getHours() + Number(minutos / 60);
    var latitude = -23.5, longitude = -46.6, longitudeFuso = -45;

    var diaDoAno = dia + ((mes - 1) * 30) + CorrecaoMes[mes - 1];

    var decl = declinacaoSolarRad(diaDoAno);
    var latRad = transformarEmRad(latitude);
    var horaSolar = horarioSolarVerdadeiro(horaLocal, longitude, longitudeFuso, diaDoAno);
    var anguloHora = anguloHorarioEmRad(horaSolar);
    var alt = anguloAltitudeRad(decl, latRad, anguloHora);
    var azimute = transformarEmGraus(anguloAzimuteRad(decl, latRad, anguloHora, alt));
    return azimute;
}
var aux = 0;

function toggle(){
    aux == 1 ? 0 : 1;
}