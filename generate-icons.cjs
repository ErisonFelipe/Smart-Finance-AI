const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function generateIcons() {
  // Garantir que a pasta public existe
  if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
  }

  // Criar SVG do ícone
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <!-- Fundo -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Círculo de fundo -->
      <circle cx="256" cy="256" r="240" fill="url(#grad)"/>
      
      <!-- Símbolo de gráfico/finanças -->
      <g transform="translate(256, 180)" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
        <!-- Gráfico de barras -->
        <rect x="-120" y="40" width="35" height="80" fill="white" stroke="none" rx="4"/>
        <rect x="-50" y="-20" width="35" height="140" fill="white" stroke="none" rx="4"/>
        <rect x="20" y="10" width="35" height="110" fill="white" stroke="none" rx="4"/>
        <rect x="90" y="60" width="35" height="60" fill="white" stroke="none" rx="4"/>
        
        <!-- Linha de tendência -->
        <polyline points="-100,90 -40,60 40,70 110,30" stroke="#a7f3d0" stroke-width="8"/>
        <circle cx="110" cy="30" r="10" fill="#a7f3d0" stroke="none"/>
      </g>
      
      <!-- Texto FinIA -->
      <text x="256" y="380" text-anchor="middle" fill="white" font-size="48" font-family="Arial, Helvetica, sans-serif" font-weight="bold">FinIA</text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svgIcon);

  // Gerar 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join("public", "icon-192.png"));

  console.log("✅ icon-192.png criado");

  // Gerar 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join("public", "icon-512.png"));

  console.log("✅ icon-512.png criado");

  // Gerar favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join("public", "favicon.png"));

  console.log("✅ favicon.png criado");

  console.log("\n🎉 Todos os ícones gerados em /public/");
}

generateIcons().catch(console.error);