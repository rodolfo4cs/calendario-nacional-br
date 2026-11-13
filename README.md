# Calendário Nacional Brasileiro

Calendário web estático em HTML, CSS e JavaScript puro (vanilla), focado na visualização de meses e anos com destaque para **feriados nacionais brasileiros**.

Não utiliza frameworks, bibliotecas ou build tools. Roda diretamente no navegador.

## Funcionalidades

- **Visão mensal**: grade completa do mês com feriados destacados, legenda e mini-calendários do mês anterior e seguinte.
- **Visão anual**: grade com os 12 meses do ano, layout configurável.
- Destaque visual de **domingos** e **feriados**.
- Tooltip com o nome do feriado ao passar o mouse.
- Dados de feriados nacionais em JSON (anos 2001–2078 aproximadamente).
- Interface responsiva e visual limpo, inspirado em calendários impressos.

## Como usar

### Requisitos

- Navegador moderno com suporte a ES modules e `fetch`.
- Servidor HTTP local (necessário por causa do carregamento do JSON via `fetch` — abrir o `index.html` diretamente via `file://` pode falhar por restrições de CORS).

### Executando localmente

1. Clone ou baixe o repositório.
2. Entre na pasta do projeto (`src/` ou a raiz onde estão os arquivos).
3. Suba um servidor estático simples. Exemplos:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8080
```

4. Acesse no navegador: `http://localhost:8080`

### Parâmetros de URL (query string)

O calendário é controlado exclusivamente por parâmetros na URL. Não há navegação interativa.

| Parâmetro | Exemplo | Comportamento |
|-----------|---------|---------------|
| `ano` + `mes` | `?ano=2026&mes=11` | Visão **mensal** do mês informado |
| apenas `ano` | `?ano=2026` | Visão **anual** do ano (layout padrão 3×4) |
| `ano` + `layout` | `?ano=2026&layout=2x6` | Visão anual com número de colunas definido |
| nenhum / inválido | — | Fallback para o **mês atual** (visão mensal) |

#### Exemplos práticos

```
http://localhost:8080/?ano=2026&mes=3          → Março de 2026
http://localhost:8080/?ano=2026               → Ano 2026 (3 colunas)
http://localhost:8080/?ano=2026&layout=4x3    → Ano 2026 em 4 colunas
http://localhost:8080/?ano=2026&layout=2x6    → Ano 2026 em 2 colunas
http://localhost:8080/                        → Mês corrente
```

- `layout` aceita o formato `CxL` (ex.: `3x4`, `2x6`, `4x3`, `1x12`). Apenas o **número de colunas** (1–12) é usado; as linhas são calculadas automaticamente.
- Valores inválidos de `ano` (fora de 1900–2100) ou `mes` (fora de 1–12) fazem fallback para o mês atual.

## Estrutura do projeto

```
src/
├── index.html                 # Página principal
├── css/
│   └── style.css              # Estilos (visão mensal e anual)
├── js/
│   ├── calendar.js            # Lógica principal de renderização
│   └── holidays.js            # Carregamento e consulta de feriados
└── data/
    └── feriados_nacionais.json  # Mapa de feriados (YYYY-MM-DD → nome)
```

## Dados de feriados

https://gist.github.com/sistematico/0d795e73e133632204593f1d1db4a618

O arquivo `data/feriados_nacionais.json` contém um objeto no formato:

```json
{
  "2026-01-01": "Confraternização Universal",
  "2026-04-21": "Tiradentes",
  ...
}
```

Os feriados são carregados de forma assíncrona na inicialização. Em caso de falha no carregamento, o calendário continua funcionando sem destaque de feriados.

## Tecnologias

- HTML5
- CSS3 (Grid, Custom Properties)
- JavaScript ES Modules (vanilla)
- Sem dependências externas

## Observações

- O projeto é **somente visualização** — não possui controles de navegação, seleção de data ou persistência.
- Ideal para incorporação em páginas estáticas, impressão ou uso como widget de referência de feriados.
- Feriados incluem datas móveis (Carnaval, Paixão de Cristo, Corpus Christi) já calculadas no JSON.

## Licença

Uso livre. Adapte conforme necessário.
