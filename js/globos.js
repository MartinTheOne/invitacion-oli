/* =================================================================
   Globos flotantes (normales y con forma de corazón) + confeti.
   Uso:
     Globos.iniciar({ colores: [...], corazones: 0.4, intervalo: 2000, max: 10 })
     Globos.rafaga(12)        → suelta varios globos a la vez
     Globos.lluviaConfeti()   → confeti cayendo desde arriba
     Globos.lluviaCorazones(x, y) → estallido de corazones desde un punto de la pantalla
   Los globos se revientan al tocarlos.
   ================================================================= */
window.Globos = (() => {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Formas dibujadas en una caja de 100 × 170. brillo = [cx, cy, rx, ry, giro]
  const FORMAS = {
    globo: {
      cuerpo: 'M50 6C25 6 8 27 8 52c0 30 24 56 42 60 18-4 42-30 42-60C92 27 75 6 50 6z',
      nudo: 'M44 120h12l-6-9z',
      brillo: [30, 33, 7, 14, 28]
    },
    corazon: {
      cuerpo: 'M50 110C22 90 6 70 6 45 6 25 20 10 36 10c7 0 11 3 14 10 3-7 7-10 14-10 16 0 30 15 30 35 0 25-16 45-44 65z',
      nudo: 'M44 118h12l-6-9z',
      brillo: [24, 31, 5.5, 11, 42]
    }
  };

  // Corazón chico (caja de 24 × 24) para la lluvia de corazones
  const CORAZON = 'M12 21C6 16.5 2 13 2 8.6 2 5.5 4.4 3.2 7.3 3.2c1.9 0 3.6 1 4.7 2.6 1.1-1.6 2.8-2.6 4.7-2.6 2.9 0 5.3 2.3 5.3 5.4C22 13 18 16.5 12 21z';

  const opciones = {
    colores: ['#f9b8c9', '#fcd5ce', '#cdb4db', '#bde0fe', '#ffe5a5'],
    confeti: null, // si es null usa los mismos colores de los globos
    corazones: 0.4,
    intervalo: 2200,
    max: 8
  };

  let capa = null;
  let reloj = null;

  const azar = (min, max) => min + Math.random() * (max - min);
  const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

  function asegurarCapa() {
    if (capa) return capa;
    capa = document.createElement('div');
    capa.className = 'capa-globos';
    capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML = `
      <svg width="0" height="0" style="position:absolute">
        <defs>
          <radialGradient id="globo-volumen" cx=".35" cy=".3" r=".8">
            <stop offset="0" stop-color="#fff" stop-opacity=".5"/>
            <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity=".18"/>
          </radialGradient>
        </defs>
      </svg>`;
    capa.addEventListener('pointerdown', (e) => {
      const globo = e.target.closest('.globo');
      if (globo) reventar(globo);
    });
    document.body.appendChild(capa);
    return capa;
  }

  function crearGlobo(rapido) {
    const tipo = Math.random() < opciones.corazones ? 'corazon' : 'globo';
    const forma = FORMAS[tipo];
    const color = elegir(opciones.colores);
    const [bx, by, brx, bry, bgiro] = forma.brillo;

    const globo = document.createElement('div');
    globo.className = `globo globo-${tipo}`;
    globo.dataset.color = color;
    globo.style.left = `${azar(-4, 94).toFixed(1)}%`;
    globo.style.setProperty('--tam', `${Math.round(azar(48, 86))}px`);
    globo.style.setProperty('--dur', `${azar(rapido ? 7 : 12, rapido ? 10 : 18).toFixed(1)}s`);
    globo.style.setProperty('--deriva', `${Math.round(azar(-70, 70))}px`);
    globo.style.setProperty('--vaiven', `${azar(2.2, 3.6).toFixed(1)}s`);
    globo.innerHTML = `
      <div class="globo-vaiven">
        <svg viewBox="0 0 100 170" focusable="false">
          <path class="hilo" d="M50 119c-7 11 7 20 0 31s6 13 0 20" fill="none" stroke-width="1.5" stroke-linecap="round"/>
          <path d="${forma.nudo}" fill="${color}"/>
          <g class="cuerpo-globo">
            <path d="${forma.cuerpo}" fill="${color}"/>
            <path d="${forma.cuerpo}" fill="url(#globo-volumen)"/>
            <ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" transform="rotate(${bgiro} ${bx} ${by})" fill="#fff" opacity=".55"/>
          </g>
        </svg>
      </div>`;
    globo.addEventListener('animationend', (e) => {
      if (e.animationName === 'subir-globo') globo.remove();
    });
    return globo;
  }

  function reventar(globo) {
    if (globo.classList.contains('reventado')) return;
    const caja = globo.querySelector('.cuerpo-globo').getBoundingClientRect();
    globo.classList.add('reventado');
    chispas(caja.left + caja.width / 2, caja.top + caja.height / 2, globo.dataset.color);
    setTimeout(() => globo.remove(), 250);
  }

  function chispas(x, y, colorBase, n = 14) {
    asegurarCapa();
    const colores = opciones.confeti || opciones.colores;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const angulo = (Math.PI * 2 * i) / n + azar(-0.25, 0.25);
      const distancia = azar(40, 95);
      p.className = 'chispa';
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.background = i % 3 === 0 && colorBase ? colorBase : elegir(colores);
      p.style.setProperty('--dx', `${(Math.cos(angulo) * distancia).toFixed(1)}px`);
      p.style.setProperty('--dy', `${(Math.sin(angulo) * distancia).toFixed(1)}px`);
      p.addEventListener('animationend', () => p.remove());
      capa.appendChild(p);
    }
  }

  function lluviaConfeti(n = 90) {
    if (reducido) return;
    asegurarCapa();
    const colores = opciones.confeti || opciones.colores;
    const grupo = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confeti';
      c.style.left = `${azar(0, 100).toFixed(1)}%`;
      c.style.background = elegir(colores);
      c.style.setProperty('--an', `${Math.round(azar(6, 10))}px`);
      c.style.setProperty('--al', `${Math.round(azar(9, 16))}px`);
      c.style.setProperty('--caida', `${azar(2.8, 5).toFixed(2)}s`);
      c.style.setProperty('--retraso', `${azar(0, 1.2).toFixed(2)}s`);
      c.style.setProperty('--lado', `${Math.round(azar(-90, 90))}px`);
      c.style.setProperty('--giro', `${Math.round(azar(360, 1080))}deg`);
      if (i % 4 === 0) c.style.borderRadius = '50%';
      c.addEventListener('animationend', () => c.remove());
      grupo.appendChild(c);
    }
    capa.appendChild(grupo);
  }

  function soltar() {
    if (document.hidden) return;
    if (capa.querySelectorAll('.globo:not(.reventado)').length >= opciones.max) return;
    capa.appendChild(crearGlobo(false));
  }

  function iniciar(nuevas = {}) {
    Object.entries(nuevas).forEach(([clave, valor]) => {
      if (valor !== undefined) opciones[clave] = valor;
    });
    asegurarCapa();
    if (reducido) return;
    clearInterval(reloj);
    reloj = setInterval(soltar, opciones.intervalo);
  }

  function rafaga(n = 12) {
    if (reducido) return;
    asegurarCapa();
    for (let i = 0; i < n; i++) {
      const globo = crearGlobo(true);
      globo.style.left = `${(((i + 0.5) / n) * 100 - 6 + azar(-3, 3)).toFixed(1)}%`;
      globo.style.animationDelay = `${azar(0, 0.9).toFixed(2)}s`;
      capa.appendChild(globo);
    }
  }

  function onda(x, y, color, retraso) {
    const anillo = document.createElement('i');
    anillo.className = 'festejo festejo-onda';
    anillo.style.left = `${x - 30}px`;
    anillo.style.top = `${y - 30}px`;
    anillo.style.borderColor = color;
    capa.appendChild(anillo);
    anillo.animate(
      [{ transform: 'scale(.6)', opacity: 0.9 }, { transform: 'scale(4.5)', opacity: 0 }],
      { duration: 1000, delay: retraso, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }
    ).onfinish = () => anillo.remove();
  }

  // Dos ondas y un estallido de corazones que suben flotando desde (x, y), en coordenadas de la ventana
  function lluviaCorazones(x, y, n = 28) {
    if (reducido) return;
    asegurarCapa();
    const colores = [...(opciones.confeti || opciones.colores), '#efb84a'];
    const acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || colores[0];
    onda(x, y, acento, 0);
    onda(x, y, colores[0], 200);

    for (let i = 0; i < n; i++) {
      const tam = Math.round(azar(14, 30));
      const corazon = document.createElement('i');
      corazon.className = 'festejo';
      corazon.style.left = `${x - tam / 2}px`;
      corazon.style.top = `${y - tam / 2}px`;
      corazon.innerHTML = `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}"><path d="${CORAZON}" fill="${elegir(colores)}"/></svg>`;
      capa.appendChild(corazon);

      const angulo = ((-90 + azar(-80, 80)) * Math.PI) / 180;
      const distancia = azar(90, 200);
      const dx = Math.cos(angulo) * distancia;
      const dy = Math.sin(angulo) * distancia;
      const giro = azar(-40, 40);
      corazon.animate(
        [
          { transform: 'translate(0, 0) scale(.2)', opacity: 0 },
          { transform: `translate(${dx}px, ${dy}px) scale(1) rotate(${giro}deg)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${dx + azar(-20, 20)}px, ${dy - azar(60, 110)}px) scale(.8) rotate(${giro * 1.5}deg)`, opacity: 0 }
        ],
        { duration: azar(1600, 2300), delay: azar(0, 220), easing: 'cubic-bezier(.16,.8,.3,1)', fill: 'both' }
      ).onfinish = () => corazon.remove();
    }
  }

  return { iniciar, rafaga, lluviaConfeti, lluviaCorazones, chispas };
})();
