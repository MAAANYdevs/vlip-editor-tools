/**
 * Ziehgriff für die Einstellungs-Seitenleiste des Block-Editors.
 * Erklärung und Bedienung stehen in module.php.
 */
( function ( wp ) {
	if ( ! wp || ! wp.domReady || ! wp.data ) {
		return;
	}

	var SCOPE = 'vlip';
	var KEY = 'editorSidebarWidth';
	var DEFAULT = 360;
	var MIN = 280;
	var STEP = 20;
	var root = document.documentElement;
	var handle = null;

	/*
	 * `preferred` ist die Breite, die der User eingestellt hat. `width` ist die
	 * Breite, die gerade passt. Wird das Fenster schmaler, schrumpft nur
	 * `width`. Wird es wieder breiter, kommt die eingestellte Breite zurück.
	 * Gespeichert wird nur, was der User selbst einstellt.
	 */
	var preferred = DEFAULT;
	var width = DEFAULT;

	// Höchstens 720 px, und die Leinwand behält mindestens 480 px.
	function max() {
		return Math.max( MIN, Math.min( 720, window.innerWidth - 480 ) );
	}

	function clamp( value ) {
		return Math.round( Math.min( max(), Math.max( MIN, value ) ) );
	}

	function apply( value, save ) {
		if ( save ) {
			preferred = clamp( value );
		}
		width = clamp( save ? preferred : value );
		root.style.setProperty( '--vlip-sidebar-width', width + 'px' );

		if ( handle && handle.isConnected ) {
			handle.setAttribute( 'aria-valuenow', String( width ) );
			handle.setAttribute( 'aria-valuemax', String( max() ) );
			handle.setAttribute( 'aria-valuetext', width + ' Pixel' );
		}

		if ( save ) {
			var prefs = wp.data.dispatch( 'core/preferences' );
			if ( prefs ) {
				prefs.set( SCOPE, KEY, preferred );
			}
		}
	}

	// Zeigt wieder die eingestellte Breite, so weit der Platz reicht.
	function restore() {
		apply( preferred, false );
	}

	function createHandle() {
		var el = document.createElement( 'div' );
		el.className = 'vlip-sidebar-resize';
		el.tabIndex = 0;
		el.setAttribute( 'role', 'separator' );
		el.setAttribute( 'aria-orientation', 'vertical' );
		el.setAttribute( 'aria-label', 'Breite der Seitenleiste' );
		el.setAttribute( 'aria-valuemin', String( MIN ) );
		el.title = 'Ziehen ändert die Breite, Doppelklick setzt zurück';

		el.addEventListener( 'pointerdown', function ( event ) {
			if ( event.button !== 0 ) {
				return;
			}
			event.preventDefault();

			var right = el.parentElement.getBoundingClientRect().right;

			// Pointer-Capture hält die Events beim Griff, auch wenn die Maus
			// über das iframe der Leinwand fährt.
			el.setPointerCapture( event.pointerId );
			el.classList.add( 'is-dragging' );
			document.body.classList.add( 'vlip-sidebar-resizing' );

			function move( e ) {
				apply( right - e.clientX, false );
			}

			function stop( e ) {
				el.releasePointerCapture( e.pointerId );
				el.classList.remove( 'is-dragging' );
				document.body.classList.remove( 'vlip-sidebar-resizing' );
				el.removeEventListener( 'pointermove', move );
				el.removeEventListener( 'pointerup', stop );
				el.removeEventListener( 'pointercancel', stop );
				apply( width, true );
			}

			el.addEventListener( 'pointermove', move );
			el.addEventListener( 'pointerup', stop );
			el.addEventListener( 'pointercancel', stop );
		} );

		el.addEventListener( 'dblclick', function () {
			apply( DEFAULT, true );
		} );

		el.addEventListener( 'keydown', function ( event ) {
			var next = null;

			switch ( event.key ) {
				case 'ArrowLeft':
					next = width + STEP;
					break;
				case 'ArrowRight':
					next = width - STEP;
					break;
				case 'Home':
					next = MIN;
					break;
				case 'End':
					next = max();
					break;
				case 'Delete':
				case 'Backspace':
					next = DEFAULT;
					break;
			}

			if ( next !== null ) {
				event.preventDefault();
				apply( next, true );
			}
		} );

		return el;
	}

	// React baut die Seitenleiste beim Öffnen und Schließen neu auf. Der
	// Observer hängt den Griff jedes Mal wieder ein.
	function ensureHandle() {
		var sidebar = document.querySelector( '.interface-interface-skeleton__sidebar' );
		if ( sidebar && ! sidebar.querySelector( ':scope > .vlip-sidebar-resize' ) ) {
			handle = createHandle();
			sidebar.appendChild( handle );
			restore();
		}
	}

	var store = wp.data.select( 'core/preferences' );
	var stored = store ? parseInt( store.get( SCOPE, KEY ), 10 ) : NaN;
	preferred = stored || DEFAULT;
	restore();

	wp.domReady( function () {
		var queued = false;

		ensureHandle();

		new MutationObserver( function () {
			if ( queued ) {
				return;
			}
			queued = true;
			window.requestAnimationFrame( function () {
				queued = false;
				ensureHandle();
			} );
		} ).observe( document.body, { childList: true, subtree: true } );

		window.addEventListener( 'resize', restore );
	} );
} )( window.wp );
