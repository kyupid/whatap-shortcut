// ============================================
// WhaTap Quick Navigation - Menu Data
// ============================================

window.WhaTapQN = window.WhaTapQN || {};

(function(QN) {
  'use strict';

  // 프로젝트 불필요 메뉴 (Global)
  QN.GLOBAL_MENUS = [
    // Main
    { name: '메인 페이지', path: '/v2/account/project/list', category: 'Home', aliases: ['main', 'home', '홈', '메인', '시작'] },
    // Account
    { name: '프로젝트 목록', path: '/v2/account/project/list', category: 'Account' },
    { name: '계정 관리', path: '/v2/account/management', category: 'Account' },
    { name: 'SSO 연동', path: '/v2/account/sso_integrations', category: 'Account' },
    { name: '빌링', path: '/v2/account/billing', category: 'Account' },
    { name: '프로젝트 구독', path: '/v2/account/projectSubscription', category: 'Account' },
    { name: '결제 이력', path: '/v2/account/paymentHistory', category: 'Account' },
    { name: '잔액', path: '/v2/account/balance', category: 'Account' },
    { name: '인보이스 미리보기', path: '/v2/account/invoicePreview', category: 'Account' },
    { name: '사용량 미리보기', path: '/v2/account/usage_preview', category: 'Account' },
    { name: '미터링', path: '/v2/account/metering', category: 'Account' },
    { name: '접근 제어', path: '/v2/account/access_control', category: 'Account' },
    { name: '통합 공지 목록', path: '/v2/account/user_integrated_notice/list', category: 'Account' },
    // Integration
    { name: '그룹 생성', path: '/v2/integration/group/create', category: 'Integration' },
    { name: '프로젝트 통합', path: '/v2/account/project/integration', category: 'Integration' },
    { name: 'Flex 보드 (통합)', path: '/v2/integration/flexboard', category: 'Integration' },
    { name: '리포트 (통합)', path: '/v2/integration/report', category: 'Integration' },
    { name: '토폴로지 (통합)', path: '/v2/integration/topology', category: 'Integration' },
    { name: '이벤트 목록 (통합)', path: '/v2/integration/eventlist', category: 'Integration' },
    { name: '이벤트 관리 (통합)', path: '/v2/integration/event-management', category: 'Integration' },
    { name: '그룹 관리 (통합)', path: '/v2/integration/management/group', category: 'Integration' },
    { name: '멤버 관리 (통합)', path: '/v2/integration/management/members', category: 'Integration' },
    { name: '에이전트 전송', path: '/v2/integration/agent_transfer', category: 'Integration' },
    { name: '로그 검색 (통합)', path: '/v2/integration/logSearch', category: 'Integration' },
    // Organization
    { name: '조직 생성', path: '/v2/organization/create', category: 'Organization' },
    { name: '조직 관리', path: '/v2/organization/management', category: 'Organization' },
    { name: '조직 멤버', path: '/v2/organization/members', category: 'Organization' },
    // Group
    { name: '그룹 프로젝트 목록', path: '/v2/group/project/list', category: 'Group' },
    { name: '그룹 멤버', path: '/v2/group/member', category: 'Group' },
    { name: '그룹 관리', path: '/v2/group/manage', category: 'Group' },
    { name: 'CPM 그룹 프로젝트', path: '/v2/cpmGroup/project/list', category: 'Group' },
  ];

  // 공통 메뉴 (모든 프로젝트 타입에서 사용 가능)
  QN.COMMON_MENUS = [
    { name: '보고서', path: '/flexible_report', category: 'Report' },
    { name: '메트릭스 조회', path: '/tag_count', category: 'Metrics' },
    { name: '메트릭스 차트', path: '/metrics_chart', category: 'Metrics' },
    { name: 'MXQL', path: '/mxql', category: 'Lab' },
    { name: 'OpenMX 에이전트 설치', path: '/openmx/agent/install', category: 'OpenMetrics' },
    { name: 'OpenMX', path: '/openmx', category: 'OpenMetrics' },
    { name: 'OpenMX 플러그인', path: '/openmx/plugin', category: 'OpenMetrics' },
    { name: 'NGINX 플러그인', path: '/openmx/plugin/nginx', category: 'OpenMetrics' },
    { name: 'Istio 플러그인', path: '/openmx/plugin/istio', category: 'OpenMetrics' },
  ];

  // APM 메뉴
  QN.APM_MENUS = [
    // Dashboard
    { name: '애플리케이션 대시보드', path: '/dashboard', category: 'Dashboard' },
    { name: '컨텍스트 대시보드', path: '/dashboard/context', category: 'Dashboard' },
    { name: 'IIS 대시보드', path: '/iis', category: 'Dashboard' },
    { name: '에이전트 리소스 대시보드', path: '/agent_resource_dashboard', category: 'Dashboard' },
    { name: '트랜잭션 맵', path: '/transaction_map', category: 'Dashboard' },
    { name: '멀티 액티브 TX', path: '/multi_active_tx', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Analysis
    { name: '일일 앱 통계', path: '/daily_app_stat', category: 'Analysis' },
    { name: '퍼포먼스 트렌드', path: '/trending', category: 'Analysis' },
    { name: '메트릭스 차트', path: '/metrics_chart', category: 'Analysis' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    { name: 'MSA 분석', path: '/msa', category: 'Analysis' },
    { name: '스택 분석', path: '/stack', category: 'Analysis' },
    { name: '앱 큐브', path: '/cube2', category: 'Analysis' },
    { name: '히트맵', path: '/daily_hitmap', category: 'Analysis' },
    { name: '멀티 서버 TX 트레이스', path: '/transaction/trace', category: 'Analysis' },
    { name: 'TX 검색', path: '/new/tx_profile', category: 'Analysis' },
    // Topology
    { name: '애플리케이션 토폴로지', path: '/topology/application', category: 'Topology' },
    // Statistics
    { name: 'TX 통계', path: '/stat_service', category: 'Statistics' },
    { name: 'TX 퍼센타일', path: '/stat_service_percentile', category: 'Statistics' },
    { name: '도메인 통계', path: '/stat_domain', category: 'Statistics' },
    { name: '호출자 통계', path: '/stat_caller', category: 'Statistics' },
    { name: '로그인 통계', path: '/stat_login', category: 'Statistics' },
    { name: 'IP 통계', path: '/stat_ip', category: 'Statistics' },
    { name: '레퍼러 통계', path: '/stat_referer', category: 'Statistics' },
    { name: '에러 통계', path: '/stat_error', category: 'Statistics' },
    { name: 'SQL 통계', path: '/stat_sql', category: 'Statistics' },
    { name: 'HTTP 호출 통계', path: '/stat_httpc', category: 'Statistics' },
    { name: '리모트 통계', path: '/stat_remote', category: 'Statistics' },
    { name: 'User Agent 통계', path: '/stat_useragent', category: 'Statistics' },
    { name: 'User Agent 상세 통계', path: '/stat_useragent_detail', category: 'Statistics' },
    // Agent Configuration
    { name: '환경 변수', path: '/environment', category: 'Agent' },
    { name: '부트 환경', path: '/boot_environment', category: 'Agent' },
    { name: '힙 히스토그램', path: '/heap_histogram', category: 'Agent' },
    { name: '로드된 클래스', path: '/loaded_classes', category: 'Agent' },
    { name: '컴포넌트 버전', path: '/components_version', category: 'Agent' },
    { name: '스레드 목록', path: '/thread_list', category: 'Agent' },
    { name: '오픈 소켓', path: '/open_socket', category: 'Agent' },
    { name: '메소드 통계', path: '/method_stat', category: 'Agent' },
    { name: 'DB 상태', path: '/db_status', category: 'Agent' },
    { name: '에이전트 로그', path: '/agent_log', category: 'Agent' },
    { name: '시스템 GC', path: '/system_garbage_collection', category: 'Agent' },
    { name: '힙 덤프', path: '/heap_dump', category: 'Agent' },
    { name: '모듈 의존성', path: '/module_depend', category: 'Agent' },
    // Management
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '에이전트 목록', path: '/agent_list', category: 'Management' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: '에이전트 업데이트', path: '/agent_update', category: 'Management' },
    { name: '에이전트 설정', path: '/new/agents', category: 'Management' },
    { name: '에이전트 설정 V2', path: '/new/agents/setting', category: 'Management' },
    { name: '클라우드 모니터링', path: '/cloud', category: 'Management' },
    { name: '상관관계 관리', path: '/correlations/management', category: 'Management' },
    // Event
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 규칙 V2', path: '/event/rules_v2', category: 'Event' },
    { name: '이벤트 설정', path: '/event/config', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
    { name: '통합 유지보수', path: '/integrated_maintenance', category: 'Event' },
    // Log
    { name: '라이브 테일', path: '/liveTail', category: 'Log' },
    { name: '로그 탐색기', path: '/logExplorer', category: 'Log' },
    { name: '로그 검색', path: '/logSearch', category: 'Log' },
    { name: '로그 설정', path: '/logSetting', category: 'Log' },
  ];

  // Server (SMS) 메뉴
  QN.SERVER_MENUS = [
    // Dashboard
    { name: '리소스 보드', path: '/dashboard/resource_board', category: 'Dashboard' },
    { name: '컴파운드 아이', path: '/compoundEye', category: 'Dashboard' },
    { name: '서버 인벤토리 맵', path: '/dashboard/server_inventory_map', category: 'Dashboard' },
    { name: '멀티 라인', path: '/dashboard/multi_line', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Server List
    { name: '서버 목록', path: '/server/list', category: 'Server' },
    { name: '서버 상세', path: '/server_detail', category: 'Server' },
    { name: '서버 인벤토리', path: '/server_inventory', category: 'Server' },
    // GPU
    { name: 'GPU 인벤토리', path: '/gpu_inventory', category: 'GPU' },
    { name: 'GPU 성능', path: '/gpu_performance', category: 'GPU' },
    // Analysis
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    { name: '서버 큐브', path: '/server/cube', category: 'Analysis' },
    { name: '시간 가용성', path: '/time_availability', category: 'Analysis' },
    { name: '메트릭스 탐색기', path: '/metrics_explorer', category: 'Analysis' },
    // Agent Setting
    { name: '서버 에이전트', path: '/server/agent', category: 'Agent' },
    { name: '서버 설정', path: '/server/setting', category: 'Agent' },
    // Event
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
    { name: '유지보수', path: '/maintenance', category: 'Event' },
    // Management
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
  ];

  // Database 메뉴
  QN.DATABASE_MENUS = [
    // Dashboard
    { name: '인스턴스 목록', path: '/instance_list', category: 'Dashboard' },
    { name: '모니터링', path: '/monitoring', category: 'Dashboard' },
    { name: '인스턴스 모니터링', path: '/instance_monitoring', category: 'Dashboard' },
    { name: 'DB 인스턴스 맵', path: '/db_instance_map', category: 'Dashboard' },
    { name: 'DB 대시보드', path: '/db_dashboard', category: 'Dashboard' },
    { name: 'DB 인스턴스 모니터링', path: '/db_instance_monitoring', category: 'Dashboard' },
    { name: 'RAC 모니터링', path: '/rac_monitoring', category: 'Dashboard' },
    { name: '버퍼풀 모니터링', path: '/buffer_pool_monitoring', category: 'Dashboard' },
    { name: '멀티 인스턴스', path: '/multi_instance', category: 'Dashboard' },
    { name: '슬로우 쿼리', path: '/slow_query', category: 'Dashboard' },
    { name: 'DB 클러스터 토폴로지', path: '/dbClusterTopology', category: 'Dashboard' },
    { name: '클러스터 목록', path: '/cluster_list', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Analysis
    { name: '트렌드', path: '/trends', category: 'Analysis' },
    { name: 'DB 트렌드 비교', path: '/db_trends_compare', category: 'Analysis' },
    { name: '트렌드 비교', path: '/trends_compare', category: 'Analysis' },
    { name: '락 트리', path: '/lock_tree', category: 'Analysis' },
    { name: 'DB 락 트리', path: '/db_lock_tree', category: 'Analysis' },
    { name: 'DB PQ 트리', path: '/db_pq_tree', category: 'Analysis' },
    { name: 'PQ 트리', path: '/pq_tree', category: 'Analysis' },
    { name: 'DB 데드락', path: '/db_dead_lock', category: 'Analysis' },
    { name: '데드락', path: '/dead_lock', category: 'Analysis' },
    { name: 'DB 파라미터', path: '/db_parameter', category: 'Analysis' },
    { name: '세션 히스토리', path: '/session_history', category: 'Analysis' },
    { name: '대기 분석', path: '/wait_analysis', category: 'Analysis' },
    { name: '대기 통계', path: '/wait_stat', category: 'Analysis' },
    { name: 'SQL 분석', path: '/sql_analysis', category: 'Analysis' },
    { name: '오브젝트 정보', path: '/object_info', category: 'Analysis' },
    { name: '탑 SQL 비교', path: '/top_sql_comparison', category: 'Analysis' },
    { name: '메트릭스 차트', path: '/metrics_chart', category: 'Analysis' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    { name: '장기 메트릭스', path: '/metrics_longterm', category: 'Analysis' },
    // Statistics
    { name: 'SQL 통계', path: '/statistics_sql', category: 'Statistics' },
    { name: '탑 SQL', path: '/top_sql', category: 'Statistics' },
    { name: 'PostgreSQL 통계', path: '/pg_stat', category: 'Statistics' },
    { name: 'MySQL 통계', path: '/mysql_stat', category: 'Statistics' },
    { name: '프로시저 통계', path: '/procedure_stat', category: 'Statistics' },
    // Size Increase
    { name: '테이블 정보', path: '/size_increase/table_info', category: 'Size' },
    { name: '테이블스페이스', path: '/size_increase/table_space', category: 'Size' },
    { name: 'DB 사이즈', path: '/size_increase/db_size', category: 'Size' },
    { name: 'SGA', path: '/size_increase/sga', category: 'Size' },
    // Log
    { name: '클라우드 로그 뷰어', path: '/cloud_log_viewer', category: 'Log' },
    // Management
    { name: '에이전트 목록', path: '/agent_list', category: 'Management' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: 'DB 에이전트 업데이트', path: '/db_agent_update', category: 'Management' },
    { name: '스크립트 관리', path: '/script_manager', category: 'Management' },
    { name: '백업/복구 이력', path: '/backup_recovery_history', category: 'Management' },
    { name: 'Job 정보', path: '/job_info', category: 'Management' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    // Event
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 규칙 V2', path: '/event/rules_v2', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
    { name: '통합 유지보수', path: '/integrated_maintenance', category: 'Event' },
  ];

  // Kubernetes (CPM) 메뉴
  QN.KUBERNETES_MENUS = [
    // Dashboard
    { name: '컨테이너 맵', path: '/containerMap', category: 'Dashboard' },
    { name: '멀티 컨테이너 맵', path: '/multiContainerMap', category: 'Dashboard' },
    { name: '노드 맵', path: '/node/map', category: 'Dashboard' },
    { name: '서비스 대시보드', path: '/serviceDashboard', category: 'Dashboard' },
    { name: '컨테이너 퍼포먼스', path: '/container/performace', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Cluster
    { name: '클러스터 오버뷰', path: '/cluster/overview', category: 'Cluster' },
    { name: '네임스페이스 상태', path: '/namespace/status', category: 'Cluster' },
    // Node
    { name: '노드 목록', path: '/node/list', category: 'Node' },
    { name: '노드 타임라인', path: '/node/timeline', category: 'Node' },
    { name: '노드 상세', path: '/node_detail', category: 'Node' },
    { name: '노드 디스크 목록', path: '/node/disk/list', category: 'Node' },
    // GPU
    { name: 'GPU 대시보드', path: '/gpu/dashboard', category: 'GPU' },
    { name: 'GPU 트렌드', path: '/gpu/trend', category: 'GPU' },
    // Container
    { name: '컨테이너 목록', path: '/container/list', category: 'Container' },
    { name: '컨테이너 타임라인', path: '/container/timeline', category: 'Container' },
    { name: '컨테이너 볼륨', path: '/new/counter/container/volume', category: 'Container' },
    { name: '컨테이너 이미지', path: '/container/images', category: 'Container' },
    { name: 'OOM 컨테이너', path: '/oom_container', category: 'Container' },
    // Workload
    { name: 'Workload 목록', path: '/workload/list', category: 'Workload' },
    { name: 'Pod 목록', path: '/pod/list', category: 'Workload' },
    { name: 'Pod 타임라인', path: '/pod/timeline', category: 'Workload' },
    { name: 'Pending Pod', path: '/pendingPod', category: 'Workload' },
    { name: '애플리케이션 목록', path: '/application/list', category: 'Workload' },
    { name: 'Deployment 목록', path: '/deployment/list', category: 'Workload' },
    // Service & Networking
    { name: 'Service 목록', path: '/service/list', category: 'Network' },
    { name: 'Ingress 목록', path: '/ingress/list', category: 'Network' },
    // Storage
    { name: 'PV 목록', path: '/pv/list', category: 'Storage' },
    { name: 'PVC 목록', path: '/pvc/list', category: 'Storage' },
    // Control Plane
    { name: 'API Server 대시보드', path: '/controlplane/kube_apiserver/dashboard', category: 'Control Plane' },
    { name: 'API Server 메트릭스 검색', path: '/controlplane/kube_apiserver/metrics/search', category: 'Control Plane' },
    { name: 'etcd 대시보드', path: '/controlplane/etcd/dashboard', category: 'Control Plane' },
    { name: 'Scheduler 대시보드', path: '/controlplane/kube_scheduler/dashboard', category: 'Control Plane' },
    // Analysis
    { name: '오브젝트 Manifest', path: '/object_manifest', category: 'Analysis' },
    { name: 'Kube 이벤트', path: '/kube_event', category: 'Analysis' },
    { name: 'Pod 초기화 성능', path: '/pod/init_perform', category: 'Analysis' },
    { name: '히트맵', path: '/daily_hitmap', category: 'Analysis' },
    { name: '멀티 히트맵', path: '/new/multi_hitmap', category: 'Analysis' },
    { name: 'MSA 분석', path: '/msa', category: 'Analysis' },
    { name: '스택 분석', path: '/stack', category: 'Analysis' },
    { name: '메트릭스 차트', path: '/metrics_chart', category: 'Analysis' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    // Management
    { name: 'Kube 에이전트 목록', path: '/kube/agent/list', category: 'Management' },
    { name: '네임스페이스 관리', path: '/namespace/management', category: 'Management' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    // Event
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 규칙 V2', path: '/event/rules_v2', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
    { name: '통합 유지보수', path: '/integrated_maintenance', category: 'Event' },
    // Log
    { name: '라이브 테일', path: '/liveTail', category: 'Log' },
    { name: '로그 탐색기', path: '/logExplorer', category: 'Log' },
    { name: '로그 검색', path: '/logSearch', category: 'Log' },
    { name: '로그 설정', path: '/logSetting', category: 'Log' },
  ];

  // URL Monitoring (WPM) 메뉴
  QN.URL_MENUS = [
    { name: 'URL 목록', path: '/url/list', category: 'Dashboard' },
    { name: '리전', path: '/regions', category: 'Dashboard' },
    { name: '카테고리별 상태', path: '/dashboard/status/category', category: 'Dashboard' },
    { name: '태그별 상태', path: '/dashboard/status/tag', category: 'Dashboard' },
    { name: '에러 상태', path: '/dashboard/error_status', category: 'Dashboard' },
    { name: 'URL 상세', path: '/url/detail', category: 'Dashboard' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    { name: '관리 목록', path: '/manage/list', category: 'Management' },
    { name: '카테고리 관리', path: '/manage/category', category: 'Management' },
    { name: '태그 관리', path: '/manage/tag', category: 'Management' },
    { name: '커스텀 컬럼', path: '/manage/custom_columns', category: 'Management' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // Browser 메뉴
  QN.BROWSER_MENUS = [
    // Dashboard
    { name: 'RUM 대시보드', path: '/browser_live_stats', category: 'Dashboard' },
    { name: '에러 대시보드', path: '/browser_error_stats', category: 'Dashboard' },
    { name: '페이지 로드 대시보드', path: '/browser_pageload_stats', category: 'Dashboard' },
    { name: '리소스 대시보드', path: '/browser_resource_stats', category: 'Dashboard' },
    { name: 'AJAX 대시보드', path: '/browser_ajax_stats', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Analysis
    { name: '페이지 로드 히트맵', path: '/rum_pageload_hitmap', category: 'Analysis' },
    { name: 'AJAX 분석', path: '/ajax_analytics', category: 'Analysis' },
    { name: '에러 트래킹', path: '/browser_error_tracking', category: 'Analysis' },
    { name: '사용자 세션 검색', path: '/user_session_event_search', category: 'Analysis' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    // Statistics
    { name: '페이지 로드 통계', path: '/page_load_statistics', category: 'Statistics' },
    { name: 'IP 통계', path: '/ip_statistics', category: 'Statistics' },
    { name: '사용자 ID 통계', path: '/user_id_statistics', category: 'Statistics' },
    { name: '리소스 통계', path: '/resource_statistics', category: 'Statistics' },
    { name: 'URL 패턴 통계', path: '/url_pattern_statistics', category: 'Statistics' },
    { name: '에러 통계', path: '/error_statistics', category: 'Statistics' },
    // Management
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // Mobile 메뉴
  QN.MOBILE_MENUS = [
    // Dashboard
    { name: '모바일 대시보드', path: '/mobile_dashboard', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Analysis
    { name: '사용자 액션 히트맵', path: '/rum_useraction_hitmap', category: 'Analysis' },
    { name: 'HTTP 히트맵', path: '/rum_http_hitmap', category: 'Analysis' },
    { name: '사용자 세션 검색', path: '/user_session_event_search', category: 'Analysis' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    // Statistics
    { name: '화면 로드 통계', path: '/screen_load_statistics', category: 'Statistics' },
    { name: 'ANR 통계', path: '/anr_statistics', category: 'Statistics' },
    { name: '크래시 통계', path: '/crash_statistics', category: 'Statistics' },
    // Management
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // Network Performance (NPM) 메뉴
  QN.NETWORK_MENUS = [
    // Dashboard
    { name: '네트워크 토폴로지', path: '/network_topology', category: 'Dashboard' },
    { name: 'TCP 진행', path: '/network_progress_tcp', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Analysis
    { name: 'TCP 세션 상태', path: '/tcp_session_state', category: 'Analysis' },
    { name: 'UDP 세션 상태', path: '/udp_session_state', category: 'Analysis' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    // Management
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: 'IP 이벤트 수신자', path: '/ip_event_receivers', category: 'Management' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // Network Management (NMS) 메뉴
  QN.NETWORK_MGMT_MENUS = [
    // Dashboard
    { name: '토폴로지', path: '/topology', category: 'Dashboard' },
    { name: '대시보드', path: '/dashboard', category: 'Dashboard' },
    { name: '데이터 파이프라인', path: '/dashboard/data_pipeline', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    // Device
    { name: '장치 인벤토리', path: '/deviceInventory', category: 'Device' },
    { name: '헬스 체크', path: '/healthCheck', category: 'Device' },
    { name: '헬스 체크 목록', path: '/healthCheckList', category: 'Device' },
    { name: '인터페이스 상태', path: '/interfaceStatus', category: 'Device' },
    { name: '장치 트렌드', path: '/deviceTrend', category: 'Device' },
    { name: '장치 히스토리', path: '/deviceHistory', category: 'Device' },
    { name: '장치 설정', path: '/deviceSetting', category: 'Device' },
    // Analysis
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    // Setting
    { name: 'OID 관리', path: '/oidManagement', category: 'Setting' },
    { name: 'MIB 업로드', path: '/mibUpload', category: 'Setting' },
    { name: 'MIB 브라우저', path: '/mibBrowser', category: 'Setting' },
    { name: 'Trap 설정', path: '/trapSetting', category: 'Setting' },
    { name: 'Syslog 설정', path: '/syslogSetting', category: 'Setting' },
    { name: '매니저 정보', path: '/managerInfo', category: 'Setting' },
    { name: '설치', path: '/install', category: 'Setting' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // Cloud Integration (VR) 메뉴
  QN.CLOUD_MENUS = [
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    { name: 'AWS EC2', path: '/flexboard/aws_ec2', category: 'AWS' },
    { name: 'AWS EBS', path: '/flexboard/aws_ebs', category: 'AWS' },
    { name: 'AWS ELB', path: '/flexboard/aws_elb', category: 'AWS' },
    { name: 'AWS AutoScaling', path: '/flexboard/aws_autoscaling', category: 'AWS' },
    { name: 'AWS ElasticBeanstalk', path: '/flexboard/aws_elasticbeanstalk', category: 'AWS' },
    { name: 'AWS ElastiCache', path: '/flexboard/aws_elasticache', category: 'AWS' },
    { name: 'ECS Task', path: '/flexboard/ecs_task', category: 'AWS' },
    { name: 'ECS Service', path: '/flexboard/ecs_service', category: 'AWS' },
    { name: 'ECS Container Instance', path: '/flexboard/ecs_container_instance', category: 'AWS' },
    { name: '메트릭스 카운터', path: '/counter', category: 'Analysis' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // Log Monitoring 메뉴
  QN.LOG_MENUS = [
    { name: '데이터 파이프라인 대시보드', path: '/dashboard/data_pipeline', category: 'Dashboard' },
    { name: 'Flex 보드', path: '/flexboard', category: 'Dashboard' },
    { name: '라이브 테일', path: '/liveTail', category: 'Log' },
    { name: '로그 탐색기', path: '/logExplorer', category: 'Log' },
    { name: '로그 검색', path: '/logSearch', category: 'Log' },
    { name: '로그 설정', path: '/logSetting', category: 'Log' },
    { name: '에이전트 설치', path: '/install', category: 'Management' },
    { name: '프로젝트 관리', path: '/management', category: 'Management' },
    { name: '프로젝트 멤버', path: '/members', category: 'Management' },
    { name: '이벤트 규칙', path: '/event/rules', category: 'Event' },
    { name: '이벤트 히스토리', path: '/event/history', category: 'Event' },
  ];

  // productType → URL path 매핑
  QN.PRODUCT_TYPE_MAP = {
    'APM': 'apm',
    'DB': 'database',
    'SERVER': 'sms',
    'CONTAINER': 'cpm',
    'URL': 'wpm',
    'BROWSER': 'browser',
    'MOBILE': 'mobile',
    'NETWORK': 'network',
    'NMS': 'networkManagement',
    'CLOUD': 'vr',
    'LOG': 'log',
  };

  // URL path → 메뉴 매핑
  QN.PRODUCT_MENUS = {
    'apm': QN.APM_MENUS,
    'sms': QN.SERVER_MENUS,
    'database': QN.DATABASE_MENUS,
    'cpm': QN.KUBERNETES_MENUS,
    'wpm': QN.URL_MENUS,
    'browser': QN.BROWSER_MENUS,
    'mobile': QN.MOBILE_MENUS,
    'network': QN.NETWORK_MENUS,
    'networkManagement': QN.NETWORK_MGMT_MENUS,
    'vr': QN.CLOUD_MENUS,
    'log': QN.LOG_MENUS,
  };

})(window.WhaTapQN);
