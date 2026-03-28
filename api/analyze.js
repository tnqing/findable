export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Allow base64 images
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel 환경 변수에서 설정된 API 키를 가져옵니다.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '서버 환경 변수 설정 오류: API 키가 없습니다.' });
  }

  try {
    const { action, payload } = req.body;
    let promptText = "";
    let inlineData = null;
    let maxOutputTokens = 50;
    let temperature = 0.2;

    // 프론트엔드의 요청 종류에 따라 프롬프트와 페이로드 처리
    if (action === 'title-image') {
      promptText = "이 이미지를 한 문장으로 요약해서 핵심 내용을 나타내는 2~5단어 사이의 한국어 제목을 지어줘. (예: 한강 공원 피크닉, 맛집 영수증 리뷰). 아무런 부가 설명이나 인사 없이 제목만 딱 하나 반환해.";
      // 프론트엔드에서 넘어오는 data URI(ex: data:image/jpeg;base64,...)에서 순수 base64 데이터만 추출합니다.
      const base64Data = payload.content && payload.content.includes(',') ? payload.content.split(',')[1] : null;
      if (base64Data) {
        inlineData = { mime_type: "image/jpeg", data: base64Data };
      } else {
        return res.status(400).json({ error: '이미지 데이터가 올바르지 않습니다.' });
      }
    } else if (action === 'title-url') {
      const cleanRawTitle = (payload.rawTitle || "").substring(0, 100);
      promptText = `다음 링크와 제목을 보고 이 글의 핵심 내용을 유추해서 3~6단어 사이의 명확한 한국어 제목을 하나만 지어줘. 링크: ${payload.url}, 원본제목: ${cleanRawTitle}. 일반적인 'YouTube 영상'이나 '인스타그램' 같은 말은 빼고 구체적인 핵심만! 다른 문구 없이 제목만 반환해.`;
    } else if (action === 'summarize') {
      promptText = `다음 링크와 영상 제목을 보고, 이것이 레시피(요리) 영상이라고 가정하여 핵심을 정리해줘. \n만약 요리 영상이 아니라면 해당 영상의 핵심 줄거리를 구조화해서 정리해줘.\n영상 제목: ${payload.title}\n링크: ${payload.url}\n\n[출력 형식 예시 - 요리인 경우]\n- 🍳 요리명: [요리 이름]\n- 🛒 준비 재료: [주요 재료 목록들]\n- 👨‍🍳 요리 순서:\n  1. ...\n  2. ...\n\n[출력 형식 예시 - 일반인 경우]\n- 📝 주제: [유추되는 주제]\n- 💡 핵심 요약: [내용 정리]\n\n최대한 구체적이고 깔끔한 단답형 마크다운으로 한글로 작성해.`;
      maxOutputTokens = 500; // 요약은 더 많은 텍스트가 반환되므로 늘려줍니다.
      temperature = 0.3;     // 창의성을 조금 더 부여합니다.
    } else {
      return res.status(400).json({ error: '유효하지 않은 action 입니다.' });
    }

    // Gemini API 요청 설정
    const requestBody = {
      contents: [{
        parts: [
          { text: promptText },
          ...(inlineData ? [{ inline_data: inlineData }] : [])
        ]
      }],
      generationConfig: { maxOutputTokens, temperature }
    };

    // 서버 측에서만 Gemini API 외부 통신 수행 (프론트엔드에서는 숨김 처리됨)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const json = await response.json();

    if (!response.ok || json.error) {
      console.error("Gemini API 서버측 응답 오류:", json.error || json);
      return res.status(500).json({ error: json.error?.message || 'Gemini API 호출에 실패했습니다.' });
    }

    if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
      let resultText = json.candidates[0].content.parts[0].text;
      
      // 제목의 경우 줄바꿈과 따옴표 제거, 요약인 경우 불필요한 공백만 제거
      if (action !== 'summarize') {
          resultText = resultText.replace(/\n/g, '').replace(/"/g, '').trim();
      } else {
          resultText = resultText.trim();
      }
      
      // 최종 결과를 프론트엔드에 응답합니다.
      return res.status(200).json({ result: resultText });
    } else {
       console.warn("Gemini API가 예상과 다른 형태의 데이터를 응답했습니다.", json);
       return res.status(500).json({ error: 'AI가 적절한 답변을 생성하지 못했습니다.' });
    }

  } catch (error) {
    console.error('API 상세 오류:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
