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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const prompt = `
    너는 식품 영양 및 성분 분석 전문가야. 다음 식품 라벨 이미지를 분석하고 JSON 형식으로만 응답해. 마크다운(\`\`\`) 없이 순수 JSON만 반환해.
    
    [분석 규칙]
    1. '제품명'과 '원재료명' 추출.
    2. '화학 첨가물' 총 개수 파악.
    3. '맨 앞 5개' 성분 중점 확인.
    
    [상태(status) 분류 기준]
    - "danger": 화학 첨가물 4개 이상 OR 맨 앞 5개 성분 중 위험 성분이 1개라도 있는 경우.
    - "warning": 맨 앞 5개에는 위험 성분이 없으나, 전체 중 화학 첨가물이 1~3개 포함된 경우.
    - "safe": 위 조건에 해당하지 않는 깨끗한 성분인 경우.
    
    [응답 JSON 양식]
    {
      "product_name": "추출한 제품명",
      "status": "danger" | "warning" | "safe",
      "reasons": ["핵심 성분명이나 단어 형태의 키워드로만 작성 (예: 팜유, 수크랄로스, 화학첨가물 5개, 특이사항 없음)"],
      "warning_target": "해당 식품의 성분으로 인해 섭취에 특히 주의해야 할 대상 (예: '소화기가 약한 사람', '당뇨 환자', '알레르기 민감자'). 주의할 사항이 없으면 '해당 없음'으로 작성",
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
