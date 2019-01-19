function initializeSwitch() {
	const elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

	elems.forEach(function(html) {
		const options = {
			color: '#39527b'
			, secondaryColor: '#eee'
			, jackColor: '#fff'
			, jackSecondaryColor: '#eee'
			, className: 'switchery'
			, disabled: false
			, disabledOpacity: 0.5
			, speed: '0.3s'
			, size: 'small'
		};
		new Switchery(html, options);
	});
}



document.querySelector("html").classList.add('js');

const fileInput = document.querySelector(".custom-file-input");
const label = document.querySelector(".custom-file-label");

fileInput.addEventListener( "change", function( event ) {
	label.innerHTML = this.value;
});


