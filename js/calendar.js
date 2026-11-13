/**
 * Lógica principal de geração do calendário.
 * Suporta visão mensal (?ano=&mes=) e visão anual (?ano=).
 * Apenas visualização — sem navegação.
 */

import {
  loadHolidays,
  getHoliday,
  getHolidaysOfMonth
} from './holidays.js';

const MONTH_NAMES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/**
 * Interpreta o parâmetro layout (ex: "3x4", "2x6", "4x3").
 * Retorna número de colunas válido (1–12). Padrão: 3.
 */
function parseLayout(layoutParam) {
  const DEFAULT_COLS = 3;

  if (!layoutParam || typeof layoutParam !== 'string') {
    return DEFAULT_COLS;
  }

  const match = layoutParam.trim().toLowerCase().match(/^(\d+)\s*[x×]\s*(\d+)$/);
  if (!match) {
    return DEFAULT_COLS;
  }

  const cols = parseInt(match[1], 10);
  // Aceita apenas colunas entre 1 e 12 (linhas são derivadas automaticamente)
  if (Number.isNaN(cols) || cols < 1 || cols > 12) {
    return DEFAULT_COLS;
  }

  return cols;
}

/**
 * Lê e valida os parâmetros da query string.
 * - ?ano=YYYY&mes=MM           → visão mensal
 * - ?ano=YYYY                  → visão anual (layout padrão 3x4)
 * - ?ano=YYYY&layout=2x6       → visão anual com N colunas
 * - sem parâmetros / inválidos → fallback mês atual (visão mensal)
 */
function getViewParams() {
  const params = new URLSearchParams(window.location.search);
  const now = new Date();

  let year = parseInt(params.get('ano'), 10);
  let month = parseInt(params.get('mes'), 10);
  const layoutCols = parseLayout(params.get('layout'));

  const hasValidYear = !Number.isNaN(year) && year >= 1900 && year <= 2100;
  const hasValidMonth = !Number.isNaN(month) && month >= 1 && month <= 12;

  if (hasValidYear && hasValidMonth) {
    return { mode: 'month', year, month };
  }

  if (hasValidYear && !hasValidMonth) {
    return { mode: 'year', year, cols: layoutCols };
  }

  // Fallback: mês atual
  return {
    mode: 'month',
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
}

/**
 * Quantidade de dias do mês.
 */
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Dia da semana do primeiro dia do mês (0 = domingo).
 */
function firstWeekday(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Gera o HTML da grade de dias (visão mensal principal).
 */
function buildDaysGrid(year, month) {
  const totalDays = daysInMonth(year, month);
  const startWeekday = firstWeekday(year, month);
  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push('<div class="day empty"></div>');
  }

  for (let day = 1; day <= totalDays; day++) {
    const weekday = (startWeekday + day - 1) % 7;
    const isSunday = weekday === 0;
    const holidayName = getHoliday(year, month, day);

    let classes = 'day';
    if (isSunday) classes += ' sunday';
    if (holidayName) classes += ' holiday';

    const circle = holidayName
      ? `<span class="holiday-circle">${day}</span>`
      : day;

    cells.push(
      `<div class="${classes}" data-day="${day}" title="${holidayName || ''}">${circle}</div>`
    );
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < remaining; i++) {
    cells.push('<div class="day empty"></div>');
  }

  return cells.join('');
}

/**
 * Gera grade de dias compacta para os cards da visão anual.
 */
function buildCompactDaysGrid(year, month) {
  const totalDays = daysInMonth(year, month);
  const startWeekday = firstWeekday(year, month);
  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push('<span class="compact-day empty"></span>');
  }

  for (let day = 1; day <= totalDays; day++) {
    const weekday = (startWeekday + day - 1) % 7;
    const isSunday = weekday === 0;
    const holidayName = getHoliday(year, month, day);

    let classes = 'compact-day';
    if (isSunday) classes += ' sunday';
    if (holidayName) classes += ' holiday';

    const content = holidayName
      ? `<span class="compact-holiday-circle">${day}</span>`
      : day;

    cells.push(
      `<span class="${classes}" title="${holidayName || ''}">${content}</span>`
    );
  }

  return cells.join('');
}

/**
 * Gera a legenda de feriados de um mês (HTML).
 */
function buildHolidayLegend(year, month) {
  const holidays = getHolidaysOfMonth(year, month);
  if (holidays.length === 0) {
    return '';
  }

  return holidays
    .map(h => {
      const dayStr = String(h.day).padStart(2, '0');
      return `<span class="holiday-item">${dayStr} ${h.name}</span>`;
    })
    .join('');
}

/**
 * Gera um card completo de um mês (visão anual).
 */
function buildMonthCard(year, month) {
  const title = MONTH_NAMES[month - 1];
  const weekdays = WEEKDAY_LABELS
    .map((l, i) => `<span class="${i === 0 ? 'sun' : ''}">${l}</span>`)
    .join('');
  const days = buildCompactDaysGrid(year, month);
  const legend = buildHolidayLegend(year, month);

  return `
    <div class="month-card">
      <div class="month-card-title">${title}</div>
      <div class="month-card-weekdays">${weekdays}</div>
      <div class="month-card-days">${days}</div>
      ${legend ? `<div class="month-card-legend">${legend}</div>` : ''}
    </div>
  `;
}

/**
 * Gera um mini-calendário estático (mês anterior ou seguinte).
 */
function buildMiniCalendar(year, month, title) {
  const totalDays = daysInMonth(year, month);
  const startWeekday = firstWeekday(year, month);

  let html = `
    <div class="mini-calendar">
      <div class="mini-header">${title}</div>
      <div class="mini-weekdays">
        ${WEEKDAY_LABELS.map((l, i) =>
          `<span class="${i === 0 ? 'sun' : ''}">${l}</span>`
        ).join('')}
      </div>
      <div class="mini-days">
  `;

  for (let i = 0; i < startWeekday; i++) {
    html += '<span class="mini-day empty"></span>';
  }

  for (let day = 1; day <= totalDays; day++) {
    const weekday = (startWeekday + day - 1) % 7;
    const isSunday = weekday === 0;
    const holidayName = getHoliday(year, month, day);

    let classes = 'mini-day';
    if (isSunday) classes += ' sunday';
    if (holidayName) classes += ' holiday';

    html += `<span class="${classes}">${day}</span>`;
  }

  html += '</div></div>';
  return html;
}

/**
 * Atualiza a legenda de feriados do mês (visão mensal).
 */
function renderHolidayLabels(year, month) {
  const holidays = getHolidaysOfMonth(year, month);
  const container = document.getElementById('holiday-labels');

  if (!container) return;

  if (holidays.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = holidays
    .map(h => {
      const dayStr = String(h.day).padStart(2, '0');
      const monthShort = MONTH_NAMES[month - 1].slice(0, 3);
      return `<span class="holiday-item">${dayStr} ${monthShort} ${h.name}</span>`;
    })
    .join('');
}

/**
 * Renderiza a visão mensal (comportamento original).
 */
function renderMonthView(year, month) {
  const wrapper = document.querySelector('.calendar-wrapper');
  if (!wrapper) return;

  wrapper.classList.remove('year-mode');
  wrapper.classList.add('month-mode');

  // Garante a estrutura da visão mensal
  wrapper.innerHTML = `
    <header class="month-header" id="month-title">
      <span class="month-name">${MONTH_NAMES[month - 1]}</span>
      <span class="year">${year}</span>
    </header>

    <div class="weekdays">
      <span class="sunday-label">D</span>
      <span>S</span>
      <span>T</span>
      <span>Q</span>
      <span>Q</span>
      <span>S</span>
      <span>S</span>
    </div>

    <div class="days-grid" id="days-grid"></div>

    <div class="holiday-labels" id="holiday-labels"></div>

    <section class="mini-section">
      <div id="mini-prev"></div>
      <div id="mini-next"></div>
    </section>
  `;

  const gridEl = document.getElementById('days-grid');
  if (gridEl) {
    gridEl.innerHTML = buildDaysGrid(year, month);
  }

  // Mini-calendários (mês anterior e seguinte)
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }

  const prevTitle = `${MONTH_NAMES[prevMonth - 1]} ${prevYear}`;
  const nextTitle = `${MONTH_NAMES[nextMonth - 1]} ${nextYear}`;

  const miniPrev = document.getElementById('mini-prev');
  const miniNext = document.getElementById('mini-next');

  if (miniPrev) {
    miniPrev.innerHTML = buildMiniCalendar(prevYear, prevMonth, prevTitle);
  }
  if (miniNext) {
    miniNext.innerHTML = buildMiniCalendar(nextYear, nextMonth, nextTitle);
  }

  renderHolidayLabels(year, month);
}

/**
 * Renderiza a visão anual (12 meses em grade configurável).
 * @param {number} year
 * @param {number} cols - número de colunas (1–12). Linhas = ceil(12 / cols).
 */
function renderYearView(year, cols = 3) {
  const wrapper = document.querySelector('.calendar-wrapper');
  if (!wrapper) return;

  const safeCols = Math.min(12, Math.max(1, cols || 3));

  wrapper.classList.remove('month-mode');
  wrapper.classList.add('year-mode');

  const cards = [];
  for (let m = 1; m <= 12; m++) {
    cards.push(buildMonthCard(year, m));
  }

  wrapper.innerHTML = `
    <header class="year-header">
      <span class="year">${year}</span>
    </header>
    <div class="year-grid" style="--year-cols: ${safeCols};">
      ${cards.join('')}
    </div>
  `;
}

/**
 * Inicialização.
 */
async function init() {
  const params = getViewParams();

  await loadHolidays();

  if (params.mode === 'year') {
    renderYearView(params.year, params.cols);
  } else {
    renderMonthView(params.year, params.month);
  }
}

// Inicia quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
