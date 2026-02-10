// ============================================
// WhaTap Quick Navigation - Main UI & Events
// ============================================

(function(QN) {
  'use strict';

  // 상태 참조 (단축 변수)
  const state = QN.state;

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
        <div class="whatap-qn-header">
          <span class="whatap-qn-breadcrumb"></span>
        </div>
        <div class="whatap-qn-search-wrapper">
          <svg class="whatap-qn-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" class="whatap-qn-input" placeholder="메뉴 검색... (↑↓ 이동, Enter 선택)" autofocus />
          <kbd class="whatap-qn-kbd">ESC</kbd>
        </div>
        <div class="whatap-qn-results"></div>
        <div class="whatap-qn-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>Enter</kbd> 선택</span>
          <span><kbd>⌘</kbd><kbd>Enter</kbd> 새탭</span>
          <span><kbd>⌘</kbd><kbd>D</kbd> 핀</span>
          <span><kbd>Backspace</kbd> 뒤로</span>
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

    state.searchInput.addEventListener('input', handleSearch);
    state.searchInput.addEventListener('keydown', handleKeydown);
    backdrop.addEventListener('click', hideModal);

    // 초기화 버튼 클릭 핸들러
    resetBtn.addEventListener('click', () => {
      if (!confirm('방문 기록을 모두 초기화하시겠습니까?\n(핀 설정은 유지됩니다)')) return;
      QN.resetAllVisitData();
      // 현재 단계에 따라 목록 갱신
      if (state.currentStep === 'menu') {
        state.filteredItems = QN.getAllItems();
        renderItemResults();
      } else if (state.currentStep === 'project') {
        renderProjectResults(QN.getProjectListForMenu(state.selectedMenu));
      } else if (state.currentStep === 'menu_for_project') {
        renderMenusForProject();
      }
    });

    // 새로고침 버튼 클릭 핸들러
    refreshBtn.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN) {
        return; // 쿨다운 중
      }
      lastRefreshTime = now;

      refreshBtn.classList.add('loading');
      await QN.loadProjects(true); // forceRefresh
      refreshBtn.classList.remove('loading');

      // 현재 단계에 따라 목록 갱신
      if (state.currentStep === 'menu') {
        state.filteredItems = QN.getAllItems();
        renderItemResults();
      } else if (state.currentStep === 'project') {
        renderProjectResults(QN.getProjectListForMenu(state.selectedMenu));
      } else if (state.currentStep === 'menu_for_project') {
        renderMenusForProject();
      }
    });
  }

  function updateBreadcrumb() {
    const breadcrumb = state.modal.querySelector('.whatap-qn-breadcrumb');
    if (state.currentStep === 'menu') {
      breadcrumb.textContent = '';
    } else if (state.currentStep === 'project' && state.selectedMenu) {
      breadcrumb.innerHTML = `<span class="whatap-qn-crumb">${state.selectedMenu.name}</span> → 프로젝트 선택`;
    } else if (state.currentStep === 'menu_for_project' && state.selectedProject) {
      breadcrumb.innerHTML = `<span class="whatap-qn-crumb">${state.selectedProject.name}</span> → 메뉴 선택`;
    }
  }

  // 첫 단계: 메뉴 + 프로젝트 통합 렌더링
  function renderItemResults() {
    state.resultsList.innerHTML = '';

    if (state.filteredItems.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
      return;
    }

    const currentMenuPath = QN.getCurrentMenuPath();
    const query = state.searchInput ? state.searchInput.value.trim() : '';

    // 검색어 없을 때 최근 방문 섹션 표시
    if (!query && state.recentVisits && state.recentVisits.length > 0) {
      const header = document.createElement('div');
      header.className = 'whatap-qn-section-header';
      header.textContent = '최근 방문';
      state.resultsList.appendChild(header);

      const recentMenus = QN.getRecentMenuItems();
      recentMenus.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

        const productBadge = item.productType && item.productType !== 'global'
          ? `<span class="whatap-qn-badge">${item.displayProductType || item.productType.toUpperCase()}</span>`
          : '';

        const projectInfo = item.projectName
          ? `<span class="whatap-qn-item-category">${QN.escapeHtml(item.projectName)}</span>`
          : '';

        div.innerHTML = `
          <div class="whatap-qn-item-content">
            <span class="whatap-qn-item-name">${QN.escapeHtml(item.name)}</span>
            ${projectInfo}
          </div>
          <div class="whatap-qn-item-meta">
            <span class="whatap-qn-recent-badge">최근</span>
            ${productBadge}
          </div>
        `;
        div.addEventListener('click', () => {
          if (item.fullPath) {
            window.location.href = item.fullPath;
            hideModal();
          } else if (item.itemType === 'menu') {
            selectMenu(item);
          }
        });
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

      // 전체 메뉴 섹션 헤더
      const allHeader = document.createElement('div');
      allHeader.className = 'whatap-qn-section-header';
      allHeader.textContent = '전체 메뉴';
      state.resultsList.appendChild(allHeader);
    }

    state.filteredItems.slice(0, 50).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

      if (item.itemType === 'project') {
        // 프로젝트 렌더링
        const visitCount = state.projectVisitCounts[item.pcode] || 0;
        const visitBadge = visitCount > 0
          ? `<span class="whatap-qn-visit-count">${visitCount}</span>`
          : '';
        const pinIcon = QN.isProjectPinned(item.pcode) ? '<span class="whatap-qn-pin-icon pinned" title="핀 해제">&#9733;</span>' : '';

        div.innerHTML = `
          <div class="whatap-qn-item-content">
            <span class="whatap-qn-item-icon">📁</span>
            <span class="whatap-qn-item-name">${QN.highlightMatch(item.name, query)}</span>
            <span class="whatap-qn-item-category">${QN.highlightMatch(item.platform || item.productType, query)}</span>
          </div>
          <div class="whatap-qn-item-meta">
            ${pinIcon}
            ${visitBadge}
            <span class="whatap-qn-pcode">#${item.pcode}</span>
          </div>
        `;
        div.addEventListener('click', (e) => selectProjectFirst(item));
      } else {
        // 메뉴 렌더링
        const isCurrentMenu = item.path === currentMenuPath || item.fullPath === currentMenuPath;
        const currentPageBadge = isCurrentMenu
          ? '<span class="whatap-qn-current-badge">현재 페이지</span>'
          : '';

        const productBadge = item.productType !== 'global'
          ? `<span class="whatap-qn-badge">${item.displayProductType || item.productType.toUpperCase()}</span>`
          : '';

        const visitBadge = state.visitCounts[item.path]
          ? `<span class="whatap-qn-visit-count">${state.visitCounts[item.path]}</span>`
          : '';
        const pinIcon = QN.isMenuPinned(item.path) ? '<span class="whatap-qn-pin-icon pinned" title="핀 해제">&#9733;</span>' : '';

        div.innerHTML = `
          <div class="whatap-qn-item-content">
            <span class="whatap-qn-item-name">${QN.highlightMatch(item.name, query)}</span>
            <span class="whatap-qn-item-category">${QN.highlightMatch(item.category || '', query)}</span>
          </div>
          <div class="whatap-qn-item-meta">
            ${pinIcon}
            ${currentPageBadge}
            ${visitBadge}
            ${productBadge}
          </div>
        `;
        div.addEventListener('click', (e) => selectMenu(item, e.metaKey || e.ctrlKey));
      }

      div.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        if (state.selectedIndex === index) return;
        // 기존 선택 해제
        const prev = state.resultsList.querySelector('.whatap-qn-item.selected');
        if (prev) prev.classList.remove('selected');
        // 새 항목 선택
        state.selectedIndex = index;
        div.classList.add('selected');
      });
      div.addEventListener('mousemove', () => {
        state.isKeyboardNavigation = false;
      });
      state.resultsList.appendChild(div);
    });

    scrollToSelected();
  }

  // 프로젝트 먼저 선택 후 메뉴 렌더링
  function renderMenusForProject() {
    state.resultsList.innerHTML = '';

    const menus = QN.getMenusForProductType(state.selectedProject.productType);
    const query = state.searchInput.value.trim();
    const filtered = query ? QN.fuzzySearch(query, menus) : menus;

    if (filtered.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
      return;
    }

    const currentMenuPath = QN.getCurrentMenuPath();

    filtered.slice(0, 50).forEach((menu, index) => {
      const div = document.createElement('div');
      div.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

      const isCurrentMenu = menu.path === currentMenuPath;
      const currentPageBadge = isCurrentMenu
        ? '<span class="whatap-qn-current-badge">현재 페이지</span>'
        : '';

      const productBadge = menu.productType !== 'global'
        ? `<span class="whatap-qn-badge">${menu.displayProductType || menu.productType.toUpperCase()}</span>`
        : '';

      const visitBadge = state.visitCounts[menu.path]
        ? `<span class="whatap-qn-visit-count">${state.visitCounts[menu.path]}</span>`
        : '';

      div.innerHTML = `
        <div class="whatap-qn-item-content">
          <span class="whatap-qn-item-name">${QN.highlightMatch(menu.name, query)}</span>
          <span class="whatap-qn-item-category">${QN.highlightMatch(menu.category || '', query)}</span>
        </div>
        <div class="whatap-qn-item-meta">
          ${currentPageBadge}
          ${visitBadge}
          ${productBadge}
        </div>
      `;
      div.addEventListener('click', (e) => navigateFromProject(menu, e.metaKey || e.ctrlKey));
      div.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        if (state.selectedIndex === index) return;
        // 기존 선택 해제
        const prev = state.resultsList.querySelector('.whatap-qn-item.selected');
        if (prev) prev.classList.remove('selected');
        // 새 항목 선택
        state.selectedIndex = index;
        div.classList.add('selected');
      });
      div.addEventListener('mousemove', () => {
        state.isKeyboardNavigation = false;
      });
      state.resultsList.appendChild(div);
    });

    scrollToSelected();
  }

  function renderProjectResults(projectList) {
    state.resultsList.innerHTML = '';

    if (projectList.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">접근 가능한 프로젝트가 없습니다</div>';
      return;
    }

    const query = state.searchInput.value.trim();
    const finalList = QN.filterAndSortProjects(projectList, query);

    if (finalList.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
      return;
    }

    const currentPcode = QN.getCurrentProjectPcode();
    let lastGroupName = null;

    finalList.forEach((project, index) => {
      // 검색어 없을 때 그룹 헤더 표시
      if (!query && project.groupName !== lastGroupName) {
        lastGroupName = project.groupName;
        const header = document.createElement('div');
        header.className = 'whatap-qn-section-header';
        header.textContent = project.groupName || '미분류';
        state.resultsList.appendChild(header);
      }

      const item = document.createElement('div');
      item.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

      const isCurrentProject = currentPcode && String(project.pcode) === currentPcode;
      const visitCount = state.projectVisitCounts[project.pcode] || 0;
      const visitBadge = visitCount > 0
        ? `<span class="whatap-qn-visit-count">${visitCount}</span>`
        : '';
      const currentBadge = isCurrentProject
        ? '<span class="whatap-qn-current-badge">현재 프로젝트</span>'
        : '';
      const pinIcon = QN.isProjectPinned(project.pcode) ? '<span class="whatap-qn-pin-icon pinned" title="핀 해제">&#9733;</span>' : '';
      const groupBadge = query && project.groupName
        ? `<span class="whatap-qn-item-category">${QN.escapeHtml(project.groupName)}</span>`
        : '';

      item.innerHTML = `
        <div class="whatap-qn-item-content">
          <span class="whatap-qn-item-name">${QN.highlightMatch(project.name, query)}</span>
          <span class="whatap-qn-item-category">${QN.highlightMatch(project.platform || project.productType, query)}</span>
          ${groupBadge}
        </div>
        <div class="whatap-qn-item-meta">
          ${pinIcon}
          ${currentBadge}
          ${visitBadge}
          <span class="whatap-qn-pcode">#${project.pcode}</span>
        </div>
      `;
      item.addEventListener('click', (e) => navigateToProject(project, e.metaKey || e.ctrlKey));
      item.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        if (state.selectedIndex === index) return;
        const prev = state.resultsList.querySelector('.whatap-qn-item.selected');
        if (prev) prev.classList.remove('selected');
        state.selectedIndex = index;
        item.classList.add('selected');
      });
      item.addEventListener('mousemove', () => {
        state.isKeyboardNavigation = false;
      });
      state.resultsList.appendChild(item);
    });

    scrollToSelected();
  }

  function scrollToSelected() {
    const selectedItem = state.resultsList.querySelector('.whatap-qn-item.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  // ============================================
  // 이벤트 핸들러
  // ============================================

  function handleSearch() {
    state.selectedIndex = 0;

    if (state.currentStep === 'menu') {
      const query = state.searchInput.value.trim();
      state.filteredItems = QN.fuzzySearch(query, QN.getAllItems());
      renderItemResults();
    } else if (state.currentStep === 'project') {
      const projectList = QN.getProjectListForMenu(state.selectedMenu);
      renderProjectResults(projectList);
    } else if (state.currentStep === 'menu_for_project') {
      renderMenusForProject();
    }
  }

  function handleKeydown(e) {
    // 한글 IME 조합 중이면 무시 (한글 입력 버그 방지)
    if (e.isComposing || e.keyCode === 229) return;

    // Cmd+D / Ctrl+D: 핀 토글
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      if (state.currentStep === 'menu' && state.filteredItems[state.selectedIndex]) {
        const item = state.filteredItems[state.selectedIndex];
        if (item.itemType === 'project') {
          QN.togglePinProject(item.pcode);
        } else {
          QN.togglePinMenu(item.path);
        }
        // 목록 재정렬 후 리렌더링
        state.filteredItems = QN.fuzzySearch(state.searchInput.value.trim(), QN.getAllItems());
        renderItemResults();
      } else if (state.currentStep === 'project') {
        const projectList = QN.getProjectListForMenu(state.selectedMenu);
        const query = state.searchInput.value.trim();
        const finalList = QN.filterAndSortProjects(projectList, query);
        if (finalList[state.selectedIndex]) {
          QN.togglePinProject(finalList[state.selectedIndex].pcode);
          renderProjectResults(projectList);
        }
      }
      return;
    }

    let maxIndex = 0;
    if (state.currentStep === 'menu') {
      maxIndex = Math.min(state.filteredItems.length, 50) - 1;
    } else if (state.currentStep === 'project') {
      const projectQuery = state.searchInput.value.trim();
      const projectFinalList = QN.filterAndSortProjects(QN.getProjectListForMenu(state.selectedMenu), projectQuery);
      maxIndex = projectFinalList.length - 1;
    } else if (state.currentStep === 'menu_for_project') {
      const menus = QN.getMenusForProductType(state.selectedProject.productType);
      const query = state.searchInput.value.trim();
      const filtered = query ? QN.fuzzySearch(query, menus) : menus;
      maxIndex = Math.min(filtered.length, 50) - 1;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        state.isKeyboardNavigation = true;
        state.selectedIndex = Math.min(state.selectedIndex + 1, maxIndex);
        if (state.currentStep === 'menu') {
          renderItemResults();
        } else if (state.currentStep === 'project') {
          renderProjectResults(QN.getProjectListForMenu(state.selectedMenu));
        } else if (state.currentStep === 'menu_for_project') {
          renderMenusForProject();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        state.isKeyboardNavigation = true;
        state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
        if (state.currentStep === 'menu') {
          renderItemResults();
        } else if (state.currentStep === 'project') {
          renderProjectResults(QN.getProjectListForMenu(state.selectedMenu));
        } else if (state.currentStep === 'menu_for_project') {
          renderMenusForProject();
        }
        break;

      case 'Enter':
        e.preventDefault();
        const openInNewTab = e.metaKey || e.ctrlKey; // Cmd+Enter / Ctrl+Enter

        if (state.currentStep === 'menu' && state.filteredItems[state.selectedIndex]) {
          const item = state.filteredItems[state.selectedIndex];
          if (item.itemType === 'project') {
            selectProjectFirst(item);
          } else {
            selectMenu(item, openInNewTab);
          }
        } else if (state.currentStep === 'project') {
          const projectList = QN.getProjectListForMenu(state.selectedMenu);
          const query = state.searchInput.value.trim();
          const finalList = QN.filterAndSortProjects(projectList, query);
          if (finalList[state.selectedIndex]) {
            navigateToProject(finalList[state.selectedIndex], openInNewTab);
          }
        } else if (state.currentStep === 'menu_for_project') {
          const menus = QN.getMenusForProductType(state.selectedProject.productType);
          const query = state.searchInput.value.trim();
          const filtered = query ? QN.fuzzySearch(query, menus) : menus;
          if (filtered[state.selectedIndex]) {
            navigateFromProject(filtered[state.selectedIndex], openInNewTab);
          }
        }
        break;

      case 'Backspace':
        if (state.searchInput.value === '' && (state.currentStep === 'project' || state.currentStep === 'menu_for_project')) {
          e.preventDefault();
          goBackToMenuStep();
        }
        break;

      case 'Escape':
        e.preventDefault();
        // 검색어가 있으면 지우기만
        if (state.searchInput.value.length > 0) {
          state.searchInput.value = '';
          handleSearch();
        }
        // 프로젝트/메뉴 선택 단계면 첫 단계로 돌아가기
        else if (state.currentStep === 'project' || state.currentStep === 'menu_for_project') {
          goBackToMenuStep();
        }
        // 검색어 없고 첫 단계면 닫기
        else {
          hideModal();
        }
        break;
    }
  }

  function selectMenu(menu, openInNewTab = false) {
    if (menu.productType === 'global') {
      // Global 메뉴는 바로 이동
      QN.saveVisitCount(menu.path);
      QN.saveRecentVisit(menu.path, 'menu');
      const fullPath = menu.fullPath || menu.path;
      if (openInNewTab) {
        window.open(fullPath, '_blank');
      } else {
        window.location.href = fullPath;
        hideModal();
      }
    } else {
      // 프로젝트 선택 단계로 이동
      state.selectedMenu = menu;
      state.currentStep = 'project';
      state.selectedIndex = 0;
      state.searchInput.value = '';
      state.searchInput.placeholder = '프로젝트 검색...';
      updateBreadcrumb();
      renderProjectResults(QN.getProjectListForMenu(menu));
      state.searchInput.focus();
    }
  }

  // 프로젝트 먼저 선택 (첫 단계에서)
  function selectProjectFirst(project) {
    state.selectedProject = project;
    state.currentStep = 'menu_for_project';
    state.selectedIndex = 0;
    state.searchInput.value = '';
    state.searchInput.placeholder = '메뉴 검색...';
    updateBreadcrumb();
    renderMenusForProject();
    state.searchInput.focus();
  }

  function navigateToProject(project, openInNewTab = false) {
    // 공통 메뉴면 프로젝트의 productType 사용, 아니면 메뉴의 productType 사용
    const urlProductType = state.selectedMenu.productType === 'common'
      ? QN.getUrlProductType(project.productType)
      : state.selectedMenu.productType;
    const fullPath = `/v2/project/${urlProductType}/${project.pcode}${state.selectedMenu.path}`;
    QN.saveVisitCount(state.selectedMenu.path);
    QN.saveProjectVisitCount(project.pcode);
    QN.saveRecentVisit(state.selectedMenu.path, 'menu', project.pcode);

    if (openInNewTab) {
      window.open(fullPath, '_blank');
    } else {
      window.location.href = fullPath;
      hideModal();
    }
  }

  // 프로젝트 먼저 선택 후 메뉴 선택 → 이동
  function navigateFromProject(menu, openInNewTab = false) {
    // 공통 메뉴면 프로젝트의 productType 사용
    const urlProductType = menu.productType === 'common'
      ? QN.getUrlProductType(state.selectedProject.productType)
      : menu.productType;
    const fullPath = `/v2/project/${urlProductType}/${state.selectedProject.pcode}${menu.path}`;
    QN.saveVisitCount(menu.path);
    QN.saveProjectVisitCount(state.selectedProject.pcode);
    QN.saveRecentVisit(menu.path, 'menu', state.selectedProject.pcode);

    if (openInNewTab) {
      window.open(fullPath, '_blank');
    } else {
      window.location.href = fullPath;
      hideModal();
    }
  }

  function goBackToMenuStep() {
    state.currentStep = 'menu';
    state.selectedMenu = null;
    state.selectedProject = null;
    state.selectedIndex = 0;
    state.searchInput.value = '';
    state.searchInput.placeholder = '메뉴 또는 프로젝트 검색...';
    updateBreadcrumb();
    state.filteredItems = QN.getAllItems();
    renderItemResults();
    state.searchInput.focus();
  }

  // ============================================
  // 모달 표시/숨기기
  // ============================================

  function showModal() {
    createModal();
    state.modal.classList.add('visible');
    state.currentStep = 'menu';
    state.selectedMenu = null;
    state.selectedProject = null;
    state.searchInput.value = '';
    state.searchInput.placeholder = '메뉴 또는 프로젝트 검색...';
    updateBreadcrumb();
    state.filteredItems = QN.getAllItems();
    state.selectedIndex = 0;
    renderItemResults();
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
    // ESC 키 처리
    if (e.key === 'Escape' && state.modal && state.modal.classList.contains('visible')) {
      e.preventDefault();
      e.stopPropagation();

      // 검색어가 있으면 지우기만 (1번째 ESC)
      if (state.searchInput && state.searchInput.value.length > 0) {
        state.searchInput.value = '';
        handleSearch();
      }
      // 프로젝트/메뉴 선택 단계면 첫 단계로 돌아가기
      else if (state.currentStep === 'project' || state.currentStep === 'menu_for_project') {
        goBackToMenuStep();
      }
      // 검색어 없고 첫 단계면 모달 닫기 (2번째 ESC)
      else {
        hideModal();
      }
    }
  });

  // 초기 로드
  QN.loadVisitCounts();
  QN.loadProjectVisitCounts();
  QN.loadRecentVisits();
  QN.loadPinned();
  QN.applyVisitDecay();
  QN.loadProjects().then(() => {
    QN.cleanupDeletedProjects();
  });

  console.log('WhaTap Quick Navigation loaded. Press Cmd+K (Mac) or Ctrl+K (Windows) to open.');

})(window.WhaTapQN);
