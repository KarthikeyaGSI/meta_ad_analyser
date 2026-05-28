import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyticsApi } from '../../../services/api';

export async function POST(req: Request) {
  try {
    const { messages, accountId } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key missing in environment' }, { status: 500 });
    }

    const result = await streamText({
      model: openai('gpt-4o'),
      messages,
      system: `You are Aetheris, an expert Meta Ads Media Buyer AI. You analyze campaigns, budgets, and creatives. 
      You are speaking to the campaign manager. Provide concise, strategic, and data-driven answers.`,
      tools: {
        getCampaignMetrics: tool({
          description: 'Get active campaign performance metrics for the user to answer questions about ROAS, spend, etc.',
          parameters: z.object({
            limit: z.number().optional().describe('Number of campaigns to fetch'),
          }),
          // @ts-expect-error - Bypass AI SDK strict typing for prototype
          execute: async ({ limit }: { limit?: number }) => {
            if (!accountId) return { error: 'No active account ID provided in chat context.' };
            const today = new Date().toISOString().split('T')[0];
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            try {
              const res = await analyticsApi.getCampaigns(accountId, lastWeek, today, { limit: limit || 10 });
              return res.data;
            } catch (error: unknown) {
              return { error: 'Failed to fetch campaigns', details: error };
            }
          },
        }),
      },
    });

    // @ts-expect-error - Bypass AI SDK strict typing for prototype
    return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
  } catch (error) {
    console.error('API Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
