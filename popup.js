jQuery(document).ready(function($){

	$.extend($.fn, {
		
		popup:function(args) {

			var s = $.extend(true,{
				types:{
					def:{
						content: 'body',
						ajax: true,
						initCallback:null,
						closeCallback:null,
						overlay:{
							color:'#000',
							image:null,
							opacity:0.8
						}
					}
				},
				zIndex:25,
				duration:500,
				easeIn:'swing',
				easeOut:'swing',
				text:{
					loading:'Loading...',
					closePopup:'Close'
				}
			}, args);	
			
			$(this).on('click',function(e){
				
				var self = this;
				var href = $(this).attr('href');
				var type = s.types[$(this).attr('popup')] ? $(this).attr('popup') : 'def';
				var cs = $.extend(true,s.types.def, s.types[type]);

				var originalProps = {
						scroll: { x: $(window).scrollLeft(), y:$(window).scrollTop() },
						overflow: $('body')[0].style.overflow
					};
				
				$('body').append('<div id="popup"><div class="overlay"></div><div class="close">'+s.text.closePopup+'</div></div>');
				
				var popup = $('#popup').fadeTo(0,0).css({
						position:'fixed',
						top:0,
						bottom:0,
						left:0,
						right:0,
						overflow:'auto',
						zIndex: s.zIndex
					});
				var overlay = $('.overlay', popup).css({
						position:'fixed',
						top:0,
						bottom:0,
						left:0,
						right:0,
						background: (cs.overlay.image ? image+' ' : '') + cs.overlay.color,
						zIndex: 0
					}).fadeTo(0, cs.overlay.opacity);

				$('body').css({
						overflow:'hidden',
						height:$(window).height()+'px'
					}).prepend('<div class="freezed"></div>').children().not(popup).appendTo($('body>.freezed'));
				
				var freezed = $('body>.freezed').css({
							marginTop:'-'+originalProps.scroll.y+'px'
						});

				window.scrollTo(0, 0);

				$(popup).append('<div class="loader">'+s.text.loading+'</div>').fadeTo(s.duration, 1, s.easeIn);
				
				var loader = $('.loader',popup).css({
						position:'absolute',
						left:'50%',
						top:'50%',
						zIndex:3,
						margin: '-'+($(this).height()/2)+'px -'+($(this).width()/2)+'px'
				});

				var content = null;
				var parent = null;
				var ind = null;
				var close = $('.close',popup).hide();

				if(cs.ajax)
					var ajaxReq = $.get(href, function(data){
							var temp = $(data).find(cs.content);
							
							$(popup).append('<div class="popup-content"></div>');

							content = $('.popup-content', popup).css({
									minHeight:'100%',
									margin:'100% auto 0',
									zIndex:2
								}).fadeTo(0,0).append($(close).show()).append(temp).fadeTo(s.duration, 1, s.easeOut);


							if(cs.initCallback) cs.initCallback();

							$(loader).fadeTo(s.duration, 0, s.easeOut, function(){
									$(this).remove();
								})
							$(content).animate({
									marginTop:'0%'
								}, s.duration, s.easeOut);
						})
				else{
					var temp = $(self).parent().find(cs.content).length>0 ? $(self).parent().find(cs.content).show() : $(cs.content).show();
					
					$(popup).append('<div class="popup-content"></div>');

					content = $('.popup-content', popup).css({
							minHeight:'100%',
							margin:'100% auto 0',
							zIndex:2
						}).fadeTo(0,0).append($(close).show())

					content.p = temp.parent();
					content.i = temp.index();

					content.append(temp).fadeTo(s.duration, 1, s.easeOut);

					if(cs.initCallback) cs.initCallback();

					$(loader).fadeTo(s.duration, 0, s.easeOut, function(){
							$(this).remove();
						})
					$(content).animate({
							marginTop:'0%'
						}, s.duration, s.easeOut);
				};


				$(overlay).add(close).on('click',function(e){
						$(overlay).add(close).off('click');
						if(ajaxReq) ajaxReq.abort();

						if(cs.closeCallback) cs.closeCallback();

						$('body')[0].style.height = '';
						
						$('body')[0].style.overflow = '';
						

						$('body').css({
								overflow:originalProps.overflow,
								height:''
							});

						$(freezed).children().first().unwrap();

						window.scrollTo(originalProps.scroll.x, originalProps.scroll.y);

						if(content) $(content).animate({
								marginTop:'-100%'
							}, s.duration, s.easeIn);
							
						$(popup).fadeTo(s.duration, 0, s.easeIn, function(){
								if(!cs.ajax){
									if(content.i==0)
										$(content.p).prepend($(content.children(cs.content)))
									else
										$(content.p).children().eq(content.i-1).after($(content.children(cs.content).hide()));
								}
								$(overlay).add(close).off('click');
								$(this).remove();
							});
					});


				e.stopPropagation();
				e.preventDefault();
				return false;
			})

		}
				
	});

});