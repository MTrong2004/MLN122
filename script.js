/**
 * [AI CONTEXT NOTE]
 * - Project: Interactive presentation on "Bàn Tay Vô Hình và Bàn Tay Nhà Nước - Câu Chuyện Nhà Ở Xã Hội".
 * - Role of this file: Interactive logic, animations, and UI state management.
 * - Key features implemented:
 *   - Scroll progress, dynamic section header text, and indicator dots navigation.
 *   - Mouse parallax (hero background aurora, moon, stars) and Canvas gold dust animation.
 *   - Interaction panels for model comparison (accordion expand/collapse).
 *   - IntersectionObserver triggers for scroll reveal animations.
 *   - 3D hover/tilt effects on the four tool cards in Scene 6.
 *   - Custom audio commentary controller (Text-to-Speech playback logic, sync, progress bars).
 *   - Preloader page fadeout.
 */
(function () {
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navCenterTitle = $('#nav-center-title');
  const navTitles = {
    'scene-hero': '',
    'scene-thesis-1': 'Phần I - Cơ sở chung',
    'scene-definitions': 'Định nghĩa hai mô hình',
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

    const nav = $('nav');
    if (nav) {
      Array.from(nav.classList).forEach(function (cls) {
        if (cls.startsWith('scene-')) {
          nav.classList.remove(cls);
        }
      });
      if (sectionId) {
        nav.classList.add(sectionId);
      }
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
  const navGoldDivider = $('.nav-gold-divider');

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

    // ---------- Nav gold divider scroll-driven fade ----------
    // As the on-page gold divider between sections approaches the header,
    // the nav divider fades out, then fades back in on the next section.
    if (navGoldDivider && navbarEl) {
      const navHeight = navbarEl.getBoundingClientRect().height;
      const pageDividers = $$('.gold-divider:not(.nav-gold-divider)');
      const FADE_RANGE = 45; // reduced from 160px so it only fades when very close to transitioning

      let closestDist = Infinity;
      pageDividers.forEach(function (div) {
        const rect = div.getBoundingClientRect();
        // Distance from the divider line to the bottom of the nav
        const dist = Math.abs(rect.top - navHeight);
        if (dist < closestDist) closestDist = dist;
      });

      let targetOpacity;
      if (scrollTop <= 50) {
        targetOpacity = 0;
      } else {
        if (closestDist < FADE_RANGE) {
          // Linearly fade: fully opaque at FADE_RANGE px away, almost invisible at 0 px
          targetOpacity = closestDist / FADE_RANGE;
        } else {
          targetOpacity = 1;
        }
        // Keep a minimum glow so it's never fully gone when scrolled
        targetOpacity = Math.max(0.08, targetOpacity);
      }
      navGoldDivider.style.opacity = targetOpacity;
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

  // Hàm cân bằng chiều cao các mục so sánh ở 2 cột (KTTT Tư bản vs Định hướng XHCN)
  function equalizeDetailItems() {
    const tbcnPanel = $('.view-panel.tbcn');
    const xhcnPanel = $('.view-panel.xhcn');
    if (!tbcnPanel || !xhcnPanel) return;

    const tbcnStatement = $('.view-statement', tbcnPanel);
    const xhcnStatement = $('.view-statement', xhcnPanel);
    const tbcnItems = $$('.view-detail-item', tbcnPanel);
    const xhcnItems = $$('.view-detail-item', xhcnPanel);

    // Reset lại chiều cao tự nhiên để đo chính xác
    if (tbcnStatement) tbcnStatement.style.height = '';
    if (xhcnStatement) xhcnStatement.style.height = '';
    tbcnItems.forEach(function (item) { item.style.height = ''; });
    xhcnItems.forEach(function (item) { item.style.height = ''; });

    const isTbcnExpanded = tbcnPanel.classList.contains('expanded');
    const isXhcnExpanded = xhcnPanel.classList.contains('expanded');

    // Chỉ thực hiện căn bằng chiều cao khi cả 2 thẻ cùng đang mở
    if (isTbcnExpanded && isXhcnExpanded) {
      // 1. Cân bằng dòng Statement giới thiệu
      if (tbcnStatement && xhcnStatement) {
        const h1 = tbcnStatement.offsetHeight;
        const h2 = xhcnStatement.offsetHeight;
        const maxH = Math.max(h1, h2);
        tbcnStatement.style.height = maxH + 'px';
        xhcnStatement.style.height = maxH + 'px';
      }

      // 2. Cân bằng từng mục chi tiết (Sở hữu, Mục tiêu, Vai trò, Phân phối, Công bằng)
      const count = Math.min(tbcnItems.length, xhcnItems.length);
      for (let i = 0; i < count; i++) {
        const h1 = tbcnItems[i].offsetHeight;
        const h2 = xhcnItems[i].offsetHeight;
        const maxH = Math.max(h1, h2);
        tbcnItems[i].style.height = maxH + 'px';
        xhcnItems[i].style.height = maxH + 'px';
      }
    }
  }

  // Lắng nghe sự kiện thay đổi kích thước màn hình để tự động tính lại
  window.addEventListener('resize', equalizeDetailItems, { passive: true });

  viewPanels.forEach(function (panel) {
    function toggle() {
      const willOpen = !panel.classList.contains('expanded');
      panel.classList.toggle('expanded', willOpen);
      panel.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      updateViewsTheme();
      equalizeDetailItems(); // Đồng bộ chiều cao khi mở/đóng thẻ

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

    // Tính toán tọa độ cuộn ổn định độc lập với hiệu ứng chuyển cảnh
    const nav = document.querySelector('nav');
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const sectionTop = analysisSection.getBoundingClientRect().top + window.scrollY;
    const viewportH = window.innerHeight;
    const containerH = analysisContainer.offsetHeight;

    // 12vh padding-top là 12% của chiều cao viewport
    const paddingTop = 12 * viewportH / 100;
    const centeringOffset = Math.max(paddingTop, (viewportH - containerH) / 2);
    const targetTop = sectionTop + centeringOffset - navH - 24;

    // Tự động cuộn căn lề trên phần Bốn công cụ khớp dưới Navbar
    setTimeout(function () {
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
    'scene-definitions': 'Định nghĩa',
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

  function getScrolledNavHeight() {
    if (!navbarEl) return 0;
    const hasScrolledClass = navbarEl.classList.contains('nav-scrolled');
    if (!hasScrolledClass) {
      navbarEl.classList.add('nav-scrolled');
    }
    const height = navbarEl.getBoundingClientRect().height;
    if (!hasScrolledClass) {
      navbarEl.classList.remove('nav-scrolled');
    }
    return height;
  }

  function getSectionScrollTarget(index) {
    if (index === 0) return 0;
    const section = pageSections[index];
    if (!section) return 0;
    const navH = getScrolledNavHeight();

    // Find preceding gold divider
    let prevSibling = section.previousElementSibling;
    while (prevSibling && !prevSibling.classList.contains('gold-divider')) {
      prevSibling = prevSibling.previousElementSibling;
    }

    if (prevSibling && prevSibling.classList.contains('gold-divider')) {
      // Position so gold divider aligns exactly with the nav bottom
      return prevSibling.getBoundingClientRect().top + window.scrollY - navH;
    }
    return section.getBoundingClientRect().top + window.scrollY - navH;
  }

  function scrollToSection(index) {
    if (index < 0 || index >= pageSections.length) return;
    currentSectionIndex = index;

    const targetTop = getSectionScrollTarget(index);
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

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
      const label = sec.getAttribute('data-dot-label') || sectionLabels[sec.id] || ('Phần ' + (i + 1));
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
  // ---------- Conclusion Balance Scale Widget ----------
  const balanceWidget = $('.conclusion-balance-widget');
  if (balanceWidget) {
    const btns = $$('.balance-btn', balanceWidget);
    const beam = $('.scale-beam', balanceWidget);
    const title = $('.info-card-title', balanceWidget);
    const desc = $('.info-card-desc', balanceWidget);
    const profitVal = $('.val-profit', balanceWidget);
    const welfareVal = $('.val-welfare', balanceWidget);

    const states = {
      free: {
        rot: '12deg',
        title: 'Tự điều tiết cực đoan (Bàn tay vô hình)',
        desc: 'Khi để thị trường tự do hoàn toàn, dòng vốn chỉ chảy vào phân khúc chung cư cao cấp để tối đa hóa lợi nhuận. Doanh nghiệp thu lợi lớn nhưng người thu nhập thấp hoàn toàn bị gạt ra ngoài rìa xã hội, không thể tiếp cận nhà ở.',
        profit: 'Cực kỳ cao',
        profitClass: 'val-high',
        welfare: 'Gần như bằng 0',
        welfareClass: 'val-low'
      },
      force: {
        rot: '-12deg',
        title: 'Mệnh lệnh áp đặt cực đoan (Hành chính)',
        desc: 'Khi Nhà nước dùng mệnh lệnh hành chính ép giá thấp mà không hỗ trợ, doanh nghiệp bị triệt tiêu động lực vì không có lợi nhuận. Vốn lập tức rút khỏi thị trường, dẫn đến khan hiếm nguồn cung trầm trọng, không có dự án nào được xây dựng.',
        profit: 'Không có / Âm',
        profitClass: 'val-low',
        welfare: 'Không có nhà để mua',
        welfareClass: 'val-low'
      },
      macro: {
        rot: '0deg',
        title: 'Điều tiết vĩ mô (Định hướng XHCN)',
        desc: 'Nhà nước không dùng mệnh lệnh hành chính mà điều tiết vĩ mô bằng 4 công cụ (Đất đai, Thuế, Tín dụng, Thể chế) để hướng dòng vốn. Doanh nghiệp đạt lợi nhuận định mức ổn định (~10%), người dân tiếp cận được NOXH giá rẻ thực chất.',
        profit: 'Định mức ổn định (~10%)',
        profitClass: 'val-normal',
        welfare: 'Bảo đảm an sinh thực chất',
        welfareClass: 'val-normal'
      }
    };

    function activateState(stateKey) {
      const state = states[stateKey];
      if (!state) return;

      const targetBtn = btns.find(b => b.getAttribute('data-state') === stateKey);
      if (targetBtn) {
        btns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
      }

      if (beam) {
        beam.style.setProperty('--beam-rot', state.rot);
        // Đồng bộ góc quay cho đĩa cân luôn treo thẳng đứng
        const pans = $$('.scale-pan', beam);
        pans.forEach(function (pan) {
          pan.style.transform = 'rotate(calc(-1 * ' + state.rot + '))';
        });
      }

      const infoCard = $('.balance-info-card', balanceWidget);
      if (infoCard) {
        infoCard.style.opacity = '0';
        infoCard.style.transform = 'translateY(8px)';
        setTimeout(function () {
          if (title) title.textContent = state.title;
          if (desc) desc.textContent = state.desc;
          if (profitVal) {
            profitVal.textContent = state.profit;
            profitVal.className = 'metric-val val-profit ' + state.profitClass;
          }
          if (welfareVal) {
            welfareVal.textContent = state.welfare;
            welfareVal.className = 'metric-val val-welfare ' + state.welfareClass;
          }
          infoCard.style.opacity = '1';
          infoCard.style.transform = 'translateY(0)';
        }, 200);
      }
    }

    // Auto-cycle the scale states until interacted
    const stateKeys = ['free', 'force', 'macro'];
    let currentScaleIndex = 0;
    let autoPlayInterval = null;

    function startAutoPlay() {
      autoPlayInterval = setInterval(function () {
        currentScaleIndex = (currentScaleIndex + 1) % stateKeys.length;
        activateState(stateKeys[currentScaleIndex]);
      }, 4000);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        stopAutoPlay(); // Stop cycling permanently when clicked
        const stateKey = btn.getAttribute('data-state');
        currentScaleIndex = stateKeys.indexOf(stateKey);
        activateState(stateKey);
      });
    });

    // Start auto cycle on load
    startAutoPlay();
  }

})();

// ----- PRELOADER -----
function initPreloader() {
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
    if (progressLine) progressLine.style.width = percent + '%';
    if (percentText) percentText.innerText = percent;
  }, 30);

  if (document.readyState === 'complete') {
    percent = 100;
  } else {
    window.addEventListener('load', function () {
      percent = 100;
    });
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloader);
} else {
  initPreloader();
}

// ----- SCROLL DRIVEN CONCLUSION -----
function initConclusion() {
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
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConclusion);
} else {
  initConclusion();
}

// ======================================================
// ✨ HẠT VÀNG BAY QUANH "Bàn tay hữu hình"
// ======================================================
(function () {
  const kientaoEl = document.querySelector('.hero-kientao');
  if (!kientaoEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawnParticle() {
    const rect = kientaoEl.getBoundingClientRect();
    if (rect.width === 0) return;

    const p = document.createElement('span');
    p.className = 'kientao-particle';

    // Kích thước ngẫu nhiên 2–5px
    const size = 2 + Math.random() * 3.5;
    p.style.width = size + 'px';
    p.style.height = size + 'px';

    // Vị trí ngẫu nhiên dọc theo chữ (x trong rect, y ±8px quanh đường baseline)
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    p.style.left = x + 'px';
    p.style.top = y + 'px';

    // Hướng bay ngẫu nhiên: lên trên, lệch trái/phải một chút
    const dx = (Math.random() - 0.5) * 28;
    const dy = -(28 + Math.random() * 30);
    const dur = 0.85 + Math.random() * 0.7;

    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    p.style.setProperty('--dur', dur + 's');

    document.body.appendChild(p);

    // Dọn dẹp sau khi animation kết thúc
    setTimeout(() => p.remove(), dur * 1000 + 50);
  }

  // Spawn mỗi 140ms (khoảng 7 hạt/giây, đủ dày mà không nặng)
  setInterval(spawnParticle, 140);
})();

// ======================================================
// 🌫️ HẠT BẠC BAY QUANH "Bàn tay vô hình"
// ======================================================
(function () {
  const vohinhEl = document.querySelector('.hero-vohinh');
  if (!vohinhEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawnVohinhParticle() {
    const rect = vohinhEl.getBoundingClientRect();
    if (rect.width === 0) return;

    const p = document.createElement('span');
    p.className = 'vohinh-particle';

    // Nhỏ hơn và mờ hơn hạt vàng — gợi sự "vô hình"
    const size = 1.5 + Math.random() * 3;
    p.style.width = size + 'px';
    p.style.height = size + 'px';

    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    p.style.left = x + 'px';
    p.style.top = y + 'px';

    // Bay theo mọi hướng — không chỉ lên, gợi sự phân tán hỗn loạn
    const dx = (Math.random() - 0.5) * 36;
    const dy = -(18 + Math.random() * 38);
    const dur = 1.0 + Math.random() * 0.9;

    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    p.style.setProperty('--dur', dur + 's');

    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000 + 50);
  }

  // Thưa hơn hạt vàng một chút (170ms) — hiệu ứng nhẹ nhàng, bí ẩn hơn
  setInterval(spawnVohinhParticle, 170);
})();
