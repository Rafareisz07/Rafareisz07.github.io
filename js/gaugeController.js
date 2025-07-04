class GaugeController {
    constructor() {
        this.gauges = {
            luminosidade: {
                needle: document.getElementById('needle-lum'),
                maxValue: 10000,
                minAngle: -90,
                maxAngle: 90
            }
        };
    }

    updateLuminosidadeGauge(valor) {
        const gauge = this.gauges.luminosidade;
        if (!gauge.needle) return;

        // Calcula o ângulo de -90 a 90 graus
        const angulo = gauge.minAngle + ((valor / gauge.maxValue) * (gauge.maxAngle - gauge.minAngle));
        gauge.needle.style.transform = `rotate(${angulo}deg)`;

        // Atualiza o display do valor
        const valueElement = document.getElementById('Luminosidade');
        if (valueElement) {
            valueElement.textContent = `${valor} lumens`;
        }
    }

    addGauge(name, config) {
        this.gauges[name] = {
            needle: document.getElementById(config.needleId),
            maxValue: config.maxValue,
            minAngle: config.minAngle || -90,
            maxAngle: config.maxAngle || 90
        };
    }

    updateGauge(name, value) {
        const gauge = this.gauges[name];
        if (!gauge || !gauge.needle) return;

        // Calcula o ângulo de -90 a 90 graus
        const angle = gauge.minAngle + ((value / gauge.maxValue) * (gauge.maxAngle - gauge.minAngle));
        gauge.needle.style.transform = `rotate(${angle}deg)`;
    }
}