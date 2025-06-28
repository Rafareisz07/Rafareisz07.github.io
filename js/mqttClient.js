class MQTTClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 5000;
        this.onMessageCallback = null;
        this.onConnectionStatusCallback = null;
        
        this.initializeClient();
    }

    initializeClient() {
        this.client = new Paho.Client(
            "test.mosquitto.org",
            8081,
            "/mqtt",
            `clientId-${Math.random().toString(36).substr(2, 9)}`
        );

        this.client.onConnectionLost = (responseObject) => {
            if (responseObject.errorCode !== 0) {
                console.error('Conexão perdida:', responseObject.errorMessage);
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.scheduleReconnect();
            }
        };

        this.client.onMessageArrived = (message) => {
            try {
                const data = JSON.parse(message.payloadString);
                console.log('MQTT mensagem recebida:', data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(data);
                }
            } catch (error) {
                console.error('Erro ao processar mensagem MQTT:', error);
            }
        };
    }

    connect() {
        if (this.isConnected) {
            console.log('Cliente já está conectado');
            return;
        }

        this.updateConnectionStatus('connecting');
        
        this.client.connect({
            useSSL: true,
            timeout: 10,
            onSuccess: () => {
                console.log('Conectado ao broker MQTT!');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
                this.client.subscribe('Resp_ESP32');
            },
            onFailure: (error) => {
                console.error('Falha ao conectar:', error.errorMessage);
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.scheduleReconnect();
            }
        });
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Máximo de tentativas de reconexão atingido');
            this.updateConnectionStatus('failed');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${this.reconnectDelay/1000}s`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, this.reconnectDelay);
    }

    publishTestMessage() {
        if (!this.isConnected) {
            console.error("Cliente MQTT não está conectado");
            this.connect(); // Tenta reconectar
            return false;
        }

        const testData = {
            dia: new Date().getDate(),
            mes: new Date().getMonth() + 1,
            Latitude: -23.55 + (Math.random() - 0.5) * 0.01,
            Longitude: -46.63 + (Math.random() - 0.5) * 0.01,
            HorarioLocal: new Date().toLocaleTimeString(),
            LongitudeF: -46.63 + (Math.random() - 0.5) * 0.01,
            luz: Math.floor(Math.random() * 10000),
            Status_INA: Math.random() > 0.1 ? "OK" : "ERROR",
            Potencia: parseFloat((Math.random() * 100).toFixed(2)),
            Corrente: parseFloat((Math.random() * 10).toFixed(2)),
            Volts: parseFloat((Math.random() * 220).toFixed(2))
        };

        try {
            const message = new Paho.Message(JSON.stringify(testData));
            message.destinationName = "Resp_ESP32";
            this.client.send(message);
            console.log('Mensagem de teste enviada:', testData);
            return true;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return false;
        }
    }

    updateConnectionStatus(status) {
        if (this.onConnectionStatusCallback) {
            this.onConnectionStatusCallback(status);
        }
    }

    setMessageCallback(callback) {
        this.onMessageCallback = callback;
    }

    setConnectionStatusCallback(callback) {
        this.onConnectionStatusCallback = callback;
    }

    disconnect() {
        if (this.client && this.isConnected) {
            this.client.disconnect();
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
        }
    }
}