# Report Generator Chrome Extension

## 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build
```

## Chrome에서 Extension 로드 테스트

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
