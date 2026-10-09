$files = @(
  'src\components\BinCard.tsx',
  'src\components\CNNSimulator.tsx',
  'src\components\DummyMap.tsx',
  'src\components\ToastContainer.tsx'
)

foreach ($file in $files) {
  $content = Get-Content $file
  $content = $content -replace '../../store/', '../store/'
  $content = $content -replace '../../types', '../types'
  $content = $content -replace '../../lib/', '../lib/'
  Set-Content $file $content
  Write-Host "Fixed: $file"
}
Write-Host "Done."
