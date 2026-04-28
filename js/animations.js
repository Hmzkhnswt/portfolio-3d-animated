// ============================================================
// GSAP SCROLL TRIGGER REVEAL ANIMATIONS
// Called by main.js after the loader completes
// ============================================================
function initRevealAnimations() {
  // Hero entrance — word stagger
  gsap.from('.hero h1 .word', {
    yPercent: 110,
    duration: 1.4,
    ease: 'power4.out',
    stagger: 0.18,
  });

  gsap.from('.hero-tag', {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.4,
    ease: 'power2.out',
  });

  gsap.from('.hero-bottom > *', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 1.2,
    stagger: 0.15,
    ease: 'power2.out',
  });

  // Section titles
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      yPercent: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Section meta
  gsap.utils.toArray('.section-meta').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.3,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Project rows stagger
  gsap.utils.toArray('.project').forEach((el) => {
    gsap.from(el, {
      x: -60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Process cards
  gsap.utils.toArray('.process-card').forEach((el, i) => {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 1,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // About reveal
  gsap.from('[data-reveal]', {
    opacity: 0,
    y: 50,
    duration: 1.4,
    ease: 'power3.out',
    scrollTrigger: { trigger: '[data-reveal]', start: 'top 80%' },
  });

  // Stats counter
  gsap.utils.toArray('.stat-num').forEach(el => {
    const target = parseInt(el.textContent);
    gsap.fromTo(el,
      { textContent: 0 },
      {
        textContent: target,
        duration: 2.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });

  // Contact headline
  gsap.from('.contact-headline', {
    opacity: 0,
    y: 60,
    duration: 1.4,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-headline', start: 'top 80%' },
  });

  // Stat side reveal
  gsap.from('.stat', {
    opacity: 0,
    x: 40,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.about-side', start: 'top 80%' },
  });
}
