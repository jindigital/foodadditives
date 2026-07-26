export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Vercel 환경변수 누락' });
    }

    // 최신 Gemini 3 Flash 모델 적용
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const prompt = `
    너는 식품 영양 및 성분 분석 전문가야. 다음 식품 라벨 이미지를 분석하고 JSON 형식으로만 응답해. 마크다운(\`\`\`) 없이 순수 JSON만 반환해.
    
    [분석 규칙]
    1. 이미지에서 가장 잘 보이는 '제품명'과 '원재료명'을 추출한다. 제품명이 안 보이면 '알 수 없는 제품'으로 작성한다.
    2. 추출된 원재료 중 '화학 첨가물'의 총 개수를 파악한다.
    3. 원재료명 기재 순서상 '맨 앞 5개' 성분을 중점적으로 확인한다.
    
    [위험 성분 기준]
    - 수입 밀가루, 식물성 유지 (팜유 등), 인공 감미료 (수크랄로스, 아스파탐 등), 화학 첨가물 (방부제, 표백제 등)

    [상태(status) 분류 기준]
    - "danger" (빨간색): 화학 첨가물이 4개 이상이거나 OR 맨 앞 5개 성분 중 위험 성분이 1개라도 있는 경우.
    - "warning" (노란색): 맨 앞 5개에는 위험 성분이 없으나, 전체 원재료 중 화학 첨가물이 1~3개 포함된 경우.
    - "safe" (초록색): 위 조건에 해당하지 않는 깨끗한 성분인 경우.
    
    [응답 JSON 양식]
    {
      "product_name": "추출한 제품명",
      "status": "danger" | "warning" | "safe",
      "reasons": ["상태를 판정한 사유를 긴 문장으로 쓰지 말고, 반드시 핵심 성분명이나 단어 형태의 키워드로만 작성할 것. (예: 팜유, 수크랄로스, 화학첨가물 5개, 특이사항 없음)"],
      "terms": [
        {
          "name": "어려운 성분명",
          "hashtags": ["#키워드1", "#키워드2", "#키워드3"] 
        }
      ]
    }
    `;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(500).json({ error: 'AI 분석 실패', details: data.error?.message });
        }
        
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        const resultJson = JSON.parse(rawText);
        res.status(200).json(resultJson);

    } catch (error) {
        console.error('서버 내부 에러:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
}
