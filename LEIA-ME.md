# Pedra da Boca Hotel — site

Site estático (HTML, CSS e JS puros, sem dependências). Basta enviar o conteúdo desta pasta para a raiz da hospedagem.

## Estrutura
- `index.html` — página principal (one page)
- `privacidade.html` — Política de Privacidade e Cookies (LGPD)
- `404.html` — página de erro
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `.htaccess` (HTTPS, cache, compressão, cabeçalhos de segurança, 404)
- `assets/css/style.css`, `assets/js/main.js`
- `assets/js/config.js` — **IDs de rastreamento e número de WhatsApp**
- `assets/img/` — fotos otimizadas (WebP), logo, favicons, imagem Open Graph
- `assets/svg/` — Kit SVG Pedra da Boca (grafismos e ícones)
- `assets/video/` — local para os vídeos (ver LEIA-ME da pasta)

## O que já funciona
- Formulários (consulta rápida e reserva) com validação → abrem o WhatsApp do hotel com a mensagem preenchida
- Botões de WhatsApp, telefone, Instagram, rota no Google Maps
- Mapa e vídeos do Instagram carregados só após clique (privacidade + desempenho)
- Galeria com ampliação (teclado, setas e gesto de deslizar)
- Banner de cookies com Consent Mode v2; nenhuma tag carrega sem consentimento
- Eventos: `generate_lead`, `whatsapp_click`, `phone_click`, `instagram_click`, `video_play`, `map_load`, `rota_click` (com UTMs da sessão)

## Pendências (dependem do cliente / acessos)
1. **Domínio**: substituir `https://SEU-DOMINIO.com.br` em `index.html`, `robots.txt` e `sitemap.xml`.
2. **Vídeos**: o Instagram bloqueia download automático. Baixar os 2 vídeos e salvar em `assets/video/` (`video-1.mp4`, `video-2.mp4`). Até lá o site usa o player incorporado do Instagram.
3. **WhatsApp**: confirmar se (84) 98623-4426 atende WhatsApp (todos os botões usam esse número).
4. **Rastreamento**: preencher `GTM_ID`, `GA4_ID`, `GOOGLE_ADS_ID` + rótulo de conversão e `META_PIXEL_ID` em `assets/js/config.js`.
5. **Conteúdo não informado** (não foi inventado; incluir quando o cliente enviar): tipos e quantidade de acomodações, comodidades dos quartos, valores, horários de check-in/out, café da manhã, política de pets/crianças, formas de pagamento, avaliações reais de hóspedes, e-mail de contato.
6. **Política de Privacidade**: completar razão social, CNPJ e e-mail do encarregado (DPO).
7. **Endereço**: o endereço do Google é "Unnamed Road, Serra de São Bento – RN, 59214-000", e a logo diz "Passa e Fica – RN". Confirmar qual município usar como principal.
8. **Fontes**: carregadas do Google Fonts (Fredoka + Nunito Sans). Para hospedar localmente, baixar os arquivos .woff2 e trocar o `<link>`.
9. **Logo**: o arquivo veio em JPEG; a versão transparente e a branca foram geradas a partir dele. Se houver o vetor oficial, substituir `assets/img/logo*.webp`.

© Copyright RiQ Tecnologias Digitais. Todos os direitos reservados.
