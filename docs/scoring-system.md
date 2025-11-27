# 검색 스코어링 시스템

## 개요

WhaTap Quick Navigation의 검색 결과 정렬은 **스코어 기반 퍼지 검색**을 사용합니다.
각 메뉴 항목은 검색어와의 일치도에 따라 점수를 받고, 높은 점수 순으로 정렬됩니다.

---

## 1. 스코어링 개요

### 1.1 기본 원리

```
검색어 입력 → 모든 메뉴에 대해 스코어 계산 → 0점 초과 필터링 → 점수 순 정렬
```

### 1.2 스코어 계산 대상

| 대상 | 설명 |
|-----|------|
| `name` | 메뉴 이름 (예: "인스턴스 모니터링") |
| `category` | 카테고리 (예: "Dashboard") |
| `path` | URL 경로 (예: "/instance_monitoring") |
| `productType` | 제품 유형 (예: "APM", "DATABASE") |
| `aliases` | 검색 별칭 (예: ["홈", "메인", "시작"]) |

---

## 2. 스코어링 규칙

### 2.1 별칭 매칭 (최고 우선순위)

```javascript
for (const alias of aliases) {
  if (alias.startsWith(query)) score += 120;
  else if (alias.includes(query)) score += 80;
}
```

| 조건 | 점수 | 예시 |
|-----|------|------|
| 별칭이 검색어로 시작 | +120 | "홈" 검색 → "홈" 별칭 |
| 별칭에 검색어 포함 | +80 | "메" 검색 → "메인" 별칭 |

**용도**: "홈", "메인", "시작" 등으로 "메인 페이지" 검색

### 2.2 시작 문자열 매칭 (높은 우선순위)

```javascript
if (name.startsWith(query)) score += 100;
if (category.startsWith(query)) score += 50;
if (productType.startsWith(query)) score += 50;
```

| 조건 | 점수 | 예시 |
|-----|------|------|
| 이름이 검색어로 시작 | +100 | "인스턴스" → "인스턴스 모니터링" |
| 카테고리가 검색어로 시작 | +50 | "Dash" → "Dashboard" |
| 제품 유형이 검색어로 시작 | +50 | "APM" → APM 메뉴들 |

### 2.3 포함 매칭 (중간 우선순위)

```javascript
if (name.includes(query)) score += 30;
if (category.includes(query)) score += 20;
if (path.includes(query)) score += 10;
if (productType.includes(query)) score += 20;
```

| 조건 | 점수 | 예시 |
|-----|------|------|
| 이름에 검색어 포함 | +30 | "모니터링" → "인스턴스 모니터링" |
| 카테고리에 검색어 포함 | +20 | "board" → "Dashboard" |
| 경로에 검색어 포함 | +10 | "monitor" → "/instance_monitoring" |
| 제품 유형에 검색어 포함 | +20 | "PM" → "APM" |

### 2.4 초성 매칭 (낮은 우선순위)

```javascript
const words = name.split(/\s+/);
const initials = words.map(w => w[0]).join('');
if (initials.includes(query)) score += 40;
```

| 조건 | 점수 | 예시 |
|-----|------|------|
| 각 단어 첫 글자 조합 | +40 | "애대" → "애플리케이션 대시보드" |

### 2.5 방문 빈도 가중치

```javascript
const visitCount = visitCounts[menu.path] || 0;
score += visitCount * 5;
```

| 조건 | 점수 |
|-----|------|
| 방문 1회당 | +5 |

**예시**: 10번 방문한 메뉴 → +50점 추가

---

## 3. 스코어 계산 예시

### 3.1 예시: "모니터링" 검색

**대상 메뉴**: `{ name: "인스턴스 모니터링", category: "Dashboard", path: "/instance_monitoring" }`

| 규칙 | 계산 | 점수 |
|-----|------|------|
| 이름 시작 | "인스턴스 모니터링".startsWith("모니터링") = false | 0 |
| 이름 포함 | "인스턴스 모니터링".includes("모니터링") = true | +30 |
| 경로 포함 | "/instance_monitoring".includes("모니터링") = false | 0 |
| 방문 횟수 | 5회 × 5 | +25 |
| **총점** | | **55** |

### 3.2 예시: "홈" 검색

**대상 메뉴**: `{ name: "메인 페이지", aliases: ["main", "home", "홈", "메인", "시작"] }`

| 규칙 | 계산 | 점수 |
|-----|------|------|
| 별칭 시작 | "홈".startsWith("홈") = true | +120 |
| 이름 포함 | "메인 페이지".includes("홈") = false | 0 |
| **총점** | | **120** |

### 3.3 예시: "APM" 검색

**대상 메뉴**: APM 제품의 "애플리케이션 대시보드"

| 규칙 | 계산 | 점수 |
|-----|------|------|
| 제품 유형 시작 | "APM".startsWith("APM") = true | +50 |
| 제품 유형 포함 | "APM".includes("APM") = true | +20 |
| **총점** | | **70** |

---

## 4. 점수 요약표

| 매칭 유형 | 점수 | 우선순위 |
|----------|------|---------|
| 별칭 시작 | 120 | 최고 |
| 이름 시작 | 100 | 높음 |
| 별칭 포함 | 80 | 높음 |
| 카테고리 시작 | 50 | 중간 |
| 제품 유형 시작 | 50 | 중간 |
| 초성 매칭 | 40 | 중간 |
| 이름 포함 | 30 | 중간 |
| 카테고리 포함 | 20 | 낮음 |
| 제품 유형 포함 | 20 | 낮음 |
| 경로 포함 | 10 | 최저 |
| 방문 1회당 | 5 | 가중치 |

---

## 5. 프로젝트 스코어링

프로젝트 선택 화면에서는 별도의 방문 빈도 기반 정렬을 사용합니다.

### 5.1 정렬 로직

```javascript
filtered.sort((a, b) => {
  const countA = projectVisitCounts[a.pcode] || 0;
  const countB = projectVisitCounts[b.pcode] || 0;
  return countB - countA;
});
```

### 5.2 프로젝트 검색 필터

```javascript
filtered = projectList.filter(p =>
  p.name.toLowerCase().includes(query) ||
  String(p.pcode).includes(query) ||
  (p.platform || '').toLowerCase().includes(query)
);
```

| 검색 대상 | 예시 |
|----------|------|
| 프로젝트 이름 | "운영 서버" |
| 프로젝트 코드 | "12345" |
| 플랫폼 | "Java", "PHP" |

---

## 6. 데이터 저장

### 6.1 메뉴 방문 횟수

```javascript
// localStorage 키: whatap_qn_visits
{
  "/dashboard": 15,
  "/instance_monitoring": 8,
  "/flexboard": 23
}
```

### 6.2 프로젝트 방문 횟수

```javascript
// localStorage 키: whatap_qn_project_visits
{
  "12345": 10,
  "67890": 5
}
```

---

## 7. 스코어링 최적화 팁

### 7.1 자주 쓰는 메뉴

- 자주 방문하면 자동으로 상단에 노출
- 방문 횟수 × 5점 가중치

### 7.2 빠른 검색을 위한 팁

| 검색어 | 효과 |
|-------|------|
| 정확한 이름 시작 | +100점 (가장 효과적) |
| 별칭 사용 | +120점 (홈, 메인 등) |
| 제품 타입 | +50~70점 (APM, DB 등) |
| 카테고리 | +50~70점 (Dashboard 등) |

### 7.3 예시 검색어

| 목적 | 추천 검색어 |
|-----|------------|
| 메인 페이지 | "홈", "메인", "main" |
| 대시보드류 | "대시", "dash" |
| APM 메뉴 | "APM" |
| 특정 메뉴 | 메뉴 이름 첫 2~3글자 |

---

## 8. 코드 위치

스코어링 로직은 `content.js`의 `fuzzySearch` 함수에 구현되어 있습니다.

```javascript
function fuzzySearch(query, menus) {
  if (!query) return menus;

  const lowerQuery = query.toLowerCase();
  const scored = menus.map(menu => {
    // ... 스코어 계산 로직
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.menu);
}
```

---

## 9. 향후 개선 가능 영역

1. **한글 초성 검색**: "ㅇㅅㅁㄴ" → "인스턴스 모니터링"
2. **오타 허용**: Levenshtein 거리 기반 유사도
3. **시간 기반 가중치**: 최근 방문 메뉴 우선
4. **사용자별 학습**: 개인화된 검색 결과
