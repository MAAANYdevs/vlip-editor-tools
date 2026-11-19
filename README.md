# VLIP Editor Tools

Verbesserungen für den Block-Editor, die jedes VLIP-Bedrock-Projekt bekommt.
Das Paket ist ein mu-plugin. Redakteure können es also nicht abschalten.

## Module

| Modul | Was es macht |
| --- | --- |
| `sidebar-resize` | Die Einstellungs-Seitenleiste ist 360 px breit statt 280 px. Am linken Rand sitzt ein Ziehgriff. Die Breite wird pro User gespeichert. |

## Einbinden

In der `composer.json` des Projekts das Repository eintragen:

```json
"repositories": [
  {
    "type": "vcs",
    "url": "https://github.com/MAAANYdevs/vlip-editor-tools.git",
    "no-api": true,
    "only": ["vlip/vlip-editor-tools"]
  }
]
```

Das Repo ist öffentlich. ddev und der Docker-Build brauchen dafür weder
SSH-Key noch Token.

Dann installieren:

```sh
ddev composer require vlip/vlip-editor-tools:dev-main
```

Bedrock legt das Paket nach `web/app/mu-plugins/vlip-editor-tools/`. Der
Bedrock-Autoloader lädt es von dort. Dafür muss `installer-paths` den Typ
`wordpress-muplugin` kennen. Das ist im Bedrock-Standard so eingestellt.

Updates holt `ddev composer update vlip/vlip-editor-tools`.

## Ein Modul abschalten

Ein Projekt kann einzelne Module abschalten. Der Filter muss in einem eigenen
mu-plugin stehen, weil die Module bei `plugins_loaded` laden. Im Theme ist es
dafür zu spät.

```php
add_filter('vlip_editor_tools/modules', fn (array $modules) => array_diff($modules, ['sidebar-resize']));
```

## Ein neues Modul anlegen

Ein Feature gehört hierher, wenn es kein Wissen über ein Projekt braucht. Es
darf also keine projekteigenen Blöcke, Post Types oder Felder kennen.

1. Ordner `modules/{name}/` mit einer `module.php` anlegen.
2. Namespace `Vlip\EditorTools\{Name}`. Handles, CSS-Klassen und Variablen
   beginnen mit `vlip-`.
3. CSS und JavaScript liegen als fertige Dateien daneben. Es gibt keinen
   Build-Schritt. Pfade und Versionen liefert `Vlip\EditorTools\asset()`.
4. Den Namen in die Liste in `vlip-editor-tools.php` eintragen.
5. Die Tabelle oben in dieser README ergänzen.
6. Oben in der `module.php` erklären, was das Modul tut und warum
   JavaScript nötig ist, falls es JavaScript nutzt.
