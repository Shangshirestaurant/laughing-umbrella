# Shang Shi — Allergen Selector (Landing + Main)

This is a minimal, elegant landing → allergen selector built for GitHub Pages.

## Structure
- `index.html` — intro screen; the **logo is the enter button**.
- `app.html` — main page with glass header, allergen chips, presets, search and dish cards.
- `assets/css/styles.css` — theme (gold + dark green) with glassmorphism header.
- `assets/js/app.js` — vanilla JS for filtering logic and rendering.
- `data/menu.json` — your menu data (update this file only).

## How filtering works
Selecting allergens means **avoid** dishes that contain any of them. Presets simply pre-select a set of allergens.
Search filters by dish name or description.

### Allergen codes supported
`CE` celery, `GL` gluten, `CR` crustaceans, `EG` eggs, `Fl` fish, `LU` lupin,
`MO` molluscs, `Mi` milk, `MU` mustard, `NU` nuts, `PE` peanuts, `SE` sesame,
`SO` soy, `SU` sulfites, `GA` garlic, `ON` onion, `MR` mushrooms, `Cl` awaiting classification.

## Update menu
Edit `data/menu.json` and push. Example item:
```json
{
  "name": "Char Siu Pork",
  "price": 18.00,
  "allergens": ["GL","SO"],
  "description": "Honey-glazed roasted pork with five-spice."
}
```

## Deploy on GitHub Pages
1. Create a new repo (e.g., `shangshi-allergens`).
2. Upload all files at repo root.
3. In **Settings → Pages**, set **Branch: `main` / root**.
4. Your site will be live at `https://<your-username>.github.io/<repo>/`.
   - Intro: `/index.html`
   - Main: `/app.html`

## Optional: Deploy on Vercel
- Import the repo on Vercel (framework: **Other**), build command: **None**, output dir: **/**.

## Notes
- The header uses `backdrop-filter` for blur and degrades gracefully.
- No frameworks, no build step, fast and safe.
- Accessible: chips are toggles with `aria-checked`.
