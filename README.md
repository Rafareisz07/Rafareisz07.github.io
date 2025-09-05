# MQTT Real-Time Dashboard for Solarimetria

This project is a web-based, real-time dashboard designed to monitor and visualize data from a solar tracking system, likely powered by an ESP32 microcontroller. It uses MQTT to receive data and displays it through a user-friendly interface with charts and gauges.

## Features

*   **Real-Time Data Visualization:** View live data streams from your IoT devices.
*   **Interactive Charts:** Line charts for tracking luminosity, current, voltage, and power over time, powered by Chart.js.
*   **Dynamic Gauges:** A sleek gauge for at-a-glance readings of current luminosity.
*   **MQTT Integration:** Connects to any standard MQTT broker to subscribe to data topics.
*   **Sensor Status:** Monitor the operational status of various sensors (Luminosity, Gyroscope, Motor, INA).
*   **Tabbed Interface:** Cleanly organized sections for Sensor Status, Solar Position, Luminosity, and Measurements.
*   **Built-in MQTT Test:** A "Test" button allows you to generate sample data to see the dashboard in action without a physical device.
*   **Client-Side Calculations:** Includes a feature to calculate and display the solar azimuth based on a hardcoded location.

## Technology Stack

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** Node.js with Express.js (for serving static files)
*   **Real-Time Communication:** MQTT (using the Paho MQTT JavaScript library)
*   **Charting Library:** Chart.js

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mqtt-dashboard
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed. Run the following command in the project root:
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

4.  **Open the dashboard:**
    Open your web browser and navigate to `http://localhost:8000`.

## How to Use

### Connecting to the MQTT Broker

The dashboard is pre-configured to connect to `test.mosquitto.org` on port `8081` (WSS). To change the broker, edit the connection details in `js/mqttClient.js`.

### MQTT Data Format

The dashboard subscribes to the topic `Resp_ESP32` and expects incoming messages to be in JSON format. Here is an example of the expected payload structure:

```json
{
    "dia": 24,
    "mes": 5,
    "Latitude": -23.55,
    "Longitude": -46.63,
    "HorarioLocal": 14.5,
    "LongitudeF": -45.0,
    "luz": 7500,
    "Status_INA": 1,
    "Potencia": 4500.50,
    "Corrente": 900.75,
    "Volts": 5.00
}
```

### Using the Test Feature

To test the dashboard without a live data feed, simply click the **▶️ Enviar Teste MQTT** button. This will send a randomly generated message (following the format above) to the broker, and you will see the UI update instantly.
