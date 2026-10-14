# Claude 코드 리뷰 요청서 — Orca Interactive Tutor MVP

## 목표
Windows/macOS에서 실행되는 Orca IDE 학습용 Electron 앱과 GitHub 웹페이지의 클릭 위치를 형광펜으로 강조하는 Chrome 확장 프로그램을 검토해 주세요. **각 기능의 현업 활용 이유와 구체적인 개발 시나리오를 초보자가 이해하도록 설명하는 것**은 필수 제품 요구사항입니다.

## 우선 확인할 파일
- `README.md`: 현재 지원 범위 및 실행 방법
- `src/lessons.js`: 6개 과정, 단계별 안내 데이터
- `src/renderer.js`, `src/index.html`: UI, 진행 상태 및 이벤트
- `src/main.cjs`, `src/preload.cjs`: Electron 보안과 IPC
- `extension/manifest.json`, `extension/highlight.js`, `extension/popup.js`: 브라우저 DOM 강조
- `docs/orca_ade_guide.md`: 사용자 제공 원본 가이드. Orca 단축키/메뉴는 이 자료 기반이며 버전별 검증 필요
- `docs/REAL_WORLD_USE_CASES.md`: 추가한 실무 활용 요구사항/시나리오

## 필수 리뷰 관점
1. **현업 활용 설명**: 모든 강의/주요 기능에 '왜 사용하는가', '현업 예시', '언제 쓰면 안 되는가/주의점', '결과물'이 명확히 표시되는지. 현재 앱 UI에는 별도 실무 설명 필드가 없으므로 **미구현 요구사항**으로 보고 개선 방안을 제시해 주세요.
2. **초보자 경험**: 클릭 위치, 실제 UI 언어/버전 차이, 예외 화면, 성공 판정, 안내 누락.
3. **정확성**: Orca 단축키/메뉴, Worktree 분리, 터미널 4분할, 멀티 프로젝트 등은 설치 버전 검증 전 확정하지 말 것.
4. **브라우저 형광펜**: DOM 선택자 안정성, SPA 내비게이션, 리사이즈/스크롤, 이벤트 중복 등록, 클릭 차단 여부, 권한 범위.
5. **Electron 보안**: nodeIntegration/contextIsolation, preload API, 외부 링크 유효성, CSP, 데이터 저장.
6. **교차 플랫폼**: Windows/macOS 키 표기, 실행/패키징, 접근성/권한, 고해상도 화면.
7. **검증**: 실제 구현된 기능과 계획 기능을 구별하고, 재현 절차 및 테스트 항목을 제안.

## 요청 출력
- 심각도별 발견 사항(Critical/High/Medium/Low), 파일/위치, 재현 방법, 개선안
- 제품 요구사항 대비 구현 상태 표
- 우선순위별 수정 로드맵 및 필요한 테스트
- 가능하면 구체적인 패치 제안. **리뷰 요청 단계에서는 원본 파일을 임의로 수정하지 마세요.**

## 주의
이 프로젝트는 초기 MVP이며 실기기 통합 테스트 완료를 주장하지 않습니다. 자동 Orca UI 강조, 자동 단계 검증, 언어 자동 감지, Electron-확장 동기화, Computer Use는 아직 구현되지 않았습니다.
