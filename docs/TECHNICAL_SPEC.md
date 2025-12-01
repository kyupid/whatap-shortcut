# WhaTap Quick Navigation - 기술 스펙

## 상수 및 설정값

### 캐시 설정

| 항목 | 값 | 설명 |
|------|-----|------|
| `PROJECT_CACHE_TTL` | 3,600,000 ms (1시간) | 프로젝트 목록 캐시 유효 시간 |
| `REFRESH_COOLDOWN` | 5,000 ms (5초) | 새로고침 버튼 쿨다운 시간 |

### 검색 및 표시

| 항목 | 값 | 설명 |
|------|-----|------|
| 검색 결과 최대 표시 | 50개 | `slice(0, 50)` |

### localStorage 키

| 키 | 형식 | 설명 |
|-----|------|------|
| `whatap_qn_visits` | `{ "menuPath": count }` | 메뉴 방문 횟수 |
| `whatap_qn_project_visits` | `{ "pcode": count }` | 프로젝트 방문 횟수 |
| `whatap_qn_projects` | `{ data: {...}, timestamp: number }` | 프로젝트 목록 캐시 (타임스탬프 포함) |

---

## 검색 점수 가중치 (퍼지 검색)

### 프로젝트 검색

| 조건 | 점수 |
|------|------|
| pcode 완전 일치 | +150 |
| pcode 시작 일치 | +120 |
| pcode 포함 | +80 |
| 이름 시작 일치 | +100 |
| 이름 포함 | +30 |
| 플랫폼/productType 시작 일치 | +50 |
| 플랫폼/productType 포함 | +20 |
| 빈도 가중치 | 방문횟수 × 5 |

### 메뉴 검색

| 조건 | 점수 |
|------|------|
| alias 시작 일치 | +120 |
| alias 포함 | +80 |
| 이름 시작 일치 | +100 |
| 카테고리 시작 일치 | +50 |
| productType 시작 일치 | +50 |
| 이름 포함 | +30 |
| 카테고리 포함 | +20 |
| productType 포함 | +20 |
| path 포함 | +10 |
| 단어 첫 글자(initials) 매칭 | +40 |
| 빈도 가중치 | 방문횟수 × 5 |

---

## 제외 서브도메인

확장 프로그램이 실행되지 않는 서브도메인:

```
jenkins, docs, guide, api, status, blog, www
```

---

## 키보드 단축키

| 키 | 동작 |
|----|------|
| `Cmd+K` (Mac) / `Ctrl+K` (Windows) | 모달 열기/닫기 |
| `↑` / `↓` | 항목 이동 |
| `Enter` | 선택 |
| `Backspace` | 빈 검색어일 때 이전 단계로 |
| `Escape` | 1차: 검색어 지우기 → 2차: 이전 단계로 → 3차: 모달 닫기 |

---

## API 엔드포인트

| 용도 | 엔드포인트 |
|------|-----------|
| 프로젝트 목록 조회 | `GET /account/api/v4/groups/min` |

---

## productType 매핑

API 반환값 → URL path 변환:

| API 반환값 | URL path | 제품 |
|-----------|----------|------|
| APM | apm | Application |
| SERVER, SMS | sms | Server |
| DB | database | Database |
| CONTAINER, CPM | cpm | Kubernetes |
| URL, WPM | wpm | URL |
| BROWSER | browser | Browser |
| MOBILE | mobile | Mobile |
| NETWORK | network | Network |
| NMS | networkManagement | Network Management |
| CLOUD, VR | vr | Cloud |
| LOG | log | Log |

---

## 네비게이션 플로우

### 1. 메뉴 먼저 선택
```
메뉴 선택 → (Global 메뉴면 바로 이동)
         → (프로젝트 필요 메뉴면) 프로젝트 선택 → 이동
```

### 2. 프로젝트 먼저 선택
```
프로젝트 선택 → 해당 productType 메뉴 목록 표시 → 메뉴 선택 → 이동
```

---

## URL 생성 규칙

### Global 메뉴
```
{menu.path}
예: /v2/account/project/list
```

### 프로젝트 메뉴
```
/v2/project/{urlProductType}/{pcode}{menu.path}
예: /v2/project/apm/12345/dashboard
```

### 공통 메뉴 (common)
프로젝트의 productType을 URL에 사용:
```
/v2/project/{project.urlProductType}/{pcode}{menu.path}
```

---

## 정렬 규칙

### 메뉴 목록
- 방문 빈도 높은 순 (내림차순)

### 프로젝트 목록 (2단계)
1. 현재 페이지의 프로젝트 최상단 고정
2. 나머지는 방문 빈도 높은 순

---

## 파일 구조

```
whatap-shortcut/
├── manifest.json   # Chrome Extension Manifest V3 설정
├── menus.js        # 메뉴 데이터 정의 (제일 먼저 로드)
├── utils.js        # 유틸리티 함수, 상태 관리, API 호출
├── content.js      # 메인 UI, 이벤트 핸들러
├── styles.css      # 모달 스타일링
└── docs/
    └── TECHNICAL_SPEC.md  # 이 문서
```

### 로드 순서 (manifest.json)
1. `menus.js` - 메뉴 데이터 및 전역 객체 초기화
2. `utils.js` - 유틸리티 함수
3. `content.js` - UI 및 이벤트

---

## 한글 IME 처리

```javascript
// 한글 조합 중 이벤트 무시
if (e.isComposing || e.keyCode === 229) return;
```

---

## 마우스/키보드 충돌 방지

```javascript
let isKeyboardNavigation = false;
// 키보드 방향키 사용 시: isKeyboardNavigation = true
// 마우스 이동 시: isKeyboardNavigation = false
// hover 이벤트에서 isKeyboardNavigation이면 선택 변경 무시
```
