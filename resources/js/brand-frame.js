function initBrandFrames() {
	var settings = window.jifBrandFrame || {};
	var targets = document.querySelectorAll( '.brand-frame' );

	if ( ! targets.length ) {
		return;
	}

	var wraps = [];

	targets.forEach( function ( target ) {
		if ( target.parentElement && target.parentElement.classList.contains( 'brand-frame-wrap' ) ) {
			wraps.push( target.parentElement );
			return;
		}

		var wrap = document.createElement( 'div' );
		wrap.className = 'brand-frame-wrap';

		target.parentNode.insertBefore( wrap, target );

		var spin = document.createElement( 'img' );
		spin.className = 'brand-frame-wrap__spin';
		spin.src = settings.frame || '';
		spin.alt = '';
		spin.setAttribute( 'aria-hidden', 'true' );

		var frame = document.createElement( 'span' );
		frame.className = 'brand-frame-wrap__frame';
		frame.appendChild( spin );

		wrap.appendChild( target );
		wrap.appendChild( frame );

		wraps.push( wrap );
	} );

	if ( ! ( 'IntersectionObserver' in window ) ) {
		wraps.forEach( function ( wrap ) {
			wrap.classList.add( 'is-visible' );
		} );
		return;
	}

	var observer = new IntersectionObserver(
		function ( entries ) {
			entries.forEach( function ( entry ) {
				if ( entry.isIntersecting ) {
					entry.target.classList.add( 'is-visible' );
					observer.unobserve( entry.target );
				}
			} );
		},
		{ threshold: 0.35 }
	);

	wraps.forEach( function ( wrap ) {
		observer.observe( wrap );
	} );
}

initBrandFrames();
