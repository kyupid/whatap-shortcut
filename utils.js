// ============================================
// WhaTap Quick Navigation - Utilities
// ============================================

(function(QN) {
  'use strict';

  // ============================================
  // 상태 변수
  // ============================================
  QN.state = {
    modal: null,
    searchInput: null,
    resultsList: null,
    selectedIndex: 0,
    isKeyboardNavigation: false,
    projects: {},
    visitCounts: {},
    projectVisitCounts: {},
    recentVisits: [], // [{ path, timestamp, type: 'menu'|'project', pcode? }]
    pinnedCombos: [],  // [{ menuPath, pcode }, ...]
    groups: {},         // { gcode: { name, projectCodes: [pcode, ...] } }
    agents: {}          // { pcode: [{ oid, oname, ip, isActive, alias, initial }] }
  };

  // ============================================
  // 동의어 사전 (Synonym Dictionary)
  // ============================================

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

  // 동의어 룩업맵 (lazy init, O(1) 조회)
  let _termLookup = null;

  function findTermGroup(word) {
    if (!_termLookup) {
      _termLookup = {};
      TERM_GROUPS.forEach(group => {
        group.forEach(term => {
          _termLookup[term.toLowerCase()] = group;
        });
      });
    }
    return _termLookup[word.toLowerCase()] || null;
  }

  // 메뉴 아이템에 동의어 자동 확장
  QN.enrichAliases = function(menuItem) {
    const autoAliases = new Set(menuItem.aliases || []);

    // 1) path에서 단어 추출 (camelCase도 분리)
    const pathSegments = menuItem.path
      .replace(/^\//, '')
      .split(/[/_-]/)
      .filter(w => w.length > 1);

    const pathWords = [];
    pathSegments.forEach(seg => {
      // camelCase 분리: "containerMap" → ["container", "Map"]
      const parts = seg.split(/(?=[A-Z])/).filter(p => p.length > 1);
      if (parts.length > 1) {
        parts.forEach(p => pathWords.push(p));
      }
      pathWords.push(seg);
    });

    // 2) name에서 단어 추출
    const nameWords = menuItem.name.split(/\s+/);

    // 3) 동의어 확장
    [...pathWords, ...nameWords].forEach(word => {
      const group = findTermGroup(word);
      if (group) {
        group.forEach(term => autoAliases.add(term));
      }
    });

    menuItem.aliases = [...autoAliases];
  };

  // ============================================
  // localStorage 함수
  // ============================================

  // 접속 빈도 로드
  QN.loadVisitCounts = function() {
    try {
      const data = localStorage.getItem('whatap_qn_visits');
      if (data) QN.state.visitCounts = JSON.parse(data);
    } catch (e) {
      console.error('Failed to load visit counts:', e);
    }
  };

  // 접속 빈도 저장
  QN.saveVisitCount = function(path) {
    QN.state.visitCounts[path] = (QN.state.visitCounts[path] || 0) + 1;
    try {
      localStorage.setItem('whatap_qn_visits', JSON.stringify(QN.state.visitCounts));
    } catch (e) {
      console.error('Failed to save visit count:', e);
    }
  };

  // 프로젝트 접속 빈도 로드
  QN.loadProjectVisitCounts = function() {
    try {
      const data = localStorage.getItem('whatap_qn_project_visits');
      if (data) QN.state.projectVisitCounts = JSON.parse(data);
    } catch (e) {
      console.error('Failed to load project visit counts:', e);
    }
  };

  // 프로젝트 접속 빈도 저장
  QN.saveProjectVisitCount = function(pcode) {
    QN.state.projectVisitCounts[pcode] = (QN.state.projectVisitCounts[pcode] || 0) + 1;
    try {
      localStorage.setItem('whatap_qn_project_visits', JSON.stringify(QN.state.projectVisitCounts));
    } catch (e) {
      console.error('Failed to save project visit count:', e);
    }
  };

  // 방문 기록 전체 초기화
  QN.resetAllVisitData = function() {
    QN.state.visitCounts = {};
    QN.state.projectVisitCounts = {};
    QN.state.recentVisits = [];
    try {
      localStorage.removeItem('whatap_qn_visits');
      localStorage.removeItem('whatap_qn_project_visits');
      localStorage.removeItem('whatap_qn_recent_visits');
    } catch (e) {}
  };

  // 삭제된 프로젝트 기록 정리
  QN.cleanupDeletedProjects = function() {
    const validPcodes = new Set(Object.keys(QN.state.projects));
    if (validPcodes.size === 0) return; // 프로젝트 미로드 시 정리 안 함

    // projectVisitCounts에서 존재하지 않는 pcode 제거
    let cleaned = false;
    for (const pcode of Object.keys(QN.state.projectVisitCounts)) {
      if (!validPcodes.has(pcode)) {
        delete QN.state.projectVisitCounts[pcode];
        cleaned = true;
      }
    }
    if (cleaned) {
      try {
        localStorage.setItem('whatap_qn_project_visits', JSON.stringify(QN.state.projectVisitCounts));
      } catch (e) {}
    }

    // recentVisits에서 존재하지 않는 pcode 제거
    const before = QN.state.recentVisits.length;
    QN.state.recentVisits = QN.state.recentVisits.filter(v =>
      !v.pcode || validPcodes.has(String(v.pcode))
    );
    if (QN.state.recentVisits.length !== before) {
      try {
        localStorage.setItem('whatap_qn_recent_visits', JSON.stringify(QN.state.recentVisits));
      } catch (e) {}
    }

    // pinnedCombos에서 존재하지 않는 pcode 제거
    if (QN.state.pinnedCombos.length > 0) {
      const beforeCombos = QN.state.pinnedCombos.length;
      QN.state.pinnedCombos = QN.state.pinnedCombos.filter(c =>
        c.pcode === null || validPcodes.has(String(c.pcode))
      );
      if (QN.state.pinnedCombos.length !== beforeCombos) {
        try {
          localStorage.setItem('whatap_qn_pinned_combos', JSON.stringify(QN.state.pinnedCombos));
        } catch (e) {}
      }
    }

    // agents에서 존재하지 않는 pcode 제거
    let agentsCleaned = false;
    for (const pcode of Object.keys(QN.state.agents)) {
      if (!validPcodes.has(pcode)) {
        delete QN.state.agents[pcode];
        agentsCleaned = true;
      }
    }
    if (agentsCleaned) QN.saveAgents();
  };

  // 방문 빈도 자동 감쇠 (1주일마다 50% 감쇠)
  const DECAY_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 1주
  const DECAY_FACTOR = 0.5;

  QN.applyVisitDecay = function() {
    try {
      const lastDecay = localStorage.getItem('whatap_qn_last_decay');
      const lastDecayTime = lastDecay ? Number(lastDecay) : Date.now();

      if (Date.now() - lastDecayTime < DECAY_INTERVAL) return;

      // 메뉴 방문 감쇠
      for (const path of Object.keys(QN.state.visitCounts)) {
        QN.state.visitCounts[path] = Math.floor(QN.state.visitCounts[path] * DECAY_FACTOR);
        if (QN.state.visitCounts[path] <= 0) delete QN.state.visitCounts[path];
      }
      localStorage.setItem('whatap_qn_visits', JSON.stringify(QN.state.visitCounts));

      // 프로젝트 방문 감쇠
      for (const pcode of Object.keys(QN.state.projectVisitCounts)) {
        QN.state.projectVisitCounts[pcode] = Math.floor(QN.state.projectVisitCounts[pcode] * DECAY_FACTOR);
        if (QN.state.projectVisitCounts[pcode] <= 0) delete QN.state.projectVisitCounts[pcode];
      }
      localStorage.setItem('whatap_qn_project_visits', JSON.stringify(QN.state.projectVisitCounts));

      localStorage.setItem('whatap_qn_last_decay', String(Date.now()));
    } catch (e) {}
  };

  // 최근 방문 기록 로드
  const MAX_RECENT_VISITS = 10;

  QN.loadRecentVisits = function() {
    try {
      const data = localStorage.getItem('whatap_qn_recent_visits');
      if (data) QN.state.recentVisits = JSON.parse(data);
    } catch (e) {
      QN.state.recentVisits = [];
    }
  };

  // 최근 방문 기록 저장
  QN.saveRecentVisit = function(path, type, pcode) {
    // 중복 제거 (같은 path+pcode 조합)
    QN.state.recentVisits = QN.state.recentVisits.filter(v =>
      !(v.path === path && v.pcode === pcode)
    );
    // 최신 항목을 앞에 추가
    QN.state.recentVisits.unshift({ path, timestamp: Date.now(), type, pcode: pcode || null });
    // 최대 개수 유지
    QN.state.recentVisits = QN.state.recentVisits.slice(0, MAX_RECENT_VISITS);
    try {
      localStorage.setItem('whatap_qn_recent_visits', JSON.stringify(QN.state.recentVisits));
    } catch (e) {}
  };

  // 콤보 핀 로드 (기존 핀 데이터 마이그레이션 포함)
  QN.loadPinnedCombos = function() {
    try {
      const data = localStorage.getItem('whatap_qn_pinned_combos');
      if (data) {
        QN.state.pinnedCombos = JSON.parse(data);
        return;
      }

      // 기존 pinnedMenus → pinnedCombos 마이그레이션
      const oldMenus = localStorage.getItem('whatap_qn_pinned_menus');
      if (oldMenus) {
        const menus = JSON.parse(oldMenus);
        QN.state.pinnedCombos = menus.map(path => ({ menuPath: path, pcode: null }));
        localStorage.setItem('whatap_qn_pinned_combos', JSON.stringify(QN.state.pinnedCombos));
        localStorage.removeItem('whatap_qn_pinned_menus');
        localStorage.removeItem('whatap_qn_pinned_projects');
      }
    } catch (e) {
      QN.state.pinnedCombos = [];
    }
  };

  // 콤보 핀 토글
  QN.togglePinCombo = function(menuPath, pcode) {
    const pcodeStr = pcode != null ? String(pcode) : null;
    const idx = QN.state.pinnedCombos.findIndex(c =>
      c.menuPath === menuPath && c.pcode === pcodeStr
    );
    if (idx >= 0) {
      QN.state.pinnedCombos.splice(idx, 1);
    } else {
      QN.state.pinnedCombos.push({ menuPath, pcode: pcodeStr });
    }
    try {
      localStorage.setItem('whatap_qn_pinned_combos', JSON.stringify(QN.state.pinnedCombos));
    } catch (e) {}
  };

  // 콤보 핀 여부 확인
  QN.isComboPinned = function(menuPath, pcode) {
    const pcodeStr = pcode != null ? String(pcode) : null;
    return QN.state.pinnedCombos.some(c =>
      c.menuPath === menuPath && c.pcode === pcodeStr
    );
  };

  // ============================================
  // 에이전트 캐시
  // ============================================

  QN.loadAgents = function() {
    try {
      const raw = localStorage.getItem('whatap_qn_agents');
      if (raw) QN.state.agents = JSON.parse(raw);
    } catch (e) { QN.state.agents = {}; }
  };

  QN.saveAgents = function() {
    try {
      localStorage.setItem('whatap_qn_agents', JSON.stringify(QN.state.agents));
    } catch (e) {}
  };

  // postMessage 수신 (interceptor.js → content script)
  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'WHATAP_QN_AGENT_DATA') {
      QN.state.agents[event.data.pcode] = event.data.agents;
      QN.saveAgents();
    }
  });

  // 쿼리 접두사 파싱: "a:DMX" → { prefix: 'agent', query: 'DMX' }
  QN.parseQuery = function(input) {
    const match = input.match(/^a:(.*)$/);
    if (match) {
      return { prefix: 'agent', query: match[1].trim() };
    }
    return { prefix: null, query: input.trim() };
  };

  // 에이전트 아이템 목록
  QN.getAgentItems = function() {
    const items = [];
    for (const [pcode, agents] of Object.entries(QN.state.agents)) {
      const project = QN.state.projects[pcode];
      if (!project) continue;
      agents.forEach(agent => {
        items.push({
          itemType: 'agent',
          oname: agent.oname,
          name: agent.oname,
          ip: agent.ip,
          oid: agent.oid,
          isActive: agent.isActive,
          alias: agent.alias,
          pcode: Number(pcode),
          projectName: project.name,
          productType: project.productType
        });
      });
    }
    return items;
  };

  // ============================================
  // 프로젝트 관련 함수
  // ============================================

  // 현재 URL에서 프로젝트 pcode 추출
  QN.getCurrentProjectPcode = function() {
    const match = window.location.pathname.match(/\/v2\/project\/[^/]+\/(\d+)/);
    return match ? match[1] : null;
  };

  // 현재 URL에서 productType 추출 (URL path 기준)
  QN.getCurrentProductType = function() {
    const match = window.location.pathname.match(/\/v2\/project\/([^/]+)\/\d+/);
    return match ? match[1] : null;
  };

  // 현재 URL에서 메뉴 path 추출
  QN.getCurrentMenuPath = function() {
    const pathname = window.location.pathname;

    // 프로젝트 페이지: /v2/project/{productType}/{pcode}{menuPath}
    const projectMatch = pathname.match(/\/v2\/project\/[^/]+\/\d+(.+)/);
    if (projectMatch) {
      return projectMatch[1]; // 예: /dashboard, /metrics_chart
    }

    // Global 페이지는 전체 경로 반환
    return pathname;
  };

  // 프로젝트 목록 로드 (API) - TTL 1시간 캐시
  const PROJECT_CACHE_TTL = 60 * 60 * 1000; // 1시간

  QN.loadProjects = async function(forceRefresh = false) {
    // 캐시 확인 (강제 새로고침이 아닐 때)
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem('whatap_qn_projects');
        if (cached) {
          const parsed = JSON.parse(cached);
          // 새 캐시 구조 (timestamp 포함) 또는 기존 구조 호환
          const data = parsed.data || parsed;
          const timestamp = parsed.timestamp || 0;

          if (Date.now() - timestamp < PROJECT_CACHE_TTL) {
            QN.state.projects = data;
            if (parsed.groups) QN.state.groups = parsed.groups;
            _groupLookup = null; // 룩업맵 갱신
            return; // 캐시 사용
          }
        }
      } catch (e) {}
    }

    // API 호출
    try {
      const response = await fetch('/account/api/v4/groups/min', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      if (!text || !text.startsWith('{')) {
        throw new Error('Non-JSON response');
      }
      const data = JSON.parse(text);
      if (data.ok && data.data && data.data.projects) {
        QN.state.projects = data.data.projects;

        // 그룹 정보 저장
        if (data.data.groups) {
          QN.state.groups = {};
          for (const [gcode, group] of Object.entries(data.data.groups)) {
            QN.state.groups[gcode] = {
              name: group.name || group.groupName || `Group ${gcode}`,
              projectCodes: group.projectCodes || []
            };
          }
        }

        _groupLookup = null; // 룩업맵 갱신

        // localStorage 저장 (타임스탬프 포함)
        try {
          localStorage.setItem('whatap_qn_projects', JSON.stringify({
            data: QN.state.projects,
            groups: QN.state.groups,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          // QuotaExceededError 등 - 캐시 저장 실패해도 동작에는 문제 없음
        }
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
      // API 실패 시 만료된 캐시라도 사용
      try {
        const cached = localStorage.getItem('whatap_qn_projects');
        if (cached) {
          const parsed = JSON.parse(cached);
          QN.state.projects = parsed.data || parsed;
          if (parsed.groups) QN.state.groups = parsed.groups;
          _groupLookup = null;
        }
      } catch (e2) {
        console.error('Failed to load cached projects:', e2);
      }
    }
  };

  // productType을 URL용 타입으로 변환 (대소문자 무관)
  QN.getUrlProductType = function(productType) {
    if (!productType) return null;
    let urlType = QN.PRODUCT_TYPE_MAP[productType];
    if (!urlType) {
      urlType = QN.PRODUCT_TYPE_MAP[productType.toUpperCase()];
    }
    // 디버깅: 매핑 안 되는 productType 확인
    if (!urlType) {
      console.warn('[QN] Unknown productType:', productType, '- add to PRODUCT_TYPE_MAP');
    }
    return urlType;
  };

  // 프로젝트의 그룹명 조회 (룩업맵 캐시)
  let _groupLookup = null;
  QN.buildGroupLookup = function() {
    _groupLookup = {};
    if (!QN.state.groups) return;
    for (const [gcode, group] of Object.entries(QN.state.groups)) {
      if (group.projectCodes) {
        for (const pc of group.projectCodes) {
          _groupLookup[pc] = group.name;
        }
      }
    }
  };
  QN.getProjectGroupName = function(pcode) {
    if (!_groupLookup) QN.buildGroupLookup();
    return _groupLookup[Number(pcode)] || null;
  };

  // productType으로 프로젝트 필터링
  QN.getProjectsForProductType = function(urlProductType) {
    const result = [];
    for (const [pcode, project] of Object.entries(QN.state.projects)) {
      const mappedType = QN.getUrlProductType(project.productType);
      if (mappedType === urlProductType) {
        result.push({
          pcode: project.pcode,
          name: project.name,
          platform: project.platform,
          productType: project.productType,
          groupName: QN.getProjectGroupName(project.pcode)
        });
      }
    }
    return result;
  };

  // 모든 프로젝트 가져오기 (공통 메뉴용)
  QN.getAllProjects = function() {
    const result = [];
    for (const [pcode, project] of Object.entries(QN.state.projects)) {
      result.push({
        pcode: project.pcode,
        name: project.name,
        platform: project.platform,
        productType: project.productType,
        groupName: QN.getProjectGroupName(project.pcode)
      });
    }
    return result;
  };

  // 현재 선택된 메뉴에 맞는 프로젝트 목록 가져오기
  QN.getProjectListForMenu = function(menu) {
    if (!menu) return [];
    return menu.productType === 'common'
      ? QN.getAllProjects()
      : QN.getProjectsForProductType(menu.productType);
  };

  // ============================================
  // 메뉴 관련 함수
  // ============================================

  // enriched 메뉴 캐시 (동의어 확장은 1회만 실행)
  let _enrichedMenus = null;

  function getEnrichedMenuBase() {
    if (_enrichedMenus) return _enrichedMenus;

    _enrichedMenus = [];
    const seenPaths = new Set();

    QN.GLOBAL_MENUS.forEach(menu => {
      if (!seenPaths.has(menu.path)) {
        seenPaths.add(menu.path);
        const item = { ...menu, productType: 'global', fullPath: menu.path };
        QN.enrichAliases(item);
        _enrichedMenus.push(item);
      }
    });

    QN.COMMON_MENUS.forEach(menu => {
      if (!seenPaths.has(menu.path)) {
        seenPaths.add(menu.path);
        const item = { ...menu, productType: 'common', displayProductType: '공통' };
        QN.enrichAliases(item);
        _enrichedMenus.push(item);
      }
    });

    for (const [productType, menus] of Object.entries(QN.PRODUCT_MENUS)) {
      menus.forEach(menu => {
        if (!seenPaths.has(menu.path)) {
          seenPaths.add(menu.path);
          const item = { ...menu, productType, displayProductType: productType.toUpperCase() };
          QN.enrichAliases(item);
          _enrichedMenus.push(item);
        }
      });
    }

    return _enrichedMenus;
  }

  // 모든 메뉴 가져오기 (빈도 기반 정렬, 중복 제거)
  QN.getAllMenus = function() {
    const allMenus = [...getEnrichedMenuBase()]; // 캐시에서 복사 (정렬은 매번)

    // 컨텍스트 → 빈도 기반 정렬
    const currentUrlProductType = QN.getCurrentProductType();
    allMenus.sort((a, b) => {
      // 현재 productType 메뉴 우선
      if (currentUrlProductType) {
        const aMatch = (a.productType === currentUrlProductType || a.productType === 'common') ? 1 : 0;
        const bMatch = (b.productType === currentUrlProductType || b.productType === 'common') ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }
      // 같은 그룹 내 빈도 기반 정렬
      const countA = QN.state.visitCounts[a.path] || 0;
      const countB = QN.state.visitCounts[b.path] || 0;
      return countB - countA;
    });

    return allMenus;
  };

  // 특정 productType의 메뉴 가져오기
  QN.getMenusForProductType = function(productType) {
    const urlType = QN.getUrlProductType(productType);
    if (!urlType) return [];

    const menus = QN.PRODUCT_MENUS[urlType] || [];
    const result = menus.map(menu => {
      const item = { ...menu, productType: urlType, displayProductType: urlType.toUpperCase(), itemType: 'menu' };
      QN.enrichAliases(item);
      return item;
    });

    // 공통 메뉴 추가
    QN.COMMON_MENUS.forEach(menu => {
      const item = { ...menu, productType: 'common', displayProductType: '공통', itemType: 'menu' };
      QN.enrichAliases(item);
      result.push(item);
    });

    // 빈도 기반 정렬
    result.sort((a, b) => {
      const countA = QN.state.visitCounts[a.path] || 0;
      const countB = QN.state.visitCounts[b.path] || 0;
      return countB - countA;
    });

    return result;
  };

  // ============================================
  // 검색 함수
  // ============================================

  // fzf 스타일 퍼지 매칭: 쿼리 문자가 순서대로 존재하면 매칭
  QN.fzfScore = function(query, text) {
    if (!query || !text) return 0;
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    let qi = 0, score = 0, consecutive = 0, lastIdx = -2;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        score += 1;
        if (ti === lastIdx + 1) { consecutive++; score += consecutive * 2; }
        else { consecutive = 0; }
        if (ti === 0 || /[-_ ./]/.test(t[ti - 1])) score += 5;
        lastIdx = ti;
        qi++;
      }
    }
    return qi === q.length ? score : 0;
  };

  // 퍼지 검색 (메뉴 + 프로젝트 통합)
  QN.fuzzySearch = function(query, items) {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    const isNumericQuery = /^\d+$/.test(query); // 숫자만 입력된 경우

    const scored = items.map(item => {
      let score = 0;

      if (item.itemType === 'agent') {
        const oname = (item.oname || '').toLowerCase();
        const ip = item.ip || '';
        const alias = (item.alias || '').toLowerCase();

        if (oname === lowerQuery) score += 1000;
        else if (oname.startsWith(lowerQuery)) score += 500;
        else if (oname.includes(lowerQuery)) score += 200;

        if (ip.startsWith(lowerQuery)) score += 400;
        else if (ip.includes(lowerQuery)) score += 150;

        if (alias && alias.includes(lowerQuery)) score += 100;

        if (score === 0) {
          const fzf = QN.fzfScore(lowerQuery, oname);
          if (fzf > 0) score += Math.min(fzf, 80);
        }
      } else if (item.itemType === 'project') {
        // 프로젝트 검색
        const name = item.name.toLowerCase();
        const pcode = String(item.pcode);
        const platform = (item.platform || '').toLowerCase();
        const productType = (item.productType || '').toLowerCase();

        // pcode 매칭 (Tier 1: Exact match)
        if (pcode === lowerQuery) score += 1000;
        else if (pcode.startsWith(lowerQuery)) score += 500;
        else if (pcode.includes(lowerQuery)) score += 200;

        // 숫자 검색 시 pcode 매칭된 프로젝트 우선
        if (isNumericQuery && score > 0) score += 100;

        // 이름 매칭 (Tier 2: Prefix match, Tier 3: Substring match)
        if (name.startsWith(lowerQuery)) score += 400;
        if (name.includes(lowerQuery)) score += 150;

        // 플랫폼/productType 매칭 (Tier 3)
        if (platform.startsWith(lowerQuery)) score += 100;
        if (platform.includes(lowerQuery)) score += 20;
        if (productType.startsWith(lowerQuery)) score += 100;
        if (productType.includes(lowerQuery)) score += 20;

        // fzf 퍼지 매칭 (Tier 4: 순서 기반)
        if (score === 0) {
          const fzf = QN.fzfScore(lowerQuery, name);
          if (fzf > 0) score += Math.min(fzf, 80);
        }

        // 빈도 가중치 (Tiebreaker, 최대 300점)
        const visitCount = QN.state.projectVisitCounts[item.pcode] || 0;
        score += Math.min(visitCount * 0.5, 300);

      } else {
        // 메뉴 검색
        const name = item.name.toLowerCase();
        const category = (item.category || '').toLowerCase();
        const path = (item.path || '').toLowerCase();
        const productType = (item.displayProductType || item.productType || '').toLowerCase();
        const aliases = item.aliases || [];

        // 별칭 매칭 (Tier 1: Exact/Prefix match)
        for (const alias of aliases) {
          const lowerAlias = alias.toLowerCase();
          if (lowerAlias === lowerQuery) score += 1000;
          else if (lowerAlias.startsWith(lowerQuery)) score += 500;
          else if (lowerAlias.includes(lowerQuery)) score += 80;
        }

        // 이름/카테고리 매칭 (Tier 2: Prefix match)
        if (name.startsWith(lowerQuery)) score += 400;
        if (category.startsWith(lowerQuery)) score += 200;
        if (productType.startsWith(lowerQuery)) score += 200;

        // 포함 매칭 (Tier 3: Substring match)
        if (name.includes(lowerQuery)) score += 100;
        if (category.includes(lowerQuery)) score += 50;
        if (path.includes(lowerQuery)) score += 30;
        if (productType.includes(lowerQuery)) score += 50;

        // 각 단어의 첫 글자 매칭 (Tier 3)
        const words = name.split(/\s+/);
        const initials = words.map(w => w[0]).join('').toLowerCase();
        if (initials.includes(lowerQuery)) score += 50;

        // fzf 퍼지 매칭 (Tier 4: 순서 기반)
        if (score === 0) {
          const fzf = Math.max(QN.fzfScore(lowerQuery, name), QN.fzfScore(lowerQuery, path));
          if (fzf > 0) score += Math.min(fzf, 80);
        }

        // 빈도 가중치 (Tiebreaker, 최대 300점)
        const visitCount = QN.state.visitCounts[item.path] || 0;
        score += Math.min(visitCount * 0.5, 300);
      }

      return { item, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.item);
  };

  // 프로젝트 퍼지 검색 (스코어링 기반)
  QN.fuzzySearchProjects = function(query, projects) {
    if (!query) return projects;

    const lowerQuery = query.toLowerCase();
    const isNumericQuery = /^\d+$/.test(query);

    const scored = projects.map(project => {
      let score = 0;
      const name = project.name.toLowerCase();
      const pcode = String(project.pcode);
      const platform = (project.platform || '').toLowerCase();
      const productType = (project.productType || '').toLowerCase();

      // pcode 매칭
      if (pcode === lowerQuery) score += 1000;
      else if (pcode.startsWith(lowerQuery)) score += 500;
      else if (pcode.includes(lowerQuery)) score += 200;

      // 이름 매칭
      if (name === lowerQuery) score += 900;
      else if (name.startsWith(lowerQuery)) score += 400;
      if (name.includes(lowerQuery)) score += 150;

      // 각 단어의 첫 글자 매칭
      const words = name.split(/\s+/);
      const initials = words.map(w => w[0]).join('').toLowerCase();
      if (initials.includes(lowerQuery)) score += 50;

      // 플랫폼/productType 매칭
      if (platform.startsWith(lowerQuery)) score += 100;
      if (platform.includes(lowerQuery)) score += 20;
      if (productType.startsWith(lowerQuery)) score += 100;
      if (productType.includes(lowerQuery)) score += 20;

      // fzf 퍼지 매칭 (Tier 4: 순서 기반)
      if (score === 0) {
        const fzf = QN.fzfScore(lowerQuery, name);
        if (fzf > 0) score += Math.min(fzf, 80);
      }

      // 숫자 검색 시 pcode 매칭 가중
      if (isNumericQuery && score > 0) score += 100;

      return { project, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.project);
  };

  // 프로젝트 필터링 + 정렬 (현재 프로젝트 최상단, 퍼지 검색 적용)
  QN.filterAndSortProjects = function(projectList, query) {
    let filtered = query ? QN.fuzzySearchProjects(query, projectList) : projectList;

    const currentPcode = QN.getCurrentProjectPcode();
    let currentProject = null;
    let otherProjects = filtered;

    if (currentPcode) {
      currentProject = filtered.find(p => String(p.pcode) === currentPcode);
      otherProjects = filtered.filter(p => String(p.pcode) !== currentPcode);
    }

    // 검색어 없을 때만 핀 + 그룹 + 빈도순 정렬 (퍼지 검색 시 스코어 순 유지)
    if (!query) {
      otherProjects.sort((a, b) => {
        // 그룹별 정렬
        const aGroup = a.groupName || '';
        const bGroup = b.groupName || '';
        if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
        // 빈도순 정렬
        const countA = QN.state.projectVisitCounts[a.pcode] || 0;
        const countB = QN.state.projectVisitCounts[b.pcode] || 0;
        return countB - countA;
      });
    }

    return currentProject ? [currentProject, ...otherProjects] : otherProjects;
  };

  // 텍스트에서 query와 매칭되는 부분을 하이라이트 HTML로 변환
  QN.highlightMatch = function(text, query) {
    if (!query || !text) return QN.escapeHtml(text || '');
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // substring 매칭이면 기존 방식
    if (lowerText.includes(lowerQuery)) {
      const escaped = QN.escapeHtml(text);
      const escapedQuery = QN.escapeHtml(query);
      const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return escaped.replace(regex, '<span class="whatap-qn-highlight">$1</span>');
    }

    // fzf 스타일: 매칭 위치 찾기
    const matches = new Set();
    let qi = 0;
    for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
      if (lowerText[ti] === lowerQuery[qi]) { matches.add(ti); qi++; }
    }
    if (qi < lowerQuery.length) return QN.escapeHtml(text);

    // 연속 매칭을 하나의 span으로 묶어서 출력
    const esc = c => c.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    let result = '', inHL = false;
    for (let i = 0; i < text.length; i++) {
      if (matches.has(i) && !inHL) { result += '<span class="whatap-qn-highlight">'; inHL = true; }
      else if (!matches.has(i) && inHL) { result += '</span>'; inHL = false; }
      result += esc(text[i]);
    }
    if (inHL) result += '</span>';
    return result;
  };

  // HTML 이스케이프
  QN.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // ============================================
  // Combo Search
  // ============================================

  const MAX_COMBO_RESULTS = 50;
  const MAX_AUTO_PROJECTS = 5;

  // 단일 단어의 메뉴 매칭 점수
  function scoreMenuForWord(word, menu) {
    const lw = word.toLowerCase();
    let score = 0;

    const name = menu.name.toLowerCase();
    const path = (menu.path || '').toLowerCase();
    const category = (menu.category || '').toLowerCase();
    const aliases = menu.aliases || [];

    // 별칭 매칭
    for (const alias of aliases) {
      const la = alias.toLowerCase();
      if (la === lw) { score = Math.max(score, 1000); break; }
      else if (la.startsWith(lw)) score = Math.max(score, 500);
      else if (la.includes(lw)) score = Math.max(score, 80);
    }

    // 이름 매칭
    if (name === lw) score = Math.max(score, 900);
    else if (name.startsWith(lw)) score = Math.max(score, 400);
    if (name.includes(lw)) score = Math.max(score, 100);

    // 카테고리 매칭
    if (category.startsWith(lw)) score = Math.max(score, 200);
    if (category.includes(lw)) score = Math.max(score, 50);

    // Path 매칭
    if (path.includes(lw)) score = Math.max(score, 30);

    // fzf 퍼지 매칭 (fallback)
    if (score === 0) {
      const fzf = Math.max(QN.fzfScore(lw, name), QN.fzfScore(lw, path));
      if (fzf > 0) score = Math.min(fzf, 80);
    }

    return score;
  }

  // 단일 단어의 프로젝트 매칭 점수 (exact/prefix/includes만 - 빠름)
  function scoreProjectForWordFast(word, project) {
    const lw = word.toLowerCase();
    let score = 0;

    const name = project.name.toLowerCase();
    const pcode = String(project.pcode);
    const platform = (project.platform || '').toLowerCase();

    // pcode 매칭
    if (pcode === lw) score = Math.max(score, 1000);
    else if (pcode.startsWith(lw)) score = Math.max(score, 500);

    // 이름 매칭
    if (name === lw) score = Math.max(score, 900);
    else if (name.startsWith(lw)) score = Math.max(score, 400);
    if (name.includes(lw)) score = Math.max(score, 150);

    // 플랫폼 매칭
    if (platform.includes(lw)) score = Math.max(score, 20);

    return score;
  }

  // 단일 단어의 프로젝트 매칭 점수 (fzf 포함 - 느림)
  function scoreProjectForWord(word, project) {
    const score = scoreProjectForWordFast(word, project);
    if (score > 0) return score;

    // fzf 퍼지 매칭 (fallback)
    const fzf = QN.fzfScore(word.toLowerCase(), project.name.toLowerCase());
    return fzf > 0 ? Math.min(fzf, 80) : 0;
  }

  // productType 호환성 검사
  function isProductTypeCompatible(menu, project) {
    if (menu.productType === 'global') return false;
    if (menu.productType === 'common') return true;
    return menu.productType === QN.getUrlProductType(project.productType);
  }

  // 메뉴에 호환되는 프로젝트 목록 (빈도순, 상위 N개만)
  function getCompatibleProjects(menu, allProjects) {
    // 방문 기록 있는 프로젝트만 우선 필터 + 호환성 체크
    const withVisits = [];
    const withoutVisits = [];
    for (const p of allProjects) {
      if (!isProductTypeCompatible(menu, p)) continue;
      if (QN.state.projectVisitCounts[p.pcode] > 0) {
        withVisits.push(p);
      } else if (withVisits.length < MAX_AUTO_PROJECTS) {
        withoutVisits.push(p);
      }
    }
    withVisits.sort((a, b) => {
      return (QN.state.projectVisitCounts[b.pcode] || 0) - (QN.state.projectVisitCounts[a.pcode] || 0);
    });
    // 방문 기록 있는 프로젝트로 충분하면 그것만, 아니면 나머지 추가
    const result = withVisits.slice(0, MAX_AUTO_PROJECTS);
    if (result.length < MAX_AUTO_PROJECTS) {
      result.push(...withoutVisits.slice(0, MAX_AUTO_PROJECTS - result.length));
    }
    return result;
  }

  // Combo Search: 쿼리로 메뉴+프로젝트 조합 검색
  QN.comboSearch = function(query) {
    const words = query.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return [];

    const allMenus = QN.getAllMenus();
    const allProjects = QN.getAllProjects();
    const projectLookup = new Map();
    allProjects.forEach(p => projectLookup.set(String(p.pcode), p));
    const combos = [];
    const seen = new Set();

    // Step 1: 단어별 메뉴/프로젝트 매칭 점수 계산
    const menuMatches = words.map(w => {
      const m = new Map();
      allMenus.forEach((menu, idx) => {
        const s = scoreMenuForWord(w, menu);
        if (s > 0) m.set(idx, s);
      });
      return m;
    });

    const projectMatches = words.map(w => {
      const m = new Map();
      // 1차: exact/prefix/includes 매칭 (빠름)
      allProjects.forEach(proj => {
        const s = scoreProjectForWordFast(w, proj);
        if (s > 0) m.set(String(proj.pcode), s);
      });
      // 2차: 결과 부족하면 fzf 퍼지 매칭 추가 (느림)
      if (m.size < 10) {
        const lw = w.toLowerCase();
        allProjects.forEach(proj => {
          const pcode = String(proj.pcode);
          if (m.has(pcode)) return;
          const fzf = QN.fzfScore(lw, proj.name.toLowerCase());
          if (fzf > 0) m.set(pcode, Math.min(fzf, 80));
        });
      }
      return m;
    });

    // 콤보 추가 헬퍼 (중복 방지, 스코어링)
    function addCombo(menu, project, menuScore, projectScore) {
      const key = menu.path + ':' + (project ? project.pcode : '_');
      if (seen.has(key)) return;
      seen.add(key);

      let score = menuScore + projectScore;

      // 최근 방문 boost
      const recentIdx = QN.state.recentVisits.findIndex(v =>
        v.path === menu.path &&
        ((!project && !v.pcode) || (project && String(v.pcode) === String(project.pcode)))
      );
      if (recentIdx >= 0) score += 500 - recentIdx * 10;

      // 핀 boost
      if (QN.isComboPinned(menu.path, project ? project.pcode : null)) score += 400;

      // 방문 빈도 boost
      score += Math.min((QN.state.visitCounts[menu.path] || 0) * 0.5, 150);
      if (project) {
        score += Math.min((QN.state.projectVisitCounts[project.pcode] || 0) * 0.5, 150);
      }

      // fullPath 생성
      let fullPath;
      if (project) {
        const urlProductType = menu.productType === 'common'
          ? QN.getUrlProductType(project.productType)
          : menu.productType;
        fullPath = '/v2/project/' + urlProductType + '/' + project.pcode + menu.path;
      } else {
        fullPath = menu.fullPath || menu.path;
      }

      combos.push({ menu, project: project || null, score, fullPath });
    }

    // Step 2: 메뉴 후보에서 조합 생성
    const candidateMenuIdxs = new Set();
    menuMatches.forEach(m => m.forEach((_, idx) => candidateMenuIdxs.add(idx)));

    candidateMenuIdxs.forEach(menuIdx => {
      const menu = allMenus[menuIdx];

      // 이 메뉴가 커버하는 단어와 총 점수
      let menuTotalScore = 0;
      const coveredByMenu = [];
      words.forEach((_, wi) => {
        const s = menuMatches[wi].get(menuIdx) || 0;
        coveredByMenu.push(s > 0);
        menuTotalScore += s;
      });

      const uncoveredIdxs = words.map((_, i) => i).filter(i => !coveredByMenu[i]);

      // 모든 단어가 메뉴에 매칭됨
      if (uncoveredIdxs.length === 0) {
        if (menu.productType === 'global') {
          addCombo(menu, null, menuTotalScore, 0);
        } else {
          // 빈도 높은 프로젝트와 자동 조합
          const compatible = getCompatibleProjects(menu, allProjects);
          compatible.slice(0, MAX_AUTO_PROJECTS).forEach(proj => {
            addCombo(menu, proj, menuTotalScore, 0);
          });
        }
      }

      if (menu.productType === 'global') return;

      // 일부 단어만 메뉴에 매칭 → 나머지는 프로젝트에서 커버해야 함
      if (uncoveredIdxs.length > 0 && uncoveredIdxs.length < words.length) {
        // 모든 미커버 단어에 매칭되는 프로젝트 찾기 (교집합)
        let candidatePcodes = null;
        uncoveredIdxs.forEach(wi => {
          const pcodesForWord = new Set(projectMatches[wi].keys());
          if (candidatePcodes === null) {
            candidatePcodes = pcodesForWord;
          } else {
            candidatePcodes = new Set([...candidatePcodes].filter(p => pcodesForWord.has(p)));
          }
        });

        if (candidatePcodes) {
          candidatePcodes.forEach(pcode => {
            const proj = projectLookup.get(pcode);
            if (!proj || !isProductTypeCompatible(menu, proj)) return;

            let projScore = 0;
            uncoveredIdxs.forEach(wi => {
              projScore += projectMatches[wi].get(pcode) || 0;
            });

            addCombo(menu, proj, menuTotalScore, projScore);
          });
        }
      }
    });

    // Step 3: 단일 단어일 때 프로젝트 매칭 → 최근 메뉴와 자동 조합
    if (words.length === 1) {
      // 점수 상위 프로젝트만 처리 (성능 최적화)
      const projEntries = [...projectMatches[0].entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

      for (const [pcode, projScore] of projEntries) {
        if (combos.length >= MAX_COMBO_RESULTS) break;

        const proj = projectLookup.get(pcode);
        if (!proj) continue;

        // 이 프로젝트의 최근 방문 메뉴와 조합
        const recentMenuPaths = QN.state.recentVisits
          .filter(v => String(v.pcode) === pcode)
          .map(v => v.path);

        let menus = recentMenuPaths.length > 0
          ? allMenus.filter(m => recentMenuPaths.includes(m.path) && isProductTypeCompatible(m, proj))
          : [];

        if (menus.length === 0) {
          // fallback: 해당 productType의 상위 메뉴
          menus = allMenus.filter(m => isProductTypeCompatible(m, proj)).slice(0, 3);
        }

        menus.slice(0, 3).forEach(m => {
          addCombo(m, proj, 0, projScore);
        });
      }
    }

    return combos.sort((a, b) => b.score - a.score).slice(0, MAX_COMBO_RESULTS);
  };

  // 핀된 콤보 목록 가져오기 (초기 화면 표시용)
  QN.getPinnedCombos = function() {
    const allMenus = QN.getAllMenus();
    const result = [];

    for (const pin of QN.state.pinnedCombos) {
      const menu = allMenus.find(m => m.path === pin.menuPath);
      if (!menu) continue;

      let project = null;
      if (pin.pcode && QN.state.projects[pin.pcode]) {
        const p = QN.state.projects[pin.pcode];
        project = {
          pcode: p.pcode,
          name: p.name,
          platform: p.platform,
          productType: p.productType,
          groupName: QN.getProjectGroupName(p.pcode)
        };
      }

      let fullPath;
      if (project) {
        const urlProductType = menu.productType === 'common'
          ? QN.getUrlProductType(project.productType)
          : menu.productType;
        fullPath = '/v2/project/' + urlProductType + '/' + project.pcode + menu.path;
      } else {
        fullPath = menu.fullPath || menu.path;
      }

      result.push({ menu, project, score: 0, fullPath });
    }

    return result;
  };

  // 최근 방문 콤보 목록 가져오기 (초기 화면 표시용)
  QN.getRecentCombos = function() {
    const allMenus = QN.getAllMenus();
    const result = [];

    for (const visit of QN.state.recentVisits) {
      const menu = allMenus.find(m => m.path === visit.path);
      if (!menu) continue;

      let project = null;
      if (visit.pcode && QN.state.projects[visit.pcode]) {
        const p = QN.state.projects[visit.pcode];
        project = {
          pcode: p.pcode,
          name: p.name,
          platform: p.platform,
          productType: p.productType,
          groupName: QN.getProjectGroupName(p.pcode)
        };
      }

      let fullPath;
      if (project) {
        const urlProductType = menu.productType === 'common'
          ? QN.getUrlProductType(project.productType)
          : menu.productType;
        fullPath = '/v2/project/' + urlProductType + '/' + project.pcode + menu.path;
      } else {
        fullPath = menu.fullPath || menu.path;
      }

      result.push({ menu, project, score: 0, fullPath });
    }

    return result;
  };

})(window.WhaTapQN);
