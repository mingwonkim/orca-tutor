# memory.md

## 2026-10-14 — v0.3.1 리뷰 패치
- 사용자가 폰에서 v0.3 zip 을 GitHub 에 올림 → 클론·압축 해제 후 이전 버전들처럼 리뷰+패치 진행.
- 복사 이벤트를 강의 예제 저장소 URL 과 대조하기로 함: 다른 저장소에서 복사해도 clone 2단계가 넘어가던 문제. 기준 URL 은 lessons.js clone 1단계 `url` 하나만 둔다(중복 하드코딩 방지).
- `npm test` 는 사용자 승인 후 실행 — 64/64 통과 (2026-10-14).
- 브리지 호출을 서비스 워커로 옮김: 콘텐츠 스크립트 fetch 가 Chrome 로컬 네트워크 접근 검사(LocalNetworkAccessPermissionDenied)에 막히는 걸 실제 github.com 에서 네트워크 로그로 확인. 브리지 Origin 검사를 github.com 까지 넓히는 대안은 아무 웹페이지 스크립트가 토큰만 알면 호출 가능해져서 버림.

## 2026-10-14 — v0.4.0 Orca 연동
- 자동 확인은 화면 판독이 아니라 공식 orca CLI(--json) 로 함: 안정적이고 OS 공통. 판정은 레슨 시작 시점 스냅샷과 비교 — 이미 4분할 탭이 있던 사용자도 오탐 없게.
- 자동 형광펜은 Windows UIA: Orca(Electron) 접근성 트리에 버튼 이름이 다 노출돼 있음. PowerShell 을 매번 띄우면 느려서 상주 프로세스 하나에 질의(첫 0.4초, 이후 ~40ms).
- 단축키는 문서에 없는 게 많아 app.asar 의 기본값 표를 직접 읽음 → 기존 레슨의 Ctrl+J·Ctrl+\·Ctrl+Shift+\ 가 틀렸음.
- 사용자가 PC 사용 중이라 E2E 는 ORCA_TUTOR_HIDDEN 숨김 모드로 돌림.
