/**
 * SOGC Clean Word Paste - Gutenberg Block Editor Integration
 * Uses the official WordPress blocks.registerBlockType filter to intercept paste
 */
(function () {
  'use strict';

  // Import WordPress dependencies
  const addFilter = window.wp && window.wp.hooks && window.wp.hooks.addFilter;

  // Wait for DOM / wp.hooks to be available
  function initGutenbergCleaner() {
    // 1. Hook into Gutenberg's block paste processor
    // Filter: 'editor.BlockList.paste' or block transforms
    // In WordPress Gutenberg, editor.BlockList paste event or raw paste pre-processing:
    document.addEventListener(
      'paste',
      function (e) {
        // Only run if we are inside a Gutenberg rich text contenteditable element
        const target = e.target;
        if (!target) return;

        // Check if user is in Code Editor mode
        // In Gutenberg, code editor has class .editor-post-text-editor or is inside textarea
        if (
          target.tagName === 'TEXTAREA' ||
          target.classList.contains('editor-post-text-editor') ||
          target.closest('.editor-post-text-editor')
        ) {
          // Allow raw paste in Code / HTML View
          return;
        }

        // Check if target is a Gutenberg visual editor element (.block-editor-rich-text__editable or contenteditable)
        const isVisualBlock =
          target.isContentEditable ||
          target.closest('.block-editor-rich-text__editable') ||
          target.closest('.block-editor-block-list__layout');

        if (!isVisualBlock) {
          return;
        }

        if (e.clipboardData) {
          const rawHtml = e.clipboardData.getData('text/html');
          if (rawHtml && window.SOGCCleanWordCore) {
            // Check if it has MS Word or Office signatures
            const isWord =
              /class=["']?Mso|xmlns:o=|xmlns:w=|<!--\[if|data-listid|data-aria-|data-leveltext|mso-|font-family/i.test(
                rawHtml
              );

            if (isWord) {
              const cleaned = window.SOGCCleanWordCore.clean(rawHtml);
              if (cleaned) {
                e.preventDefault();
                e.stopPropagation();

                // Insert the sanitized HTML into the current selection
                if (document.queryCommandSupported('insertHTML')) {
                  document.execCommand('insertHTML', false, cleaned);
                } else {
                  // Fallback: Use standard Selection API
                  const sel = window.getSelection();
                  if (sel.getRangeAt && sel.rangeCount) {
                    const range = sel.getRangeAt(0);
                    range.deleteContents();
                    const el = document.createElement('div');
                    el.innerHTML = cleaned;
                    const frag = document.createDocumentFragment();
                    let node;
                    while ((node = el.firstChild)) {
                      frag.appendChild(node);
                    }
                    range.insertNode(frag);
                  }
                }
              }
            }
          }
        }
      },
      true // Capture phase: intercepts BEFORE WordPress or browser default paste handlers
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGutenbergCleaner);
  } else {
    initGutenbergCleaner();
  }
})();
