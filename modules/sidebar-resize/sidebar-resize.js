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
	var width = DEFAULT;

	// Höchstens 720 px, und der Inhalt links behält mindestens 480 px.
	function max() {
		return Math.max( MIN, Math.min( 720, window.innerWidth - 480 ) );
	}

	function clamp( value ) {
		return Math.round( Math.min( max(), Math.max( MIN, value ) ) );
	}

	function apply( value, save ) {
		width = clamp( value );
		root.style.setProperty( '--vlip-sidebar-width', width + 'px' );

		var handle = document.querySelector( '.vlip-sidebar-resize' );
		if ( handle ) {
			handle.setAttribute( 'aria-valuenow', String( width ) );
			handle.setAttribute( 'aria-valuemax', String( max() ) );
			handle.setAttribute( 'aria-valuetext', width + ' Pixel' );
		}

		if ( save ) {
			var prefs = wp.data.dispatch( 'core/preferences' );
			if ( prefs ) {
				prefs.set( SCOPE, KEY, width );
			}
		}
	}

	function createHandle() {
		var handle = document.createElement( 'div' );
		handle.className = 'vlip-sidebar-resize';
		handle.tabIndex = 0;
		handle.setAttribute( 'role', 'separator' );
		handle.setAttribute( 'aria-orientation', 'vertical' );
		handle.setAttribute( 'aria-label', 'Breite der Seitenleiste' );
		handle.setAttribute( 'aria-valuemin', String( MIN ) );
		handle.title = 'Ziehen ändert die Breite, Doppelklick setzt zurück';

		handle.addEventListener( 'pointerdown', function ( event ) {
			if ( event.button !== 0 ) {
				return;
			}
			event.preventDefault();

			var sidebar = handle.parentElement;
			var right = sidebar.getBoundingClientRect().right;

			// Pointer-Capture hält die Events beim Griff, auch wenn die Maus
			// über das iframe der Leinwand fährt.
			handle.setPointerCapture( event.pointerId );
			handle.classList.add( 'is-dragging' );
			document.body.classList.add( 'vlip-sidebar-resizing' );

			function move( e ) {
				apply( right - e.clientX, false );
			}

			function stop( e ) {
				handle.releasePointerCapture( e.pointerId );
				handle.classList.remove( 'is-dragging' );
				document.body.classList.remove( 'vlip-sidebar-resizing' );
				handle.removeEventListener( 'pointermove', move );
				handle.removeEventListener( 'pointerup', stop );
				handle.removeEventListener( 'pointercancel', stop );
				apply( width, true );
			}

			handle.addEventListener( 'pointermove', move );
			handle.addEventListener( 'pointerup', stop );
			handle.addEventListener( 'pointercancel', stop );
		} );

		handle.addEventListener( 'dblclick', function () {
			apply( DEFAULT, true );
		} );

		handle.addEventListener( 'keydown', function ( event ) {
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

		return handle;
	}

	// React baut die Seitenleiste beim Öffnen und Schließen neu auf. Der
	// Observer hängt den Griff jedes Mal wieder ein.
	function ensureHandle() {
		var sidebar = document.querySelector( '.interface-interface-skeleton__sidebar' );
		if ( sidebar && ! sidebar.querySelector( ':scope > .vlip-sidebar-resize' ) ) {
			sidebar.appendChild( createHandle() );
			apply( width, false );
		}
	}

	var store = wp.data.select( 'core/preferences' );
	var stored = store ? parseInt( store.get( SCOPE, KEY ), 10 ) : NaN;
	apply( stored || DEFAULT, false );

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

		window.addEventListener( 'resize', function () {
			apply( width, false );
		} );
	} );
} )( window.wp );
