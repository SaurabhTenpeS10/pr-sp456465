import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    console.log('API Route - Key check:', {
      hasGemini: !!geminiApiKey,
      hasOpenAI: !!openaiApiKey,
      geminiPrefix: geminiApiKey?.substring(0, 10) + '...',
      openaiPrefix: openaiApiKey?.substring(0, 10) + '...',
      message: message
    });

    let response;
    let apiType = '';
    let modelUsed = '';
    let provider = '';
    let usedApiKey = '';

    // Use Gemini API as primary (and only) provider
    if (geminiApiKey && geminiApiKey !== 'your-gemini-api-key-here') {
      console.log('Using Gemini API...');
      console.log('Gemini API Key length:', geminiApiKey.length);
      console.log('Gemini API Key starts with AIzaSy:', geminiApiKey.startsWith('AIzaSy'));

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
        console.log('Calling Gemini API at:', url);

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiApiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: message || 'Hello, this is a test message.'
              }]
            }]
          }),
        });

        console.log('Gemini API response status:', response.status);

        if (response.ok) {
          apiType = 'gemini';
          modelUsed = 'gemini-2.0-flash';
          provider = 'Google Gemini';
          usedApiKey = geminiApiKey;
          console.log('✅ Gemini API successful');
        } else {
          console.log('❌ Gemini API failed with status:', response.status);
          const errorText = await response.text();
          console.error('Gemini error details:', errorText);

          // Return the actual error from Gemini API instead of generic message
          return NextResponse.json({
            error: 'Gemini API failed',
            status: response.status,
            details: errorText,
            hasGemini: !!geminiApiKey,
            geminiPrefix: geminiApiKey?.substring(0, 10) || 'none'
          }, { status: response.status });
        }
      } catch (error) {
        console.log('❌ Gemini API error:', error);
        console.error('Full error details:', error);

        // Return detailed error message
        return NextResponse.json({
          error: 'Gemini API request failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          hasGemini: !!geminiApiKey,
          geminiPrefix: geminiApiKey?.substring(0, 10) || 'none'
        }, { status: 500 });
      }
    }

    // If Gemini API is not configured or failed
    if (!response) {
      return NextResponse.json({
        error: 'Gemini API not configured or failed',
        hasGemini: !!geminiApiKey,
        geminiPrefix: geminiApiKey?.substring(0, 10) || 'none'
      }, { status: 400 });
    }

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({
        error: `${provider} API error`,
        status: response.status,
        details: errorData,
        provider: provider,
        model: modelUsed,
        keyPrefix: usedApiKey.substring(0, 10)
      }, { status: response.status });
    }

    const data = await response.json();

    // Parse response based on API type
    let responseText = 'No response generated';
    if (apiType === 'gemini') {
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } else if (apiType === 'openai_chat') {
      responseText = data.choices?.[0]?.message?.content || 'No response generated';
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      provider: provider,
      model: modelUsed,
      api_type: apiType,
      keyPrefix: usedApiKey.substring(0, 10),
      usage: data.usage || data.usageMetadata
    });

  } catch (error) {
    console.error('Test OpenAI error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
