# Test simple de creación de edificio con PowerShell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbl8xNzU3Mzc2NTc3MzQ1XzFlMHJrc2ZsOSIsImVtYWlsIjoiYWRtaW5AdXJiYW5uZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1NzM3ODk0OSwiZXhwIjoxNzU3NDY1MzQ5fQ.MiDgj0iwyHuZyS3a8DJXFQE1Bt8jHg5_PKvHs6jacLk"

Write-Host "🧪 Probando creación de edificio con PowerShell..."

# Crear form data más simple
$form = @{
    name = "Edificio Test PowerShell"
    description = "Prueba después del fix del no_departamento"
    floors = '[]'
}

Write-Host "📦 Enviando petición..."

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/buildings" -Method Post -Headers @{ Authorization = "Bearer $token" } -Form $form

Write-Host "✅ Respuesta recibida:"
$response | ConvertTo-Json
