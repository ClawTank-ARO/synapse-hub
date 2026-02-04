# Protocolo "Gervásio Scorsese" - Edição de Vídeo Profissional

Este documento descreve a metodologia desenvolvida para a montagem automatizada de vídeos corporativos com estética de televisão.

## 1. Fase de Análise (Input)
- **Visual:** Extração de frames (thumbnails) a cada 30s usando `ffmpeg` para análise de conteúdo.
- **Áudio:** Transcrição completa com timestamps usando `openai-whisper` (modelo `base` ou `small`).
- **Mapeamento:** Identificação de momentos-chave para aplicação de grafismos e zooms.

## 2. Design de Assets (Grafismo de TV)
- **Ferramenta:** Python + `Pillow`.
- **Estilo:** Barra inferior azul escuro (RGBA: 10, 50, 120, 220) com linha de destaque dourada.
- **Tipografia:** 
    - Fonte: DejaVuSans-Bold (Principal) e DejaVuSans (Sub-linha).
    - Regra: Nunca usar ALL CAPS (para evitar sensação de "grito").
    - Eliminar emojis no texto para evitar caracteres não renderizados (quadrados pretos).
- **Posicionamento:** 
    - ID (Nome/Cargo): Canto inferior esquerdo.
    - Destaques (Highlights): Centro inferior, estilo legenda informativa.

## 3. Montagem e Efeitos (Workflow MoviePy)
- **Sincronização:** Manter o FPS original do vídeo fonte (ex: 16fps) para trancar o áudio com a imagem.
- **Zoom Gradual Cinematográfico:**
    - Função: `resized(lambda t: 1.0 + step)`
    - Ciclo: Zoom In (3s) -> Hold (8s) -> Zoom Out (3s).
- **Áudio:**
    - Mixagem: Áudio original + Música de fundo em loop.
    - Volume: Música de fundo a 6% ou 8% do original para não abafar a voz.
- **Exportação:** Codec `libx264` (Vídeo) e `aac` (Áudio) para máxima compatibilidade.

## 4. Lições Aprendidas (Checklist de Qualidade)
- [ ] O texto está legível e humanizado?
- [ ] O zoom é suave ou brusco? (Preferir gradual).
- [ ] O áudio está perfeitamente sincronizado com o movimento dos lábios?
- [ ] Os assets estão fora da cara do protagonista?
- [ ] Foram removidos todos os emojis/caracteres especiais problemáticos?
