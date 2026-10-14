# Orca Interactive Tutor v0.3 — 구현 및 검증 기록

## 새로 구현한 기능
- Electron 데스크톱 화면 위 투명 클릭 통과 형광펜. 사용자가 좌표를 입력해 위치를 지정하는 실험적 기능이며 Orca UI 자동 탐지는 **아님**.
- Git Clone 검증: 폴더 선택 후 `git rev-parse --show-toplevel`, `git remote get-url origin`으로 예시 저장소의 원격 주소 검사. 일치하면 Clone 튜토리얼 다음 단계로 진행. Git이 설치되어 있어야 함. 실제 Orca 프로젝트 등록은 별도이며 검증하지 않음.
- GitHub 확장: 버튼 클릭 후 클립보드 읽기 권한이 허용될 때에만 복사 주소 일치를 확인해 자동 진행. 읽기가 차단되면 클릭만 감지하고 사용자가 직접 확인하도록 함.
- GitHub 안내 일부를 웹페이지 언어(ko/en)에 맞춰 표기. 전체 튜토리얼 UI 언어 자동 전환은 아직 미구현.
- 기존 29단계의 현업 활용 설명 유지.

## 실행
`npm install && npm start` (Node 20+, Git 설치 권장). Chrome `chrome://extensions`에서 `extension/`을 unpacked로 로드한 뒤 앱의 연결 코드를 확장 팝업에 입력.

## 확인한 테스트
`npm test`: 64개 통과. JavaScript `node --check` 검사 수행. Windows/macOS GUI 통합 테스트는 수행하지 못함.

## 미완료/제약
- Orca IDE의 실제 버튼 자동 탐색·정확한 형광펜 자동 배치 미구현. 현재 데스크톱 형광펜은 수동 좌표 입력 방식.
- Orca에서 프로젝트가 등록되었는지, Worktree/분할이 성공했는지 자동 확인 미구현.
- GitHub 페이지 최신 레이아웃에서 실사용 검증 필요. 브라우저 클립보드 API는 권한/사용자 제스처 제약으로 실패할 수 있음.
- 전체 한국어/영어 UI 자동 대응 및 Orca 설치 버전 단축키 자동 검증 미구현.
- Windows/macOS 실제 앱 실행, 화면 배율, 다중 모니터, macOS 권한/전체화면 동작 검증 필요.

## 안전
- Git 검증은 읽기 전용. 사용자 승인 없는 push/clone/삭제 작업을 실행하지 않음.
- 수동 형광펜은 마우스 클릭을 통과시키며 필요시 숨길 수 있음.
