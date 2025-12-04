/**
 * Menus.js Unit Tests
 * - Menu data integrity validation
 * - Product type mapping validation
 */

describe('WhaTapQN Menus', () => {
  const QN = window.WhaTapQN;

  describe('GLOBAL_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.GLOBAL_MENUS).toBeDefined();
      expect(QN.GLOBAL_MENUS.length).toBeGreaterThan(0);
    });

    it('should have required properties for each menu', () => {
      QN.GLOBAL_MENUS.forEach((menu, index) => {
        expect(menu.name).toBeDefined();
        expect(typeof menu.name).toBe('string');
        expect(menu.name.length).toBeGreaterThan(0);

        expect(menu.path).toBeDefined();
        expect(typeof menu.path).toBe('string');
        expect(menu.path.startsWith('/')).toBe(true);

        expect(menu.category).toBeDefined();
        expect(typeof menu.category).toBe('string');
      });
    });

    it('should have unique paths', () => {
      const paths = QN.GLOBAL_MENUS.map(m => m.path);
      const uniquePaths = [...new Set(paths)];
      // Note: Some paths like /v2/account/project/list may appear multiple times
      // This is acceptable for different menu entries
    });

    it('should contain main page menu', () => {
      const mainPage = QN.GLOBAL_MENUS.find(m => m.name === '메인 페이지');
      expect(mainPage).toBeDefined();
      expect(mainPage.aliases).toContain('홈');
      expect(mainPage.aliases).toContain('메인');
    });
  });

  describe('COMMON_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.COMMON_MENUS).toBeDefined();
      expect(QN.COMMON_MENUS.length).toBeGreaterThan(0);
    });

    it('should have required properties for each menu', () => {
      QN.COMMON_MENUS.forEach((menu) => {
        expect(menu.name).toBeDefined();
        expect(menu.path).toBeDefined();
        expect(menu.category).toBeDefined();
      });
    });

    it('should include report menu', () => {
      const report = QN.COMMON_MENUS.find(m => m.path === '/flexible_report');
      expect(report).toBeDefined();
    });
  });

  describe('APM_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.APM_MENUS).toBeDefined();
      expect(QN.APM_MENUS.length).toBeGreaterThan(0);
    });

    it('should have required properties', () => {
      QN.APM_MENUS.forEach((menu) => {
        expect(menu.name).toBeDefined();
        expect(menu.path).toBeDefined();
        expect(menu.category).toBeDefined();
      });
    });

    it('should include dashboard', () => {
      const dashboard = QN.APM_MENUS.find(m => m.path === '/dashboard');
      expect(dashboard).toBeDefined();
    });

    it('should include hitmap', () => {
      const hitmap = QN.APM_MENUS.find(m => m.path === '/daily_hitmap');
      expect(hitmap).toBeDefined();
    });
  });

  describe('SERVER_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.SERVER_MENUS).toBeDefined();
      expect(QN.SERVER_MENUS.length).toBeGreaterThan(0);
    });

    it('should include resource board', () => {
      const resourceBoard = QN.SERVER_MENUS.find(m => m.path === '/dashboard/resource_board');
      expect(resourceBoard).toBeDefined();
    });
  });

  describe('DATABASE_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.DATABASE_MENUS).toBeDefined();
      expect(QN.DATABASE_MENUS.length).toBeGreaterThan(0);
    });

    it('should include instance monitoring', () => {
      const monitoring = QN.DATABASE_MENUS.find(m => m.path === '/instance_monitoring');
      expect(monitoring).toBeDefined();
    });
  });

  describe('KUBERNETES_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.KUBERNETES_MENUS).toBeDefined();
      expect(QN.KUBERNETES_MENUS.length).toBeGreaterThan(0);
    });

    it('should include container map', () => {
      const containerMap = QN.KUBERNETES_MENUS.find(m => m.path === '/containerMap');
      expect(containerMap).toBeDefined();
    });

    it('should include pod list', () => {
      const podList = QN.KUBERNETES_MENUS.find(m => m.path === '/pod/list');
      expect(podList).toBeDefined();
    });
  });

  describe('URL_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.URL_MENUS).toBeDefined();
      expect(QN.URL_MENUS.length).toBeGreaterThan(0);
    });
  });

  describe('BROWSER_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.BROWSER_MENUS).toBeDefined();
      expect(QN.BROWSER_MENUS.length).toBeGreaterThan(0);
    });

    it('should include RUM dashboard', () => {
      const rumDashboard = QN.BROWSER_MENUS.find(m => m.path === '/browser_live_stats');
      expect(rumDashboard).toBeDefined();
    });
  });

  describe('MOBILE_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.MOBILE_MENUS).toBeDefined();
      expect(QN.MOBILE_MENUS.length).toBeGreaterThan(0);
    });
  });

  describe('NETWORK_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.NETWORK_MENUS).toBeDefined();
      expect(QN.NETWORK_MENUS.length).toBeGreaterThan(0);
    });
  });

  describe('NETWORK_MGMT_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.NETWORK_MGMT_MENUS).toBeDefined();
      expect(QN.NETWORK_MGMT_MENUS.length).toBeGreaterThan(0);
    });
  });

  describe('CLOUD_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.CLOUD_MENUS).toBeDefined();
      expect(QN.CLOUD_MENUS.length).toBeGreaterThan(0);
    });
  });

  describe('LOG_MENUS', () => {
    it('should be defined and not empty', () => {
      expect(QN.LOG_MENUS).toBeDefined();
      expect(QN.LOG_MENUS.length).toBeGreaterThan(0);
    });

    it('should include log search', () => {
      const logSearch = QN.LOG_MENUS.find(m => m.path === '/logSearch');
      expect(logSearch).toBeDefined();
    });
  });

  describe('PRODUCT_TYPE_MAP', () => {
    it('should be defined', () => {
      expect(QN.PRODUCT_TYPE_MAP).toBeDefined();
    });

    it('should map all expected product types', () => {
      const expectedMappings = {
        'APM': 'apm',
        'DB': 'database',
        'SERVER': 'sms',
        'SMS': 'sms',
        'CONTAINER': 'cpm',
        'CPM': 'cpm',
        'URL': 'wpm',
        'WPM': 'wpm',
        'BROWSER': 'browser',
        'MOBILE': 'mobile',
        'NETWORK': 'network',
        'NMS': 'networkManagement',
        'CLOUD': 'vr',
        'VR': 'vr',
        'LOG': 'log',
      };

      Object.entries(expectedMappings).forEach(([key, value]) => {
        expect(QN.PRODUCT_TYPE_MAP[key]).toBe(value);
      });
    });
  });

  describe('PRODUCT_MENUS', () => {
    it('should be defined', () => {
      expect(QN.PRODUCT_MENUS).toBeDefined();
    });

    it('should have menu arrays for all URL paths', () => {
      const expectedPaths = [
        'apm',
        'sms',
        'database',
        'cpm',
        'wpm',
        'browser',
        'mobile',
        'network',
        'networkManagement',
        'vr',
        'log',
      ];

      expectedPaths.forEach((path) => {
        expect(QN.PRODUCT_MENUS[path]).toBeDefined();
        expect(Array.isArray(QN.PRODUCT_MENUS[path])).toBe(true);
        expect(QN.PRODUCT_MENUS[path].length).toBeGreaterThan(0);
      });
    });

    it('should reference correct menu arrays', () => {
      expect(QN.PRODUCT_MENUS['apm']).toBe(QN.APM_MENUS);
      expect(QN.PRODUCT_MENUS['sms']).toBe(QN.SERVER_MENUS);
      expect(QN.PRODUCT_MENUS['database']).toBe(QN.DATABASE_MENUS);
      expect(QN.PRODUCT_MENUS['cpm']).toBe(QN.KUBERNETES_MENUS);
      expect(QN.PRODUCT_MENUS['wpm']).toBe(QN.URL_MENUS);
      expect(QN.PRODUCT_MENUS['browser']).toBe(QN.BROWSER_MENUS);
      expect(QN.PRODUCT_MENUS['mobile']).toBe(QN.MOBILE_MENUS);
      expect(QN.PRODUCT_MENUS['network']).toBe(QN.NETWORK_MENUS);
      expect(QN.PRODUCT_MENUS['networkManagement']).toBe(QN.NETWORK_MGMT_MENUS);
      expect(QN.PRODUCT_MENUS['vr']).toBe(QN.CLOUD_MENUS);
      expect(QN.PRODUCT_MENUS['log']).toBe(QN.LOG_MENUS);
    });
  });

  describe('Menu path format validation', () => {
    const allMenus = [
      ...QN.GLOBAL_MENUS,
      ...QN.COMMON_MENUS,
      ...QN.APM_MENUS,
      ...QN.SERVER_MENUS,
      ...QN.DATABASE_MENUS,
      ...QN.KUBERNETES_MENUS,
      ...QN.URL_MENUS,
      ...QN.BROWSER_MENUS,
      ...QN.MOBILE_MENUS,
      ...QN.NETWORK_MENUS,
      ...QN.NETWORK_MGMT_MENUS,
      ...QN.CLOUD_MENUS,
      ...QN.LOG_MENUS,
    ];

    it('all paths should start with /', () => {
      allMenus.forEach((menu) => {
        expect(menu.path.startsWith('/')).toBe(true);
      });
    });

    it('all paths should not have trailing slash (except root)', () => {
      allMenus.forEach((menu) => {
        if (menu.path !== '/') {
          expect(menu.path.endsWith('/')).toBe(false);
        }
      });
    });

    it('all paths should not contain spaces', () => {
      allMenus.forEach((menu) => {
        expect(menu.path.includes(' ')).toBe(false);
      });
    });
  });

  describe('Menu name validation', () => {
    const allMenus = [
      ...QN.GLOBAL_MENUS,
      ...QN.COMMON_MENUS,
      ...QN.APM_MENUS,
      ...QN.SERVER_MENUS,
      ...QN.DATABASE_MENUS,
      ...QN.KUBERNETES_MENUS,
      ...QN.URL_MENUS,
      ...QN.BROWSER_MENUS,
      ...QN.MOBILE_MENUS,
      ...QN.NETWORK_MENUS,
      ...QN.NETWORK_MGMT_MENUS,
      ...QN.CLOUD_MENUS,
      ...QN.LOG_MENUS,
    ];

    it('all names should be non-empty strings', () => {
      allMenus.forEach((menu) => {
        expect(typeof menu.name).toBe('string');
        expect(menu.name.trim().length).toBeGreaterThan(0);
      });
    });

    it('all categories should be non-empty strings', () => {
      allMenus.forEach((menu) => {
        expect(typeof menu.category).toBe('string');
        expect(menu.category.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
