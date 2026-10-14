# Orca Interactive Tutor — MVP v0.1.1

> v0.1.1: 리뷰 반영판. 변경 내역과 남은 작업은 `REVIEW_RESULT.md` 참고.

Windows/macOS 공용 Orca IDE 단계별 튜토리얼 + GitHub 웹페이지 형광펜 강조 Chrome 확장 프로그램.

## 시작하기

Node.js 20 이상 설치 후 프로젝트 폴더에서:

```bash
npm install
npm start
npm test   # 레슨 스키마·상태 단위 테스트
```

Windows에서는 PowerShell, macOS에서는 Terminal에서 실행합니다. Electron은 해당 OS에서 설치 및 실행되어야 합니다. 이 압축파일에는 설치 프로그램(.exe/.dmg)이나 node_modules가 포함되지 않습니다.

## 브라우저 형광펜 확장

1. Chrome 주소창에서 `chrome://extensions` 열기
2. 우측 상단 **개발자 모드** 켜기
3. **압축해제된 확장 프로그램을 로드합니다** 선택
4. 이 프로젝트의 `extension` 폴더 선택
5. GitHub 저장소(예: https://github.com/mingwonkim/harujon-assets) 열기
6. 확장 아이콘 → **GitHub Code 버튼 강조** 클릭

확장은 GitHub 페이지의 실제 `Code` 버튼을 DOM으로 탐색해 노란색 테두리를 표시합니다. 버튼 클릭 시 안내 문구가 바뀝니다. GitHub UI가 변경되면 선택자 보완이 필요할 수 있습니다.

## 구현된 내용

- Windows/macOS 공용 Electron 데스크톱 앱
- 항상 위에 뜨는 안내창, 과정/단계 이동, 로컬 진행 상황 저장
- 운영체제별 단축키 표시, 명령어 복사, 예제 저장소 열기
- 기초/Worktree/4분할/멀티 프로젝트/Flutter 병렬 개발 실습
- GitHub Code 버튼 실시간 DOM 형광펜 강조 Chrome 확장

## 아직 구현하지 않은 것

- Orca 내부 버튼 자동 인식 및 정확한 위치 강조
- Orca 작업 완료 자동 검증, 전역 단축키 감지
- 사이트 전체 자동 탐색/AI Computer Use, Firefox/Safari 지원
- Electron 데스크톱 앱과 브라우저 확장 사이 진행 상태 동기화
- UI 언어 자동 판별 및 번역 (기본 안내 언어: 한국어; Orca 메뉴명은 첨부 문서 기준)

따라서 데스크톱 실습은 실제 완료 여부를 확인하고 **완료했어요**를 눌러야 진행합니다. GitHub의 Code 버튼은 자동 강조되지만 웹사이트 개편 시 동작이 달라질 수 있습니다.

## 출처 및 검증 주의

`docs/orca_ade_guide.md`는 사용자가 제공한 원본입니다. 단축키/메뉴 이름은 설치된 Orca 버전에서 `Settings → Shortcuts`를 통해 확인해야 합니다. 실무 시나리오는 특정 기업의 검증된 실제 운영 방식이 아닌 교육용 예시입니다.

## 프로젝트 구조

- `src/main.cjs`: Electron 창과 외부 URL 열기
- `src/preload.cjs`: 최소 권한 IPC
- `src/index.html`, `src/renderer.js`: 튜토리얼 UI
- `src/lessons.js`: 튜토리얼 데이터(현업 설명 필드 포함)
- `src/state.js`: 진행 상태 정규화
- `test/`: 단위 테스트
- `extension/`: Chrome MV3 브라우저 강조 도구
- `docs/`: 원본 MD 가이드

## Claude 리뷰 안내

`CLAUDE_REVIEW.md`를 Claude에게 전달해 리뷰를 요청하세요. `docs/REAL_WORLD_USE_CASES.md`는 각 기능의 현업 활용 설명을 정리한 **교육 콘텐츠 초안**입니다. v0.1.1부터 각 단계 카드에 "왜 하는가 / 현업에서는 / 성공하면 / 주의할 점" 패널이 표시됩니다.
