# Sound Trainer v0.6.0 — Install on iPhone

The app is a PWA (Home Screen web app), **not an IPA/TestFlight build**. Microphone access requires an HTTPS deployment and foreground Safari/Home Screen session.

## Deploy from source (Netlify or another static host)

1. On your PC, install Node.js 22+ and run `npm install` in the project folder.
2. Run `npm run build` and `npm run verify:dist`.
3. Upload the resulting **dist/** directory to Netlify Drop (https://app.netlify.com/drop). Alternatively, connect the GitHub repo to Netlify: build command `npm run build`, publish folder `dist`.
4. Open the resulting `https://...netlify.app` URL in iPhone Safari.
5. Tap **Share → Add to Home Screen → Add** (enable Open as Web App if offered).
6. Launch from the Home Screen; allow microphone access when asked.

If you use GitHub Actions instead of building locally, download the **minified-web-app** artifact from a successful Actions build and deploy its contents. This source ZIP is **not** a directly deployable website ZIP; the site must be bundled/minified first.

## Test four actions

- Confirm the in-app safety checklist; verify unloaded equipment and remove live ammunition from the training area.
- Learn Draw from holster, Rack slide, Trigger pull, and Change magazine (3+ examples of each, preferably 8–10).
- Tap **Start continuous listening**, not **Single sound test**. The indicator should say **Microphone active**.
- Perform several **separated** events, checking that the per-session timeline gains multiple entries. The mic should continue listening until you tap Stop or switch away/background the app.
- Verify detections in History to populate accuracy metrics. Undetected events are not represented in those metrics.
- If old `reload` samples actually represented slide movement, reset and retrain the model.

For reliability test on a real iPhone. Different microphones and rooms can cause misclassification; distinct overlapping sounds cannot always be separated. Raw recordings are never saved or uploaded. Data is local to the browser installation; export backups before clearing site data or changing origins.
