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
	/* labelName = label.innerHTML;
	if(labelName.startsWith("Import")){
		label.innerHTML = "";
	}
	const nameFile = this.value;
	console.log(nameFile.slice(12));
	label.innerHTML += nameFile.slice(12) + ";"; */
	label.innerHTML = `${fileInput.files.length} Files To Upload`;	
	
});


