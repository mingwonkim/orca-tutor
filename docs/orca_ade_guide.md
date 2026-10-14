# Orca ADE 사용법 및 단축키 가이드

> 앞선 대화에서 정리한 내용을 Markdown으로 저장한 문서입니다. 단축키와 메뉴 명칭은 Orca 버전에 따라 달라질 수 있으므로 앱의 Settings → Shortcuts 및 공식 문서를 확인하세요.

## 1. 주요 단축키

| 기능 | Windows / Linux | macOS |
|---|---|---|
| 프로젝트·워크트리 빠른 검색 | `Ctrl+J` | `⌘ J` |
| 새 터미널 탭 | `Ctrl+T` | `⌘ T` |
| 현재 탭 닫기 | `Ctrl+W` | `⌘ W` |
| 오른쪽 분할 | `Ctrl+\` | `⌘ \` |
| 아래쪽 분할 | `Ctrl+Shift+\` | `⌘ ⇧ \` |
| 다음 탭 | `Ctrl+Shift+]` | `⌘ ⇧ ]` |
| 이전 탭 | `Ctrl+Shift+[` | `⌘ ⇧ [` |
| 최근 사용 탭 | `Ctrl+Tab` | `Ctrl+Tab` |
| 플로팅 터미널 | `Ctrl+Alt+A` | `⌘ ⌥ A` |
| 빠른 파일 열기 | `Ctrl+P` | `⌘ P` |

새 에이전트 탭, 워크스페이스 보드 등은 `Settings → Shortcuts`에서 단축키를 확인하거나 지정하세요.

## 2. GitHub 프로젝트 가져오기

1. Orca의 Create Workspace 화면에서 `Project → Add a new project`를 선택합니다.
2. Git 저장소 Clone 옵션이 보이면 GitHub URL을 입력합니다. 또는 터미널에서 `git clone <URL>`로 복제한 후 로컬 폴더를 프로젝트로 등록합니다.
3. `Run on`에서 로컬 또는 원격 호스트를 선택합니다.
4. Claude Code, Codex, Blank Terminal 등 실행할 환경을 선택합니다.

예시 저장소: https://github.com/mingwonkim/harujon-assets

## 3. Git Worktree 개별 폴더 생성

1. 프로젝트에서 새 Workspace를 만듭니다.
2. `Name`에 `outfit-summer`처럼 작업 이름을 지정합니다.
3. `Branch from`에서 `origin/main` 등 시작 브랜치를 선택합니다.
4. 새 브랜치와 에이전트를 선택하고 생성합니다.
5. Worktree마다 독립적인 작업 디렉터리가 만들어집니다. 실제 경로는 설정에 따라 다릅니다.

Git CLI로 직접 만드는 예시:

```bash
git fetch origin
git worktree add -b outfit-summer ../harujon-outfit-summer origin/main
git worktree add -b outfit-winter ../harujon-outfit-winter origin/main
git worktree list
```

## 4. 터미널 4분할

1. 첫 터미널에서 `Ctrl+\` (Mac `⌘ \`)로 좌우 분할합니다.
2. 왼쪽 패널을 선택하고 `Ctrl+Shift+\` (Mac `⌘ ⇧ \`)로 상하 분할합니다.
3. 오른쪽 패널도 동일하게 상하 분할합니다.
4. 경계선을 드래그해 크기를 조정합니다.

예시:

| 왼쪽 위 | 오른쪽 위 |
|---|---|
| Claude Code — UI 개발 | Codex — API 개발 |
| 개발 서버 — `npm run dev` | Git / 테스트 — `git status` |

## 5. 다른 프로젝트 여러 개 한 화면에 띄우기

1. 프로젝트들을 Orca에 각각 등록합니다.
2. 첫 번째 프로젝트를 엽니다.
3. `Ctrl+J` / `⌘ J`로 다음 프로젝트나 Worktree를 검색합니다.
4. `Shift+Enter`로 분할 패널에서 여는 동작을 시도합니다.
5. 다른 프로젝트도 추가하고 패널 경계를 조정합니다.

**주의:** 서로 다른 프로젝트를 정확한 2×2 레이아웃으로 동시에 고정할 수 있는지는 설치 버전에서 확인해야 합니다. 한 Worktree 내부의 터미널 분할과 서로 다른 Worktree의 분할 열기는 별도 기능입니다.

## 6. 기타 편의 기능

- **Quick Open:** `Ctrl+J` / `⌘ J`로 프로젝트·워크트리 검색
- **파일 검색:** `Ctrl+P` / `⌘ P`
- **Quick Commands:** `Settings → Quick Commands`에서 자주 쓰는 명령어 저장
- **단축키 설정:** `Settings → Shortcuts`
- **Workspace Board:** 여러 Worktree를 보드 형태로 관리

## 공식 문서

- [탭·패널·분할](https://www.onorca.dev/docs/model/tabs-panes-splits)
- [Worktrees](https://www.onorca.dev/docs/model/worktrees)
- [Quick Open](https://www.onorca.dev/docs/model/quick-open)
- [터미널](https://www.onorca.dev/docs/terminal)
- [설정](https://www.onorca.dev/docs/settings)

## 7. 실무 활용 튜토리얼 (확장 제안)

> 아래 사례는 실제 특정 회사의 내부 워크플로를 확인한 것이 아니라, 실무에 적용 가능한 교육용 시나리오입니다. Orca의 메뉴·단축키·자동 감지 가능 여부는 설치 버전에서 검증해야 합니다.

| 과정 | 실무 상황 | 학습 기능 | 완료 기준 |
|---|---|---|---|
| 프로젝트 온보딩 | GitHub 프로젝트를 받아 개발 시작 | Clone, Workspace, 터미널 | 로컬 저장소와 실행 환경 확인 |
| 병렬 기능 개발 | UI·API·테스트를 서로 다른 에이전트가 작업 | Worktree, 분할 패널 | 변경사항 충돌 없이 각각 커밋 |
| 버그 핫픽스 | 운영 브랜치를 건드리지 않고 긴급 오류 수정 | 별도 Worktree, Git | 재현 테스트 통과, PR 작성 |
| AI 코드 리뷰 | 구현 담당과 검토 담당 에이전트 분리 | Diff, 리뷰 프롬프트 | 문제점 확인 및 수정 |
| 테스트·CI | 수정 후 테스트 및 빌드 자동화 | Terminal, GitHub Actions | 테스트/빌드 성공 |
| PR 통합 | 여러 기능을 순차적으로 합침 | Git, Pull Request | 리뷰·CI 통과 후 병합 |
| 멀티 프로젝트 | 여러 앱의 작업 공간 관리 | Quick Open, Workspace Board | 프로젝트 간 전환 및 상태 확인 |

### 실습 A — AI 에이전트 3개로 Flutter 로그인 기능 개발

1. GitHub에서 앱 저장소를 Clone하고 Orca Workspace로 등록합니다.
2. `feature/login-ui`, `feature/auth-api`, `test/auth`용 Worktree를 별도로 만듭니다.
3. UI 에이전트에는 로그인 화면, 인증 에이전트에는 Firebase 인증 연결, 테스트 에이전트에는 인증 테스트 작성을 지시합니다. **공통 인터페이스와 파일 소유 범위를 먼저 합의**해 충돌을 줄입니다.
4. Orca의 패널을 분할해 각 에이전트와 테스트 터미널을 관찰합니다.
5. 각 작업의 Diff를 검토하고 `flutter test` 및 필요한 빌드를 실행합니다.
6. PR을 분리해 올리고 CI와 리뷰를 통과한 뒤 순서대로 병합합니다.

**튜토리얼 오버레이 안내 예시:** `이제 로그인 UI용 Worktree를 생성하세요` → `새 에이전트에서 해당 작업 디렉터리를 열어주세요` → `오른쪽 패널에 인증 작업을 열어주세요` → `테스트를 실행하고 결과를 확인하세요`.

### 실습 B — 운영 중 버그 핫픽스

1. 버그 재현 절차와 기대 동작을 적습니다.
2. 안정 브랜치 기준으로 `fix/login-crash` Worktree를 만듭니다.
3. 에이전트에 원인 분석과 최소 변경을 지시합니다.
4. 재현 테스트를 추가하고 수정 전후 결과를 비교합니다.
5. 코드 리뷰 및 CI를 거쳐 PR을 병합합니다.

### 실습 C — 여러 프로젝트 관리

1. 서로 다른 저장소를 Orca 프로젝트로 등록합니다.
2. Quick Open으로 프로젝트를 전환합니다.
3. 각 프로젝트의 작업 상태와 미완료 작업을 확인합니다.
4. 동일 화면에서 여러 프로젝트를 동시에 배치하는 기능은 설치 버전에서 지원 여부를 확인합니다.

### 오버레이 튜토리얼의 단계별 검증

- **자동 검증 가능:** 단축키 입력 감지, `git worktree list`, `git status`, 테스트 명령 종료 코드 등(운영체제 권한과 구현에 따라 달라짐).
- **추가 연동 필요:** Orca 내부 메뉴 선택, 패널 배치, 에이전트 완료 상태. 공식 API 또는 접근성 API가 없다면 화면 인식·사용자 확인으로 대체.
- **안전장치:** 명령 실행 전 설명, Git 변경/병합 전 확인, API 키와 개인정보의 화면 캡처·로그 저장 방지.

### 권장 학습 순서

기본 조작 → GitHub 가져오기 → Worktree 생성 → 화면 분할 → 병렬 에이전트 → 코드 리뷰 → 테스트/CI → PR 병합 → 멀티 프로젝트.
