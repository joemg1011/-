# 바람이 머무는 오후

따뜻한 색연필화 풍경 위로 꽃잎이 흐르는 인터랙티브 미디어아트입니다.

- 게시 주소: https://joemg1011.github.io/-/media-art.html
- 기존 다른 주소도 같은 작품을 표시합니다: https://joemg1011.github.io/-/media-art-new.html
- 첫 화면의 Dot Runner와 게임 파일은 기존 동작을 유지합니다.

## 조작

커서나 손끝으로 바람을 움직입니다. 화면을 누르거나 **바람 불어주기**를 선택하면 꽃바람이 붑니다. **잠시 멈춤**으로 정지할 수 있습니다. 그림에 키보드 초점을 맞춘 뒤 방향키로 바람 방향, Enter로 꽃바람, Space로 정지/재생을 조절할 수 있습니다. 운영체제의 동작 줄이기가 켜져 있으면 정지된 그림으로 시작하고 직접 재생할 수 있습니다.

## 로컬 실행과 검사

Node.js 24 이상에서 별도 라이브러리 설치 없이 실행합니다.

```text
npm run dev
npm run check
npm test
```

VS Code에서 이 폴더를 열고 `npm run dev`를 실행한 뒤 http://127.0.0.1:8765/media-art.html 을 엽니다. ES 모듈을 사용하므로 HTML 파일을 더블클릭하는 대신 로컬 서버를 사용합니다.

## 구성과 자동 게시

- `media-art.html`, `media-art-new.html`: 기존 두 주소. 같은 HTML과 공통 자산을 사용합니다.
- `assets/art.css`: 화면 비율에 따른 구도와 조작 버튼.
- `assets/art.mjs`: 이미지 합성, 옷자락의 미세한 움직임, 꽃바람, 키보드·포인터·일시정지 처리.
- `assets/wind-physics.mjs`: 초 단위 꽃잎 이동과 화면 가장자리 순환.
- `assets/spring-landscape.webp`, `assets/spring-girl.webp`: 생성한 색연필화 배경과 투명 캐릭터. 합계 약 621KB.
- `tests/wind.test.mjs`: 30/60/144Hz 이동 일관성, 정지, 가장자리 순환, 커서 반응, 기존 주소·자산 검사.

기존 GitHub Pages의 `main` 브랜치 게시를 사용합니다. 변경을 이 저장소의 `main`에 올리면 기존 URL의 작품이 자동으로 갱신됩니다. `.github/workflows/verify.yml`은 코드 검사를 실행합니다. 검사가 배포를 차단하는 구조는 아니며 Pages 게시 상태는 별도로 확인합니다.

이미지 제작 방향과 프롬프트는 [제작 기록](docs/ART-DIRECTION.md)에 기록했습니다.
