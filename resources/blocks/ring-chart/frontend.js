import { computeLabelDip } from './style-vars';

function measureRing( ringEl ) {
	const labelEl = ringEl.querySelector( '.cz-ring-chart__label' );
	const textEl = ringEl.querySelector( '.cz-ring-chart__name' );
	if ( ! labelEl || ! textEl ) {
		return;
	}

	// The label's own padding is left out of the measurement — it's the
	// margin that absorbs the arc's residual curve, not span that itself
	// needs covering.
	const radius = ringEl.getBoundingClientRect().width / 2;
	const halfWidth = textEl.getBoundingClientRect().width / 2;
	const dip = computeLabelDip( radius, halfWidth );
	labelEl.style.setProperty( '--cz-rc-label-dip', `${ dip }px` );
}

function initRingCharts() {
	const rings = document.querySelectorAll( '.cz-ring-chart__ring:not(.is-core)' );
	if ( ! rings.length ) {
		return;
	}

	rings.forEach( measureRing );

	if ( ! ( 'ResizeObserver' in window ) ) {
		return;
	}

	// Both the ring (its radius) and the text (its width) can change size
	// independently — e.g. a breakpoint change resizes the ring gap and the
	// label font size at the same time, but not necessarily in the same
	// observer tick — so each ring's own remeasure closes over its element
	// rather than relying on ResizeObserver's entry.target.
	rings.forEach( ( ringEl ) => {
		const textEl = ringEl.querySelector( '.cz-ring-chart__name' );
		const remeasure = () => measureRing( ringEl );
		const observer = new ResizeObserver( remeasure );
		observer.observe( ringEl );
		if ( textEl ) {
			observer.observe( textEl );
		}
	} );
}

initRingCharts();
