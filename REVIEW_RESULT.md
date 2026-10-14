# Orca Tutor MVP — 코드 리뷰 결과 및 적용 패치 (v0.1.1)

리뷰일: 2026-10-13 · 대상: `orca-tutor-claude-review.zip` (v0.1.0)

표기: **[확인]** 공식 문서·레지스트리로 확인 / **[코드]** 코드 분석 / **[실기기]** Windows·macOS·Orca 실기기 검증 필요

## 1. 발견 사항

### High
| ID | 내용 | 위치 | 상태 |
|---|---|---|---|
| H1 | 현업 설명(왜/현업/결과/주의) UI 미구현 — 필수 요구사항 | lessons.js, index.html | ✅ 전 단계 필드 작성 + 접이식 패널 + 스키마 테스트 |
| H2 | 단축키가 공식 문서와 불일치/미기재 **[확인]**: 분할 `Ctrl+\`·`Ctrl+Shift+\`는 문서에 없음(메뉴 "Split terminal right/down"만 안내), `Ctrl+T` 미기재, `Ctrl+J/P`는 macOS만 명시. Shift+Enter 대상은 프로젝트가 아니라 **worktree** | lessons.js | ✅ `keyVerified` 플래그 + "미검증" 배지 + 메뉴 대안(`menu`) 표기, multi 레슨 문구 수정 |
| H3 | 예제 저장소(harujon-assets)는 아이콘·HTML 자산 저장소(pubspec.yaml 없음) **[확인]** → `flutter test` 실패. 실무 2단계에 worktree 생성 명령 없음 | lessons.js real | ✅ 사전 조건 단계 추가, `git worktree add` 명령 추가. ⏳ 전용 샘플 Flutter 저장소는 직접 생성 필요 |
| H4 | Electron `^35` — 마지막 35.7.5, 현재 최신 44.7.0 **[확인]**. 보안 패치 중단 | package.json | ✅ `^44.0.0`, engines 명시. ⏳ `npm install` 후 lockfile 커밋 |

### Medium
| ID | 내용 | 상태 |
|---|---|---|
| M1 | 저장 상태 손상 시 크래시(삭제된 레슨 id → `next`에서 TypeError) / 단계 수 축소 시 완료 불가 / JSON.parse 예외 | ✅ `src/state.js` 정규화 + 테스트 7개 |
| M2 | 말풍선이 첫 스크롤에만 반응(`once:true`), resize 미대응 | ✅ scroll(capture)·resize 계속 추적 |
| M3 | 클릭 후 말풍선이 드롭다운(HTTPS 주소)을 가림 | ✅ 클릭 후 버튼 위쪽으로 이동 |
| M4 | SPA 이동/재렌더 미대응(`observer` 선언만 함) | ✅ turbo:load·popstate·노드 교체 시 정리 |
| M5 | 리스너 누적, 제거 후 클릭 시 `tip` null TypeError | ✅ AbortController로 일괄 해제 |
| M6 | 선택자 오탐(파일 보기 Code/Blame 등), 저장소 루트 미확인 | ✅ 경로 검사, nav/tablist 제외, `aria-haspopup` 우선. **[실기기]** 실제 GitHub DOM 확인 |
| M7 | macOS 전체 화면 Orca 위에 안내창 미표시 가능 | ✅ `setVisibleOnAllWorkspaces(visibleOnFullScreen)` **[실기기]** |
| M8 | CSP 없음, 네비게이션/새창 가드 없음, IPC sender 미검증, 모든 http(s) 열기 허용 | ✅ CSP, will-navigate/새창 차단, sandbox, sender 검증, https+허용 호스트만 |
| M9 | 한국어 키보드에서 `\`는 `₩` 키 | ✅ Windows 표기에 "(₩ 키)" 추가 |

### Low
| ID | 내용 | 상태 |
|---|---|---|
| L1 | 첫 렌더가 win32 기준 → Mac에서 Ctrl 표기 깜빡임 | ✅ preload에서 platform 동기 노출 |
| L2 | 복사/링크 실패 시 피드백 없음 | ✅ 오류 메시지 |
| L3 | 1단계에서 진행률이 이미 1/n, 완료 상태 미저장 | ✅ 진행률 수정, 완료 저장 + 목록에 ✓ |
| L4 | aria-live/progressbar/키보드 조작 없음 | ✅ role/aria, Alt+←/→ |
| L5 | 창 높이 680 고정(작은 화면에서 잘림) | ✅ 작업 영역 기준 clamp |
| L6 | 불필요한 `host_permissions`(설치 경고 발생) | ✅ 제거(activeTab으로 충분) |
| L7 | set-top이 전역 win 참조, 패키징 설정 없음 | ✅ 전역 참조 제거 · ⏳ 패키징 |

## 2. 요구사항 대비 구현 상태 (v0.1.1)
| 요구사항 | 상태 |
|---|---|
| 단계별 현업 설명 | ✅ 전 단계(29개) 필드 + 테스트 강제 |
| 6개 과정 데이터 | ✅ 정확성 보완. 단축키는 **설치 버전 검증 전까지 '미검증' 표시** |
| OS별 키 표기 | ✅ (Linux는 Windows 표기) |
| 진행 저장/완료 표시 | ✅ |
| 항상 위 | ⚠️ macOS 전체 화면 **[실기기]** |
| GitHub Code 강조 | ⚠️ Code 버튼 + 2단계 안내. HTTPS 복사 버튼 자체 강조는 미구현 |
| Orca 자동 강조·자동 검증·언어 감지·앱↔확장 동기화 | ⏳ 계획 |
| 패키징(.exe/.dmg)·코드 서명 | ⏳ |
| 자동 테스트 | ✅ 데이터·상태 단위 테스트 63개 / ⏳ E2E |

## 3. 남은 작업 (우선순위)
1. **P0** `npm install` → Electron 44에서 실행 확인 → `package-lock.json` 커밋
2. **P0** 설치된 Orca에서 Settings → Shortcuts 대조 후 맞는 단축키만 `keyVerified:true`로 변경
3. **P0** 전용 샘플 Flutter 저장소 생성 후 real 레슨에 연결 (개인 운영 저장소 대신)
4. **P1** 실제 github.com에서 형광펜 확인(Code 버튼 선택, 드롭다운 열릴 때 재렌더로 말풍선이 사라지지 않는지)
5. **P1** E2E: Playwright `_electron.launch` 스모크, 확장 persistent context 테스트
6. **P2** electron-builder 패키징, macOS 공증, Windows 서명

## 4. 수동 테스트 매트릭스
- Windows 11: 100% / 150% 배율, 1366×768, 한국어 키보드(₩ 키)
- macOS: Orca 전체 화면 / 다른 Space, 다크·라이트
- Chrome: 저장소 메인, `/tree/branch`, 파일 보기(실행 거부 메시지), 강조 → 페이지 이동 → 잔상 없음

## 5. 이번에 검증한 것
- `npm test`: 63/63 통과 (레슨 스키마, 상태 정규화)
- Chromium에서 UI 렌더 확인: CSP 적용 상태에서 콘솔 오류 0, 손상된 localStorage로 시작해도 정상, 과정 완료 → ✓ 표시
- 가짜 GitHub 페이지에서 형광펜: 강조 적용, 스크롤 추적, 클릭 후 말풍선이 버튼 위로 이동, 제거 후 클릭 오류 없음, 파일 보기 경로에서 실행 거부
- **미검증**: 실제 Electron 실행, 실제 github.com DOM, Orca 실기기

## 6. 변경 파일
- `src/lessons.js` — 스키마 확장, 전 단계 현업 설명, 단축키 검증 플래그·대안, 실무 레슨 보완
- `src/state.js` (신규) — 상태 정규화
- `src/renderer.js`, `src/index.html` — 설명 패널, 미검증 배지, 완료 저장, 접근성, CSP
- `src/main.cjs`, `src/preload.cjs` — 보안 강화, macOS 전체 화면, 창 크기
- `extension/highlight.js`, `extension/manifest.json` — 리스너·SPA·위치 수정, 권한 축소
- `package.json` — Electron 44, test 스크립트
- `test/*.test.cjs` (신규)

출처: [Orca Tabs·Panes·Splits](https://www.onorca.dev/docs/model/tabs-panes-splits) · [Orca Quick Open](https://www.onorca.dev/docs/model/quick-open)
