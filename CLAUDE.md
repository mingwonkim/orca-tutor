# orca-tutor

Orca IDE 단계별 튜토리얼 (Electron 데스크톱 앱) + GitHub 형광펜 Chrome 확장(MV3).

## 구조
- `src/main.cjs` — Electron 메인. IPC 핸들러는 전부 `fromApp(e)` 로 sender 검증, 외부 URL 은 `ALLOWED_HOSTS` 만.
- `src/bridge.cjs` — 127.0.0.1 전용 HTTP 브리지. 확장 → 앱 이벤트(`github-copy-clicked`). 토큰은 실행마다 새로 생성.
- `src/lessons.js` — 레슨 데이터. 모든 단계에 why/practice/result/caution 필수 (테스트가 강제).
- `src/state.js` — localStorage 진행 상태 정규화.
- `extension/` — Chrome 확장. `highlight.js` 는 popup 이 executeScript 로 주입. **브리지 호출은 `background.js` 서비스 워커에서만** — 콘텐츠 스크립트 fetch 는 github.com 출처라 Chrome 로컬 네트워크 접근 검사와 브리지 Origin 검사에 둘 다 막힌다.
- `scripts/e2e-*.cjs` — 앱을 `npx electron . --remote-debugging-port=9333` 로 띄우고 실행하는 실기 테스트 (형광펜 창 닫기 / 실제 github.com 확장). `test/` 에 두면 `node --test` 가 집어가므로 분리.
- `docs/orca_ade_guide.md` — 사용자 제공 원본. 단축키는 설치 버전에서 검증 전까지 `keyVerified:false`.

## 실행
```bash
npm install && npm start
npm test        # node --test
```

## 규칙
- 리뷰 기록은 버전별 `REVIEW_V*.md` 로 남긴다.
- 실기기(Windows/macOS GUI, 실제 github.com DOM) 검증 안 한 건 "검증함"이라고 쓰지 않는다.
