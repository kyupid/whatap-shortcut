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
    projectVisitCounts: {}
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

  // ============================================
  // 프로젝트 관련 함수
  // ============================================

  // 현재 URL에서 프로젝트 pcode 추출
  QN.getCurrentProjectPcode = function() {
    const match = window.location.pathname.match(/\/v2\/project\/[^/]+\/(\d+)/);
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

        // localStorage 저장 (타임스탬프 포함)
        try {
          localStorage.setItem('whatap_qn_projects', JSON.stringify({
            data: QN.state.projects,
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
          productType: project.productType
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
        productType: project.productType
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

    // 빈도 기반 정렬
    allMenus.sort((a, b) => {
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

  // 퍼지 검색 (메뉴 + 프로젝트 통합)
  QN.fuzzySearch = function(query, items) {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    const isNumericQuery = /^\d+$/.test(query); // 숫자만 입력된 경우

    const scored = items.map(item => {
      let score = 0;

      if (item.itemType === 'project') {
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

    // 검색어 없을 때만 빈도순 정렬 (퍼지 검색 시 스코어 순 유지)
    if (!query) {
      otherProjects.sort((a, b) => {
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
    const escaped = QN.escapeHtml(text);
    const escapedQuery = QN.escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="whatap-qn-highlight">$1</span>');
  };

  // HTML 이스케이프
  QN.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

})(window.WhaTapQN);
