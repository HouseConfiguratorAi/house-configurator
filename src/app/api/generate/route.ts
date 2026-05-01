import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, buildNegativePrompt } from '@/lib/promptBuilder';
import type { GenerateRequest } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { imageBase64, config } = body;

    if (!imageBase64 || !config) {
      return NextResponse.json({ error: 'Missing imageBase64 or config' }, { status: 400 });
    }

    const prompt = buildPrompt(config);
    const negativePrompt = buildNegativePrompt();

    // Mock mode or no API token → return original with metadata
    if (process.env.MOCK_GENERATION === 'true' || !process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({
        imageUrl: imageBase64,
        prompt,
        mock: true,
      });
    }

    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const output = await replicate.run(
      'timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a6ced8c7c35e58e7f9f8f6a0a',
      {
        input: {
          prompt,
          image: `data:image/jpeg;base64,${base64Data}`,
          num_inference_steps: 50,
          image_guidance_scale: 1.5,
          guidance_scale: 7.5,
        },
      }
    );

    // output is an array of URLs from Replicate
    const outputUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ imageUrl: outputUrl, prompt, mock: false });
  } catch (err) {
    console.error('[/api/generate]', err);
    return NextResponse.json({ error: 'Generation failed', details: String(err) }, { status: 500 });
  }
}
