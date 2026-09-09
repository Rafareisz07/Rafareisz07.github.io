/**
 * MOTOR DE ANOTAÇÕES & QUADRO BRANCO / LOUSA INTERATIVA
 * Autor: Rafa / Antigravity
 * Suporte a caneta livre, marca-texto, apagador, quadros múltiplos e exportação
 */

class SlideAnnotator {
  constructor() {
    this.isActive = false;
    this.currentTool = 'pen'; // 'pen', 'highlighter', 'eraser'
    this.color = '#facc15';   // Amarelo giz por padrão
    this.lineWidth = 3;
    this.isDrawing = false;
    this.lastPoint = null;
    
    // Armazenamento de desenhos por slide: { [slideIndex]: ImageData }
    this.slideDrawings = {};
    this.currentSlideIndex = 0;
    
    // Quadro Branco / Lousa separada
    this.whiteboardOpen = false;
    this.whiteboards = [[]]; // Histórico de traços por página de lousa
    this.currentBoardIndex = 0;
    this.boardBgType = 'dark'; // 'dark' (lousa), 'grid' (quadriculado), 'light' (branco)

    this.initDOM();
    this.setupEvents();
  }

  initDOM() {
    // 1. Canvas de Anotação sobreposto aos Slides
    const viewport = document.querySelector('.slides-viewport') || document.body;
    
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'annotation-canvas';
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 45;
      cursor: crosshair;
    `;
    viewport.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // 2. Barra Flutuante de Ferramentas de Apresentação (Pincel & Lousa)
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'annotator-toolbar';
    this.toolbar.className = 'annotator-toolbar';
    this.toolbar.innerHTML = `
      <div class="tool-group">
        <button id="tool-pen-toggle" class="tool-btn" title="Ativar Pincel (Tecla D)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
          <span>Anotar</span>
        </button>
        <button id="tool-whiteboard-toggle" class="tool-btn" title="Abrir Lousa / Quadro (Tecla W)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <span>Lousa</span>
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
          <button id="btn-pen" class="mini-btn active" title="Caneta">✏️</button>
          <button id="btn-highlighter" class="mini-btn" title="Marca-Texto">🖍️</button>
          <button id="btn-eraser" class="mini-btn" title="Borracha">🧹</button>
        </div>

        <div class="action-btns">
          <button id="btn-clear-slide" class="mini-btn text-btn" title="Limpar este slide">Limpar</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.toolbar);

    // 3. Modal / Janela de Quadro Branco (Lousa Completa)
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
          <button id="wb-download" class="mini-btn" title="Exportar imagem do quadro">💾 Baixar PNG</button>
          <button id="wb-clear" class="mini-btn" title="Limpar este quadro">Limpar</button>
          <button id="wb-close" class="mini-btn close-btn" title="Fechar Lousa (Esc)">✕ Fechar</button>
        </div>
      </div>

      <div class="whiteboard-body">
        <canvas id="whiteboard-canvas"></canvas>
      </div>
    `;
    document.body.appendChild(this.whiteboardModal);

    this.wbCanvas = this.whiteboardModal.querySelector('#whiteboard-canvas');
    this.wbCtx = this.wbCanvas.getContext('2d');

    this.resizeCanvases();
  }

  resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;

    // Canvas de Slides
    const w = this.canvas.parentElement.clientWidth || window.innerWidth;
    const h = this.canvas.parentElement.clientHeight || window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);

    // Canvas da Lousa
    const wbBody = this.whiteboardModal.querySelector('.whiteboard-body');
    if (wbBody) {
      const wbW = wbBody.clientWidth || window.innerWidth;
      const wbH = wbBody.clientHeight || (window.innerHeight - 60);
      this.wbCanvas.width = wbW * dpr;
      this.wbCanvas.height = wbH * dpr;
      this.wbCtx.scale(dpr, dpr);
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resizeCanvases());

    // Toggle Pincel
    const penToggle = document.getElementById('tool-pen-toggle');
    const penControls = document.getElementById('pen-controls');
    
    penToggle.addEventListener('click', () => {
      this.isActive = !this.isActive;
      penToggle.classList.toggle('active', this.isActive);
      penControls.style.display = this.isActive ? 'flex' : 'none';
      this.canvas.style.pointerEvents = this.isActive ? 'auto' : 'none';
    });

    // Toggle Cores
    this.toolbar.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.toolbar.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.color = btn.getAttribute('data-color');
        if (this.currentTool === 'eraser') this.currentTool = 'pen';
      });
    });

    // Tipos de Pincel
    const btnPen = document.getElementById('btn-pen');
    const btnHighlighter = document.getElementById('btn-highlighter');
    const btnEraser = document.getElementById('btn-eraser');

    btnPen.addEventListener('click', () => {
      this.currentTool = 'pen';
      this.updateToolButtons([btnPen, btnHighlighter, btnEraser], btnPen);
    });

    btnHighlighter.addEventListener('click', () => {
      this.currentTool = 'highlighter';
      this.updateToolButtons([btnPen, btnHighlighter, btnEraser], btnHighlighter);
    });

    btnEraser.addEventListener('click', () => {
      this.currentTool = 'eraser';
      this.updateToolButtons([btnPen, btnHighlighter, btnEraser], btnEraser);
    });

    // Limpar Slide Atual
    document.getElementById('btn-clear-slide').addEventListener('click', () => {
      const dpr = window.devicePixelRatio || 1;
      this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
      delete this.slideDrawings[this.currentSlideIndex];
    });

    // Eventos de Desenho no Canvas de Slide
    this.bindDrawingEvents(this.canvas, this.ctx, () => this.saveCurrentSlideDrawing());

    // Toggle Lousa / Quadro Branco
    const wbToggle = document.getElementById('tool-whiteboard-toggle');
    const wbClose = document.getElementById('wb-close');

    wbToggle.addEventListener('click', () => this.openWhiteboard());
    wbClose.addEventListener('click', () => this.closeWhiteboard());

    // Controles da Lousa
    document.getElementById('wb-add-page').addEventListener('click', () => this.addWhiteboardPage());
    document.getElementById('wb-prev-page').addEventListener('click', () => this.prevWhiteboardPage());
    document.getElementById('wb-next-page').addEventListener('click', () => this.nextWhiteboardPage());
    document.getElementById('wb-clear').addEventListener('click', () => this.clearWhiteboard());
    document.getElementById('wb-download').addEventListener('click', () => this.downloadWhiteboard());

    // Seletor de Fundo da Lousa
    this.whiteboardModal.querySelectorAll('.bg-selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.whiteboardModal.querySelectorAll('.bg-selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setWhiteboardBackground(btn.getAttribute('data-bg'));
      });
    });

    // Eventos de Desenho na Lousa
    this.bindDrawingEvents(this.wbCanvas, this.wbCtx, () => this.saveWhiteboardState());

    // Atalhos Globais: 'D' para desenhar, 'W' para lousa
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'd' || e.key === 'D') {
        penToggle.click();
      } else if (e.key === 'w' || e.key === 'W') {
        if (this.whiteboardOpen) this.closeWhiteboard();
        else this.openWhiteboard();
      } else if (e.key === 'Escape') {
        if (this.whiteboardOpen) this.closeWhiteboard();
      }
    });

    // Escuta troca de slides para salvar/restaurar anotações
    window.addEventListener('slideChanged', (e) => {
      this.onSlideChange(e.detail.slideIndex);
    });
  }

  updateToolButtons(buttons, activeBtn) {
    buttons.forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  bindDrawingEvents(canvasEl, context, onStrokeEnd) {
    const getPos = (e) => {
      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const start = (e) => {
      this.isDrawing = true;
      this.lastPoint = getPos(e);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const currentPoint = getPos(e);

      context.save();
      if (this.currentTool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = 24;
        context.beginPath();
        context.arc(currentPoint.x, currentPoint.y, 12, 0, Math.PI * 2);
        context.fill();
      } else if (this.currentTool === 'highlighter') {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = this.color;
        context.globalAlpha = 0.35;
        context.lineWidth = 18;
        context.lineCap = 'square';
        context.beginPath();
        context.moveTo(this.lastPoint.x, this.lastPoint.y);
        context.lineTo(currentPoint.x, currentPoint.y);
        context.stroke();
      } else {
        // Caneta comum suave
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(this.lastPoint.x, this.lastPoint.y);
        context.lineTo(currentPoint.x, currentPoint.y);
        context.stroke();
      }
      context.restore();

      this.lastPoint = currentPoint;
    };

    const stop = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.lastPoint = null;
      if (onStrokeEnd) onStrokeEnd();
    };

    canvasEl.addEventListener('mousedown', start);
    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stop);

    canvasEl.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stop);
  }

  // --- Gerenciamento de Anotações dos Slides ---
  saveCurrentSlideDrawing() {
    this.slideDrawings[this.currentSlideIndex] = this.canvas.toDataURL();
  }

  onSlideChange(newIndex) {
    this.saveCurrentSlideDrawing();
    this.currentSlideIndex = newIndex;

    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

    // Restaurar anotação salva para este slide
    const savedData = this.slideDrawings[newIndex];
    if (savedData) {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
      };
      img.src = savedData;
    }
  }

  // --- Lousa / Quadro Branco ---
  openWhiteboard() {
    this.whiteboardOpen = true;
    this.whiteboardModal.style.display = 'flex';
    this.resizeCanvases();
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
    const dpr = window.devicePixelRatio || 1;
    this.wbCtx.clearRect(0, 0, this.wbCanvas.width / dpr, this.wbCanvas.height / dpr);

    const saved = this.whiteboards[this.currentBoardIndex];
    if (saved) {
      const img = new Image();
      img.onload = () => {
        this.wbCtx.drawImage(img, 0, 0, this.wbCanvas.width / dpr, this.wbCanvas.height / dpr);
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
    const dpr = window.devicePixelRatio || 1;
    this.wbCtx.clearRect(0, 0, this.wbCanvas.width / dpr, this.wbCanvas.height / dpr);
    this.whiteboards[this.currentBoardIndex] = null;
  }

  updateWbPageIndicator() {
    const el = document.getElementById('wb-page-indicator');
    if (el) el.textContent = `Quadro ${this.currentBoardIndex + 1} / ${this.whiteboards.length}`;
  }

  downloadWhiteboard() {
    // Cria imagem mesclada com o fundo escolhido
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.wbCanvas.width;
    tempCanvas.height = this.wbCanvas.height;
    const tCtx = tempCanvas.getContext('2d');

    // Fundo
    if (this.boardBgType === 'light') {
      tCtx.fillStyle = '#ffffff';
    } else {
      tCtx.fillStyle = '#0f172a';
    }
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Linhas ou quadriculado
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
    link.download = `anotacoes-fisica-quadro-${this.currentBoardIndex + 1}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }
}

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
  window.annotator = new SlideAnnotator();
});
