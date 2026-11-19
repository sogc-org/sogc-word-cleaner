/**
 * SOGC Clean Word Paste - TinyMCE Plugin
 * Intercepts paste in Classic Editor, ACF WYSIWYG, and Elementor TinyMCE instances
 */
(function () {
  'use strict';

  if (typeof tinymce === 'undefined') {
    return;
  }

  tinymce.PluginManager.add('sogc_clean_word_paste', function (editor) {
    // Listen for PastePreProcess event on TinyMCE
    editor.on('PastePreProcess', function (e) {
      // If user is in HTML/Text tab (textarea mode), TinyMCE is inactive and won't trigger PastePreProcess.
      // In Visual mode, this hook receives all incoming paste HTML.
      if (e.content && window.SOGCCleanWordCore) {
        // Run our aggressive sanitizer on the incoming content
        const cleaned = window.SOGCCleanWordCore.clean(e.content);
        if (cleaned) {
          e.content = cleaned;
        }
      }
    });

    // Also listen for raw paste event on editor body as an extra safeguard
    editor.on('paste', function (e) {
      if (e.clipboardData) {
        const rawHtml = e.clipboardData.getData('text/html');
        if (
          rawHtml &&
          /class=["']?Mso|xmlns:o=|xmlns:w=|<!--\[if|data-listid|data-aria-|data-leveltext|mso-|font-family/i.test(
            rawHtml
          ) &&
          window.SOGCCleanWordCore
        ) {
          const cleaned = window.SOGCCleanWordCore.clean(rawHtml);
          if (cleaned) {
            e.preventDefault();
            editor.insertContent(cleaned);
          }
        }
      }
    });
  });
})();
