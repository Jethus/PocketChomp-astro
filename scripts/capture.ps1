# Capture a native-resolution screenshot from the Pixel 8 Pro for the website.
#
# The phone must be on its full panel resolution (Settings > Display > Screen
# resolution > Full resolution), which is 1344x2992; the Pixel 8 Pro skin's
# window is exactly that size. The status bar is kept in the capture and
# blanked later by scripts/build-screens.mjs, so nothing is cropped here.
#
# Usage:
#   .\scripts\capture.ps1 today                # -> src/assets/product/captures-native/today.png
#   .\scripts\capture.ps1 today -Serial XXXX   # override device serial
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [string]$Serial = '$env:ANDROID_SERIAL',
  [string]$OutDir = (Join-Path $PSScriptRoot '..\src\assets\product\captures-native'),
  [int]$Width = 1344,
  [int]$Height = 2992
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path
$out = Join-Path $OutDir "$Name.png"

# exec-out streams raw PNG bytes; go through cmd so PowerShell never touches the binary stream.
cmd /c "adb -s $Serial exec-out screencap -p > `"$out`""
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $out)) { throw "screencap failed (is $Serial connected?)" }

$img = [System.Drawing.Image]::FromFile($out)
try {
  if ($img.Width -ne $Width -or $img.Height -ne $Height) {
    throw "Capture is $($img.Width)x$($img.Height); expected ${Width}x${Height}. Set the phone to Full resolution (Settings > Display > Screen resolution)."
  }
} finally {
  $img.Dispose()
}

Write-Host "Saved $out (${Width}x${Height})"
