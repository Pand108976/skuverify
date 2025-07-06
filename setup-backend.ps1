# Script para configurar o repositorio back-end
Write-Host "Configurando repositorio back-end..." -ForegroundColor Green

# Criar pasta para back-end
$backendDir = "salvatore-sku-backend"
if (Test-Path $backendDir) {
    Remove-Item $backendDir -Recurse -Force
}
New-Item -ItemType Directory -Name $backendDir
Set-Location $backendDir

# Copiar arquivos do back-end
Write-Host "Copiando arquivos do back-end..." -ForegroundColor Yellow
New-Item -ItemType Directory -Name "server"
Copy-Item -Path "../server/*" -Destination "server/" -Recurse -Force
Copy-Item -Path "../public" -Destination "." -Recurse -Force
Copy-Item -Path "../images" -Destination "." -Recurse -Force

# Copiar arquivos de configuracao
Copy-Item -Path "../backend-package.json" -Destination "package.json" -Force
Copy-Item -Path "../backend-server-index.ts" -Destination "server/index.ts" -Force
Copy-Item -Path "../backend-firebase.ts" -Destination "server/firebase.ts" -Force
Copy-Item -Path "../render.yaml" -Destination "." -Force

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
git commit -m "Initial backend commit"
git branch -M main

Write-Host "Back-end configurado com sucesso!" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Crie o repositorio 'salvatore-sku-backend' no GitHub" -ForegroundColor White
Write-Host "2. Execute: git remote add origin https://github.com/Pand108976/salvatore-sku-backend.git" -ForegroundColor White
Write-Host "3. Execute: git push -u origin main" -ForegroundColor White
Write-Host "4. Configure o deploy no Render" -ForegroundColor White