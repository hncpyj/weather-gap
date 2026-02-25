# Weather Gap — Mac 인수인계

## 현재 상태
- **GitHub**: https://github.com/hncpyj/weather-gap
- **배포**: https://weather-gap.vercel.app (Vercel, 자동 배포 설정됨)
- **다음 목표**: Apple App Store 등록

---

## 프로젝트 개요
영국 거주자를 위한 날씨 PWA. 핵심 기능은 **오늘 기온 vs 어제 기온 꺾은선 그래프 비교**. 내일 라인 토글도 있음.

### Tech Stack
- React 18 + Vite 5
- Tailwind CSS 3
- Recharts 2 (차트)
- vite-plugin-pwa 0.19.8
- Open-Meteo API (무료, API 키 없음)

---

## 파일 구조
```
src/
├── App.jsx                    # GPS 위치 감지, 런던 fallback
├── api/weather.js             # Open-Meteo API (날씨 + 지오코딩)
├── hooks/useWeather.js        # 데이터 fetch + 어제/오늘/내일 파싱
├── utils/weatherCode.js       # WMO 코드 → emoji/설명
└── components/
    ├── SearchBar.jsx          # 도시 검색 (debounce 300ms)
    ├── CurrentWeather.jsx     # 현재 기온, 날씨 상태
    ├── HourlyChart.jsx        # 핵심: 어제(회색점선)/오늘(파란실선)/내일(주황점선) 토글
    ├── RainForecast.jsx       # "X분 후 비" 배너 (minutely_15 기반)
    ├── WeeklyForecast.jsx     # 7일 예보
    └── WeatherDetails.jsx     # 습도/풍속/강수량 카드
```

---

## App Store 등록 계획

### 준비물 (유저가 갖고 있는 것)
- M3 맥북 프로 ✅
- Apple Developer 계정 → **아직 미등록** (apple.com/kr/developer, $99/년)

### 진행할 작업 순서

#### 1. Capacitor로 iOS 앱 래핑
```bash
# Mac 터미널에서 (weather-gap 레포 clone 후)
git clone https://github.com/hncpyj/weather-gap.git
cd weather-gap
npm install --legacy-peer-deps
npm install @capacitor/core @capacitor/ios @capacitor/cli --legacy-peer-deps
npx cap init "Weather Gap" "com.hncpyj.weathergap" --web-dir dist
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios  # Xcode 열림
```

#### 2. 앱 아이콘 교체
- 현재 `public/icon.svg` (SVG) → PNG로 변환 필요
- 1024×1024 PNG 필요 (App Store Connect용)
- Xcode Assets.xcassets에 아이콘 추가

#### 3. Xcode 설정
- Signing & Capabilities → Apple Developer 계정 연결
- Bundle Identifier: `com.hncpyj.weathergap`
- 위치 권한 설명 문구 추가 (Info.plist)
  - `NSLocationWhenInUseUsageDescription`: "Weather Gap uses your location to show local weather"

#### 4. TestFlight 업로드
- Xcode → Product → Archive → Distribute App → App Store Connect

#### 5. App Store Connect 메타데이터
- 앱 이름: Weather Gap
- 카테고리: Weather
- 차별점 설명: "어제 vs 오늘 시간별 기온 비교 그래프"
- 데이터 출처 명시: Open-Meteo (Apple 규정 필수)

---

## Apple 심사 주의사항
- **Guideline 5.1.5**: 날씨 앱은 데이터 출처 반드시 표기 → Open-Meteo 표기 필요 (앱 내 어딘가에)
- 위치 권한 사용 목적 명확히 설명
- 위험 기상 경보 기능 없으면 추가 규정 해당 없음

---

## 로컬 개발 (Windows 기준, Mac도 동일)
```bash
npm install --legacy-peer-deps  # Node 18 환경에서는 이 옵션 필요
npm run dev                     # localhost:5173
npm run build
```

> **npm 설치 주의**: SSL 에러 나면 `npm config set registry http://registry.npmjs.org/` 후 재시도
> 패키지는 한 번에 모아서 설치해야 함 (순차 설치 시 semver 에러 발생)
