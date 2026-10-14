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

## astra 리뷰 반영 (ASTRA_REVIEW_V031.md)
- [ ] findCopy 를 열린 Code 메뉴 + HTTPS 탭 선택 상태로 한정, 클립보드 읽기 실패와 주소 불일치 구분
- [ ] 메뉴 닫힘·탭 전환 시 복사 버튼 재탐색 (phase 1 에서 멈춤)
- [ ] copyDone 실행 세대 ID — 중지된 안내가 전송·말풍선 갱신 못 하게
- [ ] verify-repo 성공을 "Orca 등록 완료"로 치지 않기 + 성공 메시지가 render() 에서 지워지는 문제
- [ ] no-pair 안내 문구 정정 ("저장 후 안내 다시 시작")
- [ ] 앱 1단계에서 확장 안내 끝내면 2단계 연동 끊김
- [ ] fromApp() 을 메인 창 webContents + index.html 로 한정
- [ ] (computer-use 발견) 연결 코드가 두 줄로 넘어가면 "연결 코드 복사" 버튼이 둘째 줄을 가림 — src/index.html #pair
[o] 22:10 astra 리뷰(Medium 6·Low 2) 기록 + computer-use 실사용 테스트 — 튜터 앱 조작·연결 코드 복사 확인, Chrome 확장 설치는 사용자 데스크톱 창 겹침으로 중단
