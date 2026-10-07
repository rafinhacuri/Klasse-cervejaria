<p align="center">
  <img src="public/icon-192x192.png" width="96" alt="Klasse Cervejaria" />
</p>

# Klasse Cervejaria

Landing page conceitual para uma cervejaria de chope, feita como peça de portfólio. O fundo é um copo de chope visto de cima, que ondula com o mouse, e um barril de inox de 20 L enche conforme a página rola.

## Destaques

- Superfície de chope em WebGL, com espuma, bolhas e ondas que seguem o mouse
- Barril 3D em corte com mangueira, nível subindo e condensação no inox
- Cor do fundo que muda conforme o chope em foco
- Calculadora de litros e barris para festas
- Imagem de compartilhamento gerada com `nuxt-og-image`

## Stack

- [Nuxt 4](https://nuxt.com) + Vue 3
- [Tailwind CSS 4](https://tailwindcss.com)
- [Three.js](https://threejs.org) para o fundo e o barril
- [motion-v](https://motion.dev/docs/vue) para animações
- [Reka UI](https://reka-ui.com) para os componentes acessíveis
- `@nuxtjs/seo`
- Deploy na [Vercel](https://vercel.com)

## Rodando localmente

```bash
bun install
cp .env.example .env
bun run dev
```

`DEV_URL`, `DEV_KEY` e `DEV_CERT` são opcionais e servem para rodar o dev server com HTTPS em um host próprio.

## Scripts

| Comando             | O que faz                                    |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Servidor de desenvolvimento                  |
| `bun run build`     | Build de produção                            |
| `bun run preview`   | Pré-visualiza o build                        |
| `bun run lint`      | Lint com oxlint                              |
| `bun run fmt`       | Checa a formatação com oxfmt                 |
| `bun run typecheck` | Checagem de tipos                            |
| `bun run release`   | Formata, faz lint, checa tipos e gera versão |

## Estrutura

```
app/
  components/   componentes da interface e seções da página
  data/         conteúdo do site (chopes, barris, horários)
  lib/three/    fundo de chope, barril 3D e shaders
  pages/        página inicial
public/         logo e ícones
```

Os textos de cada seção ficam no objeto `text` do próprio componente, e os chopes e barris em [`app/data/content.ts`](app/data/content.ts).

Para atualizar os ícones, edite `public/logo.svg` e rode:

```bash
bunx nuxt-seo-utils icons --source logo.svg
```
