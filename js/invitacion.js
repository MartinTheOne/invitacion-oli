/* =================================================================
   Lógica común de las invitaciones:
   sobre → invitación, textos, cuenta regresiva, galería de meses,
   visor de fotos, confirmación por WhatsApp y música.
   Cada plantilla define window.TEMA antes de cargar este archivo.
   ================================================================= */
(() => {
  const C = window.CUMPLE;
  const T = Object.assign({ galeria: 'carrusel' }, window.TEMA);
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fecha = new Date(C.fecha);
  // Enlace personalizado: plantilla.html?para=Familia%20Pérez
  const invitado = (new URLSearchParams(location.search).get('para') || '').trim().slice(0, 60);

  const dos = (n) => String(n).padStart(2, '0');
  const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  const ICONOS = {
    izq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    der: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    musica: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/></svg>'
  };

  /* ---------- Textos y enlaces ---------- */

  function rellenarTextos() {
    const valores = {
      nombre: C.nombre,
      inicial: C.nombre.trim().charAt(0).toUpperCase(),
      diaSemana: capital(fecha.toLocaleDateString('es', { weekday: 'long' })),
      dia: String(fecha.getDate()),
      mes: capital(fecha.toLocaleDateString('es', { month: 'long' })),
      anio: String(fecha.getFullYear()),
      fechaLarga: capital(fecha.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })),
      hora: C.horaTexto || `${dos(fecha.getHours())}:${dos(fecha.getMinutes())} hrs`,
      lugar: C.lugar.nombre,
      direccion: C.lugar.direccion,
      mensaje: C.mensaje,
      nota: C.nota,
      firma: C.firma,
      saludo: invitado ? `Para: ${invitado}` : ''
    };
    // Un valor vacío deja el texto del HTML, salvo en elementos [data-opcional], que se ocultan.
    $$('[data-campo]').forEach((el) => {
      const valor = valores[el.dataset.campo];
      if (valor === undefined) return;
      if (!valor) {
        if (el.hasAttribute('data-opcional')) el.hidden = true;
        return;
      }
      el.textContent = valor;
    });
    document.title = `${C.nombre} · Mi primer añito`;
  }

  function prepararEnlaces() {
    const mapa = C.lugar.mapa ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${C.lugar.nombre}, ${C.lugar.direccion}`)}`;
    const fin = new Date(fecha.getTime() + (C.duracionHoras || 3) * 3600000);
    const formato = (d) =>
      `${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}T${dos(d.getHours())}${dos(d.getMinutes())}00`;
    const calendario = `https://calendar.google.com/calendar/render?${new URLSearchParams({
      action: 'TEMPLATE',
      text: `Primer añito de ${C.nombre} 🎈`,
      dates: `${formato(fecha)}/${formato(fin)}`,
      details: C.mensaje,
      location: `${C.lugar.nombre}, ${C.lugar.direccion}`
    })}`;
    $$('[data-enlace="mapa"]').forEach((a) => { a.href = mapa; });
    $$('[data-enlace="calendario"]').forEach((a) => { a.href = calendario; });
  }

  /* ---------- Cuenta regresiva ---------- */

  function iniciarCuenta() {
    const caja = $('[data-cuenta]');
    if (!caja) return;
    const partes = {};
    $$('[data-cuenta-parte]', caja).forEach((el) => { partes[el.dataset.cuentaParte] = el; });
    const final = $('[data-cuenta-fin]');
    let reloj = null;

    const tic = () => {
      const resto = fecha - Date.now();
      if (resto <= 0) {
        clearInterval(reloj);
        caja.hidden = true;
        if (final) {
          const hoy = new Date().toDateString() === fecha.toDateString();
          final.textContent = hoy ? '¡Hoy es el gran día! 🎉' : '¡Gracias por celebrar conmigo! 💕';
          final.hidden = false;
        }
        return;
      }
      const s = Math.floor(resto / 1000);
      partes.dias.textContent = Math.floor(s / 86400);
      partes.horas.textContent = dos(Math.floor((s % 86400) / 3600));
      partes.minutos.textContent = dos(Math.floor((s % 3600) / 60));
      partes.segundos.textContent = dos(s % 60);
    };
    reloj = setInterval(tic, 1000);
    tic();
  }

  /* ---------- Fotos ---------- */

  // Marco con un recuadro decorado debajo; si la foto carga, la tapa.
  function crearMarco(src, alt, vacia = {}, perezosa = true) {
    const marco = document.createElement('span');
    marco.className = 'foto-marco';

    const relleno = document.createElement('span');
    relleno.className = 'foto-vacia';
    relleno.setAttribute('aria-hidden', 'true');
    ['emoji', 'numero', 'palabra'].forEach((clave) => {
      const parte = document.createElement('span');
      parte.className = `foto-${clave}`;
      parte.textContent = vacia[clave] || '';
      relleno.appendChild(parte);
    });
    marco.appendChild(relleno);

    if (src) {
      const img = document.createElement('img');
      img.alt = alt;
      img.decoding = 'async';
      img.draggable = false;
      if (perezosa) img.loading = 'lazy';
      img.addEventListener('load', () => marco.classList.add('con-foto'));
      img.addEventListener('error', () => img.remove());
      img.src = src;
      marco.appendChild(img);
    }
    return marco;
  }

  function montarPortada() {
    $$('[data-portada]').forEach((caja) => {
      caja.appendChild(crearMarco(C.fotoPortada, `Foto de ${C.nombre}`, { emoji: caja.dataset.portada || '👶' }));
    });
    // Foto secundaria (debajo de la portada): sin foto configurada se oculta su espacio
    $$('[data-secundaria]').forEach((caja) => {
      if (!C.fotoSecundaria) {
        (caja.closest('section') || caja).hidden = true;
        return;
      }
      caja.appendChild(crearMarco(C.fotoSecundaria, `Otra foto de ${C.nombre}`, { emoji: caja.dataset.secundaria || '📷' }));
    });
  }

  function datosMeses() {
    return C.meses.map((mes, i) => ({
      src: mes.foto,
      alt: i === 0 ? `${C.nombre} recién nacida` : `${C.nombre} a los ${i} ${i === 1 ? 'mes' : 'meses'}`,
      titulo: `Mes ${i}`,
      texto: mes.texto || '',
      tono: i % 4,
      vacia: {
        emoji: mes.emoji || '📷',
        numero: String(i),
        palabra: i === 0 ? 'recién nacida' : i === 1 ? 'mes' : 'meses'
      }
    }));
  }

  function crearFigura(item, i) {
    const fig = document.createElement('figure');
    fig.className = `foto tono-${item.tono}`;
    fig.style.setProperty('--n', i);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'foto-abrir';
    boton.setAttribute('aria-label', `Ver foto en grande: ${item.titulo}${item.texto ? `, ${item.texto}` : ''}`);
    boton.appendChild(crearMarco(item.src, item.alt, item.vacia));

    const pie = document.createElement('figcaption');
    const titulo = document.createElement('strong');
    titulo.className = 'foto-titulo';
    titulo.textContent = item.titulo;
    const texto = document.createElement('span');
    texto.className = 'foto-texto';
    texto.textContent = item.texto;
    pie.append(titulo, texto);

    fig.append(boton, pie);
    return fig;
  }

  /* ---------- Visor de fotos en grande ---------- */

  const visor = (() => {
    let el = null;
    let items = [];
    let actual = 0;
    let origen = null;
    let ultimoDeslizamiento = 0;

    function construir() {
      el = document.createElement('div');
      el.className = 'visor';
      el.hidden = true;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Foto en grande');
      el.innerHTML = `
        <p class="visor-contador" aria-live="polite"></p>
        <button type="button" class="visor-boton visor-cerrar" aria-label="Cerrar">${ICONOS.cerrar}</button>
        <button type="button" class="visor-boton visor-flecha visor-prev" aria-label="Foto anterior">${ICONOS.izq}</button>
        <figure class="visor-figura">
          <div class="visor-marco"></div>
          <figcaption class="visor-pie"><strong></strong><span></span></figcaption>
        </figure>
        <button type="button" class="visor-boton visor-flecha visor-next" aria-label="Foto siguiente">${ICONOS.der}</button>`;
      document.body.appendChild(el);

      $('.visor-cerrar', el).addEventListener('click', cerrar);
      $('.visor-prev', el).addEventListener('click', () => mostrar(actual - 1));
      $('.visor-next', el).addEventListener('click', () => mostrar(actual + 1));
      el.addEventListener('click', (e) => {
        if (e.target === el && Date.now() - ultimoDeslizamiento > 400) cerrar();
      });
      document.addEventListener('keydown', (e) => {
        if (el.hidden) return;
        if (e.key === 'Escape') cerrar();
        else if (e.key === 'ArrowLeft') mostrar(actual - 1);
        else if (e.key === 'ArrowRight') mostrar(actual + 1);
      });

      let x0 = null;
      let y0 = 0;
      el.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
      el.addEventListener('pointerup', (e) => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        const dy = e.clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          ultimoDeslizamiento = Date.now();
          mostrar(actual + (dx < 0 ? 1 : -1));
        }
      });
    }

    function mostrar(i) {
      actual = (i + items.length) % items.length;
      const item = items[actual];
      const caja = $('.visor-marco', el);
      caja.className = `visor-marco tono-${item.tono}`;
      caja.replaceChildren(crearMarco(item.src, item.alt, item.vacia, false));
      $('.visor-pie strong', el).textContent = item.titulo;
      $('.visor-pie span', el).textContent = item.texto;
      $('.visor-contador', el).textContent = `${actual + 1} / ${items.length}`;
    }

    function abrir(lista, i) {
      if (!el) construir();
      items = lista;
      origen = document.activeElement;
      mostrar(i);
      el.hidden = false;
      document.documentElement.classList.add('sin-scroll');
      $('.visor-cerrar', el).focus();
    }

    function cerrar() {
      el.hidden = true;
      document.documentElement.classList.remove('sin-scroll');
      if (origen) origen.focus({ preventScroll: true });
    }

    return {
      abrir,
      get abierto() { return Boolean(el && !el.hidden); }
    };
  })();

  /* ---------- Galería: carrusel, cuadrícula o tendedero ---------- */

  function montarCarrusel(cont, figuras, items) {
    cont.classList.add('carrusel');
    cont.innerHTML = `
      <div class="carrusel-ventana"><div class="carrusel-pista"></div></div>
      <button type="button" class="carrusel-flecha carrusel-prev" aria-label="Mes anterior">${ICONOS.izq}</button>
      <button type="button" class="carrusel-flecha carrusel-next" aria-label="Mes siguiente">${ICONOS.der}</button>
      <div class="carrusel-puntos"></div>`;
    const ventana = $('.carrusel-ventana', cont);
    const pista = $('.carrusel-pista', cont);
    const puntos = $('.carrusel-puntos', cont);

    let actual = 0;
    let posicion = 0;
    let arrastre = 0;
    let inicioX = 0;
    let ultimoToque = 0;
    let encima = false;
    let enVista = false;
    const tocar = () => { ultimoToque = Date.now(); };

    const slides = figuras.map((fig, i) => {
      const slide = document.createElement('div');
      slide.className = 'carrusel-slide';
      slide.appendChild(fig);
      pista.appendChild(slide);

      const punto = document.createElement('button');
      punto.type = 'button';
      punto.setAttribute('aria-label', `Ir a ${items[i].titulo}`);
      punto.addEventListener('click', () => { tocar(); ir(i); });
      puntos.appendChild(punto);

      const boton = $('.foto-abrir', fig);
      boton.addEventListener('click', () => {
        if (Math.abs(arrastre) > 8) return;
        tocar();
        if (i === actual) visor.abrir(items, i);
        else ir(i);
      });
      // Con teclado, enfocar una foto la centra
      boton.addEventListener('focus', () => {
        if (boton.matches(':focus-visible') && i !== actual) ir(i);
      });
      return slide;
    });

    function ir(i) {
      actual = (i + slides.length) % slides.length;
      const slide = slides[actual];
      posicion = (ventana.clientWidth - slide.offsetWidth) / 2 - slide.offsetLeft;
      pista.style.transform = `translate3d(${posicion}px, 0, 0)`;
      slides.forEach((s, j) => s.classList.toggle('activa', j === actual));
      Array.from(puntos.children).forEach((p, j) => p.setAttribute('aria-current', j === actual ? 'true' : 'false'));
    }

    // Arrastrar con el dedo o el mouse
    const mover = (e) => {
      arrastre = e.clientX - inicioX;
      pista.style.transform = `translate3d(${posicion + arrastre}px, 0, 0)`;
    };
    const soltar = () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      pista.classList.remove('arrastrando');
      ir(Math.abs(arrastre) > 50 ? actual + (arrastre < 0 ? 1 : -1) : actual);
    };
    ventana.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      tocar();
      inicioX = e.clientX;
      arrastre = 0;
      pista.classList.add('arrastrando');
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', soltar);
    });
    // El foco con teclado no debe desplazar la ventana: el movimiento lo hace el transform
    ventana.addEventListener('scroll', () => { ventana.scrollLeft = 0; });

    $('.carrusel-prev', cont).addEventListener('click', () => { tocar(); ir(actual - 1); });
    $('.carrusel-next', cont).addEventListener('click', () => { tocar(); ir(actual + 1); });
    cont.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { tocar(); ir(actual - 1); }
      if (e.key === 'ArrowRight') { tocar(); ir(actual + 1); }
    });
    cont.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') encima = true; });
    cont.addEventListener('pointerleave', () => { encima = false; });
    window.addEventListener('resize', () => ir(actual));

    // Avanza solo mientras se ve y nadie lo está tocando
    new IntersectionObserver(([entrada]) => { enVista = entrada.isIntersecting; }, { threshold: 0.4 }).observe(cont);
    if (!reducido) {
      setInterval(() => {
        if (!enVista || encima || visor.abierto || Date.now() - ultimoToque < 8000) return;
        ir(actual + 1);
      }, 4500);
    }
    // Las fotos del carrusel se mueven con transform: si fueran perezosas se verían vacías al llegar
    $$('img', pista).forEach((img) => { img.loading = 'eager'; });
    ir(0);
  }

  function montarTendedero(cont, figuras, items) {
    cont.classList.add('tendedero');
    cont.innerHTML = `
      <div class="tendedero-pista"></div>
      <button type="button" class="tendedero-flecha tendedero-prev" aria-label="Fotos anteriores">${ICONOS.izq}</button>
      <button type="button" class="tendedero-flecha tendedero-next" aria-label="Fotos siguientes">${ICONOS.der}</button>`;
    const pista = $('.tendedero-pista', cont);
    const prev = $('.tendedero-prev', cont);
    const next = $('.tendedero-next', cont);

    figuras.forEach((fig, i) => {
      pista.appendChild(fig);
      $('.foto-abrir', fig).addEventListener('click', () => visor.abrir(items, i));
    });

    const paso = () => figuras[0].offsetWidth + (parseFloat(getComputedStyle(pista).columnGap) || 0);
    const actualizar = () => {
      prev.disabled = pista.scrollLeft < 4;
      next.disabled = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
    };
    prev.addEventListener('click', () => pista.scrollBy({ left: -paso(), behavior: 'smooth' }));
    next.addEventListener('click', () => pista.scrollBy({ left: paso(), behavior: 'smooth' }));
    pista.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
  }

  function montarCuadricula(cont, figuras, items) {
    cont.classList.add('cuadricula');
    figuras.forEach((fig, i) => {
      fig.classList.add('revelar');
      fig.style.setProperty('--retraso', `${(i % 4) * 0.08}s`);
      cont.appendChild(fig);
      $('.foto-abrir', fig).addEventListener('click', () => visor.abrir(items, i));
    });
  }

  function montarGaleria() {
    const cont = $('[data-galeria]');
    if (!cont) return;
    const items = datosMeses();
    const figuras = items.map(crearFigura);
    if (T.galeria === 'carrusel') montarCarrusel(cont, figuras, items);
    else if (T.galeria === 'tendedero') montarTendedero(cont, figuras, items);
    else montarCuadricula(cont, figuras, items);
  }

  /* ---------- Confirmación por WhatsApp ---------- */

  // Botón directo: festejo con lluvia de corazones y luego abre WhatsApp con el mensaje ya escrito
  function prepararBotonWhatsapp() {
    const numero = String(C.whatsapp || '').replace(/\D/g, '');
    const saludo = invitado ? `¡Hola! Soy ${invitado} y confirmo` : '¡Hola! Confirmo';
    const texto = `${saludo} mi asistencia al primer añito de ${C.nombre} 🎈`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

    $$('[data-whatsapp]').forEach((enlace) => {
      enlace.href = url;
      const etiqueta = $('[data-whatsapp-texto]', enlace);

      enlace.addEventListener('click', (e) => {
        if (reducido) return; // sin animaciones: el enlace abre WhatsApp directo
        e.preventDefault();

        const caja = enlace.getBoundingClientRect();
        Globos.lluviaCorazones(caja.left + caja.width / 2, caja.top + caja.height / 2);
        enlace.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
          { duration: 450, easing: 'ease-out' }
        );
        if (etiqueta) etiqueta.textContent = '¡Gracias, te espero!';

        // Se abre antes de que pase 1 s desde el toque: si no, Safari y otros navegadores lo bloquean
        setTimeout(() => {
          const ventana = window.open(url, '_blank');
          if (ventana) ventana.opener = null;
          else location.href = url;
        }, 850);
      });
    });
  }

  // Formulario (plantillas 2 y 3)
  function prepararConfirmacion() {
    const form = $('[data-confirmar]');
    if (!form) return;
    const cantidad = $('[data-cantidad]', form);
    const gracias = $('[data-gracias]', form);
    if (invitado) form.elements.nombre.value = invitado;

    form.addEventListener('change', () => {
      cantidad.hidden = form.elements.asistencia.value === 'no';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.elements.nombre.value.trim();
      if (!nombre) {
        form.elements.nombre.focus();
        return;
      }
      const asiste = form.elements.asistencia.value !== 'no';
      const personas = Number(form.elements.cantidad.value) || 1;
      const texto = asiste
        ? `¡Hola! Soy ${nombre} y confirmo mi asistencia al primer añito de ${C.nombre} 🎈 Seremos ${personas} ${personas === 1 ? 'persona' : 'personas'}.`
        : `¡Hola! Soy ${nombre}. Lamentablemente no podré ir al primer añito de ${C.nombre}, ¡pero le mando muchos besos! 💕`;
      const numero = String(C.whatsapp || '').replace(/\D/g, '');
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');

      if (asiste) Globos.rafaga(8);
      gracias.textContent = asiste ? '¡Gracias! Te espero con muchas ganas 💕' : '¡Gracias por avisarme! 💕';
      gracias.hidden = false;
    });
  }

  /* ---------- Música (opcional) ---------- */

  function prepararMusica() {
    if (!C.musica) return () => {};
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = 'none';

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn-musica';
    boton.hidden = true;
    boton.innerHTML = ICONOS.musica;
    document.body.appendChild(boton);

    audio.addEventListener('playing', () => {
      boton.hidden = false;
      boton.classList.add('sonando');
      boton.setAttribute('aria-label', 'Pausar música');
    });
    audio.addEventListener('pause', () => {
      boton.classList.remove('sonando');
      boton.setAttribute('aria-label', 'Reproducir música');
    });
    boton.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));

    // Se llama al abrir el sobre (necesita el toque del usuario para sonar)
    return () => {
      audio.src = C.musica;
      audio.play().catch(() => {});
    };
  }

  /* ---------- Sobre y aparición de la invitación ---------- */

  function revelarAlDesplazar() {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    $$('.revelar').forEach((el) => observador.observe(el));
  }

  function prepararSobre(alAbrir) {
    const sobre = $('[data-sobre]');
    const intro = $('.intro');
    const invitacion = $('.invitacion');

    // La carta termina de salir del sobre a los ~1,6 s; se deja ~1 s más para leerla
    const pausaLectura = reducido ? 200 : 2650;

    sobre.addEventListener('click', () => {
      if (document.body.classList.contains('abriendo')) return;
      document.body.classList.add('abriendo');
      sobre.setAttribute('aria-expanded', 'true');
      alAbrir();

      setTimeout(() => {
        document.body.classList.add('abierta');
        document.documentElement.classList.remove('sin-scroll');
        window.scrollTo(0, 0);
        Globos.rafaga(7);
        Globos.lluviaConfeti();
        // Mientras se lee la invitación, pocos globos para no tapar el contenido
        Globos.iniciar({ intervalo: 6000, max: 2 });
        revelarAlDesplazar();
        invitacion.focus({ preventScroll: true });
      }, pausaLectura);

      // El sobre se desvanece en 0,9 s después de la pausa
      setTimeout(() => { intro.hidden = true; }, pausaLectura + 1050);
    });
  }

  /* ---------- Inicio ---------- */

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  rellenarTextos();
  prepararEnlaces();
  montarPortada();
  montarGaleria();
  iniciarCuenta();
  prepararBotonWhatsapp();
  prepararConfirmacion();
  prepararSobre(prepararMusica());
  Globos.iniciar({
    colores: T.globos,
    confeti: T.confeti,
    corazones: T.corazones,
    intervalo: 3500,
    max: 3
  });
})();
