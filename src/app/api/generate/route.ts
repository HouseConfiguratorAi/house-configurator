import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, buildNegativePrompt } from '@/lib/promptBuilder';
import type { GenerateRequest } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, config, prompt: directPrompt, lighting = 'day', season = 'summer' } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    // Use a direct prompt if provided, otherwise build from HouseConfig
    const prompt = directPrompt ?? (config ? buildPrompt(config as GenerateRequest['config'], lighting, season) : null);
    if (!prompt) {
      return NextResponse.json({ error: 'Missing config or prompt' }, { status: 400 });
    }
    const negativePrompt = buildNegativePrompt();

    // Mock mode or no API token
    if (process.env.MOCK_GENERATION === 'true' || !process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ imageUrl: imageBase64, prompt, mock: true });
    }

    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const output = await replicate.run(
      'timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a6ced8c7c35e58e7f9f8f6a0a',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image: `data:image/jpeg;base64,${base64Data}`,
          num_inference_steps: 50,
          image_guidance_scale: 1.5,
          guidance_scale: 7.5,
        },
      }
    );

    const outputUrl = Array.isArray(output) ? output[0] : output;
    return NextResponse.json({ imageUrl: outputUrl, prompt, mock: false });
  } catch (err) {
    console.error('[/api/generate]', err);
    return NextResponse.json({ error: 'Generation failed', details: String(err) }, { status: 500 });
  }
}
