# Script pour obtenir le webhook secret de Stripe Listen
# Usage: .\get-webhook-secret.ps1

Write-Host "🔍 Recherche du webhook secret..." -ForegroundColor Cyan
Write-Host ""

# Lancer stripe listen et capturer la sortie
$job = Start-Job -ScriptBlock {
    cd $using:PWD
    stripe listen --forward-to localhost:3000/api/payments/webhook 2>&1
}

# Attendre un peu pour que stripe listen démarre
Start-Sleep -Seconds 5

# Lire la sortie du job
$output = Receive-Job -Job $job -ErrorAction SilentlyContinue

# Chercher le webhook secret dans la sortie
$secret = $output | Select-String -Pattern "whsec_[a-zA-Z0-9]+" | ForEach-Object { $_.Matches.Value }

if ($secret) {
    Write-Host "✅ Webhook secret trouvé:" -ForegroundColor Green
    Write-Host ""
    Write-Host $secret -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Copiez ce secret et ajoutez-le à votre fichier .env:" -ForegroundColor Cyan
    Write-Host "   STRIPE_WEBHOOK_SECRET=$secret" -ForegroundColor White
    Write-Host ""
    
    # Copier dans le presse-papiers
    $secret | Set-Clipboard
    Write-Host "✅ Secret copié dans le presse-papiers!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Webhook secret non trouvé dans la sortie." -ForegroundColor Yellow
    Write-Host "   Vérifiez que stripe listen tourne et regardez sa sortie." -ForegroundColor Yellow
}

# Nettoyer
Stop-Job -Job $job -ErrorAction SilentlyContinue
Remove-Job -Job $job -ErrorAction SilentlyContinue

