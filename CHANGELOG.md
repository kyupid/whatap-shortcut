# Changelog

All notable changes to WhaTap Quick Navigation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
