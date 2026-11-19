<?php
/**
 * Macht die Einstellungs-Seitenleiste des Block-Editors 360 px statt 280 px
 * breit und gibt ihr am linken Rand einen Ziehgriff.
 *
 * Core kann das nicht (Stand WP 7.1.4). Ein PR dafür liegt offen:
 * https://github.com/WordPress/gutenberg/pull/70616
 *
 * Warum JavaScript: CSS hat nur `resize`, und das setzt den Griff in die
 * untere rechte Ecke. Bei einer Seitenleiste rechts zieht er dort in die
 * falsche Richtung. Das Skript setzt nur die CSS-Variable
 * `--vlip-sidebar-width` auf <html>; die Breite selbst bleibt CSS.
 *
 * Bedienung: Ziehen mit der Maus. Mit der Tastatur Fokus auf den Griff, dann
 * Pfeil links/rechts (Schritt 20 px), Pos1/Ende für schmal/breit. Doppelklick
 * oder Entf setzt auf 360 px zurück.
 *
 * Die Breite wird pro User gespeichert, im Preferences-Store von core
 * (`core/preferences`, Scope `vlip`, Key `editorSidebarWidth`). Core schreibt
 * ihn gebündelt per REST in die User-Meta `{prefix}persisted_preferences` und
 * lädt ihn beim Öffnen des Editors vor. Die Breite gilt damit in jedem Browser.
 *
 * Unter 782 px Fensterbreite legt core die Leiste über den Inhalt; dort bleibt
 * alles wie im Core.
 */

namespace Vlip\EditorTools\SidebarResize;

use function Vlip\EditorTools\asset;

defined('ABSPATH') || exit;

add_action('enqueue_block_editor_assets', function (): void {
    [$script, $scriptVersion] = asset('modules/sidebar-resize/sidebar-resize.js');
    [$style, $styleVersion] = asset('modules/sidebar-resize/sidebar-resize.css');

    wp_enqueue_script(
        'vlip-sidebar-resize',
        $script,
        ['wp-dom-ready', 'wp-data', 'wp-preferences'],
        $scriptVersion,
        true
    );

    wp_enqueue_style('vlip-sidebar-resize', $style, [], $styleVersion);
});
