jQuery(document).ready(function($){

	var prefix = (function () {
	  var styles = window.getComputedStyle(document.documentElement, ''),
	    pre = (Array.prototype.slice
	      .call(styles)
	      .join('') 
	      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
	    )[1],
	    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
	  return {
	    dom: dom,
	    lowercase: pre,
	    css: '-' + pre + '-',
	    js: (pre[0].toUpperCase() + pre.substr(1)).toLowerCase()
	  };
	})();

	var has3D = (function () {
	   var supportedPrefix,
	      supports3d = false,
	      prefixes = [ "Webkit", "Moz", "ms", "O" ],
	      div = document.createElement("div");
	    if ( div.style.perspective !== undefined ) {
	        supportedPrefix = "";
	        supports3d = true;
	    }else {
	        for ( var i = 0; i < prefixes.length; ++i ) {
	            if((prefixes[i] + "Perspective") in div.style) {
	                supports3d = true;
	                supportedPrefix = prefixes[i];
	                break;
	            }
	        }
	    }
	    return supports3d;
	})();

	var transition = prefix.js+'Transition';
	var transform = prefix.js+'Transform';
	var CSStransform = prefix.css+'transform';
	var CSStransition = prefix.css+'transition';
	var CSStranslate = {start:'translate'+(has3D?'3d':''), end: (has3D?', 0':'')};

	$.extend($.fn, {
		
		popup:function(args) {
			var triggers = $(this);
			triggers.each(function(){
				var o = $(this)[0]?$(this)[0]:this;
				o.s = {};
				$.extend(o.s,$.extend(true,{
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
							},
							slide:true
						}
					},
					zIndex:25,
					duration:500,
					easeIn:'swing',
					easeOut:'swing',
					cssEaseIn:'cubic-bezier(0.65, 0, 0.75, 0.4)',
					cssEaseOut:'cubic-bezier(0.275, 0.895, 0.51, 1)',
					text:{
						loading:'Loading...',
						closePopup:'Close'
					}
				}, args));
			});
			
			$(this).on('click',function(e){
				
				var o = $(this)[0]?$(this)[0]:this;
				var href = $(this).attr('href');
				var type = o.s.types[$(this).attr('popup')] ? $(this).attr('popup') : 'def';
				var cs = $.extend(true,o.s.types.def, o.s.types[type]);

				var originalProps = {
						scroll: { x: $(window).scrollLeft(), y:$(window).scrollTop() },
						overflow: $('body')[0].style.overflow
					};
				
				$('body').append('<div id="popup"><div class="overlay"></div><div class="close">'+o.s.text.closePopup+'</div></div>');
				
				var popup = $('#popup').addClass(type).fadeTo(0,0).css({
						position:'fixed',
						top:0,
						bottom:0,
						left:0,
						right:0,
						overflow:'hidden',
						zIndex: o.s.zIndex
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

				$(popup).append('<div class="loader">'+o.s.text.loading+'</div>').fadeTo(o.s.duration, 1, o.s.easing);
				
				var loader = $('.loader',popup).css({
						position:'absolute',
						left:'50%',
						top:'50%',
						zIndex:3,
						margin: '-'+($(this).height()/2)+'px -'+($(this).width()/2)+'px'
				});

				var content = null;
				var csContent;
				var backInPlace = false;
				var parent = null;
				var ind = null;
				var close = $('.close',popup).css({
						zIndex:2
					}).hide();

				if(cs.ajax)
					var ajaxReq = $.get(href, function(data){
							csContent = $(data).find(cs.content);
							
							$(popup).append('<div class="popup-content white"></div>');

							content = $('.popup-content', popup).css({
									position:'relative',
									zIndex:3
								}).fadeTo(0,0).append($(close).show()).append(csContent).fadeTo(o.s.duration, 1, o.s.easeOut);
							if(cs.slide) $(content)[0]['style'][transform] = CSStranslate.start+'(0px,-1000px'+CSStranslate.end+')';

							if(cs.initCallback) cs.initCallback(o);

							$(loader).fadeTo(o.s.duration, 0, o.s.easeOut, function(){
									$(this).remove();
								})
							if(cs.slide){
								$(content).css(CSStransition,('all '+(o.s.duration+100)+'ms '+o.s.cssEaseOut));
								$(content)[0]['style'][transform] = CSStranslate.start+'(0px,0px'+CSStranslate.end+')';
								setTimeout(function(){
									$(content).css(CSStransition,'');
									$(content)[0]['style'][transform]='';
									
								},(o.s.duration+100));
							}else{
								$(popup).css('overflow','auto');
							}
							
						});
				else{
					
					switch(typeof(cs.content)) {
					    case 'string':
					      csContent = $(cs.content);
					      backInPlace = true;
					      break;
					    case 'object':
					    	if(cs.content.attr) csContent = $(o).attr(cs.content.attr);
					        if(cs.content.sibling){
					        	csContent = $($(o).siblings(cs.content.sibling+''));
					        	backInPlace = true;
					        };
					        break;
					 }
					$(popup).append('<div class="popup-content white"></div>');
					$(popup).css('overflow','hidden');
					
					content = $('.popup-content', popup).css({
							position:'relative',
							zIndex:3
						}).fadeTo(0,0).append($(close).show());

					if(backInPlace){
						content.p = csContent.parent();
						content.i = csContent.index();
					}
					if(cs.slide) $(content)[0]['style'][transform] = CSStranslate.start+'(0px, -1000px'+CSStranslate.end+')';
					content.append($(csContent).show()).fadeTo(o.s.duration, 1, o.s.easeOut);
					

					$(loader).fadeTo(o.s.duration, 0, o.s.easeOut, function(){
							$(this).remove();
						})
					if(cs.slide){
						$(content).css(CSStransition,('all '+(o.s.duration+100)+'ms '+o.s.cssEaseOut));
						$(content)[0]['style'][transform] = CSStranslate.start+'(0px,0px'+CSStranslate.end+')';
						setTimeout(function(){
							$(content).css(CSStransition,'');
							$(content)[0]['style'][transform]='';
							$(popup).css('overflow','auto');
							if(cs.initCallback) cs.initCallback(o);
						},(o.s.duration+100));
					}else{
						$(popup).css('overflow','auto');
						if(cs.initCallback) cs.initCallback(o);
					}
				};


				$(overlay).add(close).on('click',function(e){
			
						$(overlay).add(close).off('click');
						if(ajaxReq) ajaxReq.abort();
						if(cs.slide) $(content)[0]['style'][transform] = CSStranslate.start+'(0px,0px'+CSStranslate.end+')';
						if(cs.closeCallback) cs.closeCallback(o);

						$('body')[0].style.height = null;
						
						$('body')[0].style.overflow = null;

						$('body').css({
								overflow:'originalProps.overflow',
								height:null
							});

						$(freezed).children().first().unwrap();

						window.scrollTo(originalProps.scroll.x, originalProps.scroll.y);
						if(content){
							if(cs.slide){
								$(popup).css('overflow','hidden').fadeTo(o.s.duration, 0, o.s.easing);
								$(content).css(CSStransition,('all '+(o.s.duration+100)+'ms '+o.s.cssEaseIn));
								$(content)[0]['style'][transform] = CSStranslate.start+'(0px,-1000px'+CSStranslate.end+')';
								setTimeout(function(){
									$(content).css(CSStransition,'');
									$(content)[0]['style'][transform]='';
									if(!cs.ajax && backInPlace){
										if(content.i==0)
											$(content.p).prepend($(csContent))
										else
											$(content.p).children().eq(content.i-1).after($(csContent.hide()));
									}
							
									$(overlay).add(close).off('click');
									$(popup).remove();
								},(o.s.duration+100));
							}else{
								$(popup).css('overflow','hidden').fadeTo(o.s.duration, 0, o.s.easing,function(){
										if(!cs.ajax && backInPlace){
										if(content.i==0)
											$(content.p).prepend($(csContent))
										else
											$(content.p).children().eq(content.i-1).after($(csContent.hide()));
									}
							
									$(overlay).add(close).off('click');
									$(popup).remove();
									});
								
							}	
						}
					});


				e.stopPropagation();
				e.preventDefault();
				return false;
			})

		}
				
	});

});