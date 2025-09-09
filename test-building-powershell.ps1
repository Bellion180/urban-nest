# Test de creación de edificio con PowerShell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbl8xNzU3Mzc2NTc3MzQ1XzFlMHJrc2ZsOSIsImVtYWlsIjoiYWRtaW5AdXJiYW5uZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1NzM3ODk0OSwiZXhwIjoxNzU3NDY1MzQ5fQ.MiDgj0iwyHuZyS3a8DJXFQE1Bt8jHg5_PKvHs6jacLk"

# Crear form data
$form = @{
    name = "Edificio PowerShell Test"
    description = "Edificio creado con PowerShell después del fix"
    floors = '[{"name":"Piso 1","number":1,"apartments":["101","102"]},{"name":"Piso 2","number":2,"apartments":["201","202"]}]'
}

Write-Host "🧪 Probando creación de edificio..."
Write-Host "🔐 Token: $($token.Substring(0,20))..."
Write-Host "📦 Datos: $($form | ConvertTo-Json)"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/buildings" `
        -Method Post `
        -Headers @{ Authorization = "Bearer $token" } `
        -Form $form `
        -ContentType "multipart/form-data"
        
    Write-Host "✅ ¡Edificio creado exitosamente!"
    Write-Host "📊 Resultado: $($response | ConvertTo-Json -Depth 3)"
}
catch {
    Write-Host "❌ Error al crear edificio:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error: $($_.Exception.Message)"
}
