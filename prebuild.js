// prebuild.js
const fs = require('fs');
const path = require('path');

// Path to your package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// Read package.json
const packageJson = require(packageJsonPath);

// Update React version
if (packageJson.dependencies.react === '19.0.0') {
  console.log('Downgrading React from 19.0.0 to 18.3.1 for build compatibility');
  packageJson.dependencies.react = '18.3.1';
  
  // Also update react-dom if present
  if (packageJson.dependencies['react-dom'] === '19.0.0') {
    packageJson.dependencies['react-dom'] = '18.3.1';
  }
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

console.log('Prebuild script completed successfully');