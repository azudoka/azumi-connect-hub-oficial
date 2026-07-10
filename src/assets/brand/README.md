# Azumi Brand Assets

Coloque os arquivos de marca nesta pasta, com estes nomes exatos.

## Connect (tons de azul)

| Arquivo                  | Uso                                                         |
|--------------------------|-------------------------------------------------------------|
| `connect-logo.svg`       | Logo completo (ícone + texto), fundo claro                  |
| `connect-logo-light.svg` | Logo completo, variante pra fundo escuro/navy               |
| `connect-icon.svg`       | Só o ícone (círculos), sem texto — modo colapsado da sidebar |
| `connect-logo.png`       | Fallback PNG do logo completo (2×, mín. 400×120 px)        |
| `connect-icon.png`       | Fallback PNG do ícone (2×, mín. 160×160 px)                |

## Hub (tons de roxo)

| Arquivo               | Uso                                        |
|-----------------------|--------------------------------------------|
| `hub-logo.svg`        | Logo completo, fundo claro                 |
| `hub-logo-light.svg`  | Logo completo, variante pra fundo escuro   |
| `hub-icon.svg`        | Só o ícone                                 |
| `hub-logo.png`        | Fallback PNG do logo completo              |
| `hub-icon.png`        | Fallback PNG do ícone                      |

Formato preferido: SVG (escala sem perda). PNG só como fallback se não tiver o vetorial.

## Como ativar no componente

Em `src/components/brand/AzumiLogo.tsx`, o bloco de comentário no topo
mostra onde descomentar os imports assim que os arquivos acima estiverem aqui.
