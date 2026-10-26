/**
 * SIMULADORES QUÍMICOS INTERATIVOS
 * Módulos dedicados para Estequiometria, Leis Ponderais e Reações
 * Autor: Rafa / Antigravity
 */

window.ChemistrySims = {

  // 1. TÓPICO 1: Balança de Lavoisier (Lei de Conservação das Massas)
  initTopic1: function() {
    const canvas = document.getElementById('sim-canvas-lavoisier');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderM1 = document.getElementById('slider-m1');
    const sliderM2 = document.getElementById('slider-m2');
    const toggleVaso = document.getElementById('toggle-vaso');
    const btnReagir = document.getElementById('btn-reagir-lav');
    const btnReset = document.getElementById('btn-reset-lav');

    const valM1 = document.getElementById('val-m1');
    const valM2 = document.getElementById('val-m2');
    const valVaso = document.getElementById('val-vaso');

    const outMInicial = document.getElementById('out-m-inicial');
    const outMFinal = document.getElementById('out-m-final');
    const outMGas = document.getElementById('out-m-gas');
    const outStatus = document.getElementById('out-status-lav');

    let reacted = false;
    let animProgress = 0; // 0 a 1
    let animId = null;

    function update() {
      const m1 = parseFloat(sliderM1.value);
      const m2 = parseFloat(sliderM2.value);
      const isFechado = toggleVaso.checked;

      if (valM1) valM1.textContent = `${m1.toFixed(1)} g`;
      if (valM2) valM2.textContent = `${m2.toFixed(1)} g`;
      if (valVaso) valVaso.textContent = isFechado ? 'Fechado (Com Tampa)' : 'Aberto (Gás Escapa)';

      const mTotalInicial = m1 + m2;
      // Gás CO2 gerado: ~44% da reação entre bicarbonato e ácido acético
      const mGas = (m1 * 0.44);
      let mFinal;
      if (reacted) {
        mFinal = isFechado ? mTotalInicial : (mTotalInicial - mGas * animProgress);
      } else {
        mFinal = mTotalInicial;
      }

      if (outMInicial) outMInicial.textContent = `${mTotalInicial.toFixed(1)} g`;
      if (outMFinal) outMFinal.textContent = `${mFinal.toFixed(1)} g`;
      if (outMGas) outMGas.textContent = `${(mGas * (reacted ? animProgress : 0)).toFixed(1)} g`;
      if (outStatus) {
        if (!reacted) {
          outStatus.textContent = 'Reagentes Prontos';
          outStatus.style.color = '#38bdf8';
        } else if (isFechado) {
          outStatus.textContent = 'Massa Conservada (Δm = 0 g)';
          outStatus.style.color = '#4ade80';
        } else {
          outStatus.textContent = `Gás Escapou (-${mGas.toFixed(1)} g)`;
          outStatus.style.color = '#f87171';
        }
      }

      draw(mTotalInicial, mFinal, isFechado, m1, m2);
    }

    function draw(mInit, mFin, isFechado, m1, m2) {
      const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : 650;
      const parentH = canvas.parentElement ? canvas.parentElement.clientHeight : 230;
      canvas.width = parentW > 50 ? parentW : 650;
      canvas.height = parentH > 50 ? parentH : 230;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Fundo elegante de laboratório
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a1020');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Bancada de laboratório
      const benchY = h - 35;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, benchY, w, 35);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, benchY);
      ctx.lineTo(w, benchY);
      ctx.stroke();

      // Balança digital eletrônica centralizada
      const scaleW = 220;
      const scaleH = 45;
      const scaleX = w / 2 - scaleW / 2;
      const scaleY = benchY - scaleH;

      // Base da balança
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(scaleX, scaleY, scaleW, scaleH, 8) : ctx.rect(scaleX, scaleY, scaleW, scaleH);
      ctx.fill();
      ctx.stroke();

      // Display digital LED
      const dispW = 120;
      const dispH = 26;
      const dispX = scaleX + scaleW / 2 - dispW / 2;
      const dispY = scaleY + 10;
      ctx.fillStyle = '#020617';
      ctx.fillRect(dispX, dispY, dispW, dispH);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(dispX, dispY, dispW, dispH);

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`${mFin.toFixed(2)} g`, dispX + dispW / 2, dispY + 18);

      // Prato de pesagem metálico
      const plateW = 160;
      const plateH = 8;
      const plateX = w / 2 - plateW / 2;
      const plateY = scaleY - plateH;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(plateX, plateY, plateW, plateH);

      // Erlenmeyer / Frasco sobre a balança
      const flaskW = 90;
      const flaskH = 95;
      const flaskX = w / 2 - flaskW / 2;
      const flaskY = plateY - flaskH;

      ctx.save();
      // Desenho do corpo do erlenmeyer (vidro)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 15, flaskY); // Gargalo esquerdo
      ctx.lineTo(w / 2 - 15, flaskY + 28);
      ctx.lineTo(flaskX, flaskY + flaskH); // Base esquerda
      ctx.lineTo(flaskX + flaskW, flaskY + flaskH); // Base direita
      ctx.lineTo(w / 2 + 15, flaskY + 28);
      ctx.lineTo(w / 2 + 15, flaskY); // Gargalo direito
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tampa de borracha se fechado
      if (isFechado) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(w / 2 - 18, flaskY - 6, 36, 8);
        ctx.strokeStyle = '#fda4af';
        ctx.strokeRect(w / 2 - 18, flaskY - 6, 36, 8);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('TAMPA', w / 2, flaskY - 10);
      } else {
        // Gás saindo em fumacinha se reagiu e aberto
        if (reacted && animProgress > 0) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.lineWidth = 1.5;
          for (let i = -10; i <= 10; i += 10) {
            ctx.beginPath();
            ctx.moveTo(w / 2 + i, flaskY);
            ctx.quadraticCurveTo(w / 2 + i + 10 * Math.sin(animProgress * 5), flaskY - 25, w / 2 + i, flaskY - 45);
            ctx.stroke();
          }
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#f87171';
          ctx.fillText('CO₂ escapando ↗', w / 2 + 45, flaskY - 25);
        }
      }

      // Líquido e efervescência dentro do frasco
      const liquidLevel = flaskY + flaskH - 40;
      ctx.fillStyle = reacted ? 'rgba(52, 211, 153, 0.45)' : 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.moveTo(flaskX + 12, flaskY + flaskH - 4);
      ctx.lineTo(flaskX + 22, liquidLevel);
      ctx.lineTo(flaskX + flaskW - 22, liquidLevel);
      ctx.lineTo(flaskX + flaskW - 12, flaskY + flaskH - 4);
      ctx.closePath();
      ctx.fill();

      // Bolhas de efervescência
      if (reacted && animProgress < 1) {
        ctx.fillStyle = '#ffffff';
        for (let b = 0; b < 6; b++) {
          const bx = flaskX + 25 + (b * 7) % 40;
          const by = liquidLevel + 8 + (b * 6) % 25;
          ctx.beginPath();
          ctx.arc(bx, by, 2 + (b % 2), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Legendas informativas
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('Reação: NaHCO₃ (sólido) + CH₃COOH (líquido) → NaAc + H₂O + CO₂ (gás)', 20, 26);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(isFechado ? '• Sistema FECHADO: O gás fica retido. A balança mantém o valor rigorosamente igual.' : '• Sistema ABERTO: O gás CO₂ se dispersa no ar, aparentando "perda de massa".', 20, 44);
    }

    function triggerReaction() {
      if (reacted) return;
      reacted = true;
      animProgress = 0;
      const startTime = performance.now();

      function step(now) {
        animProgress = Math.min(1, (now - startTime) / 1200);
        update();
        if (animProgress < 1) {
          animId = requestAnimationFrame(step);
        }
      }
      animId = requestAnimationFrame(step);
    }

    function reset() {
      if (animId) cancelAnimationFrame(animId);
      reacted = false;
      animProgress = 0;
      update();
    }

    if (sliderM1) sliderM1.addEventListener('input', update);
    if (sliderM2) sliderM2.addEventListener('input', update);
    if (toggleVaso) toggleVaso.addEventListener('change', update);
    if (btnReagir) btnReagir.addEventListener('click', triggerReaction);
    if (btnReset) btnReset.addEventListener('click', reset);

    window.addEventListener('slideChanged', (e) => {
      if (e.detail && e.detail.slideIndex === 4) update();
    });

    update();
  },

  // 2. TÓPICO 2: Balanceamento Atômico por Coeficientes
  initTopic2: function() {
    const canvas = document.getElementById('sim-canvas-balanc');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const coefN2 = document.getElementById('coef-n2');
    const coefH2 = document.getElementById('coef-h2');
    const coefNH3 = document.getElementById('coef-nh3');
    const btnVerificar = document.getElementById('btn-check-balanc');
    const outStatus = document.getElementById('out-status-balanc');

    function update() {
      const a = parseInt(coefN2.value, 10) || 1;
      const b = parseInt(coefH2.value, 10) || 1;
      const c = parseInt(coefNH3.value, 10) || 1;

      // Reagentes:
      // N2 tem 2 átomos de N
      // H2 tem 2 átomos de H
      const N_reag = a * 2;
      const H_reag = b * 2;

      // Produtos:
      // NH3 tem 1 N e 3 H
      const N_prod = c * 1;
      const H_prod = c * 3;

      const isBalanced = (N_reag === N_prod) && (H_reag === H_prod);

      if (outStatus) {
        if (isBalanced) {
          outStatus.textContent = `✅ Equação Perfeitamente Balanceada! (${a} N₂ + ${b} H₂ → ${c} NH₃)`;
          outStatus.style.color = '#34d399';
        } else {
          outStatus.textContent = `❌ Desbalanceada: Reagentes [N=${N_reag}, H=${H_reag}] vs Produtos [N=${N_prod}, H=${H_prod}]`;
          outStatus.style.color = '#f87171';
        }
      }

      draw(a, b, c, N_reag, H_reag, N_prod, H_prod, isBalanced);
    }

    function draw(a, b, c, Nr, Hr, Np, Hp, isBalanced) {
      const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : 650;
      const parentH = canvas.parentElement ? canvas.parentElement.clientHeight : 230;
      canvas.width = parentW > 50 ? parentW : 650;
      canvas.height = parentH > 50 ? parentH : 230;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Fundo escuro
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, w, h);

      // Divisória Reagentes | Produtos
      const midX = w / 2;
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(midX, 20);
      ctx.lineTo(midX, h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Títulos
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`REAGENTES (${a} N₂ + ${b} H₂)`, midX / 2, 30);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`PRODUTOS (${c} NH₃)`, midX + midX / 2, 30);

      // Seta de reação no centro
      ctx.font = '22px sans-serif';
      ctx.fillStyle = isBalanced ? '#34d399' : '#64748b';
      ctx.fillText('➔', midX, h / 2 + 6);

      // Desenhar átomos dos reagentes
      // N = Azul grande, H = Branco pequeno
      const startYr = 60;
      let curYr = startYr;

      // Desenha moléculas N2
      ctx.textAlign = 'left';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${a}x Moléculas N₂:`, 25, curYr);
      curYr += 16;
      for (let i = 0; i < a; i++) {
        const mx = 35 + i * 46;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(mx, curYr, 9, 0, Math.PI * 2);
        ctx.arc(mx + 14, curYr, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();
      }

      curYr += 32;
      // Desenha moléculas H2
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${b}x Moléculas H₂:`, 25, curYr);
      curYr += 16;
      for (let i = 0; i < b; i++) {
        const mx = 35 + (i % 6) * 36;
        const my = curYr + Math.floor(i / 6) * 22;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.arc(mx + 10, my, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
      }

      // Desenhar moléculas de NH3 dos produtos
      let curYp = startYr;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${c}x Moléculas NH₃:`, midX + 25, curYp);
      curYp += 20;

      for (let i = 0; i < c; i++) {
        const mx = midX + 45 + (i % 4) * 60;
        const my = curYp + Math.floor(i / 4) * 44;

        // Átomo Central N
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(mx, my, 9, 0, Math.PI * 2);
        ctx.fill();

        // 3 átomos de H ligados
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(mx - 9, my + 8, 5, 0, Math.PI * 2);
        ctx.arc(mx + 9, my + 8, 5, 0, Math.PI * 2);
        ctx.arc(mx, my - 11, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Placar comparativo na base
      const boxY = h - 45;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = isBalanced ? '#34d399' : '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(20, boxY, w - 40, 36, 6) : ctx.rect(20, boxY, w - 40, 36);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Contagem de Átomos: Nitrogênio (N): ${Nr} nos reagentes vs ${Np} nos produtos | Hidrogênio (H): ${Hr} nos reagentes vs ${Hp} nos produtos`, w / 2, boxY + 22);
    }

    [coefN2, coefH2, coefNH3].forEach(el => {
      if (el) el.addEventListener('input', update);
    });
    if (btnVerificar) btnVerificar.addEventListener('click', update);

    window.addEventListener('slideChanged', (e) => {
      if (e.detail && e.detail.slideIndex === 4) update();
    });

    update();
  },

  // 3. TÓPICO 3: A Escala do Mol & O Gigantismo de Avogadro
  initTopic3: function() {
    const canvas = document.getElementById('sim-canvas-mol');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const selectSubst = document.getElementById('select-subst-mol');
    const sliderMols = document.getElementById('slider-mols');
    const valMols = document.getElementById('val-mols');

    const outMassa = document.getElementById('out-massa-mol');
    const outParticulas = document.getElementById('out-particulas-mol');
    const outVolume = document.getElementById('out-volume-mol');
    const outVisual = document.getElementById('out-visual-mol');

    // Dados molares: Massa Molar (g/mol), estado, densidade aprox ou CNTP
    const dados = {
      'H2O': { nome: 'Água (H₂O)', mm: 18, tipo: 'líquido', desc: '18g = ~18 mL (um gole de água)' },
      'C12H22O11': { nome: 'Sacarose / Açúcar', mm: 342, tipo: 'sólido', desc: '342g = ~1 xícara e meia cheia' },
      'CO2': { nome: 'Gás Carbônico (CO₂)', mm: 44, tipo: 'gas', desc: '44g = 22,4 L na CNTP (uma bola grande)' },
      'Fe': { nome: 'Ferro Metálico (Fe)', mm: 56, tipo: 'metal', desc: '56g = ~1 barra de ferro de 7,1 cm³' },
      'NaCl': { nome: 'Sal de Cozinha (NaCl)', mm: 58.5, tipo: 'sal', desc: '58,5g = ~3 colheres de sopa' }
    };

    function update() {
      const sKey = selectSubst.value || 'H2O';
      const info = dados[sKey];
      const mols = parseFloat(sliderMols.value) || 1;

      if (valMols) valMols.textContent = `${mols.toFixed(1)} mol`;

      const massaTotal = mols * info.mm;
      const nParticulasExpo = (mols * 6.02).toFixed(2);
      const volumeGasCNTP = (mols * 22.4).toFixed(1);

      if (outMassa) outMassa.textContent = `${massaTotal.toFixed(1)} g`;
      if (outParticulas) outParticulas.textContent = `${nParticulasExpo} × 10²³ moléculas`;
      if (outVolume) {
        if (info.tipo === 'gas') {
          outVolume.textContent = `${volumeGasCNTP} L (CNTP)`;
        } else {
          outVolume.textContent = `${(massaTotal / (info.tipo === 'líquido' ? 1 : 2.5)).toFixed(1)} mL`;
        }
      }
      if (outVisual) outVisual.textContent = info.desc;

      draw(info, mols, massaTotal);
    }

    function draw(info, mols, massaTotal) {
      const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : 650;
      const parentH = canvas.parentElement ? canvas.parentElement.clientHeight : 230;
      canvas.width = parentW > 50 ? parentW : 650;
      canvas.height = parentH > 50 ? parentH : 230;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, w, h);

      // Caixa 1: O "Pacote" Macroscópico (O que vemos)
      const box1W = w * 0.44;
      const boxH = h - 40;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(20, 20, box1W, boxH, 8) : ctx.rect(20, 20, box1W, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('Mundo Macroscópico (Laboratório)', 20 + box1W / 2, 40);

      // Ilustração da porção
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      const radiusPorcao = Math.min(48, 18 + mols * 10);
      ctx.arc(20 + box1W / 2, 100, radiusPorcao, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${massaTotal.toFixed(1)} gramas de ${info.nome}`, 20 + box1W / 2, 160);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Quantidade: ${mols.toFixed(1)} mol`, 20 + box1W / 2, 180);

      // Seta de conexão
      ctx.fillStyle = '#facc15';
      ctx.font = '24px sans-serif';
      ctx.fillText('⇄', w / 2, h / 2);

      // Caixa 2: O Mundo Nanoscópico (O mar de partículas)
      const box2X = w - box1W - 20;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(box2X, 20, box1W, boxH, 8) : ctx.rect(box2X, 20, box1W, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('Mundo Microscópico (Partículas)', box2X + box1W / 2, 40);

      // Desenhar constelação densa de partículas
      const numDots = Math.min(120, Math.round(mols * 35));
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < numDots; i++) {
        // Pseudo aleatório fixo com seed
        const px = box2X + 25 + ((i * 37) % (box1W - 50));
        const py = 60 + ((i * 47) % (boxH - 85));
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Exactamente ${ (mols * 6.02).toFixed(2) } × 10²³ unidades!`, box2X + box1W / 2, h - 35);
    }

    if (selectSubst) selectSubst.addEventListener('change', update);
    if (sliderMols) sliderMols.addEventListener('input', update);

    window.addEventListener('slideChanged', (e) => {
      if (e.detail && e.detail.slideIndex === 4) update();
    });

    update();
  },

  // 4. TÓPICO 4: Reagente Limitante & Em Excesso (Síntese da Água)
  initTopic4: function() {
    const canvas = document.getElementById('sim-canvas-limitante');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderH2 = document.getElementById('slider-n-h2');
    const sliderO2 = document.getElementById('slider-n-o2');
    const btnReagir = document.getElementById('btn-reagir-lim');
    const btnReset = document.getElementById('btn-reset-lim');

    const valH2 = document.getElementById('val-n-h2');
    const valO2 = document.getElementById('val-n-o2');

    const outLimitante = document.getElementById('out-limitante');
    const outExcesso = document.getElementById('out-excesso');
    const outH2O = document.getElementById('out-h2o-formado');
    const outSobra = document.getElementById('out-sobra');

    let reacted = false;

    function update() {
      const nH2 = parseInt(sliderH2.value, 10);
      const nO2 = parseInt(sliderO2.value, 10);

      if (valH2) valH2.textContent = `${nH2} mol`;
      if (valO2) valO2.textContent = `${nO2} mol`;

      // Equação: 2 H2 + 1 O2 -> 2 H2O
      // Proporção estequiométrica: 2 mols de H2 para 1 mol de O2
      // Quantas reações completas podemos fazer?
      const maxReacoesPorH2 = nH2 / 2;
      const maxReacoesPorO2 = nO2 / 1;

      let limitante, excesso, h2oFormado, sobraMol;

      if (maxReacoesPorH2 < maxReacoesPorO2) {
        // H2 acaba primeiro
        limitante = 'H₂ (Hidrogênio)';
        excesso = 'O₂ (Oxigênio)';
        const reacoes = maxReacoesPorH2;
        h2oFormado = reacoes * 2;
        const o2Consumido = reacoes * 1;
        sobraMol = `${(nO2 - o2Consumido).toFixed(1)} mol de O₂`;
      } else if (maxReacoesPorH2 > maxReacoesPorO2) {
        // O2 acaba primeiro
        limitante = 'O₂ (Oxigênio)';
        excesso = 'H₂ (Hidrogênio)';
        const reacoes = maxReacoesPorO2;
        h2oFormado = reacoes * 2;
        const h2Consumido = reacoes * 2;
        sobraMol = `${(nH2 - h2Consumido).toFixed(1)} mol de H₂`;
      } else {
        limitante = 'Nenhum (Proporção Estequiométrica Perfeita)';
        excesso = 'Nenhum';
        h2oFormado = nH2;
        sobraMol = '0 mol (Tudo consumido)';
      }

      if (outLimitante) outLimitante.textContent = limitante;
      if (outExcesso) outExcesso.textContent = excesso;
      if (outH2O) outH2O.textContent = `${h2oFormado} mol de H₂O (${h2oFormado * 18} g)`;
      if (outSobra) outSobra.textContent = sobraMol;

      draw(nH2, nO2, h2oFormado, limitante);
    }

    function draw(nH2, nO2, nH2O, limitante) {
      const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : 650;
      const parentH = canvas.parentElement ? canvas.parentElement.clientHeight : 230;
      canvas.width = parentW > 50 ? parentW : 650;
      canvas.height = parentH > 50 ? parentH : 230;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, w, h);

      // Reatores Visuais: Antes e Depois
      const colW = w / 2 - 30;
      
      // Coluna 1: Reagentes adicionados no início
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(20, 20, colW, h - 40, 8) : ctx.rect(20, 20, colW, h - 40);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('1. Reagentes Iniciais no Vaso', 20 + colW / 2, 40);

      // Renderiza ícones de H2 e O2
      ctx.textAlign = 'left';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`• ${nH2} mols de H₂ (Branco)`, 35, 68);
      for (let i = 0; i < nH2; i++) {
        const x = 40 + (i % 6) * 32;
        const y = 85 + Math.floor(i / 6) * 18;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.arc(x + 7, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      const o2StartY = 125;
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`• ${nO2} mols de O₂ (Vermelho)`, 35, o2StartY);
      for (let i = 0; i < nO2; i++) {
        const x = 40 + (i % 5) * 36;
        const y = o2StartY + 18 + Math.floor(i / 5) * 20;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.arc(x + 9, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Seta central
      ctx.textAlign = 'center';
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText('➔', w / 2, h / 2);

      // Coluna 2: Após a Reação (Produtos + Sobra)
      const col2X = w / 2 + 10;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(col2X, 20, colW, h - 40, 8) : ctx.rect(col2X, 20, colW, h - 40);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText('2. Resultado Final Após Reação', col2X + colW / 2, 40);

      ctx.textAlign = 'left';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`• Formados: ${nH2O} mols de H₂O`, col2X + 15, 68);

      // Moléculas de H2O formadas
      for (let i = 0; i < nH2O; i++) {
        const x = col2X + 25 + (i % 5) * 44;
        const y = 88 + Math.floor(i / 5) * 26;
        // Oxigênio
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        // Hidrogênios
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(x - 5, y - 5, 4, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#facc15';
      ctx.fillText(`• Limitante: ${limitante}`, col2X + 15, h - 35);
    }

    if (sliderH2) sliderH2.addEventListener('input', update);
    if (sliderO2) sliderO2.addEventListener('input', update);
    if (btnReagir) btnReagir.addEventListener('click', update);
    if (btnReset) btnReset.addEventListener('click', () => {
      sliderH2.value = 4;
      sliderO2.value = 2;
      update();
    });

    window.addEventListener('slideChanged', (e) => {
      if (e.detail && e.detail.slideIndex === 4) update();
    });

    update();
  },

  // 5. TÓPICO 5: Grau de Pureza & Rendimento Real da Reação
  initTopic5: function() {
    const canvas = document.getElementById('sim-canvas-rendimento');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderBruta = document.getElementById('slider-m-bruta');
    const sliderPureza = document.getElementById('slider-pureza');
    const sliderRendimento = document.getElementById('slider-rendimento');

    const valBruta = document.getElementById('val-m-bruta');
    const valPureza = document.getElementById('val-pureza');
    const valRendimento = document.getElementById('val-rendimento');

    const outPura = document.getElementById('out-m-pura');
    const outTeorico = document.getElementById('out-teorico');
    const outReal = document.getElementById('out-real');

    function update() {
      const mBruta = parseFloat(sliderBruta.value) || 100;
      const pureza = parseFloat(sliderPureza.value) || 80;
      const rendimento = parseFloat(sliderRendimento.value) || 75;

      if (valBruta) valBruta.textContent = `${mBruta.toFixed(0)} g`;
      if (valPureza) valPureza.textContent = `${pureza.toFixed(0)}%`;
      if (valRendimento) valRendimento.textContent = `${rendimento.toFixed(0)}%`;

      // Exemplo prático clássico: Decomposição térmica do calcário (CaCO3 -> CaO + CO2)
      // 100g de CaCO3 puro produz teoricamente 56g de CaO (cal virgem)
      const mPura = mBruta * (pureza / 100);
      const mCaO_teorica = mPura * (56 / 100);
      const mCaO_real = mCaO_teorica * (rendimento / 100);

      if (outPura) outPura.textContent = `${mPura.toFixed(1)} g CaCO₃`;
      if (outTeorico) outTeorico.textContent = `${mCaO_teorica.toFixed(1)} g CaO`;
      if (outReal) outReal.textContent = `${mCaO_real.toFixed(1)} g CaO (${((mCaO_real / (mBruta * 0.56)) * 100).toFixed(1)}% do total bruto)`;

      draw(mBruta, pureza, rendimento, mPura, mCaO_teorica, mCaO_real);
    }

    function draw(mBruta, pur, rend, mPura, mTeorica, mReal) {
      const parentW = canvas.parentElement ? canvas.parentElement.clientWidth : 650;
      const parentH = canvas.parentElement ? canvas.parentElement.clientHeight : 230;
      canvas.width = parentW > 50 ? parentW : 650;
      canvas.height = parentH > 50 ? parentH : 230;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, w, h);

      // 3 Estágios em cascata visual
      const colW = (w - 60) / 3;

      // Estágio 1: Minério Bruto (Calcário com Impurezas)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(15, 20, colW, h - 40, 8) : ctx.rect(15, 20, colW, h - 40);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('1. AMOSTRA BRUTA', 15 + colW / 2, 40);

      // Barra de pureza dividida
      const barX = 25;
      const barY = 60;
      const barW = colW - 20;
      const barH = 50;

      const puraW = barW * (pur / 100);
      const impuraW = barW - puraW;

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX, barY, puraW, barH);
      ctx.fillStyle = '#475569';
      ctx.fillRect(barX + puraW, barY, impuraW, barH);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Puro: ${pur}%`, barX + puraW / 2, barY + 28);
      if (impuraW > 25) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`Lixo`, barX + puraW + impuraW / 2, barY + 28);
      }

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Massa Pura: ${mPura.toFixed(1)} g`, 15 + colW / 2, 135);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`Impureza: ${(mBruta - mPura).toFixed(1)} g`, 15 + colW / 2, 155);

      // Seta 1
      ctx.fillStyle = '#facc15';
      ctx.font = '18px sans-serif';
      ctx.fillText('➔', 15 + colW + 7, h / 2);

      // Estágio 2: Rendimento Teórico (100% no papel)
      const col2X = 25 + colW;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(col2X, 20, colW, h - 40, 8) : ctx.rect(col2X, 20, colW, h - 40);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('2. CÁLCULO TEÓRICO', col2X + colW / 2, 40);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Se η = 100%:', col2X + colW / 2, 75);
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${mTeorica.toFixed(1)} g CaO`, col2X + colW / 2, 105);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Expectativa estequiométrica ideal', col2X + colW / 2, 135);

      // Seta 2
      ctx.fillStyle = '#facc15';
      ctx.font = '18px sans-serif';
      ctx.fillText('➔', col2X + colW + 7, h / 2);

      // Estágio 3: Rendimento Real (Laboratório)
      const col3X = 35 + colW * 2;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(col3X, 20, colW, h - 40, 8) : ctx.rect(col3X, 20, colW, h - 40);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText('3. OBTIDO REAL', col3X + colW / 2, 40);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Rendimento: ${rend}%`, col3X + colW / 2, 75);

      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`${mReal.toFixed(1)} g CaO`, col3X + colW / 2, 105);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.fillText(`Perda real: ${(mTeorica - mReal).toFixed(1)} g`, col3X + colW / 2, 135);
    }

    [sliderBruta, sliderPureza, sliderRendimento].forEach(el => {
      if (el) el.addEventListener('input', update);
    });

    window.addEventListener('slideChanged', (e) => {
      if (e.detail && e.detail.slideIndex === 4) update();
    });

    update();
  }
};
