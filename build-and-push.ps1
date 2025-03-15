# Script configuration
$GITHUB_USERNAME = "soroushshirali"
$REPOSITORY_NAME = "party-equipments-shop"
$IMAGE_TAG = "latest"
$FULL_IMAGE_NAME = "ghcr.io/$GITHUB_USERNAME/$REPOSITORY_NAME`:$IMAGE_TAG"

# Print script header
Write-Host "🚀 Building and pushing Docker image to GitHub Container Registry" -ForegroundColor Green
Write-Host "Image: $FULL_IMAGE_NAME" -ForegroundColor Cyan
Write-Host ""

# Check if user is logged in to GitHub Container Registry
Write-Host "👉 Checking GitHub Container Registry login status..." -ForegroundColor Yellow
$loginStatus = docker login ghcr.io -u $GITHUB_USERNAME 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to GitHub Container Registry. Please login first:" -ForegroundColor Red
    Write-Host "1. Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens → Generate New Token" -ForegroundColor Yellow
    Write-Host "2. Select these permissions: read:packages, write:packages, delete:packages" -ForegroundColor Yellow
    Write-Host "3. Run: docker login ghcr.io -u $GITHUB_USERNAME" -ForegroundColor Yellow
    Write-Host "4. Enter your token as the password when prompted" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Successfully verified login status" -ForegroundColor Green
Write-Host ""

# Build the Docker image
Write-Host "🏗️ Building Docker image..." -ForegroundColor Yellow
docker build -t $FULL_IMAGE_NAME .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Successfully built Docker image" -ForegroundColor Green
Write-Host ""

# Push the image to GitHub Container Registry
Write-Host "📤 Pushing image to GitHub Container Registry..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push Docker image" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Successfully pushed Docker image" -ForegroundColor Green
Write-Host ""

# Print success message and usage instructions
Write-Host "🎉 All done! Your image is now available at:" -ForegroundColor Green
Write-Host $FULL_IMAGE_NAME -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the image, use this command:" -ForegroundColor Yellow
Write-Host "docker run -p 3000:3000 \"
Write-Host "  -e MONGODB_URI='your_mongodb_uri' \"
Write-Host "  -e NEXTAUTH_URL='your_nextauth_url' \"
Write-Host "  -e NEXTAUTH_SECRET='your_nextauth_secret' \"
Write-Host "  -e NODE_ENV='production' \"
Write-Host "  $FULL_IMAGE_NAME" 