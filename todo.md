# todo.md

## 할 일
- [ ] 앱 화면에서 레슨 이동·형광펜 수동 확인
- [ ] 설치된 Orca Settings → Shortcuts 와 대조해 맞는 단축키만 `keyVerified:true`
- [ ] 일반 Chrome 에 확장 직접 설치해 한 번 사용 (headless 자동 테스트만 함), 한국어 GitHub UI 확인
- [ ] verify-repo 기대 URL(main.cjs 하드코딩)을 lessons.js 에서 받도록 통일

## 2026-10-14
[o] 20:30 v0.3 zip 클론·압축 해제 + 리뷰 — 버그 4건 패치 (REVIEW_V031.md)
[o] 20:45 npm test 실행 — 64/64 통과
[o] 20:55 npm install + npm start — Electron 44.7.2, "Orca Tutor" 창 표시, 로그 오류 없음
[o] 21:05 형광펜 표시→숨김→창 닫기 CDP 자동 테스트 — 수정본 1초 내 종료, 수정 전 코드는 10초 후에도 프로세스 4개 잔존
[o] 21:40 실제 github.com 확장 E2E — 브리지가 원래 한 번도 안 되던 원인(로컬 네트워크 접근 차단+Origin) 수정, 복사 버튼 탐색 수정, 앱 2/4→3/4 진행 확인

[o] 22:10 astra 리뷰(Medium 6·Low 2) 기록 + computer-use 실사용 테스트 — 튜터 앱 조작·연결 코드 복사 확인, Chrome 확장 설치는 사용자 데스크톱 창 겹침으로 중단
[o] 22:50 astra 지적 7건 + 연결 코드 겹침 수정 — 확장 E2E(CLI 탭→HTTPS 재안내, 재복사 재전송, 다른 저장소 거부)·형광펜 E2E·npm test 64/64 통과
