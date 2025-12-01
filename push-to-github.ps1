# PowerShell script to push Real Estate Direct to GitHub
Write-Host "`n🚀 Pushing Real Estate Direct to GitHub...`n" -ForegroundColor Cyan

# Navigate to project directory
Set-Location "C:\Users\mathe\Downloads\Real-Estate-Direct-master\Real-Estate-Direct-master"

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository...`n" -ForegroundColor Yellow
    git init
}

# Check current remote
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "Current remote: $remote" -ForegroundColor Yellow
    Write-Host "`n⚠️  Repository already has a remote." -ForegroundColor Yellow
    Write-Host "Do you want to change it? (This will update the remote URL)" -ForegroundColor Yellow
    $changeRemote = Read-Host "Enter new GitHub repo URL (or press Enter to keep current)"
    
    if ($changeRemote) {
        git remote set-url origin $changeRemote
        Write-Host "✅ Remote updated to: $changeRemote" -ForegroundColor Green
    }
} else {
    Write-Host "No remote configured. You'll need to add one after creating the repo on GitHub." -ForegroundColor Yellow
}

# Show status
Write-Host "`n📊 Current Status:`n" -ForegroundColor Cyan
git status --short | Select-Object -First 20

# Add all files
Write-Host "`n📁 Adding all files...`n" -ForegroundColor Cyan
git add .

# Show what will be committed
Write-Host "Files staged for commit:" -ForegroundColor Yellow
git diff --cached --name-only | Select-Object -First 20

# Commit
Write-Host "`n💾 Creating commit...`n" -ForegroundColor Cyan
$commitMessage = "Real Estate Direct Platform - Complete full-stack application

- Backend: Node.js/Express with MongoDB
- Frontend: Next.js 14 with React
- Features: Property listings, transactions, mortgages, lawyers
- Compliance: Provincial regulations for all 13 provinces
- Integrations: DocuSign, Stripe ready, email service
- Security: JWT auth, rate limiting, validation
- Documentation: Comprehensive guides and API docs"

git commit -m $commitMessage

Write-Host "`n✅ Commit created!`n" -ForegroundColor Green

# Check if remote exists
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "🌐 Remote repository: $remote" -ForegroundColor Cyan
    Write-Host "`nReady to push! Run:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host "  (or git push -u origin master if main branch doesn't exist)`n" -ForegroundColor White
} else {
    Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Create repository on GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "2. Then run:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/real-estate-direct.git" -ForegroundColor Cyan
    Write-Host "   git branch -M main" -ForegroundColor Cyan
    Write-Host "   git push -u origin main`n" -ForegroundColor Cyan
}

Write-Host "`n✅ Repository ready for GitHub!`n" -ForegroundColor Green

