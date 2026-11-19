<?php
/**
 * Plugin Name: SOGC Word Cleaner
 * Plugin URI:  https://github.com/sogc-org/sogc-word-cleaner
 * Description: Automatically strips Microsoft Word / Office 365 bloated styles, attributes (aria-*, data-*, class, style), zero-width characters, and merged broken <ul> tags when pasting into Gutenberg blocks and TinyMCE Classic Editor (WYSIWYG visual mode only). Leaves HTML code view untouched. Supports automatic updates directly from GitHub.
 * Version:     1.0.0
 * Author:      SOGC Digital Team
 * Author URI:  https://sogc.org
 * License:     GPL-2.0+
 * Text Domain: sogc-word-cleaner
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class SOGC_Word_Cleaner {

    const VERSION = '1.0.0';

    public function __construct() {
        // Enqueue Gutenberg paste filter in block editor
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );

        // Enqueue TinyMCE Classic Editor plugin / paste handler
        add_filter( 'mce_external_plugins', array( $this, 'add_tinymce_plugin' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_classic_editor_assets' ) );
    }

    /**
     * Enqueue asset for Gutenberg Block Editor
     */
    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'sogc-clean-word-core',
            plugins_url( 'assets/clean-core.js', __FILE__ ),
            array(),
            self::VERSION,
            true
        );

        wp_enqueue_script(
            'sogc-clean-word-paste-gutenberg',
            plugins_url( 'assets/clean-paste-gutenberg.js', __FILE__ ),
            array( 'sogc-clean-word-core' ),
            self::VERSION,
            true
        );
    }

    /**
     * Register TinyMCE plugin for Classic Editor / ACF WYSIWYG
     */
    public function add_tinymce_plugin( $plugins ) {
        $plugins['sogc_clean_word_paste'] = plugins_url( 'assets/clean-paste-tinymce.js', __FILE__ );
        return $plugins;
    }

    /**
     * Ensure script loads for admin screens using Classic Editor
     */
    public function enqueue_classic_editor_assets( $hook ) {
        if ( in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
            wp_enqueue_script(
                'sogc-clean-word-core',
                plugins_url( 'assets/clean-core.js', __FILE__ ),
                array(),
                self::VERSION,
                true
            );
        }
    }
}

new SOGC_Word_Cleaner();

// Initialize GitHub Auto-Updater
require_once plugin_dir_path( __FILE__ ) . 'class-sogc-github-updater.php';
new SOGC_GitHub_Plugin_Updater(
    __FILE__,
    'sogc-org/sogc-word-cleaner',
    SOGC_Word_Cleaner::VERSION,
    '' // Root level repo
);
