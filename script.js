// Basic interactivity: project expand, tag highlighting, skill <-> project linking, mobile menu, theme toggle, copy-to-clipboard, lightbox

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();

    const isTouch = window.matchMedia('(hover: none)').matches || window.matchMedia('(max-width: 800px)').matches;
    document.querySelectorAll('.reveal-block').forEach(block => {
      const toggle = block.querySelector('.block-toggle');
      const heading = block.querySelector('.block-heading');
      const hint = block.querySelector('.reveal-hint');
      const hintLabel = hint.firstChild;
      const closedHint = hintLabel.textContent;

      if (isTouch) {
        hintLabel.textContent = 'tap to reveal ';
        hint.querySelector('b').textContent = '☝';
      }

      const setOpen = (open) => {
        block.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Close section' : `Open ${block.querySelector('h2').textContent}`;
        hintLabel.textContent = open ? 'tap to close ' : (isTouch ? 'tap to reveal ' : closedHint);
        hint.querySelector('b').textContent = open ? '×' : (isTouch ? '☝' : '+');
      };

      if (!isTouch) {
        block.addEventListener('pointerenter', () => setOpen(true));
        block.addEventListener('pointerleave', () => setOpen(false));
      }

      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setOpen(isTouch ? !block.classList.contains('is-open') : true);
      });
      heading.addEventListener('click', (event) => {
        if (event.target !== toggle && isTouch) setOpen(!block.classList.contains('is-open'));
      });
    });

    document.querySelectorAll('.project').forEach(project => {
      project.addEventListener('click', event => {
        if (event.target.closest('.tag')) return;
        project.classList.toggle('open');
      });
    });

    document.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('mouseenter', () => highlightSkill(tag.dataset.skill || tag.textContent.trim(), true));
      tag.addEventListener('mouseleave', () => highlightSkill(null, false));
      tag.addEventListener('click', event => {
        event.stopPropagation();
        flashSkill(tag.dataset.skill || tag.textContent.trim());
      });
    });

    document.querySelectorAll('.skill').forEach(skill => {
      const filterProjects = () => {
        const projects = (skill.dataset.projects || '').split(/\s+/).filter(Boolean);
        document.querySelectorAll('.project').forEach(project => {
          project.style.opacity = projects.length && !projects.includes(project.id) ? '.45' : '1';
        });
      };
      skill.addEventListener('mouseenter', filterProjects);
      skill.addEventListener('mouseleave', () => document.querySelectorAll('.project').forEach(project => project.style.opacity = '1'));
      skill.addEventListener('click', () => {
        const projects = (skill.dataset.projects || '').split(/\s+/).filter(Boolean);
        document.querySelectorAll('.project').forEach(project => project.classList.toggle('open', projects.includes(project.id)));
      });
    });

    const mobileMenu = document.getElementById('mobileMenu');
    const nav = document.querySelector('.main-nav');
    if (mobileMenu && nav) {
      mobileMenu.addEventListener('click', () => {
        const open = nav.style.display === 'flex';
        nav.style.display = open ? 'none' : 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.right = '6vw';
        nav.style.top = '70px';
        nav.style.padding = '14px';
        nav.style.background = 'var(--surface)';
        nav.style.border = '1px solid rgba(46,217,168,.35)';
      });
    }

    const contactTop = document.getElementById('contactTop');
    const contact = document.getElementById('contact');
    const contactCTA = document.getElementById('contactCTA');
    if (contactTop && contact) contactTop.addEventListener('click', () => contact.scrollIntoView({behavior:'smooth'}));
    if (contactCTA) contactCTA.addEventListener('click', () => alert('Thanks — please email rufaidbinomar@gmail.com to get in touch.'));

    document.querySelectorAll('.copy').forEach(button => {
      button.addEventListener('click', async () => {
        const value = button.dataset.copy;
        try {
          await navigator.clipboard.writeText(value);
          showToast('Copied: ' + value);
        } catch (error) {
          const textarea = document.createElement('textarea');
          textarea.value = value;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
          showToast('Copied');
        }
      });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = () => {
      lightbox.classList.remove('show');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
    };
    document.querySelectorAll('.model-thumb').forEach(image => image.addEventListener('click', () => {
      lightboxImg.src = image.dataset.full || image.src;
      lightboxImg.alt = image.alt || '';
      lightbox.classList.add('show');
      lightbox.setAttribute('aria-hidden', 'false');
    }));
    const lightboxClose = document.getElementById('lightboxClose');
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

    function highlightSkill(name, on) {
      document.querySelectorAll('.skill').forEach(skill => {
        const match = name && skill.textContent.trim().toLowerCase() === name.toLowerCase();
        skill.classList.toggle('highlight', Boolean(match && on));
      });
      document.querySelectorAll('.project').forEach(project => {
        project.style.opacity = on ? (project.querySelector('.tech-tags').textContent.toLowerCase().includes((name || '').toLowerCase()) ? '1' : '.6') : '1';
      });
    }

    function flashSkill(name) {
      const skill = Array.from(document.querySelectorAll('.skill')).find(item => item.textContent.trim().toLowerCase() === name.toLowerCase());
      if (!skill) return;
      skill.classList.add('highlight');
      setTimeout(() => skill.classList.remove('highlight'), 900);
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--accent);color:#062019;padding:10px 14px;font:600 12px var(--mono);z-index:3000';
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 220ms'; setTimeout(() => toast.remove(), 240); }, 1200);
    }

  // Ensure touch targets are big enough (for accessibility) - no-op but kept for potential runtime checks
});
