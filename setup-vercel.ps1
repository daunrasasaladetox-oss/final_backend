# PowerShell script to prepare backend for Vercel deployment and commit changes
# Usage: cd FEBE-main/FEBE-main/backend; .\setup-vercel.ps1

# modify app.js: remove app.listen block and export app
$path = "app.js"
$text = Get-Content $path -Raw
# remove the app.listen(...) block (greedy, across lines)
$text = $text -replace "// Start server[\s\S]*?\}\);", "";
# ensure export at end
if ($text -notmatch "module\.exports = app;") {
    $text += "`r`n// Export the app for serverless platforms (Vercel)`r`nmodule.exports = app;`r`n"
}
Set-Content $path $text

# create api directory and index.js
if (-not (Test-Path api)) { New-Item -ItemType Directory -Path api | Out-Null }
@"const app = require('../app');

module.exports = (req, res) => {
  return app(req, res);
};
"@ | Set-Content api\index.js

# create vercel.json
@"{
  "version": 2,
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "\/(.*)", "dest": "api/index.js" }
  ]
}
"@ | Set-Content vercel.json

# git operations
Write-Host "Staging and committing changes..."
git add app.js api vercel.json
if ((git diff --cached --name-only) -ne $null) {
    git commit -m "Setup for Vercel deployment"
    git push
} else {
    Write-Host "No changes to commit."
}

Write-Host "Done. Please verify the commit on GitHub and deploy on Vercel if needed."