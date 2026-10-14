# Orca Interactive Tutor — v0.4.0

Orca IDE 초보자용 단계별 튜토리얼(Electron 데스크톱 앱) + GitHub 형광펜 Chrome 확장.

## 설치

### 설치 파일 (Windows)
`npm run dist:win` → `dist/` 에 설치 프로그램(`Orca Tutor Setup 0.4.0.exe`)과 무설치 실행 파일(`Orca Tutor-0.4.0-portable.exe`)이 생깁니다.
코드 서명이 없어서 처음 실행할 때 Windows SmartScreen 경고가 뜰 수 있습니다(추가 정보 → 실행).

macOS 는 macOS 에서 `npm run dist:mac` 으로 dmg 를 만듭니다(서명·공증 없음, 미검증).

### 소스에서 실행
```bash
npm install
npm start
npm test        # 단위 테스트
```

### 브라우저 확장
1. `chrome://extensions` → 개발자 모드 → **압축해제된 확장 프로그램을 로드합니다** → `extension` 폴더
   (설치 파일로 깔았다면 설치 폴더의 `resources/extension`)
2. 튜터 앱 "브라우저 연동"의 **연결 코드 복사** → 확장 팝업에 붙여 넣고 저장
3. GitHub 저장소 페이지에서 확장 팝업 → **형광펜 튜토리얼 시작**
4. 처음 복사할 때 Chrome 이 "클립보드 확인" 권한을 물으면 허용(복사된 주소 확인용, 차단해도 진행 가능)

## 무엇을 자동으로 해 주나

| 기능 | 방법 | 플랫폼 |
|---|---|---|
| Orca 작업 자동 확인 → 다음 단계 자동 진행 | 공식 `orca` CLI(`repo list`·`worktree list`·`terminal list --json`) 읽기 전용 조회. 프로젝트 등록, 새 Worktree, 터미널 분할(2·3·4분할), 에이전트 3개 실행 | Windows·macOS (CLI 가 있으면) |
| Orca 화면 버튼 형광펜 | Windows UI Automation 으로 Orca 창의 버튼(프로젝트 추가, 새 탭, 오른쪽 분할, 작업 트리 검색, 설정 등) 위치를 1초마다 찾아 클릭이 통과되는 노란 테두리 표시. 한국어·영어 UI | Windows 전용 (macOS 는 수동 좌표 형광펜) |
| 단축키 표기 | Orca 1.4.205 설치 파일의 기본 단축키 표로 검증한 값. `~/.orca/keybindings.json` 에 바꾼 값이 있으면 그 값을 표시 | 공통 |
| GitHub Code → HTTPS 복사 안내 | 확장이 화면 상태(메뉴 닫힘/Local/HTTPS/복사)를 보고 다음 클릭할 곳을 강조. 복사하면 클립보드 확인 후 튜터에 전달 | Chrome |
| Clone 폴더 확인 | `git rev-parse`·`remote get-url` 로 예제 저장소 clone 여부 확인(읽기 전용) | 공통 |

자동 확인이 없는 단계(Orca 실행, 팔레트 열기, 실행 환경 선택 등)는 직접 확인한 뒤 **완료했어요**를 누릅니다.

## 검증한 것 / 못 한 것
- Windows 10 + Orca 1.4.205 + Chrome 154: 단위 테스트, `scripts/e2e-*.cjs`(실제 github.com·실제 Orca CLI·실제 Orca 창 UIA, 빌드된 exe 포함), computer-use 로 실제 Chrome 에 확장 설치부터 복사·앱 진행까지 사람처럼 조작.
- **못 한 것**: macOS 실행·dmg, 코드 서명, 영어 UI Orca(버튼 이름은 Orca 번역 원문에서 가져옴), Orca 다른 버전, 설치 프로그램(NSIS) 실제 설치 과정.

## E2E (PC 를 쓰는 중에도 돌릴 수 있게 앱은 숨김 모드)
```bash
node scripts/e2e-orca.cjs                                          # 앱을 직접 숨김 모드로 띄움
ORCA_TUTOR_BIN="dist/win-unpacked/Orca Tutor.exe" node scripts/e2e-orca.cjs   # 빌드 결과 검사
ORCA_TUTOR_HIDDEN=1 npx electron . --remote-debugging-port=9333    # 아래 두 개용
node scripts/e2e-extension.cjs                                     # headless Chrome + 실제 github.com
node scripts/e2e-overlay.cjs                                       # 수동 형광펜 + 창 닫기 → 앱 종료
```

## 구조
- `src/main.cjs` — Electron 메인. IPC 는 메인 문서(index.html)만 허용, 외부 URL 허용 목록
- `src/orca.cjs` — Orca CLI 조회·판정(`evaluate`), 단축키 파일, Windows UIA 버튼 찾기(상주 PowerShell)
- `src/bridge.cjs` — 127.0.0.1 전용 브리지(확장 → 앱), 실행마다 새 토큰
- `src/lessons.js` — 6개 과정 29단계. `check`(자동 확인), `target`(형광펜 버튼), `action`(단축키 ID)
- `extension/` — Chrome MV3. 브리지 호출은 `background.js` 서비스 워커만
- 리뷰 기록: `REVIEW_RESULT.md`(v0.1.1), `REVIEW_V021.md`, `REVIEW_V030.md`, `REVIEW_V031.md`, `ASTRA_REVIEW_V031.md`, `REVIEW_V040.md`

실무 시나리오는 교육용 예시이며 특정 회사의 검증된 운영 방식이 아닙니다.
