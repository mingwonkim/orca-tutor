# todo.md

## 할 일
- [ ] 앱 화면에서 레슨 이동·형광펜 수동 확인
- [ ] 설치된 Orca Settings → Shortcuts 와 대조해 맞는 단축키만 `keyVerified:true`
- [ ] 실제 github.com 에서 형광펜 Code → HTTPS 복사 순차 안내 확인
- [ ] verify-repo 기대 URL(main.cjs 하드코딩)을 lessons.js 에서 받도록 통일

## 2026-10-14
[o] 20:30 v0.3 zip 클론·압축 해제 + 리뷰 — 버그 4건 패치 (REVIEW_V031.md)
[o] 20:45 npm test 실행 — 64/64 통과
[o] 20:55 npm install + npm start — Electron 44.7.2, "Orca Tutor" 창 표시, 로그 오류 없음
[o] 21:05 형광펜 표시→숨김→창 닫기 CDP 자동 테스트 — 수정본 1초 내 종료, 수정 전 코드는 10초 후에도 프로세스 4개 잔존
