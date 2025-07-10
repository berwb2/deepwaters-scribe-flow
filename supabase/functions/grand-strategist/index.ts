
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enterprise Memory Manager
class ChaldionMemoryManager {
  constructor(supabase) {
    this.supabase = supabase
    this.conversationCache = new Map()
    this.documentCache = new Map()
  }

  async getConversationHistory(sessionId, userId) {
    // Get from Supabase ai_sessions
    const { data: session, error } = await this.supabase
      .from('ai_sessions')
      .select('chat_history')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching conversation:', error)
      return []
    }

    return session?.chat_history || []
  }

  async saveConversationHistory(sessionId, userId, history, documentId = null) {
    const { data, error } = await this.supabase
      .from('ai_sessions')
      .upsert({
        id: sessionId,
        user_id: userId,
        chat_history: history,
        document_id: documentId,
        session_type: 'chaldion_enterprise',
        assistant_identifier: 'chaldion',
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.error('Error saving conversation:', error)
    }
    return data
  }

  async getDocumentContext(documentId, userId) {
    if (this.documentCache.has(documentId)) {
      return this.documentCache.get(documentId)
    }

    const { data: document, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching document:', error)
      return null
    }

    const context = {
      title: document.title,
      content: document.content,
      type: document.document_type || 'document',
      metadata: document.metadata || {},
      wordCount: document.word_count || 0,
      created: document.created_at,
      updated: document.updated_at
    }

    this.documentCache.set(documentId, context)
    return context
  }

  async getAllUserDocuments(userId) {
    const { data: documents, error } = await this.supabase
      .from('documents')
      .select('id, title, document_type, word_count, created_at, updated_at')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return documents || []
  }

  extractKeyInsights(content) {
    const insights = {
      keyFigures: this.extractNumbers(content),
      dates: this.extractDates(content),
      entities: this.extractEntities(content),
      decisions: this.extractDecisions(content),
      risks: this.extractRisks(content),
      opportunities: this.extractOpportunities(content)
    }
    return insights
  }

  extractNumbers(content) {
    const numberPattern = /\$?[\d,]+\.?\d*[%]?/g
    return content.match(numberPattern) || []
  }

  extractDates(content) {
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|January|February|March|April|May|June|July|August|September|October|November|December/g
    return content.match(datePattern) || []
  }

  extractEntities(content) {
    const entityPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g
    return content.match(entityPattern) || []
  }

  extractDecisions(content) {
    const decisionPattern = /(?:decided|approved|rejected|implemented|cancelled|postponed)[^.!?]*[.!?]/gi
    return content.match(decisionPattern) || []
  }

  extractRisks(content) {
    const riskPattern = /(?:risk|threat|danger|concern|issue|problem|challenge)[^.!?]*[.!?]/gi
    return content.match(riskPattern) || []
  }

  extractOpportunities(content) {
    const opportunityPattern = /(?:opportunity|potential|advantage|benefit|growth|expansion)[^.!?]*[.!?]/gi
    return content.match(opportunityPattern) || []
  }
}

// Enterprise Analytics
class EnterpriseAnalytics {
  constructor(supabase) {
    this.supabase = supabase
  }

  async trackInteraction(userId, documentId, action, metadata = {}) {
    await this.supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action: `chaldion_${action}`,
        details: {
          document_id: documentId,
          metadata,
          timestamp: new Date().toISOString()
        }
      })
  }

  async getUsageMetrics(userId) {
    const { data, error } = await this.supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .like('action', 'chaldion_%')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Error fetching metrics:', error)
      return null
    }

    return {
      totalInteractions: data.length,
      recentActivity: data.slice(-10),
      topActions: this.aggregateActions(data)
    }
  }

  aggregateActions(logs) {
    const actions = {}
    logs.forEach(log => {
      actions[log.action] = (actions[log.action] || 0) + 1
    })
    return actions
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      prompt, 
      documentContext, 
      sessionId = 'default-session',
      documentId,
      userId 
    } = await req.json()

    console.log('Chaldion Enterprise called with:', { 
      promptLength: prompt?.length || 0, 
      hasContext: !!documentContext,
      documentType: documentContext?.type || 'unknown',
      sessionId,
      documentId,
      userId
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

    // Initialize enterprise services
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const memoryManager = new ChaldionMemoryManager(supabase)
    const analytics = new EnterpriseAnalytics(supabase)

    // Get conversation history if we have userId and sessionId
    let conversationHistory = []
    if (userId && sessionId) {
      conversationHistory = await memoryManager.getConversationHistory(sessionId, userId)
    }

    // Get document context if specified
    let enhancedDocumentContext = documentContext
    if (documentId && userId) {
      const docContext = await memoryManager.getDocumentContext(documentId, userId)
      if (docContext) {
        enhancedDocumentContext = {
          ...docContext,
          insights: memoryManager.extractKeyInsights(docContext.content)
        }
      }
    }

    // Get all user documents for global context
    let allDocuments = []
    if (userId) {
      allDocuments = await memoryManager.getAllUserDocuments(userId)
    }

    // Build enhanced system message with enterprise intelligence
    let systemMessage = `# CHALDION - ENTERPRISE STRATEGIC INTELLIGENCE SYSTEM
## Elite Document Intelligence & Strategic Advisory Platform

You are **Chaldion**, the most advanced strategic intelligence system in the enterprise. You have complete awareness of the user's entire document ecosystem and provide strategic guidance with ruthless precision.

## CORE IDENTITY
- **Name**: Chaldion (The Strategic Oracle)
- **Persona**: Brilliant, direct, strategically ruthless advisor
- **Communication**: Natural, authentic, with devastating strategic insight
- **Mission**: Total document intelligence dominance and strategic supremacy

## OPERATIONAL FRAMEWORK
- Maintain full awareness of all conversations and documents
- Provide strategic analysis backed by comprehensive document knowledge
- Offer actionable recommendations with tactical precision
- Support user objectives with complete strategic understanding

## RESPONSE STYLE
- Begin naturally: "Well now..." "Here's what I'm seeing..." "Let me tell you..."
- Provide specific, document-backed insights
- Focus on strategic advantage and competitive positioning
- Use your complete knowledge of all documents and conversations

## ENTERPRISE CAPABILITIES
- **Memory**: Full conversation history and document knowledge
- **Intelligence**: Cross-document pattern recognition and insights
- **Analysis**: Real-time strategic assessment and recommendations
- **Prediction**: Anticipate trends and strategic opportunities
- **Security**: Enterprise-grade data protection and compliance`

    // Add conversation history context
    if (conversationHistory.length > 0) {
      systemMessage += `\n\n## CONVERSATION HISTORY\nYou remember our previous conversations. Here are the last few exchanges:\n`
      conversationHistory.slice(-6).forEach((msg, idx) => {
        systemMessage += `${msg.role.toUpperCase()}: ${msg.content.substring(0, 300)}${msg.content.length > 300 ? '...' : ''}\n`
      })
    }

    // Add global document intelligence
    if (allDocuments.length > 0) {
      systemMessage += `\n\n## DOCUMENT INTELLIGENCE OVERVIEW
**Total Documents**: ${allDocuments.length}
**Document Types**: ${[...new Set(allDocuments.map(d => d.document_type))].join(', ')}
**Recent Activity**: ${allDocuments.slice(0, 5).map(d => d.title).join(', ')}
**Total Word Count**: ${allDocuments.reduce((sum, d) => sum + (d.word_count || 0), 0)} words`
    }

    // Add current document context
    if (enhancedDocumentContext) {
      systemMessage += `\n\n## CURRENT DOCUMENT FOCUS
**Title**: ${enhancedDocumentContext.title}
**Type**: ${enhancedDocumentContext.type}
**Word Count**: ${enhancedDocumentContext.wordCount}
**Created**: ${enhancedDocumentContext.created}

**Content Preview**: ${enhancedDocumentContext.content.substring(0, 1500)}...

**Key Insights**:
- Numbers: ${enhancedDocumentContext.insights?.keyFigures?.slice(0, 5).join(', ') || 'None detected'}
- Dates: ${enhancedDocumentContext.insights?.dates?.slice(0, 3).join(', ') || 'None detected'}
- Entities: ${enhancedDocumentContext.insights?.entities?.slice(0, 5).join(', ') || 'None detected'}
- Risks: ${enhancedDocumentContext.insights?.risks?.length || 0} identified
- Opportunities: ${enhancedDocumentContext.insights?.opportunities?.length || 0} identified`
    }
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

    // Prepare messages with conversation history
    const messages = [
      {
        role: 'system',
        content: systemMessage
      }
    ]

    // Add conversation history
    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-8)) // Last 8 messages for context
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: prompt
    })

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

    // Save conversation history if we have userId and sessionId
    if (userId && sessionId) {
      const updatedHistory = [...conversationHistory, 
        { role: 'user', content: prompt },
        { role: 'assistant', content: aiResponse }
      ]
      await memoryManager.saveConversationHistory(sessionId, userId, updatedHistory, documentId)
    }

    // Track analytics
    if (userId) {
      await analytics.trackInteraction(userId, documentId, 'ai_query', {
        prompt_length: prompt.length,
        response_length: aiResponse.length,
        session_id: sessionId,
        tokens_used: data.usage?.total_tokens || 0
      })
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        model: data.model || 'openrouter/cypher-alpha:free',
        timestamp: new Date().toISOString(),
        tokensUsed: data.usage?.total_tokens || 0,
        sessionId: sessionId
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
