$ErrorActionPreference = "Stop"

# Always run from project root (folder containing this script)
Set-Location -Path $PSScriptRoot

Set-Location -Path ".\frontend"
npm run dev
