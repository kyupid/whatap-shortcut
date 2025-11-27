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
          <span><kbd>Backspace</kbd> 뒤로</span>
          <span><kbd>ESC</kbd> 닫기</span>
        </div>
      </div>
    `;

    document.body.appendChild(state.modal);

    state.searchInput = state.modal.querySelector('.whatap-qn-input');
    state.resultsList = state.modal.querySelector('.whatap-qn-results');
    const backdrop = state.modal.querySelector('.whatap-qn-backdrop');

    state.searchInput.addEventListener('input', handleSearch);
    state.searchInput.addEventListener('keydown', handleKeydown);
    backdrop.addEventListener('click', hideModal);
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

    state.filteredItems.slice(0, 50).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

      if (item.itemType === 'project') {
        // 프로젝트 렌더링
        const visitCount = state.projectVisitCounts[item.pcode] || 0;
        const visitBadge = visitCount > 0
          ? `<span class="whatap-qn-visit-count">${visitCount}</span>`
          : '';

        div.innerHTML = `
          <div class="whatap-qn-item-content">
            <span class="whatap-qn-item-icon">📁</span>
            <span class="whatap-qn-item-name">${item.name}</span>
            <span class="whatap-qn-item-category">${item.platform || item.productType}</span>
          </div>
          <div class="whatap-qn-item-meta">
            ${visitBadge}
            <span class="whatap-qn-pcode">#${item.pcode}</span>
          </div>
        `;
        div.addEventListener('click', () => selectProjectFirst(item));
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

        div.innerHTML = `
          <div class="whatap-qn-item-content">
            <span class="whatap-qn-item-name">${item.name}</span>
            <span class="whatap-qn-item-category">${item.category || ''}</span>
          </div>
          <div class="whatap-qn-item-meta">
            ${currentPageBadge}
            ${visitBadge}
            ${productBadge}
          </div>
        `;
        div.addEventListener('click', () => selectMenu(item));
      }

      div.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        state.selectedIndex = index;
        renderItemResults();
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
          <span class="whatap-qn-item-name">${menu.name}</span>
          <span class="whatap-qn-item-category">${menu.category || ''}</span>
        </div>
        <div class="whatap-qn-item-meta">
          ${currentPageBadge}
          ${visitBadge}
          ${productBadge}
        </div>
      `;
      div.addEventListener('click', () => navigateFromProject(menu));
      div.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        state.selectedIndex = index;
        renderMenusForProject();
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

    const query = state.searchInput.value.trim().toLowerCase();
    let filtered = projectList;

    if (query) {
      filtered = projectList.filter(p =>
        p.name.toLowerCase().includes(query) ||
        String(p.pcode).includes(query) ||
        (p.platform || '').toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      state.resultsList.innerHTML = '<div class="whatap-qn-empty">검색 결과가 없습니다</div>';
      return;
    }

    // 현재 프로젝트 pcode 가져오기
    const currentPcode = QN.getCurrentProjectPcode();
    let currentProject = null;
    let otherProjects = filtered;

    if (currentPcode) {
      currentProject = filtered.find(p => String(p.pcode) === currentPcode);
      otherProjects = filtered.filter(p => String(p.pcode) !== currentPcode);
    }

    // 나머지 프로젝트 빈도수로 정렬
    otherProjects.sort((a, b) => {
      const countA = state.projectVisitCounts[a.pcode] || 0;
      const countB = state.projectVisitCounts[b.pcode] || 0;
      return countB - countA;
    });

    // 현재 프로젝트를 최상단에, 나머지는 그 뒤에
    const finalList = currentProject ? [currentProject, ...otherProjects] : otherProjects;

    finalList.forEach((project, index) => {
      const item = document.createElement('div');
      item.className = 'whatap-qn-item' + (index === state.selectedIndex ? ' selected' : '');

      const isCurrentProject = currentProject && String(project.pcode) === currentPcode;
      const visitCount = state.projectVisitCounts[project.pcode] || 0;
      const visitBadge = visitCount > 0
        ? `<span class="whatap-qn-visit-count">${visitCount}</span>`
        : '';
      const currentBadge = isCurrentProject
        ? '<span class="whatap-qn-current-badge">현재 프로젝트</span>'
        : '';

      item.innerHTML = `
        <div class="whatap-qn-item-content">
          <span class="whatap-qn-item-name">${project.name}</span>
          <span class="whatap-qn-item-category">${project.platform || project.productType}</span>
        </div>
        <div class="whatap-qn-item-meta">
          ${currentBadge}
          ${visitBadge}
          <span class="whatap-qn-pcode">#${project.pcode}</span>
        </div>
      `;
      item.addEventListener('click', () => navigateToProject(project));
      item.addEventListener('mouseenter', () => {
        if (state.isKeyboardNavigation) return;
        state.selectedIndex = index;
        renderProjectResults(projectList);
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

    let maxIndex = 0;
    if (state.currentStep === 'menu') {
      maxIndex = Math.min(state.filteredItems.length, 50) - 1;
    } else if (state.currentStep === 'project') {
      maxIndex = QN.getProjectListForMenu(state.selectedMenu).length - 1;
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
        if (state.currentStep === 'menu' && state.filteredItems[state.selectedIndex]) {
          const item = state.filteredItems[state.selectedIndex];
          if (item.itemType === 'project') {
            selectProjectFirst(item);
          } else {
            selectMenu(item);
          }
        } else if (state.currentStep === 'project') {
          const projectList = QN.getProjectListForMenu(state.selectedMenu);
          const query = state.searchInput.value.trim().toLowerCase();
          let filtered = projectList;
          if (query) {
            filtered = projectList.filter(p =>
              p.name.toLowerCase().includes(query) ||
              String(p.pcode).includes(query) ||
              (p.platform || '').toLowerCase().includes(query)
            );
          }
          // 현재 프로젝트 최상단 고정 (renderProjectResults와 동일)
          const currentPcode = QN.getCurrentProjectPcode();
          let currentProject = null;
          let otherProjects = filtered;
          if (currentPcode) {
            currentProject = filtered.find(p => String(p.pcode) === currentPcode);
            otherProjects = filtered.filter(p => String(p.pcode) !== currentPcode);
          }
          // 나머지 프로젝트 빈도순 정렬
          otherProjects.sort((a, b) => {
            const countA = state.projectVisitCounts[a.pcode] || 0;
            const countB = state.projectVisitCounts[b.pcode] || 0;
            return countB - countA;
          });
          const finalList = currentProject ? [currentProject, ...otherProjects] : otherProjects;
          if (finalList[state.selectedIndex]) {
            navigateToProject(finalList[state.selectedIndex]);
          }
        } else if (state.currentStep === 'menu_for_project') {
          const menus = QN.getMenusForProductType(state.selectedProject.productType);
          const query = state.searchInput.value.trim();
          const filtered = query ? QN.fuzzySearch(query, menus) : menus;
          if (filtered[state.selectedIndex]) {
            navigateFromProject(filtered[state.selectedIndex]);
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

  function selectMenu(menu) {
    if (menu.productType === 'global') {
      // Global 메뉴는 바로 이동
      QN.saveVisitCount(menu.path);
      window.location.href = menu.fullPath || menu.path;
      hideModal();
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

  function navigateToProject(project) {
    // 공통 메뉴면 프로젝트의 productType 사용, 아니면 메뉴의 productType 사용
    const urlProductType = state.selectedMenu.productType === 'common'
      ? QN.PRODUCT_TYPE_MAP[project.productType]
      : state.selectedMenu.productType;
    const fullPath = `/v2/project/${urlProductType}/${project.pcode}${state.selectedMenu.path}`;
    QN.saveVisitCount(state.selectedMenu.path);
    QN.saveProjectVisitCount(project.pcode);
    window.location.href = fullPath;
    hideModal();
  }

  // 프로젝트 먼저 선택 후 메뉴 선택 → 이동
  function navigateFromProject(menu) {
    // 공통 메뉴면 프로젝트의 productType 사용
    const urlProductType = menu.productType === 'common'
      ? QN.PRODUCT_TYPE_MAP[state.selectedProject.productType]
      : menu.productType;
    const fullPath = `/v2/project/${urlProductType}/${state.selectedProject.pcode}${menu.path}`;
    QN.saveVisitCount(menu.path);
    QN.saveProjectVisitCount(state.selectedProject.pcode);
    window.location.href = fullPath;
    hideModal();
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
    // Cmd+K / Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
  QN.loadProjects();

  console.log('WhaTap Quick Navigation loaded. Press Cmd+K (Mac) or Ctrl+K (Windows) to open.');

})(window.WhaTapQN);
