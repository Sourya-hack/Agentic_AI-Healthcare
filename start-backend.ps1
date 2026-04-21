$ErrorActionPreference = "Stop"

# Always run from project root (folder containing this script)
Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Virtual environment not found. Create it first with: py -3.11 -m venv .venv" -ForegroundColor Yellow
    exit 1
}

& ".\.venv\Scripts\Activate.ps1"
python ".\backend\run.py"
