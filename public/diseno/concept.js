(() => {
  'use strict';
  const root = document.documentElement;
  const search = new URLSearchParams(location.search);
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const palettes = ['prisma', 'orbita', 'papel'];
  const requestedPalette = search.get('palette');
  if (palettes.includes(requestedPalette)) root.dataset.palette = requestedPalette;
  let userReduced = search.get('motion') === 'reduced';
  const motionButton = document.querySelector('#motion-control');
  const art = document.querySelector('.hero-art');
  const stage = document.querySelector('.sculpture-stage');
  const description = document.querySelector('.layer-description');
  const signalButton = document.querySelector('.signal-button');
  const descriptions = {
    all: 'Selecciona una capa para explorar cómo se conecta con las demás.',
    interface: 'Interfaz · Angular, TypeScript y experiencias e-commerce. El punto donde una intención se convierte en interacción.',
    services: 'Servicios · APIs REST, backend e integraciones entre aplicaciones, bases de datos y dispositivos.',
    infra: 'Infraestructura · Linux, Docker y CI/CD para desplegar y mantener aplicaciones y bases de datos.'
  };
  const setMotion = () => {
    const reduced = userReduced || motionPreference.matches;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.textContent = motionPreference.matches ? 'Movimiento reducido · sistema' : reduced ? 'Activar movimiento' : 'Reducir movimiento';
    motionButton.disabled = motionPreference.matches;
    if (reduced) { stage.style.removeProperty('--tilt-x'); stage.style.removeProperty('--tilt-y'); }
  };
  setMotion();
  motionPreference.addEventListener('change', setMotion);
  motionButton.addEventListener('click', () => { userReduced = !userReduced; setMotion(); });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent || !event.data) return;
    if (event.data.type === 'atlas:palette' && palettes.includes(event.data.palette)) root.dataset.palette = event.data.palette;
    if (event.data.type === 'atlas:motion' && typeof event.data.reduced === 'boolean') { userReduced = event.data.reduced; setMotion(); }
  });
  document.querySelectorAll('.layer-button').forEach(button => {
    button.addEventListener('click', () => {
      const layer = art.dataset.layer === button.dataset.layer ? 'all' : button.dataset.layer;
      art.dataset.layer = layer;
      document.querySelectorAll('.layer-button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.layer === layer)));
      description.textContent = descriptions[layer];
    });
  });
  signalButton.addEventListener('click', () => {
    if (root.dataset.motion === 'reduced') return;
    const active = art.dataset.signal !== 'true';
    art.dataset.signal = String(active);
    signalButton.dataset.signal = String(active);
    signalButton.innerHTML = active ? 'Detener recorrido <span aria-hidden="true">×</span>' : 'Seguir una solicitud <span aria-hidden="true">↗</span>';
  });
  let tiltFrame = 0;
  stage.addEventListener('pointermove', event => {
    if (!finePointer.matches || root.dataset.motion === 'reduced' || innerWidth <= 900) return;
    cancelAnimationFrame(tiltFrame);
    tiltFrame = requestAnimationFrame(() => {
      const box = stage.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      stage.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
      stage.style.setProperty('--tilt-y', `${(x * 9).toFixed(2)}deg`);
    });
  });
  stage.addEventListener('pointerleave', () => { cancelAnimationFrame(tiltFrame); stage.style.setProperty('--tilt-x', '0deg'); stage.style.setProperty('--tilt-y', '0deg'); });
  document.querySelectorAll('.project-visual').forEach(visual => {
    let projectFrame = 0;
    visual.addEventListener('pointermove', event => {
      if (!finePointer.matches || root.dataset.motion === 'reduced') return;
      cancelAnimationFrame(projectFrame);
      projectFrame = requestAnimationFrame(() => {
        const box = visual.getBoundingClientRect();
        visual.style.setProperty('--assembly-x', `${((event.clientX - box.left) / box.width - .5) * 10}px`);
        visual.style.setProperty('--assembly-y', `${((event.clientY - box.top) / box.height - .5) * 7}px`);
      });
    });
    visual.addEventListener('pointerleave', () => { cancelAnimationFrame(projectFrame); visual.style.setProperty('--assembly-x', '0px'); visual.style.setProperty('--assembly-y', '0px'); });
  });
  document.querySelectorAll('[data-expand]').forEach(button => {
    const project = button.closest('.project');
    const details = document.getElementById(button.getAttribute('aria-controls'));
    const sync = () => { button.setAttribute('aria-expanded', String(details.open)); project.dataset.expanded = String(details.open); };
    button.addEventListener('click', () => { details.open = !details.open; sync(); });
    details.addEventListener('toggle', sync);
  });
  const steps = [
    { label:'01 / Experiencia', title:'La interacción empieza aquí.', copy:'Una interfaz recoge una intención y presenta una respuesta comprensible. Aquí importan el flujo, los estados y el espacio disponible.', tools:'Angular · TypeScript · HTML / CSS', evidence:'Experiencia relacionada: frontend e-commerce ↗' },
    { label:'02 / Contrato', title:'Una conexión con reglas claras.', copy:'La API define cómo se comunican las aplicaciones: qué se envía, qué se devuelve y cómo se expresan los errores. Es la frontera entre responsabilidades.', tools:'APIs REST · Node.js · NestJS', evidence:'Experiencia relacionada: APIs e integraciones ↗' },
    { label:'03 / Lógica', title:'El contexto se convierte en comportamiento.', copy:'Los servicios coordinan las reglas de negocio y las integraciones. En una solución operativa, conectan la aplicación con datos y otros sistemas.', tools:'Node.js · NestJS · Java · PHP', evidence:'Experiencia relacionada: sistemas operativos ↗' },
    { label:'04 / Persistencia', title:'Información que conserva su sentido.', copy:'La capa de datos guarda y recupera información. Su estructura debe responder a las operaciones que la aplicación necesita realizar.', tools:'PostgreSQL · MySQL · SQL', evidence:'Experiencia relacionada: bases transaccionales ↗' },
    { label:'05 / Entorno', title:'Un sistema también necesita dónde operar.', copy:'La infraestructura sostiene estas capas. Despliegue y mantenimiento forman parte del trabajo para que aplicaciones y bases de datos puedan operar.', tools:'Linux · Docker · Jenkins · CI/CD', evidence:'Experiencia relacionada: despliegue y mantenimiento ↗' }
  ];
  const explorer = document.querySelector('.system-explorer');
  const nextButton = document.querySelector('#next-step');
  let selectedStep = 0;
  const selectStep = value => {
    selectedStep = value;
    const step = steps[value];
    explorer.dataset.step = String(value);
    explorer.querySelectorAll('button[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === value)));
    explorer.querySelector('.step-count').textContent = step.label;
    explorer.querySelector('.step-panel h3').textContent = step.title;
    explorer.querySelector('.step-copy').textContent = step.copy;
    explorer.querySelector('.step-tools').textContent = step.tools;
    explorer.querySelector('.step-evidence').textContent = step.evidence;
    explorer.querySelector('.step-evidence').href = value === 0 ? '#commerce-story' : '#operations-story';
    explorer.querySelector('.step-evidence').dataset.story = value === 0 ? 'commerce' : 'operations';
    nextButton.firstChild.textContent = value === steps.length - 1 ? 'Volver a la interfaz ' : 'Siguiente conexión ';
  };
  explorer.querySelectorAll('button[data-step]').forEach(button => button.addEventListener('click', () => selectStep(Number(button.dataset.step))));
  nextButton.addEventListener('click', () => selectStep((selectedStep + 1) % steps.length));
  selectStep(0);
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-story]');
    if (!link) return;
    const dialog = document.getElementById(`${link.dataset.story}-story`);
    if (dialog && typeof dialog.showModal === 'function') {
      event.preventDefault();
      dialog.showModal();
      dialog.querySelector('.dialog-close').focus();
    }
  });
  document.querySelectorAll('.story-dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => { document.querySelector('.mobile-nav').open = false; }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) document.body.dataset.currentSection = entry.target.id === 'trabajo' ? 'work' : entry.target.id;
    }, {threshold:.1});
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), {threshold:.18});
    document.querySelectorAll('.project, .system-explorer, .profile, .contact-section').forEach(item => revealObserver.observe(item));
  }
  const hero = document.querySelector('.hero');
  let scrollFrame = 0;
  addEventListener('scroll', () => {
    if (root.dataset.motion === 'reduced') return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / Math.max(1, hero.offsetHeight)));
      root.style.setProperty('--scroll-progress', progress.toFixed(3));
      art.style.setProperty('--scroll-art', `${progress * -24}px`);
    });
  }, {passive:true});
})();
