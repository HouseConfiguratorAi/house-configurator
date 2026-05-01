# House Configurator — AI Woning Renovatie

Upload een woningfoto en visualiseer kleur- en stijlwijzigingen in seconden via AI.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — donker, premium design
- **Zustand** — client state tussen pagina's
- **Replicate** — AI image generation (SDXL img2img)

## Snel starten

```bash
npm install
cp .env.example .env.local
# Vul REPLICATE_API_TOKEN in
npm run dev
```

Open `http://localhost:3000`

## Zonder API key

Zet `MOCK_GENERATION=true` in `.env.local` voor een demo zonder AI (geeft originele foto terug).

## Deploy naar Vercel

```bash
vercel --prod
```

Voeg `REPLICATE_API_TOKEN` toe als environment variable in het Vercel dashboard.

## Flow

1. **/** — upload foto of kies voorbeeldwoning
2. **/configure** — kies dak/gevel/ramen/deur kleur
3. **/result** — before/after slider + download
