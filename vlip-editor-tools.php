<?php
/**
 * Plugin Name: VLIP Editor Tools
 * Plugin URI: https://vlip.io
 * Description: Verbesserungen für den Block-Editor, die jedes VLIP-Projekt bekommt.
 * Version: 1.2.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Author: VLIP
 * Author URI: https://vlip.io
 */

namespace Vlip\EditorTools;

defined('ABSPATH') || exit;

const VERSION = '1.2.0';

/**
 * Die Module, die geladen werden. Ein Projekt schaltet ein Modul ab, indem es
 * den Schlüssel aus der Liste nimmt:
 *
 *     add_filter('vlip_editor_tools/modules', fn ($modules) => array_diff($modules, ['sidebar-resize']));
 *
 * Der Filter muss vor `plugins_loaded` stehen, also in einem eigenen
 * mu-plugin. Im Theme ist es dafür zu spät.
 */
add_action('plugins_loaded', function (): void {
    $modules = apply_filters('vlip_editor_tools/modules', [
        'sidebar-resize',
    ]);

    foreach ($modules as $module) {
        $file = __DIR__ . '/modules/' . basename($module) . '/module.php';

        if (is_readable($file)) {
            require_once $file;
        }
    }
});

/**
 * URL und Version einer Datei im Paket. Die Version ist der Zeitstempel der
 * Datei, damit Browser nach einem `composer update` die neue Fassung laden.
 *
 * @return array{0: string, 1: string}
 */
function asset(string $path): array
{
    $file = __DIR__ . '/' . ltrim($path, '/');

    return [
        plugins_url($path, __FILE__),
        is_readable($file) ? (string) filemtime($file) : VERSION,
    ];
}
