<?php
/**
 * Gibt beiden Seitenleisten des Block-Editors einen Ziehgriff.
 *
 * - Rechts (Einstellungen): 360 px statt 280 px, Griff am linken Rand.
 * - Links (Listenansicht und Inserter): 350 px wie core, Griff am rechten
 *   Rand. Listenansicht und Inserter teilen sich die Breite, weil core beide
 *   im selben Container zeigt.
 *
 * Core kann das nicht (Stand WP 7.1.4). Ein PR dafür liegt offen:
 * https://github.com/WordPress/gutenberg/pull/70616
 *
 * Warum JavaScript: CSS hat nur `resize`, und das setzt den Griff in die
 * untere rechte Ecke. Bei der rechten Leiste zieht er dort in die falsche
 * Richtung. Das Skript setzt nur die CSS-Variablen `--vlip-sidebar-width`
 * und `--vlip-secondary-sidebar-width` auf <html>; die Breite selbst bleibt
 * CSS.
 *
 * Bedienung: Ziehen mit der Maus. Mit der Tastatur Fokus auf den Griff, dann
 * Pfeiltasten (Schritt 20 px), Pos1/Ende für schmal/breit. Doppelklick oder
 * Entf setzt auf den Standard zurück.
 *
 * Grenzen: mindestens 280 px, höchstens 720 px. Die Leinwand behält immer
 * mindestens 480 px. Wird das Fenster schmaler, schrumpfen die Leisten. Wird
 * es wieder breiter, kommt die eingestellte Breite zurück.
 *
 * Die Breiten werden pro User gespeichert, im Preferences-Store von core
 * (`core/preferences`, Scope `vlip`, Keys `editorSidebarWidth` und
 * `editorSecondarySidebarWidth`). Core schreibt sie gebündelt per REST in die
 * User-Meta `{prefix}persisted_preferences` und lädt sie beim Öffnen des
 * Editors vor. Die Breiten gelten damit in jedem Browser.
 *
 * Unter 782 px Fensterbreite legt core die Leisten über den Inhalt; dort
 * bleibt alles wie im Core.
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
