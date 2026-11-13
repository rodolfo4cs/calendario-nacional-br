/**
 * Módulo de feriados nacionais.
 * Carrega o JSON e expõe funções de consulta.
 */

let holidaysMap = null;

/**
 * Carrega o arquivo de feriados.
 * @returns {Promise<Object>} Mapa { "YYYY-MM-DD": "Nome" }
 */
export async function loadHolidays() {
  if (holidaysMap) {
    return holidaysMap;
  }

  try {
    const response = await fetch('./data/feriados_nacionais.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    holidaysMap = await response.json();
    return holidaysMap;
  } catch (err) {
    console.warn('Não foi possível carregar feriados:', err.message);
    holidaysMap = {};
    return holidaysMap;
  }
}

/**
 * Formata uma data no padrão do JSON (YYYY-MM-DD).
 * @param {number} year
 * @param {number} month - 1 a 12
 * @param {number} day
 * @returns {string}
 */
export function formatDate(year, month, day) {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Retorna o nome do feriado para a data informada, ou null.
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {string|null}
 */
export function getHoliday(year, month, day) {
  if (!holidaysMap) return null;
  const key = formatDate(year, month, day);
  return holidaysMap[key] || null;
}

/**
 * Retorna todos os feriados de um mês.
 * @param {number} year
 * @param {number} month
 * @returns {Array<{day: number, name: string}>}
 */
export function getHolidaysOfMonth(year, month) {
  if (!holidaysMap) return [];

  const result = [];
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;

  for (const [date, name] of Object.entries(holidaysMap)) {
    if (date.startsWith(prefix)) {
      const day = parseInt(date.slice(8), 10);
      result.push({ day, name });
    }
  }

  return result.sort((a, b) => a.day - b.day);
}
