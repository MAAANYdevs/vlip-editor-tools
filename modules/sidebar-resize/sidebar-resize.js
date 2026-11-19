/**
 * Ziehgriffe für die beiden Seitenleisten des Block-Editors.
 * Erklärung und Bedienung stehen in module.php.
 */
( function ( wp ) {
	if ( ! wp || ! wp.domReady || ! wp.data ) {
		return;
	}

	var SCOPE = 'vlip';
	var MIN = 280;
	var STEP = 20;
	var root = document.documentElement;

	/*
	 * `grow` sagt, in welche Richtung die Leiste breiter wird. Die rechte
	 * Leiste wächst nach links, ihr Griff sitzt am linken Rand. Die linke
	 * Leiste wächst nach rechts, ihr Griff sitzt am rechten Rand.
	 */
	var sidebars = [
		{
			container: '.interface-interface-skeleton__sidebar',
			key: 'editorSidebarWidth',
			variable: '--vlip-sidebar-width',
			label: 'Breite der rechten Seitenleiste',
			className: 'vlip-sidebar-resize',
			fallback: 360,
			grow: 'left',
		},
		{
			container: '.interface-interface-skeleton__secondary-sidebar',
			key: 'editorSecondarySidebarWidth',
			variable: '--vlip-secondary-sidebar-width',
			label: 'Breite der linken Seitenleiste',
			className: 'vlip-sidebar-resize vlip-sidebar-resize--secondary',
			fallback: 350,
			grow: 'right',
		},
	];

	// Breite, die die andere Leiste gerade auf dem Bildschirm einnimmt.
	function otherWidth( sidebar ) {
		var other = sidebars[ sidebars.indexOf( sidebar ) === 0 ? 1 : 0 ];
		var el = document.querySelector( other.container );
		return el ? el.getBoundingClientRect().width : 0;
	}

	// Höchstens 720 px, und die Leinwand behält mindestens 480 px.
	function max( sidebar ) {
		return Math.max( MIN, Math.min( 720, window.innerWidth - 480 - otherWidth( sidebar ) ) );
	}

	function clamp( sidebar, value ) {
		return Math.round( Math.min( max( sidebar ), Math.max( MIN, value ) ) );
	}

	/*
	 * `preferred` ist die Breite, die der User eingestellt hat. `width` ist die
	 * Breite, die gerade passt. Wird das Fenster schmaler, schrumpft nur
	 * `width`. Wird es wieder breiter, kommt die eingestellte Breite zurück.
	 * Gespeichert wird nur, was der User selbst einstellt.
	 */
	function apply( sidebar, value, save ) {
		if ( save ) {
			sidebar.preferred = clamp( sidebar, value );
		}
		sidebar.width = clamp( sidebar, save ? sidebar.preferred : value );
		root.style.setProperty( sidebar.variable, sidebar.width + 'px' );

		var handle = sidebar.handle;
		if ( handle && handle.isConnected ) {
			handle.setAttribute( 'aria-valuenow', String( sidebar.width ) );
			handle.setAttribute( 'aria-valuemax', String( max( sidebar ) ) );
			handle.setAttribute( 'aria-valuetext', sidebar.width + ' Pixel' );
		}

		if ( save ) {
			var prefs = wp.data.dispatch( 'core/preferences' );
			if ( prefs ) {
				prefs.set( SCOPE, sidebar.key, sidebar.preferred );
			}
		}
	}

	// Zeigt wieder die eingestellte Breite, so weit der Platz reicht.
	function restore( sidebar ) {
		apply( sidebar, sidebar.preferred, false );
	}

	function createHandle( sidebar ) {
		var handle = document.createElement( 'div' );
		handle.className = sidebar.className;
		handle.tabIndex = 0;
		handle.setAttribute( 'role', 'separator' );
		handle.setAttribute( 'aria-orientation', 'vertical' );
		handle.setAttribute( 'aria-label', sidebar.label );
		handle.setAttribute( 'aria-valuemin', String( MIN ) );
		handle.title = 'Ziehen ändert die Breite, Doppelklick setzt zurück';

		handle.addEventListener( 'pointerdown', function ( event ) {
			if ( event.button !== 0 ) {
				return;
			}
			event.preventDefault();

			var rect = handle.parentElement.getBoundingClientRect();

			// Pointer-Capture hält die Events beim Griff, auch wenn die Maus
			// über das iframe der Leinwand fährt.
			handle.setPointerCapture( event.pointerId );
			handle.classList.add( 'is-dragging' );
			document.body.classList.add( 'vlip-sidebar-resizing' );

			function move( e ) {
				var value = sidebar.grow === 'left' ? rect.right - e.clientX : e.clientX - rect.left;
				apply( sidebar, value, false );
			}

			function stop( e ) {
				handle.releasePointerCapture( e.pointerId );
				handle.classList.remove( 'is-dragging' );
				document.body.classList.remove( 'vlip-sidebar-resizing' );
				handle.removeEventListener( 'pointermove', move );
				handle.removeEventListener( 'pointerup', stop );
				handle.removeEventListener( 'pointercancel', stop );
				apply( sidebar, sidebar.width, true );
			}

			handle.addEventListener( 'pointermove', move );
			handle.addEventListener( 'pointerup', stop );
			handle.addEventListener( 'pointercancel', stop );
		} );

		handle.addEventListener( 'dblclick', function () {
			apply( sidebar, sidebar.fallback, true );
		} );

		handle.addEventListener( 'keydown', function ( event ) {
			// Die Pfeiltaste in Wachstumsrichtung macht die Leiste breiter.
			var wider = sidebar.grow === 'left' ? 'ArrowLeft' : 'ArrowRight';
			var narrower = sidebar.grow === 'left' ? 'ArrowRight' : 'ArrowLeft';
			var next = null;

			switch ( event.key ) {
				case wider:
					next = sidebar.width + STEP;
					break;
				case narrower:
					next = sidebar.width - STEP;
					break;
				case 'Home':
					next = MIN;
					break;
				case 'End':
					next = max( sidebar );
					break;
				case 'Delete':
				case 'Backspace':
					next = sidebar.fallback;
					break;
			}

			if ( next !== null ) {
				event.preventDefault();
				apply( sidebar, next, true );
			}
		} );

		return handle;
	}

	// React baut die Leisten beim Öffnen und Schließen neu auf. Der Observer
	// hängt die Griffe jedes Mal wieder ein.
	function ensureHandle( sidebar ) {
		var container = document.querySelector( sidebar.container );
		if ( container && ! container.querySelector( ':scope > .vlip-sidebar-resize' ) ) {
			sidebar.handle = createHandle( sidebar );
			container.appendChild( sidebar.handle );
		}
	}

	// Welche Leisten gerade offen sind. Ändert sich das, bekommt jede Leiste
	// wieder ihre eingestellte Breite, so weit der Platz reicht.
	function openState() {
		return sidebars
			.map( function ( sidebar ) {
				var container = document.querySelector( sidebar.container );
				return container && container.getBoundingClientRect().width > 0 ? '1' : '0';
			} )
			.join( '' );
	}

	var store = wp.data.select( 'core/preferences' );

	sidebars.forEach( function ( sidebar ) {
		var stored = store ? parseInt( store.get( SCOPE, sidebar.key ), 10 ) : NaN;
		sidebar.preferred = stored || sidebar.fallback;
		restore( sidebar );
	} );

	wp.domReady( function () {
		var queued = false;
		var lastState = '';

		function ensureAll() {
			sidebars.forEach( ensureHandle );

			var state = openState();
			if ( state !== lastState ) {
				lastState = state;
				sidebars.forEach( restore );
			}
		}

		ensureAll();

		new MutationObserver( function () {
			if ( queued ) {
				return;
			}
			queued = true;
			window.requestAnimationFrame( function () {
				queued = false;
				ensureAll();
			} );
		} ).observe( document.body, { childList: true, subtree: true } );

		window.addEventListener( 'resize', function () {
			sidebars.forEach( restore );
		} );
	} );
} )( window.wp );
