const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const JS_FILES = ['menus.js', 'utils.js', 'content.js'];
const COPY_FILES = ['manifest.json', 'styles.css', 'icon16.png', 'icon48.png', 'icon128.png'];

const TERSER_OPTIONS = {
  compress: {
    dead_code: true,
    drop_console: false, // console.log 유지 (디버깅용)
    passes: 2,
  },
  mangle: {
    reserved: ['WhaTapQN'], // 전역 네임스페이스 보존
  },
  format: {
    comments: false,
  },
};

async function build() {
  // dist 초기화
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  fs.mkdirSync(DIST);

  // JS minify
  for (const file of JS_FILES) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf-8');
    const result = await minify(src, TERSER_OPTIONS);
    if (result.error) {
      console.error(`Error minifying ${file}:`, result.error);
      process.exit(1);
    }
    fs.writeFileSync(path.join(DIST, file), result.code);
    const ratio = ((1 - result.code.length / src.length) * 100).toFixed(1);
    console.log(`  ${file}: ${src.length} → ${result.code.length} bytes (${ratio}% 축소)`);
  }

  // 정적 파일 복사
  for (const file of COPY_FILES) {
    fs.copyFileSync(path.join(ROOT, file), path.join(DIST, file));
  }
  console.log(`  정적 파일 ${COPY_FILES.length}개 복사 완료`);

  // --zip 플래그: dist 폴더를 zip으로 패키징
  if (process.argv.includes('--zip')) {
    const zipName = 'whatap-quick-nav.zip';
    const zipPath = path.join(ROOT, zipName);
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    execSync(`cd "${DIST}" && zip -r "${zipPath}" .`);
    const zipSize = (fs.statSync(zipPath).size / 1024).toFixed(1);
    console.log(`  ${zipName} 생성 (${zipSize} KB)`);
  }

  console.log('\nBuild 완료! dist/ 폴더를 Chrome Web Store에 업로드하세요.');
}

build().catch(err => {
  console.error('Build 실패:', err);
  process.exit(1);
});
