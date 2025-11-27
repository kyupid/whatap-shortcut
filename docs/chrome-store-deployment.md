# Chrome Web Store 업데이트 가이드

## 코드 업데이트 후 배포 방법

1. `manifest.json`의 `version` 증가 (예: `1.0.0` → `1.0.1`)
2. ZIP 파일 생성:
   ```bash
   zip -r whatap-quick-nav.zip manifest.json content.js styles.css icon*.png
   ```
3. [Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
4. 해당 확장 프로그램 선택
5. **패키지** 탭 → **새 패키지 업로드**
6. ZIP 파일 업로드
7. **검토를 위해 제출** 클릭
8. 심사 대기 (1~3일)
