---
title: Combo Search + 동의어 사전 설계
description: 2단계 네비게이션을 1단계 Combo Search로 교체하고, 동의어 사전을 통한 다양한 이름 검색 지원
author: Claude Code
date: 2026-02-13
tags: [combo-search, synonym, ux, navigation]
category: design
contributors: [kyw]
status: approved
---

# Combo Search + 동의어 사전 설계

## 1. 문제 정의

### 현재 네비게이션의 Pain Points

1. **2단계가 느리다**: 메뉴→프로젝트 또는 프로젝트→메뉴 2번 선택이 번거롭다
2. **어디서 시작할지 모호하다**: 메뉴 먼저? 프로젝트 먼저? `a:`, `p:`, `m:` 접두사? 선택지가 너무 많다
3. **자주 가는 곳 접근이 아쉽다**: 최근 방문/핀이 있지만 메뉴+프로젝트 조합 단위가 아니다
4. **메뉴 검색이 제한적이다**: 300개+ 메뉴 중 alias가 있는 건 6개뿐. 영어/약어/동의어로 검색 불가

## 2. 설계: Combo Search

### 핵심 개념

**한 번의 검색으로 메뉴+프로젝트를 동시에 찾아 1단계로 이동한다.**

### Before vs After

```
Before: Cmd+K → "dashboard" → Dashboard 선택 → 프로젝트 목록 → "prod" 검색 → prod-api 선택 → 이동
         (6단계, 입력 2회)

After:  Cmd+K → "dash prod" → "Dashboard → prod-api-server" 선택 → 이동
         (3단계, 입력 1회)
```

### 결과 표시 형태

```
┌──────────────────────────────────────────────────────┐
│ 🔍 dash prod                                    ESC │
├──────────────────────────────────────────────────────┤
│  대시보드        prod-api-server           [APM]     │
│  대시보드        prod-batch-worker         [APM]     │
│  대시보드        prod-mysql                [DB]      │
│  Flex 보드       prod-api-server           [APM]     │
└──────────────────────────────────────────────────────┘
```

- 각 행이 **완전한 목적지** (메뉴+프로젝트 조합)
- Global 메뉴는 프로젝트 없이 단독 표시
- Enter 한 번으로 바로 이동

### 초기 화면 (검색어 없을 때)

```
┌──────────────────────────────────────────────────────┐
│ 🔍 Search menus, projects...                    ESC │
├──────────────────────────────────────────────────────┤
│  PINNED                                              │
│  ★ 대시보드        prod-api-server         [APM]     │
│  ★ 트랜잭션 맵     prod-api-server         [APM]     │
│                                                      │
│  RECENT                                              │
│  대시보드          staging-mysql            [DB]      │
│  Flex 보드         prod-k8s-cluster        [K8S]     │
│  이벤트 히스토리   prod-api-server          [APM]     │
│                                                      │
│  ALL MENUS                                           │
│  메인 페이지                               [GLOBAL]  │
│  프로젝트 목록                             [GLOBAL]  │
│  ...                                                 │
├──────────────────────────────────────────────────────┤
│ ↑↓ 이동  Enter 선택  ⌘Enter 새탭  ⌘D 핀  ESC 닫기   │
└──────────────────────────────────────────────────────┘
```

## 3. 검색 알고리즘

### 조합 폭발 해결 전략

300 메뉴 × 100 프로젝트 = 30,000개를 미리 만들지 않는다.
**쿼리 시점에 동적으로 조합**한다.

### 알고리즘 순서

```
입력: "dash prod"
  ↓
1) 공백으로 분리: ["dash", "prod"]
  ↓
2) 각 단어별로 메뉴/프로젝트 개별 매칭:
   "dash" → 메뉴 매칭: [대시보드, Flex보드(별칭)]
   "prod" → 프로젝트 매칭: [prod-api, prod-batch, prod-mysql]
   (각 단어는 메뉴와 프로젝트 양쪽 모두에 대해 검색)
  ↓
3) 유효한 조합 생성:
   - 모든 쿼리 단어가 "커버"되어야 함
   - 단어A가 메뉴, 단어B가 프로젝트에 매칭되면 유효
   - 단어A와 단어B 둘 다 메뉴에 매칭되어도 유효 (메뉴만 필터링)
   - productType 호환성 체크 (APM 메뉴 + DB 프로젝트 = 제외)
  ↓
4) 스코어링 & 정렬:
   - 최근 방문 조합 boost (+500)
   - 핀 고정 boost (+400)
   - 방문 빈도 boost (기존 로직)
   - 검색 매칭 점수 (기존 tier 시스템)
  ↓
5) 상위 50개만 렌더링
```

### 단일 단어 입력 시

`"dashboard"` 한 단어만 입력하면:
- Global 메뉴 매칭 → 바로 표시 (프로젝트 불필요)
- Product 메뉴 매칭 → **최근 방문/핀/빈도 기준 상위 프로젝트와 자동 조합**
- 프로젝트 이름 매칭 → 해당 프로젝트의 **최근 방문 메뉴와 조합**

### 성능 고려

- 메뉴 매칭(300개)과 프로젝트 매칭(~100개)은 각각 O(n)으로 빠름
- 교차 조합은 **매칭된 것끼리만** (보통 5~20 × 5~20)
- 50개 제한으로 렌더링 비용 제어

## 4. 동의어 사전 (Synonym Dictionary)

### 문제

300개+ 메뉴 중 alias가 있는 건 6개뿐. "hitmap"으로 "히트맵"을 찾을 수 없고, "alert"로 "이벤트 규칙"을 찾을 수 없다.

### 해결: 3층 구조

#### Layer 1 - Path 자동 추출 (무료)

URL path에서 영어 단어를 자동 추출해서 검색 대상에 포함.

```
/daily_hitmap → ["daily", "hitmap"] 자동으로 검색 가능
/transaction_map → ["transaction", "map"] 자동으로 검색 가능
```

#### Layer 2 - 글로벌 동의어 사전 (중간 노력)

"개념" 단위로 모든 표현을 그룹화:

```javascript
const TERM_GROUPS = [
  ['dashboard', '대시보드', '대쉬', '현황판', '현황'],
  ['transaction', '트랜잭션', 'TX', '거래'],
  ['event', '이벤트', '알림', 'alert', '알럿', '경고', '알람'],
  ['hitmap', '히트맵', 'heatmap'],
  ['topology', '토폴로지', 'topo'],
  ['statistics', '통계', 'stat', 'stats'],
  ['metrics', '메트릭스', '메트릭', 'metric'],
  ['kubernetes', '쿠버네티스', 'k8s', 'kube', '쿠베'],
  ['database', '데이터베이스', 'DB'],
  ['server', '서버', 'SVR'],
  ['container', '컨테이너'],
  ['monitor', '모니터링', '모니터', 'monitoring'],
  ['analysis', '분석', 'analyze'],
  ['management', '관리', 'manage', '매니지먼트'],
  ['log', '로그'],
  ['search', '검색'],
  ['history', '히스토리', '이력', '내역'],
  ['trend', '트렌드', '추세'],
  ['resource', '리소스', '자원'],
  ['performance', '퍼포먼스', '성능', 'perf'],
  ['configuration', '설정', 'config', 'setting'],
  ['install', '설치'],
  ['member', '멤버', '구성원'],
  ['project', '프로젝트', 'proj'],
  ['agent', '에이전트'],
  ['report', '보고서', '리포트'],
  ['maintenance', '유지보수', '점검'],
  ['node', '노드'],
  ['pod', '파드', '팟'],
  ['workload', '워크로드'],
  ['cluster', '클러스터'],
  ['namespace', '네임스페이스', 'ns'],
  ['deployment', '디플로이먼트', 'deploy'],
  ['service', '서비스', 'svc'],
  ['cube', '큐브'],
  ['stack', '스택'],
  ['error', '에러', '오류'],
  ['sql', 'SQL', '쿼리', 'query'],
  ['flexboard', 'Flex 보드', 'flex', '플렉스'],
  ['instance', '인스턴스'],
  ['session', '세션'],
  ['lock', '락', '잠금'],
  ['deadlock', '데드락', '교착'],
];
```

#### Layer 3 - 수동 alias (엣지 케이스만)

사전으로 커버 안 되는 WhaTap 고유 용어만 수동 추가.

### 적용 방식: 데이터 시점 확장

메뉴 데이터 로드 시 1회 실행하여 alias를 자동 생성:

```javascript
function enrichAliases(menuItem) {
  const autoAliases = new Set(menuItem.aliases || []);

  // 1) path에서 영어 단어 추출
  const pathWords = menuItem.path
    .replace(/^\//, '')
    .split(/[/_-]/)
    .filter(w => w.length > 1);

  // 2) name에서 단어 추출
  const nameWords = menuItem.name.split(/\s+/);

  // 3) 모든 추출된 단어에 대해 동의어 확장
  [...pathWords, ...nameWords].forEach(word => {
    const group = findTermGroup(word.toLowerCase());
    if (group) {
      group.forEach(term => autoAliases.add(term));
    }
  });

  menuItem.aliases = [...autoAliases];
}
```

### 효과 예시

| 메뉴 이름 | path | 기존 검색 | 추가로 검색 가능 |
|-----------|------|----------|----------------|
| 트랜잭션 맵 | /transaction_map | "트랜잭션 맵" | tx, transaction, 거래 |
| 히트맵 | /daily_hitmap | "히트맵" | hitmap, heatmap, daily |
| 이벤트 규칙 | /event/rules | "이벤트 규칙" | event, alert, 알림, 경고, 알람 |
| 대시보드 | /dashboard | "대시보드" | dashboard, 대쉬, 현황판 |
| 컨테이너 맵 | /containerMap | "컨테이너 맵" | container |
| 프로젝트 관리 | /management | "프로젝트 관리" | management, manage, 매니지먼트 |

### Combo Search + 동의어 통합 예시

```
"tx prod"     → 트랜잭션 맵 → prod-api-server [APM]
"alert k8s"   → 이벤트 규칙 → k8s-cluster [K8S]
"대쉬 mysql"  → 대시보드 → prod-mysql [DB]
"perf java"   → 퍼포먼스 트렌드 → java-app [APM]
"k8s pod"     → Pod 목록 → k8s-cluster [K8S]
```

## 5. UI 변경 요약

| 항목 | Before | After |
|------|--------|-------|
| Breadcrumb | "Dashboard → 프로젝트 선택" | 제거 (1단계라 불필요) |
| Placeholder | "메뉴 검색... (a: 에이전트, p: 프로젝트)" | "Search menus, projects..." |
| 결과 행 | 메뉴명 + 카테고리 | 메뉴명 + 프로젝트명 + productType 뱃지 |
| Pinned 섹션 | 메뉴/프로젝트 개별 핀 | 메뉴+프로젝트 조합 핀 |
| Recent 섹션 | 메뉴 단위 최근 방문 | 메뉴+프로젝트 조합 최근 방문 |
| Footer | Backspace 뒤로 표시 | 제거 (뒤로 갈 단계가 없음) |
| 에이전트 검색 | `a:` prefix 유지 | `a:` prefix 유지 |

## 6. 데이터 구조 변경

### localStorage 변경

| 키 | 변경 | 설명 |
|---|------|------|
| `whatap_qn_visits` | 유지 | 메뉴 방문 횟수 (스코어링용) |
| `whatap_qn_project_visits` | 유지 | 프로젝트 방문 횟수 (스코어링용) |
| `whatap_qn_recent_visits` | 유지 | 기존과 동일 구조, 이미 `{path, pcode}` 조합 저장 중 |
| `whatap_qn_pinned_menus` | **제거** | → `whatap_qn_pinned_combos`로 통합 |
| `whatap_qn_pinned_projects` | **제거** | → `whatap_qn_pinned_combos`로 통합 |
| `whatap_qn_pinned_combos` | **신규** | `[{menuPath, pcode}, ...]` |
| `whatap_qn_agents` | 유지 | 에이전트 캐시 |
| `whatap_qn_projects` | 유지 | 프로젝트 캐시 |

### 핀 데이터 마이그레이션

기존 메뉴 핀 → Global 메뉴 조합으로 자동 변환. 기존 프로젝트 핀은 특정 메뉴와 연결이 없으므로 드랍.

## 7. 코드 구조 변경

### utils.js

- `comboSearch(query)` 함수 신규 추가 - 핵심 검색 로직
- `enrichAliases(menuItem)` 함수 신규 추가 - 동의어 자동 확장
- `TERM_GROUPS` 동의어 사전 추가
- `getPinnedCombos()` / `togglePinCombo()` 추가
- `getMenusForProductType()` 유지 (내부용, combo 생성에 사용)
- `getProjectListForMenu()` 유지 (내부용, combo 생성에 사용)

### content.js

- `renderItemResults()` → `renderComboResults()` 전면 개편
- `renderProjectResults()`, `renderMenusForProject()` 제거
- `selectMenu()`, `selectProjectFirst()` 제거
- `handleKeydown()` 단순화 (Backspace 뒤로가기 제거, step 분기 제거)
- `handleSearch()` 단순화 (step 분기 제거)
- `goBackToMenuStep()` 제거
- `updateBreadcrumb()` 제거
- 상태: `currentStep`, `selectedMenu`, `selectedProject` 제거

### menus.js

- 변경 없음 (alias는 런타임에 자동 생성)

### styles.css

- Breadcrumb 관련 스타일 제거
- 결과 행 레이아웃 조정 (프로젝트명 표시 영역 추가)
