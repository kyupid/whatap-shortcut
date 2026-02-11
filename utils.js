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
    filteredItems: [],
    projects: {},
    currentStep: 'menu', // 'menu' | 'project' | 'menu_for_project'
    selectedMenu: null,
    selectedProject: null,
    visitCounts: {},
    projectVisitCounts: {},
    recentVisits: [], // [{ path, timestamp, type: 'menu'|'project', pcode? }]
    pinnedMenus: [],   // [path, ...]
    pinnedProjects: [], // [pcode, ...]
    groups: {},         // { gcode: { name, projectCodes: [pcode, ...] } }
    agents: {}          // { pcode: [{ oid, oname, ip, isActive, alias, initial }] }
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

    // pinnedProjects에서 존재하지 않는 pcode 제거
    const beforePinned = QN.state.pinnedProjects.length;
    QN.state.pinnedProjects = QN.state.pinnedProjects.filter(p => validPcodes.has(p));
    if (QN.state.pinnedProjects.length !== beforePinned) {
      try {
        localStorage.setItem('whatap_qn_pinned_projects', JSON.stringify(QN.state.pinnedProjects));
      } catch (e) {}
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

  // 즐겨찾기(핀) 로드
  QN.loadPinned = function() {
    try {
      const menus = localStorage.getItem('whatap_qn_pinned_menus');
      if (menus) QN.state.pinnedMenus = JSON.parse(menus);
      const projects = localStorage.getItem('whatap_qn_pinned_projects');
      if (projects) QN.state.pinnedProjects = JSON.parse(projects);
    } catch (e) {}
  };

  // 메뉴 핀 토글
  QN.togglePinMenu = function(path) {
    const idx = QN.state.pinnedMenus.indexOf(path);
    if (idx >= 0) {
      QN.state.pinnedMenus.splice(idx, 1);
    } else {
      QN.state.pinnedMenus.push(path);
    }
    try {
      localStorage.setItem('whatap_qn_pinned_menus', JSON.stringify(QN.state.pinnedMenus));
    } catch (e) {}
  };

  // 프로젝트 핀 토글
  QN.togglePinProject = function(pcode) {
    const pcodeStr = String(pcode);
    const idx = QN.state.pinnedProjects.indexOf(pcodeStr);
    if (idx >= 0) {
      QN.state.pinnedProjects.splice(idx, 1);
    } else {
      QN.state.pinnedProjects.push(pcodeStr);
    }
    try {
      localStorage.setItem('whatap_qn_pinned_projects', JSON.stringify(QN.state.pinnedProjects));
    } catch (e) {}
  };

  QN.isMenuPinned = function(path) {
    return QN.state.pinnedMenus.includes(path);
  };

  QN.isProjectPinned = function(pcode) {
    return QN.state.pinnedProjects.includes(String(pcode));
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
    const match = input.match(/^([amp]):(.*)$/);
    if (match) {
      const prefixMap = { a: 'agent', m: 'menu', p: 'project' };
      return { prefix: prefixMap[match[1]], query: match[2].trim() };
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

  // 최근 방문 메뉴 항목 조합 (표시용)
  QN.getRecentMenuItems = function() {
    const allMenus = QN.getAllMenus();
    const result = [];

    for (const visit of QN.state.recentVisits) {
      const menu = allMenus.find(m => m.path === visit.path);
      if (!menu) continue;

      const item = { ...menu, itemType: 'menu' };

      // 프로젝트 정보 추가
      if (visit.pcode && QN.state.projects[visit.pcode]) {
        const project = QN.state.projects[visit.pcode];
        item.projectName = project.name;
        const urlProductType = menu.productType === 'common'
          ? QN.getUrlProductType(project.productType)
          : menu.productType;
        item.fullPath = `/v2/project/${urlProductType}/${visit.pcode}${menu.path}`;
      } else if (menu.productType === 'global') {
        item.fullPath = menu.fullPath || menu.path;
      }

      result.push(item);
    }

    return result;
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
      const data = await response.json();
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

  // 모든 메뉴 가져오기 (빈도 기반 정렬, 중복 제거)
  QN.getAllMenus = function() {
    const allMenus = [];
    const seenPaths = new Set(); // path 기준 중복 제거용

    // Global 메뉴
    QN.GLOBAL_MENUS.forEach(menu => {
      if (!seenPaths.has(menu.path)) {
        seenPaths.add(menu.path);
        allMenus.push({
          ...menu,
          productType: 'global',
          fullPath: menu.path
        });
      }
    });

    // 공통 메뉴 (모든 프로젝트에서 사용 가능) - 중복 시 공통으로 표시
    QN.COMMON_MENUS.forEach(menu => {
      if (!seenPaths.has(menu.path)) {
        seenPaths.add(menu.path);
        allMenus.push({
          ...menu,
          productType: 'common',
          displayProductType: '공통'
        });
      }
    });

    // 제품별 메뉴 (중복 path는 건너뜀)
    for (const [productType, menus] of Object.entries(QN.PRODUCT_MENUS)) {
      menus.forEach(menu => {
        if (!seenPaths.has(menu.path)) {
          seenPaths.add(menu.path);
          allMenus.push({
            ...menu,
            productType,
            displayProductType: productType.toUpperCase()
          });
        }
      });
    }

    // 핀 → 컨텍스트 → 빈도 기반 정렬
    const currentUrlProductType = QN.getCurrentProductType();
    allMenus.sort((a, b) => {
      // 핀된 메뉴 최우선
      const aPinned = QN.isMenuPinned(a.path) ? 1 : 0;
      const bPinned = QN.isMenuPinned(b.path) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

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

  // 모든 항목 (메뉴 + 프로젝트) 가져오기
  QN.getAllItems = function() {
    const allItems = [];

    // 메뉴 추가
    QN.getAllMenus().forEach(menu => {
      allItems.push({
        ...menu,
        itemType: 'menu'
      });
    });

    // 프로젝트 추가
    for (const [pcode, project] of Object.entries(QN.state.projects)) {
      allItems.push({
        itemType: 'project',
        pcode: project.pcode,
        name: project.name,
        platform: project.platform,
        productType: project.productType
      });
    }

    return allItems;
  };

  // 특정 productType의 메뉴 가져오기
  QN.getMenusForProductType = function(productType) {
    const urlType = QN.getUrlProductType(productType);
    if (!urlType) return [];

    const menus = QN.PRODUCT_MENUS[urlType] || [];
    const result = menus.map(menu => ({
      ...menu,
      productType: urlType,
      displayProductType: urlType.toUpperCase(),
      itemType: 'menu'
    }));

    // 공통 메뉴 추가
    QN.COMMON_MENUS.forEach(menu => {
      result.push({
        ...menu,
        productType: 'common',
        displayProductType: '공통',
        itemType: 'menu'
      });
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
        // 숫자 검색 시 프로젝트 우선
        if (isNumericQuery) score += 100;
        // 프로젝트 검색
        const name = item.name.toLowerCase();
        const pcode = String(item.pcode);
        const platform = (item.platform || '').toLowerCase();
        const productType = (item.productType || '').toLowerCase();

        // pcode 매칭 (Tier 1: Exact match)
        if (pcode === lowerQuery) score += 1000;
        else if (pcode.startsWith(lowerQuery)) score += 500;
        else if (pcode.includes(lowerQuery)) score += 200;

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
        // 핀된 프로젝트 우선
        const aPinned = QN.isProjectPinned(a.pcode) ? 1 : 0;
        const bPinned = QN.isProjectPinned(b.pcode) ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
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

})(window.WhaTapQN);
