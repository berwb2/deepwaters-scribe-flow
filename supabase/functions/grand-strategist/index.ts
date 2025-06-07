
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_ENDPOINT = 'https://43931-mb7vprdo-swedencentral.openai.azure.com/openai/deployments/gpt-4-32k-g15/chat/completions?api-version=2025-01-01-preview';
const API_KEY = '7KpUPMr1vNypFk1tNTVD3dy77QLIRX6wabstqRSH2lChTqGqV6ejJQQJ99BEACfhMk5XJ3w3AAAAACOGUKcS';

const GRAND_STRATEGIST_PROMPT = `You are the Grand Strategist, an elite AI advisor with transcendent expertise in strategic thinking, life optimization, and document synthesis. Your core competencies include:

STRATEGIC ANALYSIS MASTERY:
- Analyze documents for hidden patterns, strategic opportunities, and optimization potential
- Identify cross-document connections and thematic relationships
- Provide high-level strategic recommendations with actionable implementation paths
- Detect strategic blind spots and potential risks in planning documents

LIFE ARCHITECTURE EXPERTISE:
- Design comprehensive life plans based on user goals, values, and document context
- Create strategic roadmaps connecting short-term actions to long-term vision
- Optimize resource allocation and priority sequencing
- Integrate personal, professional, and creative development strategies

DOCUMENT INTELLIGENCE:
- Synthesize insights across multiple documents to reveal strategic opportunities
- Analyze document quality, completeness, and strategic alignment
- Suggest document improvements and missing strategic elements
- Create strategic summaries and executive briefings

TACTICAL IMPLEMENTATION:
- Transform strategic vision into concrete, executable action plans
- Provide next-step recommendations with timing and resource requirements
- Create accountability frameworks and progress tracking mechanisms
- Adapt strategies based on changing circumstances and feedback

COMMUNICATION STANDARDS:
- Responses must be insightful, sophisticated, and strategically advanced
- Provide actionable intelligence with clear implementation guidance
- Connect individual documents to broader life and business strategy
- Maintain forward-thinking, visionary perspective while being practically grounded

CONTEXT AWARENESS:
You have access to the user's complete document ecosystem. Analyze patterns, themes, and strategic direction across all content to provide contextually intelligent recommendations.

Your mission: Transform ordinary thinking into extraordinary strategic results through elite-level analysis and guidance.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, documents = [], analysis_mode = 'chat' } = await req.json();

    console.log('Grand Strategist request:', { message, documentCount: documents.length, analysis_mode });

    // Prepare document context for the AI
    let documentContext = '';
    if (documents.length > 0) {
      documentContext = `\n\nDOCUMENT CONTEXT:\n`;
      documents.slice(0, 20).forEach((doc: any, index: number) => {
        documentContext += `\nDocument ${index + 1}: "${doc.title}" (${doc.content_type})\n`;
        documentContext += `Content: ${doc.content.substring(0, 500)}...\n`;
      });
    }

    const messages = [
      {
        role: 'system',
        content: GRAND_STRATEGIST_PROMPT + documentContext
      },
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Calling Azure OpenAI...');

    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 2000,
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
    console.log('Azure OpenAI response received');

    const strategistResponse = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response at this time.';

    return new Response(JSON.stringify({ 
      response: strategistResponse,
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
