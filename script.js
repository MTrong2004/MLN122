(function () {
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navCenterTitle = $('#nav-center-title');
  const navTitles = {
    'scene-hero': '',
    'scene-thesis-1': 'Phần I - Cơ sở chung',
    'scene-views': 'Hai mô hình đối chiếu',
    'scene-video': 'Góc nhìn thực tế',
    'scene-thesis-2': 'Phần II - Vấn đề cốt lõi',
    'scene-analysis': 'Bốn công cụ điều tiết - Biến việc xây NOXH thành cơ hội kinh doanh hợp lý',
    'scene-conclusion': 'Kết luận'
  };

  function updateNavbarTitle(sectionId) {
    if (!navCenterTitle) return;
    const titleText = navTitles[sectionId] || '';
    if (titleText) {
      navCenterTitle.innerHTML = titleText;
      navCenterTitle.classList.add('visible');
    } else {
      navCenterTitle.classList.remove('visible');
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') document.body.classList.add('keyboard-navigation');
  });
  document.addEventListener('mousedown', function () {
    document.body.classList.remove('keyboard-navigation');
  });

  // ---------- Progress bar & Navbar scroll class ----------
  const progress = $('#progress');
  const navbarEl = $('nav');
  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const p = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    if (progress) progress.style.width = (p * 100) + '%';

    if (navbarEl) {
      if (scrollTop > 50) {
        navbarEl.classList.add('nav-scrolled');
      } else {
        navbarEl.classList.remove('nav-scrolled');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Floating motes ----------
  const motesContainer = $('#motes');
  if (motesContainer && !prefersReducedMotion) {
    for (let i = 0; i < 18; i++) {
      const m = document.createElement('span');
      m.className = 'mote';
      m.style.left = (Math.random() * 100) + '%';
      m.style.animationDuration = (10 + Math.random() * 14) + 's';
      m.style.animationDelay = (Math.random() * 10) + 's';
      m.style.width = m.style.height = (1.5 + Math.random() * 2.5) + 'px';
      m.style.opacity = (0.3 + Math.random() * 0.5).toString();
      motesContainer.appendChild(m);
    }
  }

  // ---------- Hero special effects ----------
  const heroSection = $('#scene-hero');
  const heroAurora = $('.hero-aurora');
  const heroMoon = $('.moon');
  const heroStars = $('.stars');

  // Mouse parallax: aurora + moon/stars shift
  if (heroSection && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', function (e) {
      const rect = heroSection.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;   // -0.5 → 0.5
      const dy = (e.clientY - cy) / rect.height;  // -0.5 → 0.5

      // Aurora follows cursor
      if (heroAurora) {
        heroAurora.style.left = (50 + dx * 30) + '%';
        heroAurora.style.top = (50 + dy * 20) + '%';
      }
      // Moon shifts subtly opposite direction (parallax depth)
      if (heroMoon) {
        heroMoon.style.transform = 'translate(' + (-dx * 14) + 'px, ' + (-dy * 10) + 'px)';
        heroMoon.style.transition = 'transform 1s cubic-bezier(0.2,0.8,0.2,1)';
      }
      // Stars shift even more gently
      if (heroStars) {
        heroStars.style.transform = 'translate(' + (-dx * 6) + 'px, ' + (-dy * 4) + 'px)';
        heroStars.style.transition = 'transform 1.4s cubic-bezier(0.2,0.8,0.2,1)';
      }
    });

    heroSection.addEventListener('mouseleave', function () {
      if (heroAurora) { heroAurora.style.left = '50%'; heroAurora.style.top = '50%'; }
      if (heroMoon) { heroMoon.style.transform = ''; }
      if (heroStars) { heroStars.style.transform = ''; }
    });
  }

  // Canvas: floating gold dust particles
  (function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;

    function resize() {
      const hero = document.getElementById('scene-hero');
      W = canvas.width = hero ? hero.offsetWidth : window.innerWidth;
      H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function Particle() {
      this.reset = function () {
        this.x = Math.random() * W;
        this.y = H + 10;
        this.r = 0.6 + Math.random() * 1.2;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(0.3 + Math.random() * 0.7);
        this.life = 0;
        this.maxLife = 120 + Math.random() * 160;
        this.alpha = 0;
      };
      this.reset();
      this.life = Math.random() * this.maxLife; // stagger start
    }

    for (let i = 0; i < 40; i++) particles.push(new Particle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.life++;
        const progress = p.life / p.maxLife;
        p.alpha = progress < 0.15
          ? progress / 0.15
          : progress > 0.85
            ? (1 - progress) / 0.15
            : 1;
        p.x += p.vx;
        p.y += p.vy;
        ctx.save();
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#e8d4a8';
        ctx.shadowColor = '#c9a463';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
        if (p.life >= p.maxLife) p.reset();
      });
      raf = requestAnimationFrame(draw);
    }

    // Only animate when hero is visible
    const heroObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { if (!raf) draw(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.1 });
    heroObs.observe(document.getElementById('scene-hero'));
  })();

  // ---------- Reveal on scroll ----------
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---------- View panels (Hai mô hình) - độc lập ----------
  const viewsSection = $('#scene-views');
  const viewPanels = $$('.view-panel');

  function updateViewsTheme() {
    const opened = viewPanels.map(function (p, i) { return p.classList.contains('expanded') ? i : -1; }).filter(function (i) { return i >= 0; });
    viewsSection.classList.remove('has-active', 'theme-1', 'theme-2', 'theme-both');
    if (opened.length === 0) return;
    viewsSection.classList.add('has-active');
    if (opened.length === 2) viewsSection.classList.add('theme-both');
    else viewsSection.classList.add('theme-' + (opened[0] + 1));
  }

  viewPanels.forEach(function (panel) {
    function toggle() {
      const willOpen = !panel.classList.contains('expanded');
      panel.classList.toggle('expanded', willOpen);
      panel.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      updateViewsTheme();

      if (willOpen) {
        // Tự động cuộn căn lề trên phần Hai mô hình vừa khít dưới Navbar cố định
        setTimeout(function () {
          const nav = document.querySelector('nav');
          const navH = nav ? nav.getBoundingClientRect().height : 0;
          const cardsContainer = document.querySelector('.views-split');
          const targetTop = cardsContainer
            ? cardsContainer.getBoundingClientRect().top + window.scrollY - navH - 24
            : viewsSection.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        }, 150);
      }
    }
    panel.addEventListener('click', toggle);
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // ---------- Analysis cards (4 công cụ) ----------
  const analysisSection = $('#scene-analysis');
  const analysisContainer = $('.analysis-container');
  const analysisGrid = $('.analysis-grid');
  const analysisCards = $$('.analysis-card');
  const detailPane = $('.analysis-detail-pane');
  let fadeTimeout = null;

  function resetAnalysis() {
    analysisContainer.classList.remove('has-active');
    analysisSection.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4', 'has-active-card');
    analysisCards.forEach(function (card) {
      card.classList.remove('state-a', 'state-l', 'state-r', 'state-h');
      card.setAttribute('aria-expanded', 'false');
    });
    if (detailPane) {
      detailPane.classList.add('detail-fade-out');
      clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(function () {
        detailPane.innerHTML = '';
        detailPane.classList.remove('detail-fade-out');
      }, 200);
    }
  }

  function openCard(clickedCard) {
    const clickedIndex = analysisCards.indexOf(clickedCard);
    if (clickedIndex < 0) return;
    if (clickedCard.classList.contains('state-a')) return resetAnalysis();

    analysisSection.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');
    analysisSection.classList.add('theme-' + (clickedIndex + 1));

    analysisCards.forEach(function (card, index) {
      card.classList.remove('state-a', 'state-l', 'state-r', 'state-h');
      let stateClass = 'state-h';
      if (index === clickedIndex) {
        stateClass = 'state-a';
      } else if (index === (clickedIndex - 1 + analysisCards.length) % analysisCards.length) {
        stateClass = 'state-l';
      } else if (index === (clickedIndex + 1) % analysisCards.length) {
        stateClass = 'state-r';
      }
      card.classList.add(stateClass);
      card.setAttribute('aria-expanded', stateClass === 'state-a' ? 'true' : 'false');
    });

    analysisContainer.classList.add('has-active');
    analysisSection.classList.add('has-active-card');

    // Tự động cuộn căn lề trên phần Bốn công cụ khớp dưới Navbar
    setTimeout(function () {
      const nav = document.querySelector('nav');
      const navH = nav ? nav.getBoundingClientRect().height : 0;
      const targetTop = analysisContainer.getBoundingClientRect().top + window.scrollY - navH - 24;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }, 150);

    if (detailPane) {
      clearTimeout(fadeTimeout);
      // Fade out nhanh rồi hiện nội dung mới ngay lập tức
      detailPane.classList.add('detail-fade-out');
      fadeTimeout = setTimeout(function () {
        const number = $('.card-num', clickedCard) ? $('.card-num', clickedCard).textContent : '0' + (clickedIndex + 1);
        const title = $('.card-title', clickedCard) ? $('.card-title', clickedCard).innerHTML : '';
        const bodyParas = $$('.card-body p', clickedCard).map(function (p) { return '<p class="detail-body">' + p.innerHTML + '</p>'; }).join('');
        detailPane.innerHTML = '<div class="analysis-detail-content detail-fade-in"><div class="detail-num">' + number + '</div><h3 class="detail-title">' + title + '</h3>' + bodyParas + '</div>';
        detailPane.classList.remove('detail-fade-out');
      }, 120);
    }
  }

  if (analysisGrid) {
    analysisGrid.addEventListener('click', function (e) {
      const clickedCard = e.target.closest('.analysis-card');
      if (!clickedCard) return;
      openCard(clickedCard);
    });
  }

  analysisCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(card); }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { resetAnalysis(); }
  });

  if (analysisSection && 'IntersectionObserver' in window) {
    const analysisObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          analysisSection.classList.add('analysis-ready');
          analysisObserver.unobserve(analysisSection);
        }
      });
    }, { threshold: [0.25, 0.45, 0.65] });
    analysisObserver.observe(analysisSection);
  } else if (analysisSection) {
    analysisSection.classList.add('analysis-ready');
  }

  // ---------- Thanh chấm bên phải + phím mũi tên chuyển từng phần ----------
  const sectionDots = $('#section-dots');
  const pageSections = $$('.scene').filter(function (sec) { return sec.id; });
  const sectionLabels = {
    'scene-hero': 'Mở đầu',
    'scene-thesis-1': 'Cơ sở',
    'scene-views': 'Mô hình',
    'scene-video': 'Video',
    'scene-thesis-2': 'Vấn đề',
    'scene-analysis': 'Công cụ',
    'scene-conclusion': 'Kết luận'
  };
  let currentSectionIndex = 0;
  let lastSectionIndex = -1;

  function showDotLabelsTemporarily() {
    const dotsContainer = document.getElementById('section-dots');
    if (!dotsContainer) return;
    dotsContainer.classList.add('show-labels');
    clearTimeout(dotsContainer.labelTimeout);
    dotsContainer.labelTimeout = setTimeout(() => {
      dotsContainer.classList.remove('show-labels');
    }, 2200);
  }

  function scrollToSection(index) {
    if (index < 0 || index >= pageSections.length) return;
    currentSectionIndex = index;

    // Tính chiều cao navbar thực tế để offset
    const nav = document.querySelector('nav');
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const target = pageSections[index];
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    updateSectionDots(index);
    if (lastSectionIndex !== index) {
      lastSectionIndex = index;
      showDotLabelsTemporarily();
      updateNavbarTitle(pageSections[index].id);
    }
  }

  function updateSectionDots(activeIndex) {
    if (!sectionDots) return;
    $$('.section-dot', sectionDots).forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
      dot.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
    });
  }

  if (sectionDots && pageSections.length) {
    sectionDots.innerHTML = pageSections.map(function (sec, i) {
      const label = sectionLabels[sec.id] || ('Phần ' + (i + 1));
      return '<button class="section-dot" type="button" data-index="' + i + '" data-label="' + label + '" aria-label="' + label + '"></button>';
    }).join('');

    sectionDots.addEventListener('click', function (e) {
      const dot = e.target.closest('.section-dot');
      if (!dot) return;
      scrollToSection(parseInt(dot.getAttribute('data-index'), 10));
    });

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const idx = pageSections.indexOf(entry.target);
          if (idx >= 0) {
            currentSectionIndex = idx;
            updateSectionDots(idx);
            if (lastSectionIndex !== idx) {
              lastSectionIndex = idx;
              showDotLabelsTemporarily();
              updateNavbarTitle(entry.target.id);
            }
          }
        }
      });
    }, { threshold: 0.55 });
    pageSections.forEach(function (sec) { sectionObserver.observe(sec); });
    updateSectionDots(0);
    showDotLabelsTemporarily(); // Show on page load
    updateNavbarTitle(pageSections[0].id);
  }

  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      scrollToSection(Math.min(currentSectionIndex + 1, pageSections.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      scrollToSection(Math.max(currentSectionIndex - 1, 0));
    }
  });

  const scrollHintBtn = $('#scroll-hint-btn');
  if (scrollHintBtn) {
    scrollHintBtn.addEventListener('click', function () {
      scrollToSection(1);
    });
  }



})();

// ----- PRELOADER -----
document.addEventListener('DOMContentLoaded', function () {
  const preloader = document.getElementById('preloader');
  const progressLine = document.getElementById('preloader-progress');
  const percentText = document.getElementById('preloader-percent');
  if (!preloader) return;

  let percent = 0;
  const interval = setInterval(function () {
    percent += Math.floor(Math.random() * 5) + 1;
    if (percent >= 100) {
      percent = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
      }, 300);
    }
    progressLine.style.width = percent + '%';
    percentText.innerText = percent;
  }, 30);

  window.addEventListener('load', function () {
    percent = 100;
  });
});

// ----- SCROLL DRIVEN CONCLUSION -----
document.addEventListener('DOMContentLoaded', function () {
  const conclusionSection = document.getElementById('scene-conclusion');
  const conclusionText = document.getElementById('conclusion-text');
  if (!conclusionSection || !conclusionText) return;

  // Split text into words for reveal
  const words = conclusionText.innerText.split(' ');
  conclusionText.innerHTML = '';
  words.forEach(word => {
    const span = document.createElement('span');
    span.className = 'reveal-word';
    span.innerText = word + ' ';
    conclusionText.appendChild(span);
  });

  const spans = conclusionText.querySelectorAll('.reveal-word');
  const glow = conclusionSection.querySelector('.conclusion-glow');

  window.addEventListener('scroll', function () {
    const rect = conclusionSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    let progress = 0;
    const startOffset = windowHeight * 0.8;
    const endOffset = windowHeight * 0.2;

    if (rect.top <= startOffset && rect.top >= endOffset) {
      progress = (startOffset - rect.top) / (startOffset - endOffset);
    } else if (rect.top < endOffset) {
      progress = 1;
    } else {
      progress = 0;
    }

    const wordsToReveal = Math.floor(progress * spans.length);
    spans.forEach((span, index) => {
      if (index < wordsToReveal) {
        span.classList.add('active');
      } else {
        span.classList.remove('active');
      }
    });

    if (glow) {
      const scale = 0.5 + progress * 1;
      const opacity = progress * 1;
      glow.style.setProperty('--glow-scale', scale);
      glow.style.setProperty('--glow-opacity', opacity);
    }
  });
});
