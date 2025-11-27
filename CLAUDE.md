# WhaTap Quick Navigation Chrome Extension

## 프로젝트 개요
WhaTap 모니터링 서비스에서 Cmd+K(Mac) / Ctrl+K(Windows) 단축키로 빠른 메뉴 탐색을 제공하는 Chrome 확장 프로그램.

## 파일 구조
```
whatap-shortcut/
├── manifest.json   # Chrome Extension Manifest V3 설정
├── content.js      # 메인 로직 (메뉴 데이터, 검색, UI)
└── styles.css      # 모달 스타일링
```

## 주요 기능
- **2단계 네비게이션**: 메뉴 선택 → 프로젝트 선택
- **퍼지 검색**: 한글 alias 지원 (예: "홈", "메인" → 메인 페이지)
- **빈도 기반 정렬**: 자주 방문한 메뉴/프로젝트 우선 표시
- **프로젝트 API 연동**: `/account/api/v4/groups/min`에서 사용자 프로젝트 목록 조회

## 기술 스택
- Chrome Extension Manifest V3
- Vanilla JavaScript (ES6+)
- CSS with CSS Variables

## 메뉴 데이터 구조
```javascript
const MENU_ITEM = {
  name: '메뉴 이름',
  path: '/v2/path/{pcode}',  // {pcode}는 프로젝트 코드로 치환
  category: '카테고리',
  aliases: ['별칭1', '별칭2']  // 검색용 alias (선택)
};
```

## 메뉴 카테고리
- `GLOBAL_MENUS`: 프로젝트 선택 불필요 (메인, 프로젝트 목록 등)
- `APM_MENUS`: Application 모니터링
- `SERVER_MENUS`: Server 모니터링
- `DATABASE_MENUS`: Database 모니터링
- `KUBERNETES_MENUS`: Kubernetes 모니터링
- `BROWSER_MENUS`: Browser 모니터링
- `NETWORK_MENUS`: Network 모니터링
- `CLOUD_MENUS`: Cloud 모니터링
- `LOG_MENUS`: Log 모니터링
- `URL_MENUS`: URL 모니터링

## localStorage 키
- `whatap-qn-visits`: 메뉴 방문 횟수 `{ "menuPath": count }`
- `whatap-qn-project-visits`: 프로젝트 방문 횟수 `{ "pcode": count }`
- `whatap-qn-projects-cache`: 프로젝트 목록 캐시

## 키보드 단축키
| 키 | 동작 |
|---|------|
| `Cmd/Ctrl + K` | 모달 열기 |
| `↑` / `↓` | 항목 이동 |
| `Enter` | 선택 |
| `Escape` | 검색어 지우기 → 메뉴로 돌아가기 → 모달 닫기 |

## 개발 시 주의사항

### 한글 IME 처리
```javascript
// 한글 조합 중 이벤트 무시
if (e.isComposing || e.keyCode === 229) return;
```

### 마우스/키보드 충돌 방지
```javascript
let isKeyboardNavigation = false;
// 키보드 방향키: isKeyboardNavigation = true
// 마우스 이동: isKeyboardNavigation = false
// hover 이벤트에서 isKeyboardNavigation이면 무시
```

### 정렬 일관성
`renderProjectResults()`와 `handleKeydown()`의 Enter 케이스에서 동일한 정렬 로직 사용 필수.

## 빌드 & 테스트
1. `chrome://extensions` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `whatap-shortcut` 폴더 선택
5. `*.whatap.io` 도메인에서 Cmd+K 테스트

## 디버깅
- 콘솔: DevTools → Console에서 `whatap-qn` 관련 로그 확인
- 스토리지: DevTools → Application → Local Storage에서 캐시 데이터 확인
