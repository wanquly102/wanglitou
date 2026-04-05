# wanglitou

Wanglitou is now a lightweight full-stack MVP for a family learning product:

- public brand page
- parent training center
- admin console
- local SQLite database

## Stack

- Node.js 22
- built-in `node:http`
- built-in `node:sqlite`
- vanilla HTML, CSS, and JavaScript

No external package installation is required for the current MVP.

## Run locally

```bash
npm start
```

The app runs at:

`http://127.0.0.1:3000`

## Default admin account

The server seeds a default admin account if one does not already exist:

- Email: `admin@wanglitou.local`
- Password: `ChangeMe123!`

You can override this with environment variables:

- `WLT_ADMIN_EMAIL`
- `WLT_ADMIN_PASSWORD`

## Main entry points

- `/` brand landing page
- `/ai-tools/` standalone AI tool studio
- `/portal.html` parent training center
- `/admin.html` admin console

## Current MVP abilities

- email registration and login
- invite-code registration
- child profile management
- English dictation training
- Chinese dictation training
- math practice generation
- guest and logged-in quota control
- standalone AI tool interface with poster, Xiaohongshu carousel, WeChat article, social visual, and product image workflows
- single-prompt workflow with example images and prompt assistance
- separate AI generation quota and recent history
- Pollinations-based open-source image generation, plus optional OpenAI fallback
- VIP gating and WeChat contact flow
- referral link generation
- admin settings, invite codes, user management, and content maintenance

## AI tools environment variables

The AI tools studio now defaults to Pollinations for open-source image generation and can optionally switch to OpenAI.

- `AI_PROVIDER` default: `pollinations`
- `POLLINATIONS_IMAGE_BASE_URL` default: `https://image.pollinations.ai`
- `POLLINATIONS_TEXT_BASE_URL` default: `https://text.pollinations.ai`
- `POLLINATIONS_IMAGE_MODEL` default: `flux`
- `POLLINATIONS_TEXT_MODEL` default: `openai`
- `POLLINATIONS_API_KEY` optional
- `AI_FETCH_TIMEOUT_MS` default: `8000`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` default: `https://api.openai.com/v1`
- `AI_TEXT_MODEL` default: `gpt-5.4-mini`
- `AI_IMAGE_MODEL` default: `gpt-image-1.5`

If Pollinations text enhancement is slow or unavailable, the app falls back to local prompt assistance and local article drafting so the tools remain usable.

## Important deployment note

The old GitHub Pages setup is still useful for a static landing page, but login, database, quota control, and admin features require a real Node host.

Recommended next deployment targets:

- Render
- Railway
- Fly.io
- your own VPS
