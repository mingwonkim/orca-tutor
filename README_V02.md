# Orca Interactive Tutor v0.2 (Windows / macOS)

## 변경 사항

- 기존 Claude 리뷰 v0.1.1 기반으로 **29개 학습 단계와 각 단계의 현업 활용 사례** 유지.
- GitHub 브라우저 확장에서 `Code` 버튼 → HTTPS 복사 버튼 **순차 형광펜 강조**.
- Electron과 Chrome 확장 사이에 **127.0.0.1 전용 인증 브리지** 추가. 복사 버튼 클릭 이벤트를 수신하면 `GitHub 프로젝트 가져오기` 강의의 2단계에서만 자동으로 다음 단계로 진행.
- 브리지 연결 코드는 앱 재시작마다 변경. 허용된 브라우저 확장 Origin, 토큰, 이벤트 타입, GitHub URL 형식 검증.
- Windows/macOS 별 단축키 표기, 실무 활용 설명, 수동 진행 기능 유지.

## 실행

Node.js 20+ 설치 후 압축 해제한 프로젝트 폴더에서:

```sh
npm install
npm start
```

Chrome에서 `chrome://extensions` → 개발자 모드 → **압축해제된 확장 프로그램 로드** → `extension` 폴더 선택.

1. 데스크톱 튜터에서 **GitHub 프로젝트 가져오기** 강의 선택.
2. 2단계인 **Clone 주소 복사**로 이동.
3. 데스크톱 튜터의 **브라우저 연동 코드**를 복사.
4. Chrome 확장 팝업에 연결 코드를 붙여 넣고 저장.
5. GitHub 저장소 메인 페이지에서 **형광펜 튜토리얼 시작** 클릭.
6. 강조된 Code 버튼과 HTTPS 복사 버튼을 순서대로 클릭.
7. 브라우저 이벤트가 연결되면 데스크톱 튜터가 3단계로 이동.

## 검증 범위와 제한

- `npm test`로 학습 데이터/상태/로컬 브리지의 자동 테스트 수행.
- **Windows/macOS 실기기 GUI 실행과 실제 최신 GitHub UI 연동은 검증하지 못함.** GitHub DOM이 변경되면 복사 버튼 탐색을 조정해야 함.
- 브라우저에서 **복사 버튼 클릭을 감지**하며, 클립보드에 정확한 주소가 들어갔는지까지 검증하지 않음.
- Orca IDE 내부의 버튼 자동 형광펜 강조 및 Worktree/Clone 실제 완료 자동 검증은 아직 구현하지 않음. 해당 단계는 수동 완료.
- 확장은 GitHub에 한정되며, 연결 코드는 **비밀번호처럼 취급**하고 타인과 공유하지 말 것.
- macOS Chrome 확장 프로그램도 동일한 방식이지만, Electron 항상 위 창의 전체 화면 동작은 운영체제별로 차이가 있을 수 있음.

## Claude 리뷰 요청

`CLAUDE_REVIEW.md`와 `REVIEW_RESULT.md`를 참고하고, 이번에 추가한 `src/bridge.cjs`, `extension/highlight.js`, `test/bridge.test.cjs`를 집중 검토해 주세요. 특히 브라우저 DOM 변경 내성, 인증/Origin 정책, 비동기 상태 변경, 초보자 UX를 검토해 주세요.
