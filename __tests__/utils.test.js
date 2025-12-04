/**
 * Utils.js Unit Tests
 */

describe('WhaTapQN Utils', () => {
  const QN = window.WhaTapQN;

  describe('getUrlProductType', () => {
    it('should map APM to apm', () => {
      expect(QN.getUrlProductType('APM')).toBe('apm');
    });

    it('should map DB to database', () => {
      expect(QN.getUrlProductType('DB')).toBe('database');
    });

    it('should map SERVER to sms', () => {
      expect(QN.getUrlProductType('SERVER')).toBe('sms');
    });

    it('should map SMS to sms (API return value)', () => {
      expect(QN.getUrlProductType('SMS')).toBe('sms');
    });

    it('should map CONTAINER to cpm', () => {
      expect(QN.getUrlProductType('CONTAINER')).toBe('cpm');
    });

    it('should map CPM to cpm (API return value)', () => {
      expect(QN.getUrlProductType('CPM')).toBe('cpm');
    });

    it('should map URL to wpm', () => {
      expect(QN.getUrlProductType('URL')).toBe('wpm');
    });

    it('should map BROWSER to browser', () => {
      expect(QN.getUrlProductType('BROWSER')).toBe('browser');
    });

    it('should map CLOUD to vr', () => {
      expect(QN.getUrlProductType('CLOUD')).toBe('vr');
    });

    it('should map LOG to log', () => {
      expect(QN.getUrlProductType('LOG')).toBe('log');
    });

    it('should handle lowercase input', () => {
      expect(QN.getUrlProductType('apm')).toBe('apm');
    });

    it('should return undefined for unknown productType', () => {
      expect(QN.getUrlProductType('UNKNOWN')).toBeUndefined();
    });

    it('should return null for null input', () => {
      expect(QN.getUrlProductType(null)).toBeNull();
    });
  });

  describe('getCurrentProjectPcode', () => {
    const originalPathname = window.location.pathname;

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: { pathname: originalPathname },
        writable: true,
      });
    });

    it('should extract pcode from project URL', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/v2/project/apm/12345/dashboard' },
        writable: true,
      });
      expect(QN.getCurrentProjectPcode()).toBe('12345');
    });

    it('should extract pcode from different product types', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/v2/project/database/99999/monitoring' },
        writable: true,
      });
      expect(QN.getCurrentProjectPcode()).toBe('99999');
    });

    it('should return null for non-project URLs', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/v2/account/project/list' },
        writable: true,
      });
      expect(QN.getCurrentProjectPcode()).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/some/random/path' },
        writable: true,
      });
      expect(QN.getCurrentProjectPcode()).toBeNull();
    });
  });

  describe('getCurrentMenuPath', () => {
    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });
    });

    it('should extract menu path from project URL', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/v2/project/apm/12345/dashboard' },
        writable: true,
      });
      expect(QN.getCurrentMenuPath()).toBe('/dashboard');
    });

    it('should extract nested menu path', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/v2/project/cpm/12345/event/rules' },
        writable: true,
      });
      expect(QN.getCurrentMenuPath()).toBe('/event/rules');
    });

    it('should return full path for global pages', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/v2/account/project/list' },
        writable: true,
      });
      expect(QN.getCurrentMenuPath()).toBe('/v2/account/project/list');
    });
  });

  describe('localStorage functions', () => {
    describe('loadVisitCounts / saveVisitCount', () => {
      it('should save and increment visit count', () => {
        QN.saveVisitCount('/dashboard');
        expect(QN.state.visitCounts['/dashboard']).toBe(1);

        QN.saveVisitCount('/dashboard');
        expect(QN.state.visitCounts['/dashboard']).toBe(2);
      });

      it('should persist to localStorage', () => {
        QN.saveVisitCount('/metrics_chart');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'whatap_qn_visits',
          expect.stringContaining('/metrics_chart')
        );
      });

      it('should load visit counts from localStorage', () => {
        localStorage.getItem.mockReturnValueOnce(
          JSON.stringify({ '/dashboard': 5, '/monitoring': 3 })
        );
        QN.loadVisitCounts();
        expect(QN.state.visitCounts['/dashboard']).toBe(5);
        expect(QN.state.visitCounts['/monitoring']).toBe(3);
      });

      it('should handle corrupted localStorage data', () => {
        localStorage.getItem.mockReturnValueOnce('invalid json');
        QN.loadVisitCounts();
        // Should not throw, visitCounts remains empty
        expect(QN.state.visitCounts).toEqual({});
      });
    });

    describe('loadProjectVisitCounts / saveProjectVisitCount', () => {
      it('should save and increment project visit count', () => {
        QN.saveProjectVisitCount('12345');
        expect(QN.state.projectVisitCounts['12345']).toBe(1);

        QN.saveProjectVisitCount('12345');
        expect(QN.state.projectVisitCounts['12345']).toBe(2);
      });

      it('should persist to localStorage', () => {
        QN.saveProjectVisitCount('99999');
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'whatap_qn_project_visits',
          expect.stringContaining('99999')
        );
      });

      it('should load project visit counts from localStorage', () => {
        localStorage.getItem.mockReturnValueOnce(
          JSON.stringify({ '12345': 10, '67890': 5 })
        );
        QN.loadProjectVisitCounts();
        expect(QN.state.projectVisitCounts['12345']).toBe(10);
        expect(QN.state.projectVisitCounts['67890']).toBe(5);
      });
    });
  });

  describe('getProjectsForProductType', () => {
    beforeEach(() => {
      setMockProjects({
        '1': { pcode: 1, name: 'APM Project 1', productType: 'APM', platform: 'Java' },
        '2': { pcode: 2, name: 'APM Project 2', productType: 'APM', platform: 'Node' },
        '3': { pcode: 3, name: 'Server Project', productType: 'SERVER', platform: 'Linux' },
        '4': { pcode: 4, name: 'K8s Project', productType: 'CONTAINER', platform: 'Kubernetes' },
      });
    });

    it('should filter projects by APM type', () => {
      const projects = QN.getProjectsForProductType('apm');
      expect(projects).toHaveLength(2);
      expect(projects.map(p => p.name)).toContain('APM Project 1');
      expect(projects.map(p => p.name)).toContain('APM Project 2');
    });

    it('should filter projects by Server type', () => {
      const projects = QN.getProjectsForProductType('sms');
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Server Project');
    });

    it('should filter projects by Kubernetes type', () => {
      const projects = QN.getProjectsForProductType('cpm');
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('K8s Project');
    });

    it('should return empty array for non-matching type', () => {
      const projects = QN.getProjectsForProductType('browser');
      expect(projects).toHaveLength(0);
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', () => {
      setMockProjects({
        '1': { pcode: 1, name: 'Project 1', productType: 'APM' },
        '2': { pcode: 2, name: 'Project 2', productType: 'SERVER' },
      });

      const projects = QN.getAllProjects();
      expect(projects).toHaveLength(2);
    });

    it('should return empty array when no projects', () => {
      const projects = QN.getAllProjects();
      expect(projects).toHaveLength(0);
    });
  });

  describe('getProjectListForMenu', () => {
    beforeEach(() => {
      setMockProjects({
        '1': { pcode: 1, name: 'APM Project', productType: 'APM' },
        '2': { pcode: 2, name: 'Server Project', productType: 'SERVER' },
      });
    });

    it('should return all projects for common menu', () => {
      const menu = { productType: 'common' };
      const projects = QN.getProjectListForMenu(menu);
      expect(projects).toHaveLength(2);
    });

    it('should return filtered projects for specific product type', () => {
      const menu = { productType: 'apm' };
      const projects = QN.getProjectListForMenu(menu);
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('APM Project');
    });

    it('should return empty array for null menu', () => {
      const projects = QN.getProjectListForMenu(null);
      expect(projects).toHaveLength(0);
    });
  });

  describe('getAllMenus', () => {
    it('should return menus with global type', () => {
      const menus = QN.getAllMenus();
      const globalMenus = menus.filter(m => m.productType === 'global');
      expect(globalMenus.length).toBeGreaterThan(0);
    });

    it('should return menus with common type', () => {
      const menus = QN.getAllMenus();
      const commonMenus = menus.filter(m => m.productType === 'common');
      expect(commonMenus.length).toBeGreaterThan(0);
    });

    it('should return menus with product-specific types', () => {
      const menus = QN.getAllMenus();
      const apmMenus = menus.filter(m => m.productType === 'apm');
      expect(apmMenus.length).toBeGreaterThan(0);
    });

    it('should sort menus by visit frequency', () => {
      setMockVisitCounts({
        '/dashboard': 10,
        '/monitoring': 5,
      });

      const menus = QN.getAllMenus();
      const dashboardIndex = menus.findIndex(m => m.path === '/dashboard');
      const monitoringIndex = menus.findIndex(m => m.path === '/monitoring');

      // Higher visit count should come first
      if (dashboardIndex !== -1 && monitoringIndex !== -1) {
        expect(dashboardIndex).toBeLessThan(monitoringIndex);
      }
    });
  });

  describe('getAllItems', () => {
    it('should include both menus and projects', () => {
      setMockProjects({
        '1': { pcode: 1, name: 'Test Project', productType: 'APM' },
      });

      const items = QN.getAllItems();
      const menuItems = items.filter(i => i.itemType === 'menu');
      const projectItems = items.filter(i => i.itemType === 'project');

      expect(menuItems.length).toBeGreaterThan(0);
      expect(projectItems).toHaveLength(1);
    });
  });

  describe('getMenusForProductType', () => {
    it('should return APM menus for APM product type', () => {
      const menus = QN.getMenusForProductType('APM');
      expect(menus.length).toBeGreaterThan(0);
      // Should include common menus too
      const commonMenus = menus.filter(m => m.productType === 'common');
      expect(commonMenus.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown product type', () => {
      const menus = QN.getMenusForProductType('UNKNOWN');
      expect(menus).toHaveLength(0);
    });

    it('should sort menus by visit frequency', () => {
      setMockVisitCounts({
        '/dashboard': 20,
        '/monitoring': 5,
      });

      const menus = QN.getMenusForProductType('APM');
      const dashboardIndex = menus.findIndex(m => m.path === '/dashboard');
      const monitoringIndex = menus.findIndex(m => m.path === '/monitoring');

      if (dashboardIndex !== -1 && monitoringIndex !== -1) {
        expect(dashboardIndex).toBeLessThan(monitoringIndex);
      }
    });
  });

  describe('fuzzySearch', () => {
    describe('menu search', () => {
      it('should find menu by exact name match', () => {
        const items = [
          { itemType: 'menu', name: '대시보드', path: '/dashboard', category: 'Dashboard' },
          { itemType: 'menu', name: '모니터링', path: '/monitoring', category: 'Dashboard' },
        ];

        const results = QN.fuzzySearch('대시보드', items);
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('대시보드');
      });

      it('should find menu by partial name match', () => {
        const items = [
          { itemType: 'menu', name: '애플리케이션 대시보드', path: '/dashboard', category: 'Dashboard' },
          { itemType: 'menu', name: '서버 목록', path: '/server/list', category: 'Server' },
        ];

        const results = QN.fuzzySearch('대시', items);
        expect(results).toHaveLength(1);
        expect(results[0].path).toBe('/dashboard');
      });

      it('should find menu by alias', () => {
        const items = [
          { itemType: 'menu', name: '메인 페이지', path: '/main', aliases: ['home', '홈', '메인'] },
          { itemType: 'menu', name: '설정', path: '/settings', aliases: [] },
        ];

        const results = QN.fuzzySearch('홈', items);
        expect(results).toHaveLength(1);
        expect(results[0].path).toBe('/main');
      });

      it('should find menu by category', () => {
        const items = [
          { itemType: 'menu', name: 'TX 통계', path: '/stat_service', category: 'Statistics' },
          { itemType: 'menu', name: '대시보드', path: '/dashboard', category: 'Dashboard' },
        ];

        const results = QN.fuzzySearch('Statistics', items);
        expect(results).toHaveLength(1);
        expect(results[0].path).toBe('/stat_service');
      });

      it('should find menu by path', () => {
        const items = [
          { itemType: 'menu', name: '히트맵', path: '/daily_hitmap', category: 'Analysis' },
          { itemType: 'menu', name: '큐브', path: '/cube', category: 'Analysis' },
        ];

        const results = QN.fuzzySearch('hitmap', items);
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('히트맵');
      });

      it('should prioritize higher visit counts', () => {
        setMockVisitCounts({
          '/low': 1,
          '/high': 100,
        });

        const items = [
          { itemType: 'menu', name: '검색 테스트 A', path: '/low', category: 'Test' },
          { itemType: 'menu', name: '검색 테스트 B', path: '/high', category: 'Test' },
        ];

        const results = QN.fuzzySearch('검색', items);
        expect(results[0].path).toBe('/high');
      });
    });

    describe('project search', () => {
      it('should find project by name', () => {
        const items = [
          { itemType: 'project', pcode: 1, name: 'Production API', productType: 'APM' },
          { itemType: 'project', pcode: 2, name: 'Staging Server', productType: 'SERVER' },
        ];

        const results = QN.fuzzySearch('Production', items);
        expect(results).toHaveLength(1);
        expect(results[0].pcode).toBe(1);
      });

      it('should find project by pcode', () => {
        const items = [
          { itemType: 'project', pcode: 12345, name: 'Project A', productType: 'APM' },
          { itemType: 'project', pcode: 67890, name: 'Project B', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('12345', items);
        expect(results).toHaveLength(1);
        expect(results[0].pcode).toBe(12345);
      });

      it('should find project by partial pcode', () => {
        const items = [
          { itemType: 'project', pcode: 12345, name: 'Project A', productType: 'APM' },
          { itemType: 'project', pcode: 67890, name: 'Project B', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('123', items);
        expect(results).toHaveLength(1);
        expect(results[0].pcode).toBe(12345);
      });

      it('should find project by platform', () => {
        const items = [
          { itemType: 'project', pcode: 1, name: 'Project A', platform: 'Java', productType: 'APM' },
          { itemType: 'project', pcode: 2, name: 'Project B', platform: 'Node.js', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('Java', items);
        expect(results).toHaveLength(1);
        expect(results[0].pcode).toBe(1);
      });

      it('should prioritize higher project visit counts', () => {
        setMockProjectVisitCounts({
          1: 5,
          2: 50,
        });

        const items = [
          { itemType: 'project', pcode: 1, name: '테스트 프로젝트 A', productType: 'APM' },
          { itemType: 'project', pcode: 2, name: '테스트 프로젝트 B', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('테스트', items);
        expect(results[0].pcode).toBe(2);
      });
    });

    describe('mixed search', () => {
      it('should return both menus and projects matching query', () => {
        const items = [
          { itemType: 'menu', name: 'APM 대시보드', path: '/dashboard', category: 'Dashboard' },
          { itemType: 'project', pcode: 1, name: 'APM Production', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('APM', items);
        expect(results).toHaveLength(2);
      });

      it('should return empty array for no matches', () => {
        const items = [
          { itemType: 'menu', name: '대시보드', path: '/dashboard', category: 'Dashboard' },
          { itemType: 'project', pcode: 1, name: 'Project', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('xxxnotfoundxxx', items);
        expect(results).toHaveLength(0);
      });

      it('should return all items when query is empty', () => {
        const items = [
          { itemType: 'menu', name: 'Menu 1', path: '/m1' },
          { itemType: 'project', pcode: 1, name: 'Project 1', productType: 'APM' },
        ];

        const results = QN.fuzzySearch('', items);
        expect(results).toHaveLength(2);
      });
    });
  });
});
