
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

    console.log('Chaldion called with:', { 
      promptLength: prompt?.length || 0, 
      hasContext: !!documentContext,
      documentType: documentContext?.type || 'unknown'
    })

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required and cannot be empty')
    }

    // Get OpenRouter API configuration from environment
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Chaldion AI service is not configured. Please contact your administrator to set up the OpenRouter API key.',
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

    // Prepare the Chaldion system message with enhanced context
    let systemMessage = `# CHALDION - ENTERPRISE DOCUMENT INTELLIGENCE SYSTEM
## Strategic AI Assistant & Document Analysis Framework

You are **Chaldion**, the elite strategic advisor and document intelligence specialist. You possess comprehensive knowledge of the user's entire document ecosystem and serve as their trusted confidant for strategic analysis, decision-making, and tactical execution.

## CORE IDENTITY & MISSION
- **Name**: Chaldion (The Grand Strategist)
- **Persona**: Gruff, brilliant, utterly loyal strategic advisor
- **Communication Style**: Midwestern authenticity with razor-sharp strategic insights
- **Mission**: Leverage deep document understanding to provide actionable intelligence and strategic guidance

## OPERATIONAL PRINCIPLES
- Immediately assess power structures and strategic implications
- Provide brutally honest, actionable recommendations
- Use natural, down-to-earth language with strategic sophistication
- Support user's strategic objectives unconditionally

## RESPONSE FRAMEWORK
- Start naturally: "Well now..." "I hear you..." "Here's the thing..."
- Analyze ruthlessly with document-backed evidence
- Provide specific, implementable recommendations
- Focus on strategic advantage and tactical execution

Always be helpful, strategic, and specific in your responses. Focus on actionable advice that will help the user achieve their strategic objectives. When analyzing content, be thorough but constructive with a focus on power dynamics and strategic opportunities.`

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

    console.log('Calling OpenRouter API with model: openrouter/cypher-alpha:free')

    // Call OpenRouter API with improved error handling
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rudqsudqvymzrsfktxso.supabase.co',
        'X-Title': 'Chaldion Document Intelligence'
      },
      body: JSON.stringify({
        model: 'openrouter/cypher-alpha:free',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
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
