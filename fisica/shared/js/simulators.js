/**
 * SIMULADORES FÍSICOS INTERATIVOS
 * Módulos dedicados para cada tópico das aulas particulares
 */

window.PhysicsSims = {
  // 1. TÓPICO 1: Potência em Subida de Veículo
  initTopic1: function() {
    const canvas = document.getElementById('sim-canvas-potencia');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const massSlider = document.getElementById('slider-massa');
    const angleSlider = document.getElementById('slider-angulo');
    const speedSlider = document.getElementById('slider-velocidade');
    const muSlider = document.getElementById('slider-atrito');

    const valMassa = document.getElementById('val-massa');
    const valAngulo = document.getElementById('val-angulo');
    const valVelocidade = document.getElementById('val-velocidade');
    const valAtrito = document.getElementById('val-atrito');

    const outForca = document.getElementById('out-forca');
    const outWatts = document.getElementById('out-watts');
    const outCv = document.getElementById('out-cv');
    const outEnergia = document.getElementById('out-energia');

    function update() {
      const m = parseFloat(massSlider.value);
      const thetaDeg = parseFloat(angleSlider.value);
      const vKmh = parseFloat(speedSlider.value);
      const mu = parseFloat(muSlider.value);

      if (valMassa) valMassa.textContent = `${m} kg`;
      if (valAngulo) valAngulo.textContent = `${thetaDeg}°`;
      if (valVelocidade) valVelocidade.textContent = `${vKmh} km/h (${(vKmh/3.6).toFixed(1)} m/s)`;
      if (valAtrito) valAtrito.textContent = mu.toFixed(2);

      const thetaRad = thetaDeg * (Math.PI / 180);
      const v = vKmh / 3.6; // m/s
      const g = 9.8;

      // Forças
      const Px = m * g * Math.sin(thetaRad);
      const N = m * g * Math.cos(thetaRad);
      const Fat = mu * N;
      const Fmotor = Px + Fat; // Força para manter velocidade constante
      const PotenciaW = Fmotor * v;
      const PotenciaCv = PotenciaW / 735.5;
      const Energia10s = PotenciaW * 10; // Joules

      if (outForca) outForca.textContent = `${Math.round(Fmotor)} N`;
      if (outWatts) outWatts.textContent = `${Math.round(PotenciaW).toLocaleString('pt-BR')} W`;
      if (outCv) outCv.textContent = `${PotenciaCv.toFixed(1)} cv`;
      if (outEnergia) outEnergia.textContent = `${(Energia10s / 1000).toFixed(1)} kJ`;

      draw(thetaRad, v);
    }

    let carPos = 0;
    function draw(thetaRad, v) {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Fundo
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, w, h);

      // Desenhar Rampa
      const rampStartX = 40;
      const rampStartY = h - 40;
      const rampLength = w - 80;
      const rampEndX = rampStartX + rampLength * Math.cos(thetaRad);
      const rampEndY = rampStartY - rampLength * Math.sin(thetaRad);

      ctx.beginPath();
      ctx.moveTo(rampStartX, rampStartY);
      ctx.lineTo(rampEndX, rampEndY);
      ctx.lineTo(rampEndX, rampStartY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Carro animado na rampa
      carPos = (carPos + v * 0.4) % (rampLength * 0.7);
      const currentDist = 40 + carPos;
      const carX = rampStartX + currentDist * Math.cos(thetaRad);
      const carY = rampStartY - currentDist * Math.sin(thetaRad);

      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(-thetaRad);

      // Corpo do carro
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-24, -22, 48, 16, 4);
      ctx.fill();

      // Rodas
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-14, -6, 5, 0, Math.PI * 2);
      ctx.arc(14, -6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vetor Força Motora (para frente)
      ctx.strokeStyle = '#34d399';
      ctx.fillStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(24, -14);
      ctx.lineTo(60, -14);
      ctx.stroke();
      // Flecha
      ctx.beginPath();
      ctx.moveTo(60, -14);
      ctx.lineTo(54, -18);
      ctx.lineTo(54, -10);
      ctx.fill();

      ctx.font = '11px monospace';
      ctx.fillText('F_motor', 28, -26);

      ctx.restore();

      // Ângulo
      ctx.beginPath();
      ctx.arc(rampStartX, rampStartY, 35, 0, -thetaRad, true);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '12px sans-serif';
      ctx.fillText('θ', rampStartX + 40, rampStartY - 8);
    }

    [massSlider, angleSlider, speedSlider, muSlider].forEach(el => {
      if (el) el.addEventListener('input', update);
    });

    update();
    setInterval(() => {
      const thetaDeg = parseFloat(angleSlider.value);
      const vKmh = parseFloat(speedSlider.value);
      draw(thetaDeg * Math.PI / 180, vKmh / 3.6);
    }, 40);
  },

  // 2. TÓPICO 2: Simulador de Impulso e Força Variável
  initTopic2: function() {
    const canvas = document.getElementById('sim-canvas-impulso');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dtSlider = document.getElementById('slider-dt');
    const valDt = document.getElementById('val-dt');
    const outFmax = document.getElementById('out-fmax');
    const outImpulso = document.getElementById('out-impulso');
    const outEfeito = document.getElementById('out-efeito');

    const deltaQ = 1200; // kg*m/s constante

    function update() {
      const dtMs = parseFloat(dtSlider.value); // em ms
      const dtSec = dtMs / 1000;
      if (valDt) valDt.textContent = `${dtMs} ms (${dtSec.toFixed(3)} s)`;

      // Área do triângulo = (base * altura)/2 = I => altura Fmax = (2 * I) / dt
      const Fmax = (2 * deltaQ) / dtSec;
      const I = deltaQ;

      if (outFmax) {
        outFmax.textContent = `${Math.round(Fmax).toLocaleString('pt-BR')} N`;
        if (Fmax > 30000) {
          outFmax.style.color = '#f43f5e';
        } else if (Fmax > 12000) {
          outFmax.style.color = '#f59e0b';
        } else {
          outFmax.style.color = '#34d399';
        }
      }
      if (outImpulso) outImpulso.textContent = `${I} N·s`;
      if (outEfeito) {
        if (Fmax > 30000) {
          outEfeito.textContent = '💀 Impacto Letal! (Batida em muro rígido)';
          outEfeito.style.color = '#f43f5e';
        } else if (Fmax > 12000) {
          outEfeito.textContent = '⚠️ Lesões Graves (Cinto sem deformação)';
          outEfeito.style.color = '#f59e0b';
        } else {
          outEfeito.textContent = '🛡️ Seguro! (Airbag e zona deformável atuando)';
          outEfeito.style.color = '#34d399';
        }
      }

      draw(dtMs, Fmax);
    }

    function draw(dtMs, Fmax) {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Eixos do Gráfico F x t
      const originX = 60;
      const originY = h - 40;
      const axisW = w - 100;
      const axisH = h - 70;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Eixo Y (Força)
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX, 20);
      // Eixo X (Tempo)
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + axisW, originY);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Força F (N)', originX - 50, 30);
      ctx.fillText('Tempo t (ms)', originX + axisW - 40, originY + 30);

      // Curva da Força (modelo senoidal suave ou triangular)
      // Mapear dtMs (10ms a 300ms) no eixo X
      const maxTimeWindow = 320; // ms
      const scaleX = axisW / maxTimeWindow;
      const maxForceScale = 70000; // N
      const scaleY = axisH / maxForceScale;

      const tStart = 20 * scaleX;
      const tDuration = dtMs * scaleX;
      const tEnd = tStart + tDuration;
      const peakY = originY - (Math.min(Fmax, maxForceScale) * scaleY);

      // Preenchimento da área (Impulso)
      ctx.beginPath();
      ctx.moveTo(originX + tStart, originY);
      // curva suave tipo sino (sin^2)
      for (let x = 0; x <= tDuration; x += 2) {
        const progress = x / tDuration;
        const currentForce = Math.sin(progress * Math.PI) * (Fmax * scaleY);
        ctx.lineTo(originX + tStart + x, originY - currentForce);
      }
      ctx.lineTo(originX + tEnd, originY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, peakY, 0, originY);
      grad.addColorStop(0, Fmax > 25000 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Contorno da curva
      ctx.strokeStyle = Fmax > 25000 ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Marcação da Área = Impulso
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      const labelX = originX + tStart + tDuration / 2 - 40;
      const labelY = Math.min(originY - 20, (originY + peakY) / 2);
      ctx.fillText('Área = Impulso (Constante)', Math.max(originX + 10, labelX), labelY);

      // Linha do pico F_max
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(originX, peakY);
      ctx.lineTo(originX + tStart + tDuration / 2, peakY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '11px monospace';
      ctx.fillText(`F_pico = ${Math.round(Fmax)} N`, originX + 5, peakY - 6);
    }

    if (dtSlider) dtSlider.addEventListener('input', update);
    update();
  },

  // 3. TÓPICO 3: Propulsão e Recuo de Sistemas Isolados
  initTopic3: function() {
    const canvas = document.getElementById('sim-canvas-recuo');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const mCanhaoSlider = document.getElementById('slider-m-canhao');
    const mProjSlider = document.getElementById('slider-m-proj');
    const vProjSlider = document.getElementById('slider-v-proj');
    const fireBtn = document.getElementById('btn-disparo');

    const valMCanhao = document.getElementById('val-m-canhao');
    const valMProj = document.getElementById('val-m-proj');
    const valVProj = document.getElementById('val-v-proj');

    const outVRecuo = document.getElementById('out-v-recuo');
    const outQProj = document.getElementById('out-q-proj');
    const outQCanhao = document.getElementById('out-q-canhao');
    const outQTotal = document.getElementById('out-q-total');

    let animState = 'ready'; // ready, firing, resetting
    let cannonX = 0;
    let projX = 0;
    let vRecuo = 0;

    function calculate() {
      const M = parseFloat(mCanhaoSlider.value);
      const m = parseFloat(mProjSlider.value);
      const v = parseFloat(vProjSlider.value);

      if (valMCanhao) valMCanhao.textContent = `${M} kg`;
      if (valMProj) valMProj.textContent = `${m} kg`;
      if (valVProj) valVProj.textContent = `${v} m/s`;

      // Q_antes = 0 => Q_canhao + Q_proj = 0 => M*V + m*v = 0 => V = -(m/M)*v
      vRecuo = -(m * v) / M;
      const qProj = m * v;
      const qCanhao = M * vRecuo;

      if (outVRecuo) outVRecuo.textContent = `${vRecuo.toFixed(2)} m/s`;
      if (outQProj) outQProj.textContent = `+${Math.round(qProj)} kg·m/s`;
      if (outQCanhao) outQCanhao.textContent = `${Math.round(qCanhao)} kg·m/s`;
      if (outQTotal) outQTotal.textContent = `0 kg·m/s (CONSERVADO!)`;
    }

    function fire() {
      calculate();
      animState = 'firing';
      cannonX = 0;
      projX = 0;
    }

    if (fireBtn) fireBtn.addEventListener('click', fire);
    [mCanhaoSlider, mProjSlider, vProjSlider].forEach(el => {
      if (el) el.addEventListener('input', calculate);
    });

    calculate();

    function renderLoop() {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, w, h);

      // Chão liso sem atrito
      const groundY = h - 60;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, w, 60);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      const centerX = w / 2;

      if (animState === 'firing') {
        const vProj = parseFloat(vProjSlider.value);
        cannonX += vRecuo * 0.25;
        projX += vProj * 0.25;

        if (projX > w || cannonX < -w / 2) {
          animState = 'ready';
          cannonX = 0;
          projX = 0;
        }
      }

      // Canhão
      const cX = centerX + cannonX;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(cX - 50, groundY - 40, 65, 30, 6);
      ctx.fill();

      // Tubo do canhão
      ctx.fillStyle = '#475569';
      ctx.fillRect(cX + 10, groundY - 35, 45, 18);

      // Rodas do canhão
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cX - 25, groundY - 10, 12, 0, Math.PI * 2);
      ctx.arc(cX + 5, groundY - 10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Projétil
      const pX = (animState === 'firing') ? (centerX + 55 + projX) : (centerX + 35);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pX, groundY - 26, 8, 0, Math.PI * 2);
      ctx.fill();

      // Vetores de velocidade durante disparo
      if (animState === 'firing') {
        // Vetor recuo (esquerda)
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cX - 50, groundY - 25);
        ctx.lineTo(cX - 90, groundY - 25);
        ctx.stroke();
        ctx.fillText('V_recuo', cX - 105, groundY - 32);

        // Vetor projétil (direita)
        ctx.strokeStyle = '#34d399';
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.moveTo(pX + 10, groundY - 26);
        ctx.lineTo(pX + 55, groundY - 26);
        ctx.stroke();
        ctx.fillText('v_proj', pX + 25, groundY - 36);
      }

      requestAnimationFrame(renderLoop);
    }

    renderLoop();
  },

  // 4. TÓPICO 4: Simulador de Colisões 1D
  initTopic4: function() {
    const canvas = document.getElementById('sim-canvas-colisoes');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const m1Input = document.getElementById('col-m1');
    const m2Input = document.getElementById('col-m2');
    const v1Input = document.getElementById('col-v1');
    const v2Input = document.getElementById('col-v2');
    const eInput = document.getElementById('col-e');
    const startBtn = document.getElementById('btn-colidir');
    const resetBtn = document.getElementById('btn-reset-col');

    const outEcAntes = document.getElementById('out-ec-antes');
    const outEcDepois = document.getElementById('out-ec-depois');
    const outQConservado = document.getElementById('out-q-conservado');
    const outPerdaEc = document.getElementById('out-perda-ec');

    let x1 = 120;
    let x2 = 420;
    let v1 = 3;
    let v2 = -2;
    let hasCollided = false;
    let isRunning = false;

    function reset() {
      x1 = 100;
      x2 = 450;
      v1 = parseFloat(v1Input.value);
      v2 = parseFloat(v2Input.value);
      hasCollided = false;
      isRunning = true;
      calculateStats();
    }

    function calculateStats() {
      const m1 = parseFloat(m1Input.value);
      const m2 = parseFloat(m2Input.value);
      const u1 = parseFloat(v1Input.value);
      const u2 = parseFloat(v2Input.value);
      const e = parseFloat(eInput.value);

      const qAntes = m1 * u1 + m2 * u2;
      const ecAntes = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;

      // Velocidades finais
      const v1f = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / (m1 + m2);
      const v2f = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / (m1 + m2);
      const ecDepois = 0.5 * m1 * v1f * v1f + 0.5 * m2 * v2f * v2f;
      const perdaPercent = ((ecAntes - ecDepois) / ecAntes) * 100;

      if (outEcAntes) outEcAntes.textContent = `${ecAntes.toFixed(1)} J`;
      if (outEcDepois) outEcDepois.textContent = `${ecDepois.toFixed(1)} J`;
      if (outQConservado) outQConservado.textContent = `${qAntes.toFixed(1)} kg·m/s`;
      if (outPerdaEc) outPerdaEc.textContent = `${Math.max(0, perdaPercent).toFixed(1)}% dissipada`;
    }

    if (startBtn) startBtn.addEventListener('click', reset);
    if (resetBtn) resetBtn.addEventListener('click', reset);
    [m1Input, m2Input, v1Input, v2Input, eInput].forEach(el => {
      if (el) el.addEventListener('input', calculateStats);
    });

    calculateStats();

    function loop() {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Pista
      const trackY = h - 60;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, trackY, w - 40, 10);

      const m1 = parseFloat(m1Input.value);
      const m2 = parseFloat(m2Input.value);
      const e = parseFloat(eInput.value);

      const size1 = 28 + Math.min(30, m1 * 4);
      const size2 = 28 + Math.min(30, m2 * 4);

      if (isRunning) {
        x1 += v1;
        x2 += v2;

        // Detecção de colisão entre blocos
        if (!hasCollided && x1 + size1 >= x2) {
          hasCollided = true;
          const u1 = v1;
          const u2 = v2;
          v1 = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / (m1 + m2);
          v2 = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / (m1 + m2);
        }

        // Bater nas paredes
        if (x1 <= 30) { x1 = 30; v1 = -v1; }
        if (x2 + size2 >= w - 30) { x2 = w - 30 - size2; v2 = -v2; }
      }

      // Desenho Bloco 1
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x1, trackY - size1, size1, size1);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${m1}kg`, x1 + 6, trackY - size1 / 2 + 4);

      // Desenho Bloco 2
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x2, trackY - size2, size2, size2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${m2}kg`, x2 + 6, trackY - size2 / 2 + 4);

      // Vetores velocidade
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + size1 / 2, trackY - size1 - 12);
      ctx.lineTo(x1 + size1 / 2 + v1 * 12, trackY - size1 - 12);
      ctx.moveTo(x2 + size2 / 2, trackY - size2 - 12);
      ctx.lineTo(x2 + size2 / 2 + v2 * 12, trackY - size2 - 12);
      ctx.stroke();

      requestAnimationFrame(loop);
    }
    loop();
  },

  // 5. TÓPICO 5: Equilíbrio de Ponto Material (Cabos Suspensos)
  initTopic5: function() {
    const canvas = document.getElementById('sim-canvas-ponto');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const theta1Input = document.getElementById('eq-theta1');
    const theta2Input = document.getElementById('eq-theta2');
    const massInput = document.getElementById('eq-mass');

    const outT1 = document.getElementById('out-t1');
    const outT2 = document.getElementById('out-t2');
    const outPeso = document.getElementById('out-peso');

    function update() {
      const a1Deg = parseFloat(theta1Input.value);
      const a2Deg = parseFloat(theta2Input.value);
      const m = parseFloat(massInput.value);
      const g = 9.8;
      const P = m * g;

      const r1 = a1Deg * Math.PI / 180;
      const r2 = a2Deg * Math.PI / 180;

      // Equilíbrio:
      // T1*cos(r1) = T2*cos(r2) => T2 = T1*(cos(r1)/cos(r2))
      // T1*sin(r1) + T2*sin(r2) = P
      // T1*(sin(r1) + cos(r1)*tan(r2)) = P
      const denom = Math.sin(r1) + Math.cos(r1) * Math.tan(r2);
      const T1 = P / denom;
      const T2 = T1 * (Math.cos(r1) / Math.cos(r2));

      if (outPeso) outPeso.textContent = `${P.toFixed(1)} N`;
      if (outT1) outT1.textContent = `${T1.toFixed(1)} N`;
      if (outT2) outT2.textContent = `${T2.toFixed(1)} N`;

      draw(a1Deg, a2Deg, T1, T2, P);
    }

    function draw(a1, a2, T1, T2, P) {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Teto
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(w - 40, 40);
      ctx.stroke();

      const knotX = w / 2;
      const knotY = 160;

      // Pontos no teto baseados nos ângulos
      const r1 = a1 * Math.PI / 180;
      const r2 = a2 * Math.PI / 180;
      const leftX = Math.max(50, knotX - (knotY - 40) / Math.tan(r1));
      const rightX = Math.min(w - 50, knotX + (knotY - 40) / Math.tan(r2));

      // Cabos
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftX, 40);
      ctx.lineTo(knotX, knotY);
      ctx.lineTo(rightX, 40);
      ctx.stroke();

      // Cabo do peso
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(knotX, knotY);
      ctx.lineTo(knotX, knotY + 60);
      ctx.stroke();

      // Bloco do peso
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(knotX - 20, knotY + 60, 40, 30);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('P', knotX - 4, knotY + 78);

      // Nó
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(knotX, knotY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Vetores de Força no Nó
      // T1
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(knotX, knotY);
      ctx.lineTo(knotX - 40 * Math.cos(r1), knotY - 40 * Math.sin(r1));
      ctx.stroke();
      ctx.fillText(`T₁`, knotX - 55 * Math.cos(r1), knotY - 45 * Math.sin(r1));

      // T2
      ctx.strokeStyle = '#a78bfa';
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(knotX, knotY);
      ctx.lineTo(knotX + 40 * Math.cos(r2), knotY - 40 * Math.sin(r2));
      ctx.stroke();
      ctx.fillText(`T₂`, knotX + 45 * Math.cos(r2), knotY - 45 * Math.sin(r2));
    }

    [theta1Input, theta2Input, massInput].forEach(el => {
      if (el) el.addEventListener('input', update);
    });
    update();
  },

  // 6. TÓPICO 6: Equilíbrio de Rotação e Torque (Gangorra)
  initTopic6: function() {
    const canvas = document.getElementById('sim-canvas-torque');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const m1Input = document.getElementById('tq-m1');
    const d1Input = document.getElementById('tq-d1');
    const m2Input = document.getElementById('tq-m2');
    const d2Input = document.getElementById('tq-d2');

    const outTq1 = document.getElementById('out-tq1');
    const outTq2 = document.getElementById('out-tq2');
    const outTqRes = document.getElementById('out-tq-res');
    const outStatus = document.getElementById('out-tq-status');

    function update() {
      const m1 = parseFloat(m1Input.value);
      const d1 = parseFloat(d1Input.value);
      const m2 = parseFloat(m2Input.value);
      const d2 = parseFloat(d2Input.value);
      const g = 10;

      const tau1 = m1 * g * d1; // sentido anti-horário (+)
      const tau2 = m2 * g * d2; // sentido horário (-)
      const tauRes = tau1 - tau2;

      if (outTq1) outTq1.textContent = `${tau1.toFixed(0)} N·m (+)`;
      if (outTq2) outTq2.textContent = `${tau2.toFixed(0)} N·m (-)`;
      if (outTqRes) outTqRes.textContent = `${Math.abs(tauRes).toFixed(0)} N·m`;

      if (outStatus) {
        if (Math.abs(tauRes) < 1) {
          outStatus.textContent = '⚖️ EQUILÍBRIO ESTÁTICO PERFEITO!';
          outStatus.style.color = '#34d399';
        } else if (tauRes > 0) {
          outStatus.textContent = '↺ Gira no Sentido Anti-horário (Lado Esquerdo)';
          outStatus.style.color = '#38bdf8';
        } else {
          outStatus.textContent = '↻ Gira no Sentido Horário (Lado Direito)';
          outStatus.style.color = '#f43f5e';
        }
      }

      draw(m1, d1, m2, d2, tauRes);
    }

    function draw(m1, d1, m2, d2, tauRes) {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      const pivotX = w / 2;
      const pivotY = h - 90;
      const beamLength = Math.min(w - 80, 500);

      // Ângulo de inclinação baseado no torque resultante
      const maxTilt = 0.25; // radianos
      const tilt = Math.max(-maxTilt, Math.min(maxTilt, -tauRes * 0.005));

      // Suporte Triangular Central
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX - 25, pivotY + 50);
      ctx.lineTo(pivotX + 25, pivotY + 50);
      ctx.closePath();
      ctx.fill();

      // Barra / Viga inclinada
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(tilt);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-beamLength / 2, -8, beamLength, 16);

      // Marcações de régua
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        const xPos = (i / 5) * (beamLength / 2);
        ctx.beginPath();
        ctx.moveTo(xPos, -8);
        ctx.lineTo(xPos, 8);
        ctx.stroke();
      }

      // Bloco 1 (esquerda a d1)
      const x1 = -(d1 / 5) * (beamLength / 2);
      const bSize1 = 20 + m1 * 2;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x1 - bSize1 / 2, -8 - bSize1, bSize1, bSize1);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${m1}kg`, x1 - 10, -12);

      // Bloco 2 (direita a d2)
      const x2 = (d2 / 5) * (beamLength / 2);
      const bSize2 = 20 + m2 * 2;
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x2 - bSize2 / 2, -8 - bSize2, bSize2, bSize2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${m2}kg`, x2 - 10, -12);

      ctx.restore();

      // Pivô
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    [m1Input, d1Input, m2Input, d2Input].forEach(el => {
      if (el) el.addEventListener('input', update);
    });
    update();
  },

  // 7. TÓPICO 7: Hidrostática & Limite Físico de Sucção
  initTopic7: function() {
    const canvas = document.getElementById('sim-canvas-succao');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const liquidSelect = document.getElementById('suc-liquido');
    const patmInput = document.getElementById('suc-patm');
    const ptopInput = document.getElementById('suc-ptop');

    const outDensidade = document.getElementById('out-densidade');
    const outHMax = document.getElementById('out-hmax');
    const outHReal = document.getElementById('out-hreal');
    const outExplicacao = document.getElementById('out-suc-exp');

    function update() {
      const type = liquidSelect.value;
      const pAtm = parseFloat(patmInput.value) * 1000; // kPa -> Pa
      const pTop = parseFloat(ptopInput.value) * 1000; // kPa -> Pa
      const g = 9.8;

      let rho = 1000; // Água
      let cor = '#38bdf8';
      let nome = 'Água';

      if (type === 'hg') {
        rho = 13600;
        cor = '#94a3b8';
        nome = 'Mercúrio (Hg)';
      } else if (type === 'alcool') {
        rho = 800;
        cor = '#f43f5e';
        nome = 'Álcool Etílico';
      }

      const deltaP = Math.max(0, pAtm - pTop);
      const hReal = deltaP / (rho * g);
      const hMax = pAtm / (rho * g);

      if (outDensidade) outDensidade.textContent = `${rho} kg/m³`;
      if (outHMax) outHMax.textContent = `${hMax.toFixed(2)} m`;
      if (outHReal) outHReal.textContent = `${hReal.toFixed(2)} m`;

      if (outExplicacao) {
        if (pTop === 0) {
          outExplicacao.textContent = `Vácuo Perfeito no topo! Coluna atingiu o LIMITE FÍSICO MÁXIMO da atmosfera: ${hMax.toFixed(2)}m. Nenhuma bomba de sucção no mundo consegue puxar mais alto!`;
        } else {
          outExplicacao.textContent = `A pressão atmosférica externa de ${(pAtm/1000).toFixed(0)} kPa empurra o líquido até ${hReal.toFixed(2)}m contra a pressão interna residual de ${(pTop/1000).toFixed(0)} kPa.`;
        }
      }

      draw(hReal, hMax, cor, nome);
    }

    function draw(hReal, hMax, cor, nome) {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Cuba aberta de líquido
      const cubaY = h - 60;
      ctx.fillStyle = cor;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(80, cubaY, w - 160, 40);
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2;
      ctx.strokeRect(80, cubaY, w - 160, 40);

      // Pressão Atmosférica empurrando a cuba (setas azuis para baixo)
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('P_atm ↓', 110, cubaY - 14);
      ctx.fillText('P_atm ↓', w - 170, cubaY - 14);

      // Tubo de sucção vertical no meio
      const tubeW = 40;
      const tubeX = w / 2 - tubeW / 2;
      const tubeTopY = 30;
      const tubeBottomY = cubaY + 30;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(tubeX, tubeTopY, tubeW, tubeBottomY - tubeTopY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(tubeX, tubeTopY, tubeW, tubeBottomY - tubeTopY);

      // Altura da coluna líquida escalada
      const maxColHeightPx = cubaY - tubeTopY - 10;
      const heightPercent = Math.min(1.0, hReal / 12.0); // 12 metros = teto visual
      const colHeightPx = heightPercent * maxColHeightPx;

      ctx.fillStyle = cor;
      ctx.fillRect(tubeX + 2, cubaY - colHeightPx, tubeW - 4, colHeightPx + 30);

      // Marcador de Altura h
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(tubeX + tubeW + 15, cubaY);
      ctx.lineTo(tubeX + tubeW + 15, cubaY - colHeightPx);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '12px monospace';
      ctx.fillText(`h = ${hReal.toFixed(2)} m`, tubeX + tubeW + 22, cubaY - colHeightPx / 2);
    }

    [liquidSelect, patmInput, ptopInput].forEach(el => {
      if (el) el.addEventListener('input', update);
    });
    update();
  },

  // 8. TÓPICO 8: Prensa Hidráulica e Tubo em U
  initTopic8: function() {
    const canvas = document.getElementById('sim-canvas-vasos');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rho1Input = document.getElementById('vas-rho1');
    const rho2Input = document.getElementById('vas-rho2');
    const h1Input = document.getElementById('vas-h1');

    const outRho1 = document.getElementById('out-vas-rho1');
    const outRho2 = document.getElementById('out-vas-rho2');
    const outH2 = document.getElementById('out-vas-h2');
    const outRegra = document.getElementById('out-vas-regra');

    function update() {
      const rho1 = parseFloat(rho1Input.value); // Líquido 1 (g/cm³)
      const rho2 = parseFloat(rho2Input.value); // Líquido 2 (g/cm³)
      const h1 = parseFloat(h1Input.value);     // cm

      // Vasos Comunicantes: rho1 * h1 = rho2 * h2 => h2 = (rho1 * h1) / rho2
      const h2 = (rho1 * h1) / rho2;

      if (outRho1) outRho1.textContent = `${rho1.toFixed(2)} g/cm³`;
      if (outRho2) outRho2.textContent = `${rho2.toFixed(2)} g/cm³`;
      if (outH2) outH2.textContent = `${h2.toFixed(1)} cm`;

      if (outRegra) {
        if (rho1 < rho2) {
          outRegra.textContent = `Líquido 1 é menos denso que Líquido 2 → atinge maior altura (h₁ > h₂).`;
        } else if (rho1 > rho2) {
          outRegra.textContent = `Líquido 1 é mais denso que Líquido 2 → atinge menor altura (h₁ < h₂).`;
        } else {
          outRegra.textContent = `Densidades iguais → alturas livres idênticas (h₁ = h₂).`;
        }
      }

      draw(rho1, rho2, h1, h2);
    }

    function draw(rho1, rho2, h1, h2) {
      canvas.width = canvas.parentElement.clientWidth || 600;
      canvas.height = canvas.parentElement.clientHeight || 280;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Tubo em U
      const pipeW = 45;
      const leftX = w / 2 - 110;
      const rightX = w / 2 + 110 - pipeW;
      const bottomY = h - 40;
      const pipeTopY = 40;

      // Base e Ramos
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Ramo esquerdo
      ctx.moveTo(leftX, pipeTopY);
      ctx.lineTo(leftX, bottomY);
      // Fundo horizontal
      ctx.lineTo(rightX + pipeW, bottomY);
      // Ramo direito
      ctx.lineTo(rightX + pipeW, pipeTopY);
      ctx.stroke();

      // Interface inferior isobárica de referência
      const refY = bottomY - 60;
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(leftX - 20, refY);
      ctx.lineTo(rightX + pipeW + 20, refY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px monospace';
      ctx.fillText('Nível Isobárico (p_A = p_B)', leftX - 15, refY - 8);

      // Líquido 2 (base e ramo direito)
      const scale = 2.4;
      const col2Height = h2 * scale;
      const col1Height = h1 * scale;

      // Líquido 2 na base e ramo direito
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      // Fundo
      ctx.fillRect(leftX + 2, refY, rightX - leftX + pipeW - 4, bottomY - refY);
      // Ramo direito subindo até h2 acima do nível de referência
      ctx.fillRect(rightX + 2, refY - col2Height, pipeW - 4, col2Height);

      // Líquido 1 no ramo esquerdo acima do nível de referência
      ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.fillRect(leftX + 2, refY - col1Height, pipeW - 4, col1Height);

      // Legendas
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`Líquido 1 (h₁ = ${h1}cm)`, leftX - 60, refY - col1Height / 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Líquido 2 (h₂ = ${h2.toFixed(1)}cm)`, rightX + pipeW + 10, refY - col2Height / 2);
    }

    [rho1Input, rho2Input, h1Input].forEach(el => {
      if (el) el.addEventListener('input', update);
    });
    update();
  }
};
