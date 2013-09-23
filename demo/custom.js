jQuery(document).ready(function($){
		
	$('a[popup], div[popup]').popup({
	  	text:{
	  		loading:'Chargement...',
	  		closePopup:'Fermer'
	  	},
	  	duration:600,
	  	types:{
	 		def:{
	 			content:'section',
				overlay:{
	 				opacity:0.5,
	 				color:'#000'
	 			}
	 		},
	 		test:{
	 			ajax: false,
	 			content:'.ipsum'

	 		}
	 	}
	 });

});