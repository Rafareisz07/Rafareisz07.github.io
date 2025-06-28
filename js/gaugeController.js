class GaugeController {
    constructor() {
        this.gauges = {
            luminosidade: {
                needle: document.getElementById('needle-lum'),
                maxValue: 10000,
                maxAngle: 180
            }
        };
    }

    updateLuminosidadeGauge(valor) {
        const gauge = this.gauges.luminosidade;
        if (!gauge.needle) return;

        // Calcula o ângulo baseado no valor (0-10000 lux = 0-180°)
        const angulo = Math.min(gauge.maxAngle, (valor / gauge.maxValue) * gauge.maxAngle);
        gauge.needle.style.transform = `rotate(${angulo}deg)`;
        
        // Atualiza o display do valor
        const valueElement = document.getElementById('Luminosidade');
        if (valueElement) {
            valueElement.textContent = `${valor} lx`;
        }
    }

    addGauge(name, config) {
        this.gauges[name] = {
            needle: document.getElementById(config.needleId),
            maxValue: config.maxValue,
            maxAngle: config.maxAngle || 180
        };
    }

    updateGauge(name, value) {
        const gauge = this.gauges[name];
        if (!gauge || !gauge.needle) return;

        const angle = Math.min(gauge.maxAngle, (value / gauge.maxValue) * gauge.maxAngle);
        gauge.needle.style.transform = `rotate(${angle}deg)`;
    }
}