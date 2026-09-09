/**
 * MOTOR DE ANOTAÇÕES & LOUSA VIRTUAL INTERATIVA
 * Autor: Rafa / Antigravity
 * Versão: 2.2.0 (PointerEvents isolados por slide, sem propagação, traço contínuo)
 */

class SlideAnnotator {
  constructor() {
    this.isActive = false;
    this.currentTool = 'pen'; // 'pen', 'highlighter', 'eraser'
    this.color = '#facc15';   // Amarelo giz por padrão
    this.lineWidth = 3.5;
    
    this.topicKey = window.location.pathname.split('/').pop().replace('.html', '') || 'topico';
    
    // Lousa
    this.whiteboardOpen = false;
    this.whiteboards = [null];
    this.currentBoardIndex = 0;
    this.boardBgType = 'dark';

    this.slideLayers = [];
    
    const initialActive = document.querySelector('.slide.active');
    const allSlidesList = Array.from(document.querySelectorAll('.slide'));
    this.currentSlideIndex = initialActive ? Math.max(0, allSlidesList.indexOf(initialActive)) : 0;

    this.initDOM();
    this.setupSlideLayers();
    this.setupCursorDot();
    this.setupEvents();
    this.loadSavedAnnotations();
  }

  initDOM() {
    // 1. Barra Flutuante de Ferramentas
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'annotator-toolbar';
    this.toolbar.className = 'annotator-toolbar';
    this.toolbar.innerHTML = `
      <div class="tool-group">
        <button id="tool-pen-toggle" class="tool-btn" title="Ativar Caneta / Pincel (Tecla D)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
          <span>Pincel</span>
        </button>
        <button id="tool-whiteboard-toggle" class="tool-btn" title="Abrir Lousa / Quadro Branco (Tecla W)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <span>Lousa</span>
        </button>
        <button id="tool-notebook-toggle" class="tool-btn" title="Ver Caderno de Anotações da Aluna (Exportar/Imprimir)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span>Caderno</span>
        </button>
      </div>

      <div id="pen-controls" class="pen-controls" style="display: none;">
        <div class="color-palette">
          <button class="color-btn active" data-color="#facc15" style="background: #facc15;" title="Amarelo Giz"></button>
          <button class="color-btn" data-color="#38bdf8" style="background: #38bdf8;" title="Ciano"></button>
          <button class="color-btn" data-color="#ffffff" style="background: #ffffff;" title="Branco"></button>
          <button class="color-btn" data-color="#4ade80" style="background: #4ade80;" title="Verde"></button>
          <button class="color-btn" data-color="#f87171" style="background: #f87171;" title="Vermelho"></button>
        </div>
        
        <div class="brush-types">
          <button id="btn-pen" class="mini-btn active" title="Caneta de Precisão">✏️</button>
          <button id="btn-highlighter" class="mini-btn" title="Marca-Texto">🖍️</button>
          <button id="btn-eraser" class="mini-btn" title="Borracha">🧹</button>
        </div>

        <div class="action-btns">
          <button id="btn-clear-slide" class="mini-btn text-btn" title="Limpar anotações deste slide (Tecla C)">Limpar</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.toolbar);

    // 2. Cursor Ponto de Precisão (Ponto circular nítido no mouse)
    this.cursorDot = document.createElement('div');
    this.cursorDot.id = 'pen-cursor-dot';
    this.cursorDot.style.cssText = `
      position: fixed;
      pointer-events: none;
      border-radius: 50%;
      z-index: 99999;
      display: none;
      transform: translate(-50%, -50%);
      transition: width 0.1s ease, height 0.1s ease, background-color 0.1s ease;
      box-shadow: 0 0 3px rgba(0,0,0,0.9), 0 0 0 1.5px #ffffff;
    `;
    document.body.appendChild(this.cursorDot);

    // 3. Modal da Lousa Virtual
    this.whiteboardModal = document.createElement('div');
    this.whiteboardModal.id = 'whiteboard-modal';
    this.whiteboardModal.className = 'whiteboard-modal';
    this.whiteboardModal.style.display = 'none';
    this.whiteboardModal.innerHTML = `
      <div class="whiteboard-header">
        <div class="wb-left">
          <span class="wb-badge">Lousa de Cálculos & Diagramas</span>
          <div class="wb-page-controls">
            <button id="wb-prev-page" class="mini-btn">◀</button>
            <span id="wb-page-indicator">Quadro 1 / 1</span>
            <button id="wb-next-page" class="mini-btn">▶</button>
            <button id="wb-add-page" class="mini-btn primary-btn">+ Novo Quadro</button>
          </div>
        </div>

        <div class="wb-center">
          <button class="bg-selector-btn active" data-bg="dark">Lousa Grafite</button>
          <button class="bg-selector-btn" data-bg="grid">Quadriculado</button>
          <button class="bg-selector-btn" data-bg="light">Quadro Branco</button>
        </div>

        <div class="wb-right">
          <button id="wb-download" class="mini-btn" title="Baixar imagem PNG deste quadro">💾 Baixar PNG</button>
          <button id="wb-clear" class="mini-btn" title="Limpar este quadro">Limpar</button>
          <button id="wb-close" class="mini-btn close-btn" title="Fechar Lousa (Esc)">✕ Fechar</button>
        </div>
      </div>

      <div class="whiteboard-body bg-dark">
        <canvas id="whiteboard-canvas"></canvas>
      </div>
    `;
    document.body.appendChild(this.whiteboardModal);

    this.wbCanvas = this.whiteboardModal.querySelector('#whiteboard-canvas');
    this.wbCtx = this.wbCanvas.getContext('2d');

    // 4. Modal "Caderno de Estudos da Aluna"
    this.notebookModal = document.createElement('div');
    this.notebookModal.id = 'notebook-modal';
    this.notebookModal.className = 'notebook-modal';
    this.notebookModal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(8, 12, 21, 0.95);
      backdrop-filter: blur(20px);
      z-index: 10000;
      display: none;
      flex-direction: column;
    `;
    this.notebookModal.innerHTML = `
      <div class="notebook-header" style="
        height: 60px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-color);
        background: rgba(15, 23, 42, 0.8);
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.2rem;">📖</span>
          <h2 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Caderno de Anotações da Aluna • Material Consolidado</h2>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="nb-download-all" class="btn" style="background: var(--accent-blue); color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">📥 Baixar Slides Anotados (PNG)</button>
          <button id="nb-export-json" class="btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 14px; border-radius: 6px; cursor: pointer;">💾 Salvar Arquivo (.json)</button>
          <button id="nb-import-json" class="btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 14px; border-radius: 6px; cursor: pointer;">📂 Carregar Anotações</button>
          <input type="file" id="nb-file-input" accept=".json" style="display: none;">
          <button id="nb-print" class="btn" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 14px; border-radius: 6px; cursor: pointer;">🖨️ Imprimir / PDF</button>
          <button id="nb-close" class="btn" style="background: #ef4444; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">✕ Fechar</button>
        </div>
      </div>
      <div id="notebook-body" style="
        flex: 1;
        overflow-y: auto;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
      ">
        <p style="color: var(--text-muted); font-size: 0.95rem;">Processando visualização consolidada do caderno...</p>
      </div>
    `;
    document.body.appendChild(this.notebookModal);
  }

  // Cria e anexa um canvas com PointerEvents totalmente ISOLADO a cada slide
  setupSlideLayers() {
    const slides = document.querySelectorAll('.slide');
    this.slideLayers = [];

    slides.forEach((slide, index) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'slide-annotation-layer';
      canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 35;
        border-radius: inherit;
        touch-action: none;
      `;
      slide.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const layer = { slide, canvas, ctx, index };
      this.slideLayers.push(layer);

      // Vincula os eventos de PointerEvents EXCLUSIVAMENTE a este canvas específico
      this.bindLayerPointerDrawing(layer);
    });

    this.resizeAllCanvases();
    this.updateSlidePointerEvents();
  }

  // Redimensionamento sem perda de dados e mapeamento nativo de pixels
  resizeAllCanvases() {
    const dpr = window.devicePixelRatio || 1;

    this.slideLayers.forEach(layer => {
      const rect = layer.slide.getBoundingClientRect();
      const w = Math.round(rect.width) || 1160;
      const h = Math.round(rect.height) || 652;

      const targetW = w * dpr;
      const targetH = h * dpr;

      if (layer.canvas.width === targetW && layer.canvas.height === targetH) return;

      let prevData = null;
      if (layer.canvas.width > 0 && layer.canvas.height > 0) {
        try { prevData = layer.canvas.toDataURL(); } catch (e) {}
      }

      layer.canvas.width = targetW;
      layer.canvas.height = targetH;

      if (prevData) {
        const img = new Image();
        img.onload = () => {
          layer.ctx.drawImage(img, 0, 0, targetW, targetH);
        };
        img.src = prevData;
      }
    });

    // Lousa
    const wbBody = this.whiteboardModal.querySelector('.whiteboard-body');
    if (wbBody) {
      const wbW = wbBody.clientWidth || window.innerWidth;
      const wbH = wbBody.clientHeight || (window.innerHeight - 60);
      this.wbCanvas.width = wbW * dpr;
      this.wbCanvas.height = wbH * dpr;
    }
  }

  updateSlidePointerEvents() {
    this.slideLayers.forEach((layer, idx) => {
      // APENAS o slide ativo no momento aceita eventos de desenho
      const isCurrentActive = (idx === this.currentSlideIndex) && layer.slide.classList.contains('active');
      layer.canvas.style.pointerEvents = (this.isActive && isCurrentActive) ? 'auto' : 'none';
    });
  }

  // Mapeamento matemático perfeito de coordenadas (Independente de zoom, escala ou DPR)
  getCanvasPoint(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  // Motor de Desenho Isolado por Camada (Zero propagação, traço 100% contínuo)
  bindLayerPointerDrawing(layer) {
    const canvas = layer.canvas;
    const ctx = layer.ctx;
    let isDrawing = false;
    let lastPoint = null;

    const start = (e) => {
      if (!this.isActive) return;
      if (e.button !== undefined && e.button !== 0) return; // Apenas botão principal
      if (!layer.slide.classList.contains('active')) return;

      try { canvas.setPointerCapture(e.pointerId); } catch(err) {}
      isDrawing = true;

      const pt = this.getCanvasPoint(e, canvas);
      lastPoint = pt;

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      if (this.currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 16 * dpr, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.currentTool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 10 * dpr, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Caneta: ponto inicial sólido
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (this.lineWidth * dpr) / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const move = (e) => {
      if (!isDrawing || !this.isActive) return;
      e.preventDefault();

      const pt = this.getCanvasPoint(e, canvas);
      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      if (this.currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 32 * dpr;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (this.currentTool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 20 * dpr;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else {
        // Traço Contínuo Perfeito (Ponta Redonda e Junção Lisa)
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth * dpr;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      ctx.restore();

      lastPoint = pt;
    };

    const stop = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      lastPoint = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      this.persistSlideAnnotations();
    };

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
  }

  // Cursor em Ponto de Precisão
  setupCursorDot() {
    this.updateCursorVisual();

    window.addEventListener('pointermove', (e) => {
      if (!this.isActive) {
        this.cursorDot.style.display = 'none';
        return;
      }

      const activeSlide = document.querySelector('.slide.active');
      if (!activeSlide) {
        this.cursorDot.style.display = 'none';
        return;
      }

      const rect = activeSlide.getBoundingClientRect();
      const inSlide = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (inSlide) {
        this.cursorDot.style.display = 'block';
        this.cursorDot.style.left = `${e.clientX}px`;
        this.cursorDot.style.top = `${e.clientY}px`;
      } else {
        this.cursorDot.style.display = 'none';
      }
    });
  }

  updateCursorVisual() {
    if (!this.cursorDot) return;
    if (this.currentTool === 'eraser') {
      this.cursorDot.style.width = '24px';
      this.cursorDot.style.height = '24px';
      this.cursorDot.style.background = 'rgba(239, 68, 68, 0.4)';
      this.cursorDot.style.boxShadow = '0 0 0 2px #ef4444, 0 0 6px rgba(0,0,0,0.8)';
    } else if (this.currentTool === 'highlighter') {
      this.cursorDot.style.width = '16px';
      this.cursorDot.style.height = '16px';
      this.cursorDot.style.background = this.color;
      this.cursorDot.style.opacity = '0.7';
      this.cursorDot.style.boxShadow = '0 0 4px rgba(0,0,0,0.9), 0 0 0 1.5px #ffffff';
    } else {
      this.cursorDot.style.width = '8px';
      this.cursorDot.style.height = '8px';
      this.cursorDot.style.background = this.color;
      this.cursorDot.style.opacity = '1';
      this.cursorDot.style.boxShadow = '0 0 3px rgba(0,0,0,0.9), 0 0 0 1.5px #ffffff';
    }
  }

  togglePen(forceState = null) {
    this.isActive = forceState !== null ? forceState : !this.isActive;
    
    const penToggle = document.getElementById('tool-pen-toggle');
    const penControls = document.getElementById('pen-controls');

    if (penToggle) penToggle.classList.toggle('active', this.isActive);
    if (penControls) penControls.style.display = this.isActive ? 'flex' : 'none';

    this.updateSlidePointerEvents();

    if (!this.isActive && this.cursorDot) {
      this.cursorDot.style.display = 'none';
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resizeAllCanvases());

    const penToggle = document.getElementById('tool-pen-toggle');
    if (penToggle) {
      penToggle.addEventListener('click', () => this.togglePen());
    }

    this.toolbar.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toolbar.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.color = btn.getAttribute('data-color');
        if (this.currentTool === 'eraser') this.currentTool = 'pen';
        this.updateCursorVisual();
      });
    });

    const btnPen = document.getElementById('btn-pen');
    const btnHighlighter = document.getElementById('btn-highlighter');
    const btnEraser = document.getElementById('btn-eraser');

    if (btnPen) {
      btnPen.addEventListener('click', () => {
        this.currentTool = 'pen';
        this.lineWidth = 3.5;
        this.updateToolButtons([btnPen, btnHighlighter, btnEraser], btnPen);
        this.updateCursorVisual();
      });
    }

    if (btnHighlighter) {
      btnHighlighter.addEventListener('click', () => {
        this.currentTool = 'highlighter';
        this.updateToolButtons([btnPen, btnHighlighter, btnEraser], btnHighlighter);
        this.updateCursorVisual();
      });
    }

    if (btnEraser) {
      btnEraser.addEventListener('click', () => {
        this.currentTool = 'eraser';
        this.updateToolButtons([btnPen, btnHighlighter, btnEraser], btnEraser);
        this.updateCursorVisual();
      });
    }

    const btnClear = document.getElementById('btn-clear-slide');
    if (btnClear) {
      btnClear.addEventListener('click', () => this.clearCurrentSlide());
    }

    const wbToggle = document.getElementById('tool-whiteboard-toggle');
    const wbClose = document.getElementById('wb-close');
    if (wbToggle) wbToggle.addEventListener('click', () => this.openWhiteboard());
    if (wbClose) wbClose.addEventListener('click', () => this.closeWhiteboard());

    const wbAdd = document.getElementById('wb-add-page');
    const wbPrev = document.getElementById('wb-prev-page');
    const wbNext = document.getElementById('wb-next-page');
    const wbClear = document.getElementById('wb-clear');
    const wbDownload = document.getElementById('wb-download');

    if (wbAdd) wbAdd.addEventListener('click', () => this.addWhiteboardPage());
    if (wbPrev) wbPrev.addEventListener('click', () => this.prevWhiteboardPage());
    if (wbNext) wbNext.addEventListener('click', () => this.nextWhiteboardPage());
    if (wbClear) wbClear.addEventListener('click', () => this.clearWhiteboard());
    if (wbDownload) wbDownload.addEventListener('click', () => this.downloadWhiteboard());

    this.whiteboardModal.querySelectorAll('.bg-selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.whiteboardModal.querySelectorAll('.bg-selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setWhiteboardBackground(btn.getAttribute('data-bg'));
      });
    });

    this.bindWhiteboardEvents();

    const nbToggle = document.getElementById('tool-notebook-toggle');
    const nbClose = document.getElementById('nb-close');
    const nbDownloadAll = document.getElementById('nb-download-all');
    const nbExportJson = document.getElementById('nb-export-json');
    const nbImportJson = document.getElementById('nb-import-json');
    const nbFileInput = document.getElementById('nb-file-input');
    const nbPrint = document.getElementById('nb-print');

    if (nbToggle) nbToggle.addEventListener('click', () => this.openNotebook());
    if (nbClose) nbClose.addEventListener('click', () => this.closeNotebook());
    if (nbDownloadAll) nbDownloadAll.addEventListener('click', () => this.downloadAllSlidesAnnotated());
    if (nbExportJson) nbExportJson.addEventListener('click', () => this.exportSessionJson());
    if (nbImportJson && nbFileInput) {
      nbImportJson.addEventListener('click', () => nbFileInput.click());
      nbFileInput.addEventListener('change', (e) => this.importSessionJson(e));
    }
    if (nbPrint) nbPrint.addEventListener('click', () => window.print());

    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'd' || e.key === 'D') {
        this.togglePen();
      } else if (e.key === 'w' || e.key === 'W') {
        if (this.whiteboardOpen) this.closeWhiteboard();
        else this.openWhiteboard();
      } else if (e.key === 'c' || e.key === 'C') {
        if (this.isActive) this.clearCurrentSlide();
      } else if (e.key === 'Escape') {
        if (this.notebookModal.style.display !== 'none') this.closeNotebook();
        else if (this.whiteboardOpen) this.closeWhiteboard();
        else if (this.isActive) this.togglePen(false);
      }
    });

    // Troca de slide: sincroniza índice e ajusta pointer-events
    window.addEventListener('slideChanged', (e) => {
      this.currentSlideIndex = e.detail.slideIndex;
      this.updateSlidePointerEvents();
    });
  }

  updateToolButtons(buttons, activeBtn) {
    buttons.forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  clearCurrentSlide() {
    const currentLayer = this.slideLayers[this.currentSlideIndex];
    if (!currentLayer) return;
    currentLayer.ctx.clearRect(0, 0, currentLayer.canvas.width, currentLayer.canvas.height);
    this.persistSlideAnnotations();
  }

  persistSlideAnnotations() {
    try {
      const data = {};
      this.slideLayers.forEach((layer, i) => {
        if (layer.canvas.width > 0 && layer.canvas.height > 0) {
          data[i] = layer.canvas.toDataURL();
        }
      });
      localStorage.setItem(`fisica_caderno_v3_${this.topicKey}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  loadSavedAnnotations() {
    try {
      // Limpa dados legados corrompidos de versões anteriores
      localStorage.removeItem(`fisica_caderno_${this.topicKey}`);
      localStorage.removeItem(`fisica_caderno_v2_${this.topicKey}`);

      const raw = localStorage.getItem(`fisica_caderno_v3_${this.topicKey}`);
      if (!raw) return;
      const data = JSON.parse(raw);

      Object.keys(data).forEach(idx => {
        const layer = this.slideLayers[parseInt(idx, 10)];
        if (layer && data[idx]) {
          const img = new Image();
          img.onload = () => {
            layer.ctx.drawImage(img, 0, 0, layer.canvas.width, layer.canvas.height);
          };
          img.src = data[idx];
        }
      });
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
    }
  }

  openNotebook() {
    this.notebookModal.style.display = 'flex';
    this.renderNotebookPreview();
  }

  closeNotebook() {
    this.notebookModal.style.display = 'none';
  }

  renderNotebookPreview() {
    const body = document.getElementById('notebook-body');
    body.innerHTML = `
      <div style="text-align: center; max-width: 800px; margin-bottom: 20px;">
        <h3 style="color: #fff; font-size: 1.3rem; margin-bottom: 6px;">Visualizador Consolidado da Aula</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Abaixo estão todos os slides com as resoluções e destaques feitos em aula. A aluna pode revisar este material, imprimir ou baixar os slides em PNG.
        </p>
      </div>
    `;

    this.slideLayers.forEach((layer, idx) => {
      const card = document.createElement('div');
      card.style.cssText = `
        width: 100%;
        max-width: 900px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 20px;
        box-shadow: var(--shadow-md);
      `;

      const title = layer.slide.querySelector('.slide-title')?.textContent || `Slide ${idx + 1}`;
      const subtitle = layer.slide.querySelector('.slide-subtitle')?.textContent || '';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <div>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700;">SLIDE ${idx + 1}</span>
            <h4 style="color: #fff; font-size: 1.05rem; margin-top: 2px;">${title}</h4>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${subtitle}</span>
          </div>
          <button class="btn btn-download-single" data-slide="${idx}" style="
            background: rgba(56, 189, 248, 0.15);
            border: 1px solid rgba(56, 189, 248, 0.4);
            color: var(--accent-cyan);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 0.82rem;
            cursor: pointer;
          ">💾 Baixar PNG</button>
        </div>
        <div class="nb-preview-container" style="position: relative; border-radius: 8px; overflow: hidden; background: #0f172a; border: 1px solid var(--border-color);">
          <img class="nb-drawing-preview" style="width: 100%; display: block; border-radius: 8px; min-height: 200px; background: #0b1120;" />
        </div>
      `;

      body.appendChild(card);

      const previewImg = card.querySelector('.nb-drawing-preview');
      previewImg.src = layer.canvas.toDataURL();

      const btnSingle = card.querySelector('.btn-download-single');
      btnSingle.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `aula-fisica-${this.topicKey}-slide-${idx + 1}.png`;
        link.href = layer.canvas.toDataURL('image/png');
        link.click();
      });
    });
  }

  downloadAllSlidesAnnotated() {
    this.slideLayers.forEach((layer, idx) => {
      const link = document.createElement('a');
      link.download = `caderno-fisica-${this.topicKey}-slide-${idx + 1}.png`;
      link.href = layer.canvas.toDataURL('image/png');
      link.click();
    });
  }

  exportSessionJson() {
    const raw = localStorage.getItem(`fisica_caderno_v3_${this.topicKey}`) || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `anotacoes-aula-${this.topicKey}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  importSessionJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        localStorage.setItem(`fisica_caderno_v3_${this.topicKey}`, JSON.stringify(data));
        this.loadSavedAnnotations();
        this.renderNotebookPreview();
        alert('Anotações carregadas com sucesso no caderno!');
      } catch (err) {
        alert('Arquivo de anotações inválido.');
      }
    };
    reader.readAsText(file);
  }

  openWhiteboard() {
    this.whiteboardOpen = true;
    this.whiteboardModal.style.display = 'flex';
    this.resizeAllCanvases();
    this.renderWhiteboardCurrentPage();
  }

  closeWhiteboard() {
    this.whiteboardOpen = false;
    this.whiteboardModal.style.display = 'none';
  }

  setWhiteboardBackground(type) {
    this.boardBgType = type;
    const body = this.whiteboardModal.querySelector('.whiteboard-body');
    body.className = `whiteboard-body bg-${type}`;
  }

  saveWhiteboardState() {
    this.whiteboards[this.currentBoardIndex] = this.wbCanvas.toDataURL();
  }

  renderWhiteboardCurrentPage() {
    this.wbCtx.clearRect(0, 0, this.wbCanvas.width, this.wbCanvas.height);

    const saved = this.whiteboards[this.currentBoardIndex];
    if (saved) {
      const img = new Image();
      img.onload = () => {
        this.wbCtx.drawImage(img, 0, 0, this.wbCanvas.width, this.wbCanvas.height);
      };
      img.src = saved;
    }
    this.updateWbPageIndicator();
  }

  addWhiteboardPage() {
    this.saveWhiteboardState();
    this.whiteboards.push(null);
    this.currentBoardIndex = this.whiteboards.length - 1;
    this.renderWhiteboardCurrentPage();
  }

  prevWhiteboardPage() {
    if (this.currentBoardIndex > 0) {
      this.saveWhiteboardState();
      this.currentBoardIndex--;
      this.renderWhiteboardCurrentPage();
    }
  }

  nextWhiteboardPage() {
    if (this.currentBoardIndex < this.whiteboards.length - 1) {
      this.saveWhiteboardState();
      this.currentBoardIndex++;
      this.renderWhiteboardCurrentPage();
    }
  }

  clearWhiteboard() {
    this.wbCtx.clearRect(0, 0, this.wbCanvas.width, this.wbCanvas.height);
    this.whiteboards[this.currentBoardIndex] = null;
  }

  updateWbPageIndicator() {
    const el = document.getElementById('wb-page-indicator');
    if (el) el.textContent = `Quadro ${this.currentBoardIndex + 1} / ${this.whiteboards.length}`;
  }

  downloadWhiteboard() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.wbCanvas.width;
    tempCanvas.height = this.wbCanvas.height;
    const tCtx = tempCanvas.getContext('2d');

    if (this.boardBgType === 'light') {
      tCtx.fillStyle = '#ffffff';
    } else {
      tCtx.fillStyle = '#0f172a';
    }
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    if (this.boardBgType === 'grid') {
      tCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      tCtx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < tempCanvas.width; x += step) {
        tCtx.beginPath(); tCtx.moveTo(x, 0); tCtx.lineTo(x, tempCanvas.height); tCtx.stroke();
      }
      for (let y = 0; y < tempCanvas.height; y += step) {
        tCtx.beginPath(); tCtx.moveTo(0, y); tCtx.lineTo(tempCanvas.width, y); tCtx.stroke();
      }
    }

    tCtx.drawImage(this.wbCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `lousa-fisica-quadro-${this.currentBoardIndex + 1}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }

  bindWhiteboardEvents() {
    let wbDrawing = false;
    let wbLastPoint = null;

    const getPos = (e) => {
      const rect = this.wbCanvas.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      return {
        x: (clientX - rect.left) * (this.wbCanvas.width / rect.width),
        y: (clientY - rect.top) * (this.wbCanvas.height / rect.height)
      };
    };

    const start = (e) => {
      wbDrawing = true;
      wbLastPoint = getPos(e);
      try { this.wbCanvas.setPointerCapture(e.pointerId); } catch(err) {}

      const dpr = window.devicePixelRatio || 1;
      this.wbCtx.save();
      if (this.currentTool === 'eraser') {
        this.wbCtx.globalCompositeOperation = 'destination-out';
        this.wbCtx.beginPath();
        this.wbCtx.arc(wbLastPoint.x, wbLastPoint.y, 16 * dpr, 0, Math.PI * 2);
        this.wbCtx.fill();
      } else if (this.currentTool === 'highlighter') {
        this.wbCtx.globalCompositeOperation = 'source-over';
        this.wbCtx.fillStyle = this.color;
        this.wbCtx.globalAlpha = 0.35;
        this.wbCtx.beginPath();
        this.wbCtx.arc(wbLastPoint.x, wbLastPoint.y, 10 * dpr, 0, Math.PI * 2);
        this.wbCtx.fill();
      } else {
        this.wbCtx.globalCompositeOperation = 'source-over';
        this.wbCtx.fillStyle = this.color;
        this.wbCtx.beginPath();
        this.wbCtx.arc(wbLastPoint.x, wbLastPoint.y, (this.lineWidth * dpr) / 2, 0, Math.PI * 2);
        this.wbCtx.fill();
      }
      this.wbCtx.restore();
    };

    const draw = (e) => {
      if (!wbDrawing) return;
      e.preventDefault();
      const currentPoint = getPos(e);
      const dpr = window.devicePixelRatio || 1;

      this.wbCtx.save();
      if (this.currentTool === 'eraser') {
        this.wbCtx.globalCompositeOperation = 'destination-out';
        this.wbCtx.lineWidth = 32 * dpr;
        this.wbCtx.lineCap = 'round';
        this.wbCtx.lineJoin = 'round';
        this.wbCtx.beginPath();
        this.wbCtx.moveTo(wbLastPoint.x, wbLastPoint.y);
        this.wbCtx.lineTo(currentPoint.x, currentPoint.y);
        this.wbCtx.stroke();
      } else if (this.currentTool === 'highlighter') {
        this.wbCtx.globalCompositeOperation = 'source-over';
        this.wbCtx.strokeStyle = this.color;
        this.wbCtx.globalAlpha = 0.35;
        this.wbCtx.lineWidth = 20 * dpr;
        this.wbCtx.lineCap = 'round';
        this.wbCtx.lineJoin = 'round';
        this.wbCtx.beginPath();
        this.wbCtx.moveTo(wbLastPoint.x, wbLastPoint.y);
        this.wbCtx.lineTo(currentPoint.x, currentPoint.y);
        this.wbCtx.stroke();
      } else {
        this.wbCtx.globalCompositeOperation = 'source-over';
        this.wbCtx.strokeStyle = this.color;
        this.wbCtx.lineWidth = this.lineWidth * dpr;
        this.wbCtx.lineCap = 'round';
        this.wbCtx.lineJoin = 'round';
        this.wbCtx.beginPath();
        this.wbCtx.moveTo(wbLastPoint.x, wbLastPoint.y);
        this.wbCtx.lineTo(currentPoint.x, currentPoint.y);
        this.wbCtx.stroke();
      }
      this.wbCtx.restore();

      wbLastPoint = currentPoint;
    };

    const stop = (e) => {
      if (!wbDrawing) return;
      wbDrawing = false;
      wbLastPoint = null;
      try { this.wbCanvas.releasePointerCapture(e.pointerId); } catch(err) {}
      this.saveWhiteboardState();
    };

    this.wbCanvas.addEventListener('pointerdown', start);
    this.wbCanvas.addEventListener('pointermove', draw);
    this.wbCanvas.addEventListener('pointerup', stop);
    this.wbCanvas.addEventListener('pointercancel', stop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.slide')) {
    window.annotator = new SlideAnnotator();
  }
});
