/* ========================================================================
   MDtranslation — Interactions
   ======================================================================== */

(function () {
  'use strict';

  /* ---------- CURRENT YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAV: sticky scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- NAV: mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const open = navMobile.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // close mobile menu on link click
    navMobile.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navMobile.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- STATS: animated counters ---------- */
  const statNums = document.querySelectorAll('.stat__num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && statNums.length) {
    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach((el) => statObs.observe(el));
  } else {
    statNums.forEach((el) => {
      el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || '');
    });
  }

  /* ---------- TESTIMONIALS CAROUSEL ---------- */
  const carousel = document.getElementById('carousel');
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');

  if (carousel && track && dotsContainer) {
    const slides = Array.from(track.children);
    let current = 0;
    let autoplayTimer = null;
    const INTERVAL = 6000;

    // build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        goTo(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const goTo = (index) => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    };

    const next = () => goTo(current + 1);

    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(next, INTERVAL);
    };
    const stopAutoplay = () => {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    };
    const resetAutoplay = () => { stopAutoplay(); startAutoplay(); };

    // pause on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // pause when offscreen to save cycles
    if ('IntersectionObserver' in window) {
      const visObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startAutoplay();
            else stopAutoplay();
          });
        },
        { threshold: 0.3 }
      );
      visObs.observe(carousel);
    } else {
      startAutoplay();
    }

    // touch / swipe
    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
        resetAutoplay();
      }
    }, { passive: true });
  }

  /* ---------- SMOOTH SCROLL FOR HASH LINKS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- CONTACT FORM ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic client-side validation
      const required = form.querySelectorAll('[required]');
      let allValid = true;
      required.forEach((f) => {
        if (!f.value.trim()) {
          f.style.borderColor = '#B54545';
          allValid = false;
        } else {
          f.style.borderColor = '';
        }
      });

      if (!allValid) {
        status.textContent = 'Please fill out the required fields.';
        status.classList.add('is-error');
        return;
      }

      status.textContent = 'Sending...';
      status.classList.remove('is-error');

      const data = new FormData(form);
      const action = form.getAttribute('action');

      // If the Formspree endpoint hasn't been set yet, stub the submit.
      if (!action || action.includes('your-endpoint-here')) {
        setTimeout(() => {
          status.textContent = 'Thank you. A specialist will respond within one business day.';
          form.reset();
        }, 700);
        return;
      }

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          status.textContent = 'Thank you. A specialist will respond within one business day.';
          form.reset();
        } else {
          status.textContent = 'Something went wrong. Please email us directly.';
          status.classList.add('is-error');
        }
      } catch (err) {
        status.textContent = 'Connection issue. Please email us directly.';
        status.classList.add('is-error');
      }
    });
  }

})();
