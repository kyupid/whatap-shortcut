// ============================================
// WhaTap Quick Navigation - Main UI & Events
// ============================================

(function(QN) {
  'use strict';

  // 상태 참조 (단축 변수)
  const state = QN.state;

  // Combo search 로컬 상태
  let comboItems = [];   // 현재 표시 중인 combo/menu 항목
  let isAgentMode = false;
  let agentItems = [];

  // 디바운스 타이머
  let searchDebounceTimer = null;
  const SEARCH_DEBOUNCE_MS = 150;

  // ============================================
  // 모달 UI
  // ============================================

  // 새로고침 버튼 쿨다운
  let lastRefreshTime = 0;
  const REFRESH_COOLDOWN = 5000; // 5초

  function createModal() {
    if (state.modal) return;

    state.modal = document.createElement('div');
    state.modal.id = 'whatap-quick-nav-modal';
    state.modal.innerHTML = `
      <div class="whatap-qn-backdrop"></div>
      <div class="whatap-qn-container">
        <div class="whatap-qn-search-wrapper">
          <svg class="whatap-qn-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span class="whatap-qn-prefix-badge" style="display:none"></span>
          <input type="text" class="whatap-qn-input" placeholder="Search menus, projects..." autofocus />
          <kbd class="whatap-qn-kbd">ESC</kbd>
        </div>
        <div class="whatap-qn-results"></div>
        <div class="whatap-qn-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>Enter</kbd> 선택</span>
          <span><kbd>⌘</kbd><kbd>Enter</kbd> 새탭</span>
          <span><kbd>⌘</kbd><kbd>D</kbd> 핀</span>
          <span><kbd>ESC</kbd> 닫기</span>
          <button class="whatap-qn-reset-btn" title="방문 기록 초기화">✕</button>
          <button class="whatap-qn-refresh-btn" title="프로젝트 새로고침">↻</button>
        </div>
      </div>
    `;

    document.body.appendChild(state.modal);

    state.searchInput = state.modal.querySelector('.whatap-qn-input');
    state.resultsList = state.modal.querySelector('.whatap-qn-results');
    const backdrop = state.modal.querySelector('.whatap-qn-backdrop');
    const refreshBtn = state.modal.querySelector('.whatap-qn-refresh-btn');
    const resetBtn = state.modal.querySelector('.whatap-qn-reset-btn');

    state.searchInput.addEventListener('input', handleSearchDebounced);
    state.searchInput.addEventListener('keydown', handleKeydown);
    backdrop.addEventListener('click', hideModal);

    // 초기화 버튼 클릭 핸들러
    resetBtn.addEventListener('click', () => {
      if (!confirm('방문 기록을 모두 초기화하시겠습니까?\n(핀 설정은 유지됩니다)')) return;
      QN.resetAllVisitData();
      state.searchInput.value = '';
      state.selectedIndex = 0;
      renderInitialScreen();
    });

    // 새로고침 버튼 클릭 핸들러
    refreshBtn.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN) return;
      lastRefreshTime = now;

      refreshBtn.classList.add('loading');
      await QN.loadProjects(true); // forceRefresh
      refreshBtn.classList.remove('loading');

      // 현재 뷰 갱신
      handleSearch();
    });
  }

  // ============================================
  // 렌더링
  // ============================================

  // 멀티워드 하이라이트: 각 단어별로 매칭 시도
  function highlightCombo(text, query) {
    if (!query || !text) return QN.escapeHtml(text || '');
    // 전체 쿼리로 먼저 시도
    const full = QN.highlightMatch(text, query);
    if (full.includes('whatap-qn-highlight')) return full;
    // 개별 단어로 시도
    const words = query.trim().split(/\s+/).filter(w => w.length > 0);
    for (const word of words) {
      const result = QN.highlightMatch(text, word);
      if (result.includes('whatap-qn-highlight')) return result;
    }
    return QN.escapeHtml(text);
  }

  // 초기 화면 (검색어 없을 때): PINNED → RECENT → ALL MENUS
  function renderInitialScreen() {
    state.resultsList.innerHTML = '';
    comboItems = [];
    isAgentMode = false;

    const pinned = QN.getPinnedCombos();
    const recent = QN.getRecentCombos();
    const allMenus = QN.getAllMenus();

    // RECENT에서 PINNED와 중복 제거
    const pinnedKeys = new Set(pinned.map(c =>
      c.menu.path + ':' + (c.project ? c.project.pcode : '_')
    ));
    const filteredRecent = recent.filter(c => {
      const key = c.menu.path + ':' + (c.project ? c.project.pcode : '_');
      return !pinnedKeys.has(key);
    });

    // PINNED 섹션
    if (pinned.length > 0) {
      appendSectionHeader('PINNED');
      pinned.forEach(combo => {
        comboItems.push(combo);
        appendComboItem(combo, comboItems.length - 1, '');
      });
    }

    // RECENT 섹션
    if (filteredRecent.length > 0) {
      appendSectionHeader('RECENT');
      filteredRecent.forEach(combo => {
        comboItems.push(combo);
        appendComboItem(combo, comboItems.length - 1, '');
      });
    }

    // ALL MENUS 섹션 (global 메뉴만 표시 - 비global은 검색으로 찾기)
    const remaining = 50 - comboItems.length;
    if (remaining > 0) {
      const shownKeys = new Set(comboItems.map(c =>
        c.menu.path + ':' + (c.project ? c.project.pcode : '_')
      ));

      appendSectionHeader('ALL MENUS');
      let count = 0;
      for (const menu of allMenus) {
        if (count >= remaining) break;
        if (menu.productType !== 'global') continue;

        const key = menu.path + ':_';
        if (shownKeys.has(key)) continue;

        const combo = {
          menu,
          project: null,
          score: 0,
          fullPath: menu.fullPath || menu.path
        };
        comboItems.push(combo);
        appendComboItem(combo, comboItems.length - 1, '');
        count++;
      }
    }

    if (comboItems.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
    }

    scrollToSelected();
  }

  // 콤보 검색 결과 렌더링
  function renderComboResults(combos, query) {
    state.resultsList.innerHTML = '';
    comboItems = combos;
    isAgentMode = false;

    if (combos.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
      return;
    }

    combos.forEach((combo, index) => {
      appendComboItem(combo, index, query);
    });

    scrollToSelected();
  }

  // 섹션 헤더 추가
  function appendSectionHeader(text) {
    const header = document.createElement('div');
    header.className = 'whatap-qn-section-header';
    header.textContent = text;
    state.resultsList.appendChild(header);
  }

  // 콤보 아이템 하나를 DOM에 추가
  function appendComboItem(combo, index, query) {
    const div = document.createElement('div');
    div.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

    // 메뉴 이름 (하이라이트)
    const menuName = query
      ? highlightCombo(combo.menu.name, query)
      : QN.escapeHtml(combo.menu.name);

    // 프로젝트 이름
    const projectName = combo.project
      ? `<span class="whatap-qn-combo-project">${query ? highlightCombo(combo.project.name, query) : QN.escapeHtml(combo.project.name)}</span>`
      : '';

    // 뱃지: productType 또는 GLOBAL
    let badgeText;
    if (combo.project) {
      badgeText = QN.getUrlProductType(combo.project.productType) || combo.project.productType;
    } else if (combo.menu.productType === 'global') {
      badgeText = 'GLOBAL';
    } else {
      badgeText = combo.menu.displayProductType || combo.menu.productType;
    }
    const badge = `<span class="whatap-qn-badge">${QN.escapeHtml((badgeText || '').toUpperCase())}</span>`;

    // 핀 아이콘
    const pinned = QN.isComboPinned(combo.menu.path, combo.project ? combo.project.pcode : null);
    const pinIcon = pinned
      ? '<span class="whatap-qn-pin-icon pinned" title="핀 해제">&#9733;</span>'
      : '';

    // 방문 횟수
    const menuVisits = state.visitCounts[combo.menu.path] || 0;
    const projVisits = combo.project ? (state.projectVisitCounts[combo.project.pcode] || 0) : 0;
    const totalVisits = menuVisits + projVisits;
    const visitBadge = totalVisits > 0
      ? `<span class="whatap-qn-visit-count">${totalVisits}</span>`
      : '';

    div.innerHTML = `
      <div class="whatap-qn-item-content">
        <span class="whatap-qn-item-name">${menuName}</span>
        ${projectName}
      </div>
      <div class="whatap-qn-item-meta">
        ${pinIcon}
        ${visitBadge}
        ${badge}
      </div>
    `;

    div.addEventListener('click', (e) => navigateToCombo(combo, e.metaKey || e.ctrlKey));
    div.addEventListener('mouseenter', () => {
      if (state.isKeyboardNavigation) return;
      if (state.selectedIndex === index) return;
      const prev = state.resultsList.querySelector('.whatap-qn-item.selected');
      if (prev) prev.classList.remove('selected');
      state.selectedIndex = index;
      div.classList.add('selected');
    });
    div.addEventListener('mousemove', () => { state.isKeyboardNavigation = false; });
    state.resultsList.appendChild(div);
  }

  // 에이전트 검색 결과 렌더링
  function renderAgentResults(agents, query) {
    state.resultsList.innerHTML = '';
    agentItems = agents;
    isAgentMode = true;
    comboItems = [];

    if (agents.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
      return;
    }

    agents.slice(0, 50).forEach((agent, index) => {
      const div = document.createElement('div');
      div.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

      const activeIndicator = agent.isActive
        ? '<span class="whatap-qn-agent-active">●</span>'
        : '<span class="whatap-qn-agent-inactive">●</span>';

      div.innerHTML = `
        <div class="whatap-qn-item-content">
          ${activeIndicator}
          <span class="whatap-qn-item-name">${QN.highlightMatch(agent.oname, query)}</span>
          <span class="whatap-qn-item-category">${QN.escapeHtml(agent.projectName)}</span>
        </div>
        <div class="whatap-qn-item-meta">
          <span class="whatap-qn-agent-ip">${QN.highlightMatch(agent.ip || '', query)}</span>
          <span class="whatap-qn-badge">AGENT</span>
        </div>
      `;

      div.addEventListener('click', (e) => navigateToAgent(agent, e.metaKey || e.ctrlKey));
      div.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        if (state.selectedIndex === index) return;
        const prev = state.resultsList.querySelector('.whatap-qn-item.selected');
        if (prev) prev.classList.remove('selected');
        state.selectedIndex = index;
        div.classList.add('selected');
      });
      div.addEventListener('mousemove', () => { state.isKeyboardNavigation = false; });
      state.resultsList.appendChild(div);
    });

    scrollToSelected();
  }

  function scrollToSelected() {
    const selectedItem = state.resultsList.querySelector('.whatap-qn-item.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  // 선택 상태만 업데이트 (전체 리렌더링 없이)
  function updateSelection() {
    const allItems = state.resultsList.querySelectorAll('.whatap-qn-item');
    allItems.forEach((el, idx) => {
      el.classList.toggle('selected', idx === state.selectedIndex);
    });
    scrollToSelected();
  }

  // ============================================
  // 이벤트 핸들러
  // ============================================

  function updatePrefixBadge(prefix) {
    const badge = state.modal.querySelector('.whatap-qn-prefix-badge');
    if (!badge) return;
    if (prefix === 'agent') {
      badge.textContent = 'AGENT';
      badge.className = 'whatap-qn-prefix-badge whatap-qn-prefix-agent';
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  function handleSearchDebounced() {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(handleSearch, SEARCH_DEBOUNCE_MS);
  }

  function handleSearch() {
    state.selectedIndex = 0;
    const rawInput = state.searchInput.value.trim();
    const { prefix, query } = QN.parseQuery(rawInput);

    updatePrefixBadge(prefix);

    if (prefix === 'agent') {
      // 에이전트 검색
      const items = QN.getAgentItems();
      const filtered = query ? QN.fuzzySearch(query, items) : items;
      renderAgentResults(filtered, query);
    } else if (!query) {
      // 검색어 없음 → 초기 화면
      renderInitialScreen();
    } else {
      // 콤보 검색
      const combos = QN.comboSearch(query);
      renderComboResults(combos, query);
    }
  }

  function handleKeydown(e) {
    // 한글 IME 조합 중이면 무시
    if (e.isComposing || e.keyCode === 229) return;

    // Cmd+D / Ctrl+D: 핀 토글
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      if (!isAgentMode && comboItems[state.selectedIndex]) {
        const combo = comboItems[state.selectedIndex];
        QN.togglePinCombo(combo.menu.path, combo.project ? combo.project.pcode : null);
        // 목록 재렌더링
        handleSearch();
      }
      return;
    }

    const items = isAgentMode ? agentItems : comboItems;
    const maxIndex = items.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        state.isKeyboardNavigation = true;
        state.selectedIndex = Math.min(state.selectedIndex + 1, maxIndex);
        updateSelection();
        break;

      case 'ArrowUp':
        e.preventDefault();
        state.isKeyboardNavigation = true;
        state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
        updateSelection();
        break;

      case 'Enter':
        e.preventDefault();
        const openInNewTab = e.metaKey || e.ctrlKey;
        if (isAgentMode) {
          if (agentItems[state.selectedIndex]) {
            navigateToAgent(agentItems[state.selectedIndex], openInNewTab);
          }
        } else {
          if (comboItems[state.selectedIndex]) {
            navigateToCombo(comboItems[state.selectedIndex], openInNewTab);
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        e.stopPropagation(); // 글로벌 핸들러 중복 방지
        if (state.searchInput.value.length > 0) {
          state.searchInput.value = '';
          handleSearch();
        } else {
          hideModal();
        }
        break;
    }
  }

  // ============================================
  // 네비게이션
  // ============================================

  function navigateToCombo(combo, openInNewTab = false) {
    // 방문 기록 저장
    QN.saveVisitCount(combo.menu.path);
    if (combo.project) {
      QN.saveProjectVisitCount(combo.project.pcode);
    }
    QN.saveRecentVisit(combo.menu.path, 'menu', combo.project ? combo.project.pcode : null);

    if (openInNewTab) {
      window.open(combo.fullPath, '_blank');
    } else {
      window.location.href = combo.fullPath;
      hideModal();
    }
  }

  function navigateToAgent(agent, openInNewTab = false) {
    const urlProductType = QN.getUrlProductType(agent.productType);
    if (!urlProductType) return;
    const fullPath = `/v2/project/${urlProductType}/${agent.pcode}/dashboard`;
    QN.saveVisitCount('/dashboard');
    QN.saveProjectVisitCount(agent.pcode);
    QN.saveRecentVisit('/dashboard', 'menu', agent.pcode);

    if (openInNewTab) {
      window.open(fullPath, '_blank');
    } else {
      window.location.href = fullPath;
      hideModal();
    }
  }

  // ============================================
  // 모달 표시/숨기기
  // ============================================

  function detectTheme() {
    const bg = getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? 'light' : 'dark';
    }
    return 'dark';
  }

  function showModal() {
    createModal();
    state.modal.classList.toggle('whatap-qn-light', detectTheme() === 'light');
    state.modal.classList.add('visible');
    state.searchInput.value = '';
    state.searchInput.placeholder = 'Search menus, projects...';
    updatePrefixBadge(null);
    state.selectedIndex = 0;
    renderInitialScreen();
    state.searchInput.focus();
  }

  function hideModal() {
    if (state.modal) {
      state.modal.classList.remove('visible');
    }
  }

  // ============================================
  // 초기화
  // ============================================

  // 모니터링 서비스가 아닌 서브도메인에서는 실행 안 함
  const EXCLUDED_SUBDOMAINS = ['jenkins', 'docs', 'guide', 'api', 'status', 'blog', 'www'];
  const subdomain = window.location.hostname.split('.')[0];

  if (EXCLUDED_SUBDOMAINS.includes(subdomain)) {
    return; // 조용히 종료
  }

  // OAuth 콜백 등 인증 관련 페이지에서는 실행 안 함
  const pathname = window.location.pathname;
  if (pathname.startsWith('/oauth2/') || pathname.startsWith('/sso/') || pathname.startsWith('/login')) {
    return;
  }

  // interceptor.js를 페이지 컨텍스트에 주입 (fetch 감싸기)
  const interceptorScript = document.createElement('script');
  interceptorScript.src = chrome.runtime.getURL('interceptor.js');
  interceptorScript.addEventListener('load', () => interceptorScript.remove());
  (document.head || document.documentElement).appendChild(interceptorScript);

  // 전역 키보드 이벤트
  document.addEventListener('keydown', (e) => {
    // Cmd+K / Ctrl+K (e.code로 물리적 키 위치 확인 - 한/영, Caps Lock 무관)
    if ((e.metaKey || e.ctrlKey) && e.code === 'KeyK') {
      e.preventDefault();
      if (state.modal && state.modal.classList.contains('visible')) {
        hideModal();
      } else {
        showModal();
      }
    }
    // ESC 키 처리 (폴백: input이 포커스되지 않은 경우)
    if (e.key === 'Escape' && state.modal && state.modal.classList.contains('visible')) {
      e.preventDefault();
      e.stopPropagation();

      if (state.searchInput && state.searchInput.value.length > 0) {
        state.searchInput.value = '';
        handleSearch();
      } else {
        hideModal();
      }
    }
  });

  // 초기 로드
  QN.loadVisitCounts();
  QN.loadProjectVisitCounts();
  QN.loadRecentVisits();
  QN.loadPinnedCombos();
  QN.loadAgents();
  QN.applyVisitDecay();
  QN.loadProjects().then(() => {
    QN.cleanupDeletedProjects();
  });

  console.log('WhaTap Quick Navigation loaded. Press Cmd+K (Mac) or Ctrl+K (Windows) to open.');

})(window.WhaTapQN);
