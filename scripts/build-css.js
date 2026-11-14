const fs = require('fs');
const path = require('path');
const { compile } = require('tailwindcss');

function getCandidates(dir, candidates = new Set()) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        getCandidates(fullPath, candidates);
      }
    } else if (/\.(tsx|ts|jsx|js|html|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/[a-zA-Z0-9_\-\/\[\]%#.:]+/g) || [];
      for (const m of matches) {
        candidates.add(m);
      }
    }
  }
  return candidates;
}

function loadStylesheet(id, base) {
  let filePath;
  if (id === 'tailwindcss') {
    filePath = path.resolve(__dirname, '../node_modules/tailwindcss/index.css');
  } else if (id.startsWith('tailwindcss/')) {
    filePath = path.resolve(__dirname, '../node_modules/tailwindcss', id.replace('tailwindcss/', '') + '.css');
  } else {
    filePath = path.resolve(base, id);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return {
    base: path.dirname(filePath),
    content,
  };
}

async function build() {
  const candidatesSet = getCandidates(path.resolve(__dirname, '../src'));
  const candidates = Array.from(candidatesSet);
  console.log(`Found ${candidates.length} candidate tokens across src/`);

  // Compile directly from tailwindcss root stylesheet
  const cssInput = '@import "tailwindcss";';
  
  const compiler = await compile(cssInput, {
    base: path.resolve(__dirname, '../src/app'),
    loadStylesheet,
  });

  const cssOutput = compiler.build(candidates);
  console.log(`Successfully compiled Tailwind CSS: ${(cssOutput.length / 1024).toFixed(2)} KB`);

  fs.writeFileSync(path.resolve(__dirname, '../src/app/tailwind.generated.css'), cssOutput, 'utf8');
  console.log('Saved compiled styles to src/app/tailwind.generated.css');
}

build().catch(err => {
  console.error('Build CSS failed:', err);
  process.exit(1);
});
