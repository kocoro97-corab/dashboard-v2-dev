# MY INVEST V2 개발 게시본 분석 기능 적용·검증 기록

## 배포 상태 (2026-11-24)

- 개발 저장소: `kocoro97-corab/dashboard-v2-dev`, 게시 브랜치 `dev-pages`
- 공개 개발 URL: `https://kocoro97-corab.github.io/dashboard-v2-dev/index.html`
- 원본 통합 소스: `kocoro97-corab/dashboard` / `feat/nh-integration-v2`
- 원본 전체 PR 회귀: **PASS** (커밋 `aa8fbb1b34b2dac20597bcba3dc02272d13728b5`).
- 개발 게시본 최초 기능 연결: `5c44893d8a7ed4c66ca3b878b17a2816b32ab1bf`.
- 적용 전 복구 커밋: `136d4d7392c39385c059153bd809f22b256a1c79`, 복구 브랜치 `backup/pre-analysis-20261124`.
- 운영 `main`, `release/pages`, GAS/Sheets/Properties/NH 실계좌 및 주문 권한은 **변경 금지**.

## 자동 검증

- `.github/workflows/dev-analysis-smoke.yml`: 개발 Pages에 올라간 실제 `index.html` 및 새 분석 JS 간 로딩 순서, CSP·OAuth·중계 보존, 기존 산업 패널과 신규 분석 패널 선택자 구분, 추가 API 요청·계좌 저장 호출 금지 검사. 시장/종목/산업/공식 실적 이벤트 연결 모의 회귀도 수행.
- `.github/workflows/dev-site-http-smoke.yml`: **실제 공개 Pages**의 HTML이 `dev=analysis-20261124`를 제공하는지, 공개 JS 파일이 `dev-pages` 브랜치 바이트와 같은지 HTTP 조회로 확인. 실패 시 캐시/Pages 설정/배포 상태 확인 필요.
- 로컬 Node 명령:
  ```sh
  node --test tests/dev-analysis-deployment.test.cjs
  node tests/exchange-session-proof.test.cjs
  node tests/exchange-session-integration.test.cjs
  node tests/sector-cache-rotation-bridge.test.cjs
  node tests/cached-strategy-bridge.test.cjs
  node tests/analysis-integration-panel-v1.test.cjs
  ```
- 독립 V8 모의 검증: 개발 게시본 배포 불변조건 80개, 분석 엔진 109개 항목 PASS. **이는 실제 사이트 렌더링·실데이터 연동·NH 로그인 성공을 의미하지 않음.** GitHub Actions 및 실제 공개 HTTP 확인 후 상태 확정.

## 직접 확인할 개발 화면

1. `https://kocoro97-corab.github.io/dashboard-v2-dev/index.html#/strategy` — 기존 로그인 후 종목 선택. **통합 투자 분석 · 실데이터 근거 확인 (조회 없음)**을 펼쳐보기. 확정봉 검증, 신규 후보와 보유종목 별도 검토, 경제 일정 위험·모르는 근거가 명확한지 확인.
2. `https://kocoro97-corab.github.io/dashboard-v2-dev/index.html#/sectors` — 미국 섹터에서 **확정 일봉 기반 산업 1·5·20·60일 상대강도 근거** 펼쳐보기. 기존 산업 모멘텀 펼쳐보기와 두 패널이 모두 살아 있는지 확인.
3. `#/stocks`, `#/accounts`, `#/news`, 캘린더 — 기존 동작·데이터 정상 표시 및 로그아웃 후 잔여 계좌정보가 남지 않는지 확인.
4. PC 1440px, Fold6 690px 펼침/344px 접힘: 가로 넘침, 선택기, 펼쳐보기, 뒤로가기, 로그아웃 상태 확인.
5. 패널 펼침/닫힘의 네트워크 탭에서 **추가 시세 API 호출 0건** 확인. 기존 종목 최초 로딩 요청은 별도 분리.
6. NH 주문/Google 개인 일정/OAuth 권한은 변경하지 않음.

## 장애 시 복구

1. GitHub 저장소 `dashboard-v2-dev`의 `dev-pages` 최신 SHA와 증상을 기록한다.
2. 백업 브랜치 `backup/pre-analysis-20261124`(커밋 `136d4d73`)과 비교한다.
3. 개발 게시본만 복구해야 하면 권한 있는 담당자가 **보존된 원본의 안전한 복구 커밋**을 작성하여 `dev-pages`에 적용한다. 기록 보존을 위해 히스토리 강제 수정은 피한다.
4. 복구 후 개발 Pages의 CSP/OAuth/중계 및 계좌·캘린더 접근을 다시 검증한다. 운영 브랜치와 실제 NH/GAS에는 손대지 않는다.

## 다음 단계

실제 HTTP 게시 확인 및 세 기기 폭 브라우저 검증을 완료한 뒤, 공용 이벤트·시장 근거를 사용하는 투자 분석 변화 추적/위험 경고 패널을 연결한다. 사용자 승인 없이 운영 반영이나 알림 전송 활성화는 하지 않는다.
