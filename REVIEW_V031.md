# v0.3.1 리뷰 패치

리뷰일: 2026-10-14 · 대상: `orca-tutor-v0.3-updated.zip`

| 심각도 | 내용 | 위치 | 수정 |
|---|---|---|---|
| Critical | 브라우저 → 앱 연동이 한 번도 동작하지 않았음. 콘텐츠 스크립트의 fetch 는 `Origin: https://github.com` 으로 나가서 Chrome 로컬 네트워크 접근 검사에 막힘(`LocalNetworkAccessPermissionDenied`). 허용해도 브리지가 `chrome-extension://` 출처만 받아 403 | `extension/highlight.js` copyDone | `extension/background.js` 서비스 워커가 대신 호출(확장 출처 + `host_permissions`). 말풍선에 전달 성공/실패 표시 |
| High | 실제 GitHub 에서 HTTPS 복사 버튼을 못 찾음. 버튼 이름이 `aria-label`·텍스트가 아니라 `aria-labelledby` 툴팁("Copy URL to clipboard")에만 있음 | `extension/highlight.js` norm | `aria-labelledby` 텍스트도 읽음 |
| High | 수동 형광펜을 한 번 쓰면 숨은 overlay 창이 남아 `window-all-closed` 가 안 뜸 → Windows 에서 메인 창을 닫아도 앱 프로세스가 계속 살아 있음 | `src/main.cjs` create | 메인 창 `closed` 에서 overlay destroy |
| Medium | 브라우저 복사 이벤트를 저장소 구분 없이 받아들임 → 아무 GitHub 저장소에서 복사해도 clone 2단계가 진행됨 | `src/renderer.js` onBrowserEvent | clone 1단계 `url` 과 대조, 다르면 안내만 |
| Medium | 복사 후 250ms 대기 중 페이지 이동·중지로 cleanup 되면 `tip` 이 null → TypeError | `extension/highlight.js` copyDone | null 가드 |
| Low | 좌표 숫자 검증보다 `getDisplayNearestPoint` 가 먼저 호출돼 NaN 입력 시 엉뚱한 오류 | `src/main.cjs` highlightRect | 검증 먼저, 정수로 반올림해 전달 |

## 검증
- `node --check` 로 수정 파일 3개 구문 확인.
- `npm test`: 64/64 통과.
- Windows Electron 44.7.2 에서 CDP 로 형광펜 표시→숨김→잘못된 좌표→창 닫기: 수정본은 1초 내 프로세스 종료, 수정 전 코드는 10초 뒤에도 4개 잔존 (버그 재현·수정 확인).
- 실제 github.com + Chrome 154 (headless, `Extensions.loadUnpacked` 로 확장 로드): 팝업 연결 코드 저장 → 시작 → Code 강조·클릭 → HTTPS 복사 강조·클릭 → 클립보드 `https://github.com/mingwonkim/harujon-assets.git` 확인 → 앱이 2/4 → 3/4 진행. 다른 저장소(agent-monitor)에서는 2/4 유지 + 안내 문구. 페이지 콘솔 오류 0. 재현: `scripts/e2e-extension.cjs`.
- **미검증**: macOS, 사람이 직접 띄운 일반(비 headless) Chrome, 한국어 GitHub UI.
