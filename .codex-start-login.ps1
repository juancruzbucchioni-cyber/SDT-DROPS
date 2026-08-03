$TaskTemp = Join-Path $env:TEMP 'sdtdrops-wrangler-login'
New-Item -ItemType Directory -Path $TaskTemp -Force | Out-Null

$OutPath = Join-Path $TaskTemp 'out.txt'
$ErrPath = Join-Path $TaskTemp 'err.txt'
Remove-Item -LiteralPath $OutPath, $ErrPath -Force -ErrorAction SilentlyContinue

$NodePath = 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$WranglerArgs = @('.\node_modules\wrangler\bin\wrangler.js', 'login', '--browser=false')
$Process = Start-Process -FilePath $NodePath -ArgumentList $WranglerArgs -WorkingDirectory 'C:\Users\Usuario\Documents\Codex\2026-08-01\crear\SDT-DROPS' -RedirectStandardOutput $OutPath -RedirectStandardError $ErrPath -WindowStyle Hidden -PassThru
$Process.Id
