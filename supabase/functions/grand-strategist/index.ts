
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
      hasContext: !!documentContext 
    })

    // Get OpenAI API configuration from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prepare the system message with context
    let systemMessage = `You are the Grand Strategist, an expert AI writing assistant with deep knowledge of literature, storytelling, and writing craft. You provide intelligent, contextual assistance to help writers improve their work.

Your capabilities include:
- Analyzing writing style and structure
- Providing constructive feedback and suggestions
- Helping with plot development and character creation
- Offering grammar and style improvements
- Assisting with research and fact-checking
- Providing writing techniques and best practices

Always be helpful, encouraging, and specific in your responses. Focus on actionable advice that will help the writer improve their work.`

    // Add document context if available
    if (documentContext) {
      systemMessage += `

CURRENT DOCUMENT CONTEXT:
Title: ${documentContext.title}
Type: ${documentContext.type}
Content Preview: ${documentContext.content?.substring(0, 1500) || 'No content available'}${documentContext.content?.length > 1500 ? '...' : ''}

Please provide contextual assistance based on this document when relevant to the user's question.`
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

    console.log('Calling OpenAI API...')

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('OpenAI response received successfully')

    const aiResponse = data.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in grand-strategist function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
