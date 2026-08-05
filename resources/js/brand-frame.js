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

		var left = document.createElement( 'img' );
		left.className = 'brand-frame-wrap__side brand-frame-wrap__side--left';
		left.src = settings.left || '';
		left.alt = '';
		left.setAttribute( 'aria-hidden', 'true' );

		var right = document.createElement( 'img' );
		right.className = 'brand-frame-wrap__side brand-frame-wrap__side--right';
		right.src = settings.right || '';
		right.alt = '';
		right.setAttribute( 'aria-hidden', 'true' );

		wrap.appendChild( target );
		wrap.appendChild( left );
		wrap.appendChild( right );

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
