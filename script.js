(function(){
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('keydown', function(e){
    if(e.key === 'Tab') document.body.classList.add('keyboard-navigation');
  });
  document.addEventListener('mousedown', function(){
    document.body.classList.remove('keyboard-navigation');
  });

  // ---------- Progress bar ----------
  const progress = $('#progress');
  function onScroll(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const p = docHeight > 0 ? Math.min(scrollTop/docHeight, 1) : 0;
    if(progress) progress.style.width = (p*100)+'%';
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---------- Floating motes ----------
  const motesContainer = $('#motes');
  if(motesContainer && !prefersReducedMotion){
    for(let i=0;i<14;i++){
      const m = document.createElement('span');
      m.className = 'mote';
      m.style.left = (Math.random()*100)+'%';
      m.style.animationDuration = (10 + Math.random()*14)+'s';
      m.style.animationDelay = (Math.random()*10)+'s';
      motesContainer.appendChild(m);
    }
  }

  // ---------- Reveal on scroll ----------
  const revealEls = $$('.reveal');
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ observer.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('visible'); });
  }

  // ---------- View panels (Hai mô hình) - độc lập ----------
  const viewsSection = $('#scene-views');
  const viewPanels = $$('.view-panel');

  function updateViewsTheme(){
    const opened = viewPanels.map(function(p, i){ return p.classList.contains('expanded') ? i : -1; }).filter(function(i){ return i>=0; });
    viewsSection.classList.remove('has-active','theme-1','theme-2','theme-both');
    if(opened.length === 0) return;
    viewsSection.classList.add('has-active');
    if(opened.length === 2) viewsSection.classList.add('theme-both');
    else viewsSection.classList.add('theme-'+(opened[0]+1));
  }

  viewPanels.forEach(function(panel){
    function toggle(){
      const willOpen = !panel.classList.contains('expanded');
      panel.classList.toggle('expanded', willOpen);
      panel.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      updateViewsTheme();
    }
    panel.addEventListener('click', toggle);
    panel.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
  });

  // ---------- Analysis cards (4 công cụ) ----------
  const analysisSection = $('#scene-analysis');
  const analysisContainer = $('.analysis-container');
  const analysisGrid = $('.analysis-grid');
  const analysisCards = $$('.analysis-card');
  const detailPane = $('.analysis-detail-pane');
  let fadeTimeout = null;

  function resetAnalysis(){
    analysisContainer.classList.remove('has-active');
    analysisSection.classList.remove('theme-1','theme-2','theme-3','theme-4');
    analysisCards.forEach(function(card){
      card.classList.remove('state-a','state-b','state-c');
      card.setAttribute('aria-expanded','false');
    });
    if(detailPane){
      detailPane.classList.add('detail-fade-out');
      clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(function(){
        detailPane.innerHTML = '';
        detailPane.classList.remove('detail-fade-out');
      }, 200);
    }
  }

  function openCard(clickedCard){
    const clickedIndex = analysisCards.indexOf(clickedCard);
    if(clickedIndex < 0) return;
    if(clickedCard.classList.contains('state-a')) return resetAnalysis();

    analysisSection.classList.remove('theme-1','theme-2','theme-3','theme-4');
    analysisSection.classList.add('theme-'+(clickedIndex+1));

    analysisCards.forEach(function(card, index){
      card.classList.remove('state-a','state-b','state-c');
      const diff = (index - clickedIndex + analysisCards.length) % analysisCards.length;
      card.classList.add(diff === 0 ? 'state-a' : diff === 1 ? 'state-b' : 'state-c');
      card.setAttribute('aria-expanded', diff === 0 ? 'true' : 'false');
    });

    analysisContainer.classList.add('has-active');
    if(detailPane){
      clearTimeout(fadeTimeout);
      detailPane.classList.add('detail-fade-out');
      fadeTimeout = setTimeout(function(){
        const number = $('.card-num', clickedCard) ? $('.card-num', clickedCard).textContent : '0'+(clickedIndex+1);
        const title = $('.card-title', clickedCard) ? $('.card-title', clickedCard).innerHTML : '';
        const bodyParas = $$('.card-body p', clickedCard).map(function(p){ return '<p class="detail-body">'+p.innerHTML+'</p>'; }).join('');
        detailPane.innerHTML = '<div class="analysis-detail-content detail-fade-in"><div class="detail-num">'+number+'</div><h3 class="detail-title">'+title+'</h3>'+bodyParas+'</div>';
        detailPane.classList.remove('detail-fade-out');
      }, 300);
    }
  }

  analysisGrid.addEventListener('click', function(e){
    const clickedCard = e.target.closest('.analysis-card');
    if(!clickedCard) return;
    openCard(clickedCard);
  });

  analysisCards.forEach(function(card){
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openCard(card); }
    });
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ resetAnalysis(); }
  });


  // ---------- Chỉ cho thẻ xuất hiện khi lướt tới phần 4 công cụ ----------
  if(analysisSection && 'IntersectionObserver' in window){
    const analysisObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && entry.intersectionRatio >= 0.45){
          analysisSection.classList.add('analysis-ready');
          analysisObserver.unobserve(analysisSection);
        }
      });
    }, { threshold:[0.25,0.45,0.65] });
    analysisObserver.observe(analysisSection);
  } else if(analysisSection){
    analysisSection.classList.add('analysis-ready');
  }

  // ---------- Thanh chấm bên phải + phím mũi tên chuyển từng phần ----------
  const sectionDots = $('#section-dots');
  const pageSections = $$('.scene').filter(function(sec){ return sec.id; });
  const sectionLabels = {
    'scene-hero':'Mở đầu',
    'scene-thesis-1':'Cơ sở',
    'scene-views':'Mô hình',
    'scene-video':'Video',
    'scene-thesis-2':'Vấn đề',
    'scene-analysis':'Công cụ',
    'scene-conclusion':'Kết luận'
  };
  let currentSectionIndex = 0;

  function scrollToSection(index){
    if(index < 0 || index >= pageSections.length) return;
    currentSectionIndex = index;
    pageSections[index].scrollIntoView({ behavior:'smooth', block:'start' });
    updateSectionDots(index);
  }

  function updateSectionDots(activeIndex){
    if(!sectionDots) return;
    $$('.section-dot', sectionDots).forEach(function(dot, i){
      dot.classList.toggle('active', i === activeIndex);
      dot.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
    });
  }

  if(sectionDots && pageSections.length){
    sectionDots.innerHTML = pageSections.map(function(sec, i){
      const label = sectionLabels[sec.id] || ('Phần '+(i+1));
      return '<button class="section-dot" type="button" data-index="'+i+'" data-label="'+label+'" aria-label="'+label+'"></button>';
    }).join('');

    sectionDots.addEventListener('click', function(e){
      const dot = e.target.closest('.section-dot');
      if(!dot) return;
      scrollToSection(parseInt(dot.getAttribute('data-index'), 10));
    });

    const sectionObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          const idx = pageSections.indexOf(entry.target);
          if(idx >= 0){
            currentSectionIndex = idx;
            updateSectionDots(idx);
          }
        }
      });
    }, { threshold:0.55 });
    pageSections.forEach(function(sec){ sectionObserver.observe(sec); });
    updateSectionDots(0);
  }

  document.addEventListener('keydown', function(e){
    const tag = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toLowerCase() : '';
    if(tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      scrollToSection(Math.min(currentSectionIndex + 1, pageSections.length - 1));
    }
    if(e.key === 'ArrowUp'){
      e.preventDefault();
      scrollToSection(Math.max(currentSectionIndex - 1, 0));
    }
  });

})();
// ----- PRELOADER -----
document.addEventListener('DOMContentLoaded', function() {
  const preloader = document.getElementById('preloader');
  const progressLine = document.getElementById('preloader-progress');
  const percentText = document.getElementById('preloader-percent');
  if(!preloader) return;
  
  let percent = 0;
  const interval = setInterval(function() {
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
  
  window.addEventListener('load', function() {
    percent = 100;
  });
});
// ----- SCROLL DRIVEN CONCLUSION -----
document.addEventListener('DOMContentLoaded', function() {
  const conclusionSection = document.getElementById('scene-conclusion');
  const conclusionText = document.getElementById('conclusion-text');
  if(!conclusionSection || !conclusionText) return;

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

  window.addEventListener('scroll', function() {
    const rect = conclusionSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Start revealing when the section comes into view (top of section hits bottom of screen)
    // End revealing when section is fully in view (top of section hits middle of screen)
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
    
    // Reveal text
    const wordsToReveal = Math.floor(progress * spans.length);
    spans.forEach((span, index) => {
      if(index < wordsToReveal) {
        span.classList.add('active');
      } else {
        span.classList.remove('active');
      }
    });

    // Animate glow
    if(glow) {
      const scale = 0.5 + progress * 1; // 0.5 to 1.5
      const opacity = progress * 1; // 0 to 1
      glow.style.setProperty('--glow-scale', scale);
      glow.style.setProperty('--glow-opacity', opacity);
    }
  });
});
