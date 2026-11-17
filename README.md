# Slide Compare

A static web page that shows two decks side by side. Upload a PDF on the left and another on the right, then step through the slides together or separately.

Files are read in the browser only. Nothing is uploaded to a server.

## Use it

1. Open `index.html` in a browser, or use the GitHub Pages link below.
2. In PowerPoint, export each deck: **File > Export > PDF** (or **Save As > PDF**).
3. Upload one PDF on each side.
4. Use the Prev/Next buttons or the arrow keys. Turn off **Sync slides** to move the two sides independently.

## Publish on GitHub Pages

```bash
cd slide-compare
git init
git add .
git commit -m "Initial slide compare site"
git branch -M main
git remote add origin https://github.com/<your-username>/slide-compare.git
git push -u origin main
```

Then in the repo go to **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save. The site will be at `https://<your-username>.github.io/slide-compare/`.

## Notes

- Rendering uses [PDF.js](https://mozilla.github.io/pdf.js/) loaded from a CDN, so an internet connection is needed.
- Direct `.pptx` upload is not supported yet. PDF export keeps fonts, images and layout as they appear in PowerPoint.
