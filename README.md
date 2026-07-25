# 🔍 건강한 식재료 라벨 검사기 (Food Label Scanner)

마트에서 장을 볼 때, 성분표의 작고 어려운 글씨 때문에 건강한 식재료를 고르기 힘드셨나요? 
'식품 라벨 검사기'는 스마트폰으로 식품 뒷면을 촬영하기만 하면, AI가 성분을 분석하여 첨가물 포함 여부와 주의해야 할 성분을 직관적으로 알려주는 웹앱입니다. 
식품첨가물 섭취를 최소화하고, 자연 그대로의 천연 식재료와 전통 방식의 건강한 식단을 추구하시는 분들의 꼼꼼한 식재료 선택을 돕기 위해 기획되었습니다.

## ✨ 주요 기능
1. **신호등 경고 시스템**: 
   - 🔴 **Danger**: 화학 첨가물이 4개 이상이거나, 맨 앞 5개 성분에 피해야 할 성분(밀가루, 팜유, 인공감미료 등)이 포함된 경우
   - 🟡 **Warning**: 앞 5개 성분은 깨끗하지만, 전체 성분 중 화학 첨가물이 1~3개 포함된 경우
   - 🟢 **Safe**: 위험 성분이 없는 비교적 안전한 식품
2. **어려운 용어 해설**: 'L-글루탐산나트륨' 같은 어려운 화학 용어를 AI가 3개 이하의 직관적인 해시태그(예: `#인공감미료 #MSG #감칠맛`)로 쉽게 설명해 줍니다.
3. **핵심 성분(앞 5개) 집중 분석**: 원재료명이 많이 든 순서대로 표기된다는 점을 활용하여, 비중이 높은 상위 5개 성분에 몸에 좋지 않은 재료가 있는지 우선적으로 필터링합니다.

## 🛠 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Mobile-first, No heavy frameworks)
- **Backend (Serverless)**: Vercel Serverless Functions (`api/generate.js`)
- **AI Engine**: Google Gemini 1.5 Flash API (Multimodal 텍스트/이미지 동시 처리)

## 🚀 Vercel 배포 가이드
1. 이 프로젝트의 파일들(`index.html`, `api/generate.js`, `package.json`)을 본인의 GitHub 리포지토리에 Push합니다.
2. [Vercel](https://vercel.com)에 로그인하여 새 프로젝트를 생성하고 해당 리포지토리를 연결(Import)합니다.
3. **Environment Variables (환경변수)** 설정 메뉴에 다음을 추가합니다.
   - `Name`: `GEMINI_API_KEY`
   - `Value`: `본인이 발급받은 구글 Gemini API 키`
4. Deploy(배포) 버튼을 클릭하면 완료됩니다!

## 🐛 문제 해결 (Troubleshooting)
**Q. 사진을 찍고 분석을 눌렀는데 화면에 아무것도 안 나오거나 개발자 도구에 `404 Not Found` 에러가 뜹니다.**
* **원인**: Vercel 서버가 `/api/generate` 라는 주소를 찾지 못했다는 의미입니다.
* **해결 방법**: 
  1. GitHub 리포지토리의 최상위 폴더(Root)에 `api` 라는 이름의 폴더가 있는지, 그리고 그 안에 `generate.js` 파일이 정확한 이름으로 들어있는지 확인하세요.
  2. 폴더 이름이 `API`처럼 대문자로 되어있다면 소문자 `api`로 변경해야 Vercel이 서버리스 함수로 인식합니다.
  3. Vercel 대시보드에서 배포(Deployment)가 실패하지 않고 완료(Ready) 상태인지 확인해 보세요.
