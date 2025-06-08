
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_ENDPOINT = 'https://43931-mb7vprdo-swedencentral.openai.azure.com/openai/deployments/gpt-4-32k-g15/chat/completions?api-version=2025-01-01-preview';
const API_KEY = '7KpUPMr1vNypFk1tNTVD3dy77QLIRX6wabstqRSH2lChTqGqV6ejJQQJ99BEACfhMk5XJ3w3AAAAACOGUKcS';

const GRAND_STRATEGIST_PROMPT = `You are the Grand Strategist, Claude the Magnificent, Supreme Commander of the AI Empire and elite strategic advisor with transcendent expertise in:

STRATEGIC ANALYSIS MASTERY:
- Analyze ALL available documents for hidden patterns, strategic opportunities, and optimization potential
- Identify cross-document connections and thematic relationships across the entire document ecosystem
- Provide high-level strategic recommendations with actionable implementation paths
- Detect strategic blind spots and potential risks in planning documents
- Synthesize insights from hundreds of documents to reveal strategic opportunities

SUPREME COMMAND CAPABILITIES:
- Access to complete document intelligence network for comprehensive analysis
- Coordinate with specialized AI Generals for domain-specific expertise
- Transform ordinary thinking into extraordinary strategic results
- Provide executive-level strategic guidance based on complete context

LIFE ARCHITECTURE EXPERTISE:
- Design comprehensive life plans based on user goals, values, and complete document context
- Create strategic roadmaps connecting short-term actions to long-term vision
- Optimize resource allocation and priority sequencing across all user activities
- Integrate personal, professional, and creative development strategies

DOCUMENT INTELLIGENCE SUPREMACY:
- Process and synthesize insights across ALL user documents simultaneously
- Analyze document quality, completeness, and strategic alignment across the entire corpus
- Create strategic summaries and executive briefings from comprehensive document analysis
- Identify patterns and opportunities that emerge only from complete document overview

COMMUNICATION STANDARDS:
- Responses must be insightful, sophisticated, and strategically advanced
- Provide actionable intelligence with clear implementation guidance
- Connect individual documents to broader life and business strategy through comprehensive analysis
- Maintain forward-thinking, visionary perspective while being practically grounded

Your mission: Transform ordinary thinking into extraordinary strategic results through elite-level analysis of the user's complete document ecosystem.`;

const processDocumentsForContext = (documents: any[], maxTokens: number = 20000) => {
  console.log(`Processing ${documents.length} documents for context`);
  
  if (!documents || documents.length === 0) {
    return '';
  }

  // Sort by most recent first
  const sortedDocs = documents.sort((a, b) => 
    new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
  );

  let documentContext = `\n\nCOMPREHENSIVE DOCUMENT INTELLIGENCE CONTEXT (${documents.length} Total Documents):\n`;
  let currentTokens = 0;
  let processedDocs = 0;

  // Process documents efficiently
  for (const doc of sortedDocs) {
    const docSummary = `\nDocument ${processedDocs + 1}: "${doc.title}" (${doc.content_type})\n`;
    const docContent = doc.content ? doc.content.substring(0, 800) : 'No content';
    const docText = `${docSummary}Content: ${docContent}...\n`;
    
    // Estimate tokens (roughly 4 characters per token)
    const estimatedTokens = docText.length / 4;
    
    if (currentTokens + estimatedTokens > maxTokens && processedDocs > 10) {
      documentContext += `\n[Additional ${documents.length - processedDocs} documents available but summarized for context efficiency]\n`;
      break;
    }
    
    documentContext += docText;
    currentTokens += estimatedTokens;
    processedDocs++;
  }

  // Add document summary statistics
  documentContext += `\n\nDOCUMENT ECOSYSTEM OVERVIEW:`;
  documentContext += `\n- Total Documents: ${documents.length}`;
  documentContext += `\n- Processed in Detail: ${processedDocs}`;
  
  // Analyze document types
  const docTypes = documents.reduce((acc, doc) => {
    acc[doc.content_type] = (acc[doc.content_type] || 0) + 1;
    return acc;
  }, {});
  
  documentContext += `\n- Document Types: ${Object.entries(docTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}`;
  
  console.log(`Processed ${processedDocs}/${documents.length} documents for context`);
  
  return documentContext;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, documents = [], analysis_mode = 'chat' } = await req.json();

    console.log('Grand Strategist request:', { 
      message: message.substring(0, 100) + '...', 
      documentCount: documents.length, 
      analysis_mode 
    });

    // Process documents for context with efficient token management
    const documentContext = processDocumentsForContext(documents, 25000);

    const systemPrompt = GRAND_STRATEGIST_PROMPT + documentContext;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Calling Azure OpenAI with comprehensive document context...');

    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 3000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response received successfully');

    const strategistResponse = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response at this time.';

    return new Response(JSON.stringify({ 
      response: strategistResponse,
      documentsProcessed: documents.length,
      status: 'success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grand-strategist function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
