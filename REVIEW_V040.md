# v0.4.0 — "아직 없는 것" 마무리

작업일: 2026-10-14 · 환경: Windows 10, Orca 1.4.205, Chrome 154, Electron 44.7.2

## 새로 구현
| 항목 | 내용 |
|---|---|
| Orca 작업 자동 확인 | `src/orca.cjs` — `orca repo/worktree/terminal list --json` 읽기 전용. 레슨별 시작 시점 스냅샷과 비교(`evaluate`)해 프로젝트 등록·새 Worktree·분할 수 증가·에이전트 수를 판정, 2초 폴링 후 자동 진행. 터미널 미리보기·제목 같은 내용은 스냅샷에서 버림 |
| Orca 버튼 자동 형광펜 | Windows UI Automation(상주 PowerShell, 질의당 ~40ms)으로 Orca 창 버튼 이름 정규식 매칭 → 물리 픽셀을 `screenToDipRect` 로 변환 → 클릭 통과 overlay. 1초마다 재탐색해 창 이동·레이아웃 변경을 따라감. 토글 저장 |
| 단축키 검증 | Orca 설치 파일(app.asar)의 기본 단축키 표에서 확인. `~/.orca/keybindings.json`(공통 + `platforms.<os>`) 사용자 값 표시 |
| 패키징 | electron-builder: Windows NSIS 설치 + portable, macOS dmg 설정. 확장 폴더는 `resources/extension` 으로 동봉 |
| E2E 숨김 모드 | `ORCA_TUTOR_HIDDEN=1` — 창·overlay 를 화면에 띄우지 않고 동작은 그대로 |
| 확장 (v0.3.1 미커밋분) | 첫 복사 때 클립보드 권한 창 안내, 탭 안내 말풍선을 위쪽에 표시 |

## 고친 단축키 (기존 레슨이 틀렸던 것)
| 동작 | 기존 | Orca 1.4.205 기본값 (Win / mac) |
|---|---|---|
| Worktree Jump (Switch worktree) | Ctrl+J | **Ctrl+Shift+J** / ⌘J |
| 오른쪽 분할 | Ctrl+\ | **Ctrl+Shift+D** / ⌘D |
| 아래로 분할 | Ctrl+Shift+\ | **Alt+Shift+D** / ⌘⇧D |
| 새 터미널 탭 · 파일 검색 | Ctrl+T · Ctrl+P (미검증) | 동일 — 검증됨 |
| 설정 | — | Ctrl+, / ⌘, (추가) |

## 검증
- `npm test` 74/74 (판정 로직, CLI 출력 정제, 오류 구분, keybindings 파싱, 레슨 형식)
- `scripts/e2e-orca.cjs`: 실제 Orca 에서 단축키 표기, "작업 트리 검색"·"새 탭"·"Terminal 오른쪽 분할" 버튼 추적, 분할 전 대기, 예제 저장소 등록 확인 후 자동 진행
- `scripts/e2e-extension.cjs`, `scripts/e2e-overlay.cjs` 회귀 통과
- 패키징 결과는 아래 "빌드" 참고

## 한계
- macOS: 자동 형광펜 없음(AX API 미구현), dmg 미빌드·미검증
- 영어 UI Orca 버튼 이름은 Orca 번역 원문에서 가져왔고 실기 확인 안 함
- 자동 형광펜은 Orca 화면에 해당 버튼이 보일 때만 (사이드바 숨김·다른 탭이면 "찾는 중")
- 코드 서명 없음 → SmartScreen 경고
- `npm audit`: electron-builder 의존성 moderate 8건 (빌드 도구, 배포물 미포함)
