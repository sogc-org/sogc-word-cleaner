# SOGC Word Cleaner (WordPress Plugin)

Automatically strips Microsoft Word and Office 365 bloated styles, attributes, zero-width characters, and merged broken list tags when pasting into WordPress WYSIWYG editors, while leaving HTML/Code views completely untouched.

Includes automatic in-dashboard updates directly from the [`sogc-org/sogc-word-cleaner`](https://github.com/sogc-org/sogc-word-cleaner) GitHub repository.

---

## Features
- **Visual WYSIWYG Only**: Intercepts pastes in visual editor modes (Gutenberg block editor, TinyMCE Classic Editor, and ACF WYSIWYG).
- **Allows Raw Paste in Code / HTML View**: If an author switches to the Gutenberg Code Editor (`Ctrl+Shift+Alt+M` or "Code editor" mode) or the Classic Editor "Text" / HTML tab, raw pasting is unhindered.
- **Aggressive Word Stripping**:
  - Removes Word attributes: `aria-*`, `data-*`, `style="..."`, `class="Mso..."`, `id="..."`, and `lang="..."`.
  - Removes `<!--[if ...]>`, `<o:p>`, `<w:worddocument>`, and `<style>` blocks.
  - Consolidates fragmented list tags (merges broken `</ul><ul>` and `</ol><ol>` into a single clean list).
  - Unwraps redundant inline `<span>` and `<font>` wrappers.
  - Preserves standard semantic structure: headings (`<h1>`–`<h6>`), paragraphs (`<p>`), lists (`<ul>`, `<ol>`, `<li>`), `<strong>`, `<em>`, `<a>`, and tables.
- **Automatic GitHub In-Dashboard Updates**: Integrated with `class-sogc-github-updater.php` for one-click updates whenever a new GitHub release is tagged.

---

## Installation

### Option 1: Upload via WordPress Admin
1. Download or generate `sogc-word-cleaner.zip`.
2. In your WordPress admin dashboard, go to **Plugins** &rarr; **Add New Plugin**.
3. Click **Upload Plugin** at the top.
4. Select `sogc-word-cleaner.zip` and click **Install Now** &rarr; **Activate**.

### Option 2: Direct Directory / Git Clone
Clone directly into your site's `wp-content/plugins/` directory:
```bash
cd wp-content/plugins/
git clone https://github.com/sogc-org/sogc-word-cleaner.git
```
Then activate the plugin in the WordPress admin panel.

---

## Automatic Updates via GitHub Releases
When publishing a new release:
1. Update `VERSION` in `sogc-word-cleaner.php`.
2. Commit and push to `main`.
3. Create a GitHub Release with tag matching the version (e.g. `v1.0.1`).
WordPress will notify administrators of the update in the dashboard and allow 1-click updating.
