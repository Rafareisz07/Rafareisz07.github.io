/**
 * SISTEMA DE NAVEGAÇÃO DE SLIDES DE FÍSICA
 * Desenvolvido para Aulas Particulares Sem Spoilers
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const indicatorsContainer = document.querySelector('.nav-indicators');
  const currentCounter = document.getElementById('current-slide');
  const totalCounter = document.getElementById('total-slides');
  const progressBar = document.getElementById('progress-bar');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const topicSelect = document.getElementById('topic-select');

  let currentIndex = 0;
  const totalSlides = slides.length;

  if (totalCounter) totalCounter.textContent = totalSlides;

  // 1. Indicadores Minimalistas de Bolinhas (Sem Títulos / Sem Spoilers)
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `dot ${idx === 0 ? 'active' : ''}`;
      dot.title = `Slide ${idx + 1}`;
      dot.addEventListener('click', () => goToSlide(idx));
      indicatorsContainer.appendChild(dot);
    });
  }

  // 2. Função Central de Navegação
  function goToSlide(index, updateHash = true) {
    if (index < 0 || index >= totalSlides) return;

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === index);
    });

    if (indicatorsContainer) {
      const dots = indicatorsContainer.querySelectorAll('.dot');
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
    }

    if (currentCounter) currentCounter.textContent = index + 1;
    if (progressBar) {
      const percent = ((index + 1) / totalSlides) * 100;
      progressBar.style.width = `${percent}%`;
    }

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === totalSlides - 1;

    currentIndex = index;

    if (updateHash) {
      window.location.hash = `slide-${index + 1}`;
    }

    // Dispara evento customizado para os simuladores e para o anotador (salvar/restaurar desenhos)
    const activeSlide = slides[currentIndex];
    window.dispatchEvent(new CustomEvent('slideChanged', { 
      detail: { slideIndex: index, slide: activeSlide } 
    }));
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }

  // 3. Roteamento por Hash (#slide-1, #slide-2)
  function readHash() {
    const hash = window.location.hash;
    const match = hash.match(/#slide-(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10) - 1;
      if (target >= 0 && target < totalSlides) {
        goToSlide(target, false);
        return;
      }
    }
    goToSlide(0, false);
  }

  window.addEventListener('hashchange', readHash);
  readHash();

  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // 4. Atalhos de Teclado Focados na Apresentação
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
    }
  });

  // 5. Suporte a Toque (Swipe) em Tablets e Celulares
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    const deltaY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 60) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // 6. Modo Professor / Notas Pedagógicas (P)
  function toggleTeacherMode() {
    document.body.classList.toggle('teacher-mode-active');
    const isActive = document.body.classList.contains('teacher-mode-active');
    if (teacherToggleBtn) teacherToggleBtn.classList.toggle('active', isActive);
    localStorage.setItem('fisica_teacher_mode', isActive ? 'true' : 'false');
  }

  
  if (localStorage.getItem('fisica_teacher_mode') === 'true') {
    document.body.classList.add('teacher-mode-active');
    if (teacherToggleBtn) teacherToggleBtn.classList.add('active');
  }

  // 7. Tema Claro / Escuro
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fisica_theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'light' ? '🌙' : '☀️';
    }
  }

  const savedTheme = localStorage.getItem('fisica_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // 8. Tela Cheia (F)
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (fullscreenBtn) fullscreenBtn.classList.add('active');
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (fullscreenBtn) fullscreenBtn.classList.remove('active');
    }
  }

  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // 9. Seletor de Tópico
  if (topicSelect) {
    topicSelect.addEventListener('change', (e) => {
      const dest = e.target.value;
      if (dest) window.location.href = dest;
    });
  }

  // 10. Resoluções Passo a Passo Ocultas
  document.querySelectorAll('.solution-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.exercise-box');
      if (container) {
        const solution = container.querySelector('.solution-content');
        if (solution) {
          const isOpen = solution.classList.contains('open');
          solution.classList.toggle('open', !isOpen);
          btn.textContent = !isOpen ? 'Ocultar Resolução' : '💡 Revelar Resolução Passo a Passo';
        }
      }
    });
  });

  // 11. Render KaTeX
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\[', display: true }
        ],
        throwOnError: false
      });
    } catch (err) {
      console.warn('KaTeX render warning:', err);
    }
  }
});
