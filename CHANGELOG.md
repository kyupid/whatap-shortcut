# Changelog

All notable changes to WhaTap Quick Navigation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-10

### Added
- **검색 결과 하이라이팅**: 검색어와 매칭되는 텍스트를 시각적으로 강조 표시 (#4)
- **프로젝트 퍼지 검색**: 프로젝트 검색에도 스코어링 기반 퍼지 검색 적용 (#5)
- **컨텍스트 기반 메뉴 정렬**: 현재 접속 중인 프로젝트 타입의 메뉴를 상단에 우선 표시 (#6)
- **최근 방문 섹션**: 검색어 없을 때 모달 상단에 최근 방문 메뉴 표시 (#7)
- **즐겨찾기(핀) 기능**: Cmd+D로 메뉴/프로젝트를 핀 고정하여 최상단 표시 (#8)
- **프로젝트 그룹별 표시**: API 그룹 정보를 활용하여 프로젝트를 그룹별로 묶어 표시 (#9)
- **방문 기록 관리**: 초기화 버튼, 1주 간격 자동 감쇠, 삭제된 프로젝트 자동 정리 (#11)

### Changed
- **다크/라이트 테마 지원**: 하드코딩된 색상을 CSS 변수로 분리, WhaTap 테마에 맞춰 자동 전환 (#10)
- 모달 너비 640px → 720px 확대
- Footer 레이아웃 최적화 (gap/font 축소, flex-wrap 적용)

### Fixed
- `renderProjectResults`의 `currentProject`/`currentPcode` 미정의 참조 버그 수정

## [1.0.9] - 2026-01-13

### Added
- **Open in New Tab**: Cmd+Enter (Mac) / Ctrl+Enter (Windows) now opens selected menu/project in a new tab while keeping the modal open
- Cmd+Click / Ctrl+Click support for mouse interactions to open in new tab
- Visual hint in footer showing the new tab shortcut (⌘+Enter)

### Changed
- Renamed "테이블 정보" to "테이블 사이즈 증감" in Database menus
- Added "테이블 정보" as a search alias for backward compatibility

## [1.0.8] - 2026-01-08

### Changed
- **Search Ranking Improvement**: Exact matches now always appear at the top of search results, regardless of visit frequency
- Implemented tier-based scoring system:
  - Tier 1 (1000pts): Exact match for project code/alias
  - Tier 2 (400-500pts): Prefix match (starts with search term)
  - Tier 3 (100-200pts): Substring match (contains search term)
  - Tiebreaker: Visit frequency (reduced from 5x to 0.5x multiplier, capped at 300pts)

### Fixed
- Fixed issue where frequently visited items would override exact match results
- Search results now prioritize accuracy over usage history

## [1.0.7] - 2025-XX-XX

### Changed
- Prioritize projects when searching with numbers

### Documentation
- Updated installation guide with Chrome Web Store link
- Updated version badge in documentation

## [1.0.0] - 2025-XX-XX

### Added
- Initial release
- Cmd+K (Mac) / Ctrl+K (Windows) shortcut for quick menu navigation
- Two-step navigation: menu selection → project selection
- Fuzzy search with Korean alias support
- Visit frequency-based sorting
- Project API integration (`/account/api/v4/groups/min`)
- Support for multiple product types:
  - Application (APM)
  - Server
  - Database
  - Kubernetes
  - Browser
  - Network
  - Cloud
  - Log
  - URL

### Features
- Search through menus and projects
- Keyboard navigation (↑/↓ arrows, Enter to select, Escape to close)
- Visit count tracking and display
- Current page/project indicators
- Responsive modal UI
