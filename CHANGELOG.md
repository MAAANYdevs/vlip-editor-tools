# Changelog

Alle Versionen von VLIP Editor Tools. Neueste oben. Versionen nach
[SemVer](https://semver.org/lang/de/), Tags als `vX.Y.Z`.

## [1.4.0] – 2026-11-19

Erstes getaggtes Release. Die Versionen davor gab es nur im Plugin-Header.

### Neu
- Modul `sidebar-resize`: Die Einstellungs-Seitenleiste des Block-Editors
  ist 360 px breit statt 280 px und hat am linken Rand einen Ziehgriff.
- Der Griff ist eine senkrechte Pille wie beim Griff der Metaboxen in core.
  Bei Hover, Fokus und Ziehen wird die Pille blau und die ganze Trennlinie
  ebenso.
- Bedienung mit Maus und Tastatur: Pfeiltasten in 20-px-Schritten,
  Pos1/Ende für schmal/breit, Doppelklick oder Entf setzt zurück.
- Die Breite wird pro User gespeichert (`core/preferences`, Scope `vlip`,
  Key `editorSidebarWidth`).
- Wird das Fenster schmaler, schrumpft nur die Anzeige. Die eingestellte
  Breite bleibt gespeichert und kommt zurück.
- Filter `vlip_editor_tools/modules` zum Abschalten einzelner Module.
