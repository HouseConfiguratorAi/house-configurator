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

    // Strip the data URL prefix to get raw base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Use SDXL img2img via Replicate
    const output = await replicate.run(
      'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37291fae01d7b3b70a1aabdb',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image: `data:image/jpeg;base64,${base64Data}`,
          strength: 0.45,          // low = preserve more structure
          guidance_scale: 7.5,
          num_inference_steps: 40,
          width: 1024,
          height: 768,
          scheduler: 'K_EULER',
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
