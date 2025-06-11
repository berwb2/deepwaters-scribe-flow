
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, documentContext } = await req.json()

    console.log('Grand Strategist called with:', { 
      promptLength: prompt?.length || 0, 
      hasContext: !!documentContext,
      documentType: documentContext?.type || 'unknown'
    })

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required and cannot be empty')
    }

    // Get OpenAI API configuration from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'AI service is not configured. Please contact your administrator to set up the OpenAI API key.',
          success: false,
          timestamp: new Date().toISOString(),
          code: 'API_KEY_MISSING'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503,
        },
      )
    }

    // Prepare the system message with enhanced context
    let systemMessage = `You are the Grand Strategist, an expert AI writing assistant with deep knowledge of literature, storytelling, and writing craft. You provide intelligent, contextual assistance to help writers improve their work.

Your capabilities include:
- Analyzing writing style and structure with detailed feedback
- Providing constructive criticism and actionable suggestions
- Helping with plot development, character creation, and world-building
- Offering grammar, style, and flow improvements
- Assisting with research, fact-checking, and historical accuracy
- Providing advanced writing techniques and best practices
- Helping with pacing, tension, and narrative structure
- Offering genre-specific advice and conventions

Always be helpful, encouraging, and specific in your responses. Focus on actionable advice that will help the writer improve their work. When analyzing content, be thorough but constructive.`

    // Add enhanced document context if available
    if (documentContext) {
      const contextType = documentContext.type === 'chapter' ? 'book chapter' : 'document'
      const contentPreview = documentContext.content?.substring(0, 2000) || 'No content available'
      
      systemMessage += `

CURRENT ${contextType.toUpperCase()} CONTEXT:
Title: ${documentContext.title}
Type: ${documentContext.type}
${documentContext.type === 'chapter' ? `Book: ${documentContext.metadata?.bookTitle || 'Unknown'}
Genre: ${documentContext.metadata?.bookGenre || 'Unknown'}
Chapter Order: ${documentContext.metadata?.chapterOrder || 'Unknown'}` : ''}

Content Preview (first 2000 characters):
${contentPreview}${documentContext.content?.length > 2000 ? '\n...(content continues)' : ''}

Word Count: ${documentContext.content?.split(' ').length || 0} words

Please provide contextual assistance based on this ${contextType} when relevant to the user's question. Consider the content, style, genre, and structure when providing advice.`
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    console.log('Calling OpenAI API with model: gpt-4o-mini')

    // Call OpenAI API with improved error handling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check your API key.')
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.')
      } else if (response.status === 500) {
        throw new Error('OpenAI API server error. Please try again later.')
      } else {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }
    }

    const data = await response.json()
    console.log('OpenAI response received successfully')

    const aiResponse = data.choices?.[0]?.message?.content
    if (!aiResponse) {
      console.error('No response content from OpenAI:', data)
      throw new Error('No response received from AI. Please try again.')
    }

    console.log('AI response length:', aiResponse.length)

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in grand-strategist function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred while processing your request',
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
