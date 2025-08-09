# Report Helper Chrome Extension

## 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build
```

## 사용법

### 1. Extension 빌드

```bash
npm run build
```

### 2. Chrome에서 Extension 로드

1. Chrome 브라우저를 열고 `chrome://extensions/` 로 이동
2. 우측 상단의 "개발자 모드" 토글을 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트의 `dist` 폴더를 선택
5. Extension이 성공적으로 로드되면 툴바에 아이콘이 표시됩니다

### 3. Google Gemini API 키 발급
1. [Google AI Studio](https://aistudio.google.com/app/apikey?hl=ko) 접속
2. 우측 상단 API 키 만들기 버튼 클릭
3. 새로운 프로젝트/기존 프로젝트에 API 키 만들기 버튼 클릭
4. API 키 발급

### 4. Extension 사용 설정
1. 사용할 구글 스프레드 시트 열기
2. 북마크바의 Extension 아이콘 클릭 or 아이콘 우클릭 해서 사이드 패널 열기 클릭
3. (최초 1회) google auth 인증
4. 3에서 발급 받은 gemini api 키 ui에 입력
5. (스프레드 시트 id는 자동 감지)

**[답변 정제 기능 사용법]**
1. 정제한 답변을 출력할 열 추가 (답변 열 우클릭 -> 오른쪽에 열 1개 삽입 클릭)
2. ui에 원본 범위와 출력 범위 입력 (ex. `F5:F16` 형태로 지정)
3. 답변 정제 실행 버튼 클릭
4. 1분 내로 생성 완료

**[피드백 생성 기능 사용법]**
1. 생성한 피드백을 출력할 열 추가 (피드백 열 우클릭 -> 오른쪽에 열 1개 삽입 클릭)
2. 피드백 생성 탭 선택
3. ui에 질문, 답변, 피드백 출력 열과 시작, 종료 행 입력
4. 피드백 생성 실행 버튼 클릭
5. 대략 2분 정도 소요 후 생성 (팝업 닫아도 백그라운드로 동작)
