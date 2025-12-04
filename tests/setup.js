/**
 * Jest Test Setup
 * - Initialize window.WhaTapQN namespace
 * - Mock localStorage
 * - Load source files in correct order
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.warn to suppress expected warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Initialize WhaTapQN namespace before loading scripts
window.WhaTapQN = window.WhaTapQN || {};

// Load menus.js first (defines menu data)
require('../menus.js');

// Load utils.js second (defines utility functions)
require('../utils.js');

// Helper to reset state between tests
global.resetWhaTapQN = () => {
  localStorageMock.clear();
  window.WhaTapQN.state = {
    modal: null,
    searchInput: null,
    resultsList: null,
    selectedIndex: 0,
    isKeyboardNavigation: false,
    filteredItems: [],
    projects: {},
    currentStep: 'menu',
    selectedMenu: null,
    selectedProject: null,
    visitCounts: {},
    projectVisitCounts: {},
  };
};

// Helper to set mock projects
global.setMockProjects = (projects) => {
  window.WhaTapQN.state.projects = projects;
};

// Helper to set mock visit counts
global.setMockVisitCounts = (visitCounts) => {
  window.WhaTapQN.state.visitCounts = visitCounts;
};

// Helper to set mock project visit counts
global.setMockProjectVisitCounts = (projectVisitCounts) => {
  window.WhaTapQN.state.projectVisitCounts = projectVisitCounts;
};

// Reset before each test
beforeEach(() => {
  resetWhaTapQN();
  jest.clearAllMocks();
});
