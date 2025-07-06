# Script para configurar o repositorio front-end
Write-Host "Configurando repositorio front-end..." -ForegroundColor Green

# Criar pasta para front-end
$frontendDir = "salvatore-sku-frontend"
if (Test-Path $frontendDir) {
    Remove-Item $frontendDir -Recurse -Force
}
New-Item -ItemType Directory -Name $frontendDir
Set-Location $frontendDir

# Copiar arquivos do front-end
Write-Host "Copiando arquivos do front-end..." -ForegroundColor Yellow
Copy-Item -Path "../client/*" -Destination "." -Recurse -Force
Copy-Item -Path "../shared" -Destination "." -Recurse -Force
Copy-Item -Path "../attached_assets" -Destination "." -Recurse -Force

# Copiar arquivos de configuracao
Copy-Item -Path "../frontend-package.json" -Destination "package.json" -Force
Copy-Item -Path "../frontend-vite.config.ts" -Destination "vite.config.ts" -Force
Copy-Item -Path "../frontend-firebase.ts" -Destination "src/firebase.ts" -Force
Copy-Item -Path "../netlify.toml" -Destination "." -Force

# Criar .gitignore
$gitignoreContent = @"
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
"@
$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8

# Inicializar git
Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main

Write-Host "Front-end configurado com sucesso!" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Crie o repositorio 'salvatore-sku-frontend' no GitHub" -ForegroundColor White
Write-Host "2. Execute: git remote add origin https://github.com/Pand108976/salvatore-sku-frontend.git" -ForegroundColor White
Write-Host "3. Execute: git push -u origin main" -ForegroundColor White
Write-Host "4. Configure o deploy no Netlify" -ForegroundColor White 