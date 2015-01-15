// popup.js
// o2web.ca

// Tous droits réservés
// All rights reserved
// 2015

(function($) {
  $(document).ready(function(){
    //
    //
    // VARIABLES
    
    window.popup = {
      //
      items: [],
      scrolled: 0,
      req: undefined,
      historyEnabled: window.history.length != undefined,
      current: {},
      //
      $page: $('body'),
      $loader: $('<div class="loader"></div>'),
      $popup: $('<div class="popup"></div>'),
      $freezed: $('<div class="freezed"></div>'),
      $closeButton: $('<button class="close"></button>'),
      $error: $('<div class="error message"><div>'),
      //
      messages: {
        close: 'Fermer',
        loading: 'Chargement',
        error: 'Une erreur est survenue'
      }
    };

    //
    //
    // CSS
    popup.$freezed.css({
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: -1,
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    });

    popup.$popup.css({
      position: 'relative',
      minHeight: '100%',
      zIndex: 1,
      overflow: 'auto'
    });


    //
    //
    // USEFUL FUNCTIONS
    function cancelEvent(e){
      e.stopPropagation();
      e.preventDefault();
      return false;
    }

    //
    //
    // ACTIONS

    function popHistory(e){
      window.onpopstate = undefined;
      popup.popped = true;
      closePopup();
    }


    function buildPopup($el){
      var settings = $el[0].popup;
      popup.current.$loader = settings.loader ? settings.loader : popup.$loader;
      popup.current.$closeButton = settings.closeButton ? settings.closeButton : popup.$closeButton;
      popup.current.messages = $.extend(true, popup.messages, settings.messages);

      popup.current.$loader.html(popup.current.messages.loading);
      popup.current.$closeButton.html(popup.current.messages.close);
      popup.current.$closeButton.on('click', closePopup);

      popup.$popup.prepend(popup.current.$loader);
      popup.$popup.append(popup.current.$closeButton);

      popup.$page.append(popup.$popup);

      
    }

    function removePopup($el){
      popup.$popup.remove().html('');
      popup.current = {};
    }


    function freezePage($el){
      // cancel scroll event
      $win.on('scroll', cancelEvent);
      
      // get page content
      $children = popup.$page.children();

      // freeze
      popup.scrolled = $win.scrollTop();
      popup.$page.prepend(popup.$freezed);
      popup.$freezed.append($children);
      popup.$freezed[0].scrollTop = popup.scrolled;

      // build popup
      buildPopup($el);
  
    }


    function unfreezePage($el){
      // get page content before freezing
      $children = popup.$freezed.children();

      // remove popup
      removePopup($el);

      // unfreeze
      $children.eq(0).unwrap();
      $win[0].scrollTo(0, popup.scrolled);

      // re-enable scroll event
      $win.off('scroll', cancelEvent);
    }


    function getAjaxContent($el){
      var settings = $el[0].popup;
      var url = $el.attr('href');
      if(!url) return false;
      if(settings.endpoint) url += settings.endpoint;
      popup.req = $.ajax({
        url: url,
        success: function(data){
          popup.req = undefined;
          popup.current.$loader.remove();
          popup.current.$data = $(data);
          popup.$popup.append(popup.current.$data);
          popup.current.$data.on('click', cancelEvent);
          popup.$popup.on('click', closePopup);
        },
        error: function(data){
          popup.req = undefined;
          popup.current.$loader.remove();
          popup.current.$error = settings.error ? settings.error : popup.$error;
          popup.current.$error.html(popup.current.messages.error);
          popup.$popup.append(popup.current.$error);
        }

      });

    }


    function parseType($el){
      var type = $el[0].popup.type;
      if(!type) return false;
      if(type=='ajax'){
        getAjaxContent($el);
      }
    }


    //
    //
    // OPEN POPUP
    function openPopup(e){
      var $el = $(this);
      var settings = $el[0].popup;
      popup.current.$trigger = $el;
      popup.current.settings = settings;
      if(typeof settings.beforeInit == 'function') settings.beforeInit(settings);

      if(popup.historyEnabled){
        window.history.pushState({}, 'popup', '#!/detail');
        window.onpopstate = popHistory;
      }

      freezePage($el);
      parseType($el);

      if(typeof settings.afterInit == 'function') settings.afterInit(settings);

      e.stopPropagation();
      e.preventDefault();
    }


    //
    //
    // CLOSE POPUP
    function closePopup(e){
      var $el = popup.current.$trigger;
      var settings = popup.current.settings;
      if(popup.req) popup.req.abort();

      if(typeof settings.beforeClose == 'function') settings.beforeClose(settings);

      unfreezePage($el);

      if(popup.historyEnabled && !popup.popped){
        window.onpopstate = undefined;
        popup.popped = undefined;
        window.history.go(-1);
      }

      popup.$popup.off('click', closePopup);

      if(typeof settings.afterClose == 'function') settings.afterClose(settings);

      e.stopPropagation();
      e.preventDefault();
    }


    //
    //
    // PARSE METHODS
    function parseMethods(arg, options){
     
    }


    //
    //
    // INIT
    $.fn.popup = function(args, options){
      var $selection = $(this);
      var type = typeof(args);
      if(type=='string'){
        parseMethods(args, options);
        return $selection;
      }
      for(var i=0; i<$selection.length; i++){
        var $el = $($selection[i]);
        var settings = {
          //
          type: 'ajax',
          endpoint: undefined,
          messages: {},
          //
          closeButton: undefined,
          loader: undefined,
          //
          beforeInit: undefined,
          afterInit: undefined,
          beforeClose: undefined,
          afterClose: undefined

        };
        $.extend(settings, args);
        var type = $el.attr('popup'); 
        if(typeof type != 'undefined' && !!type) settings.type = type;
        if($el[0].popup) $el[0].popup = settings
        else $el[0].popup = $.extend($el[0].popup, settings);
      
        window.popup.items.push($el[0]);
      }


      $selection.on('click', openPopup);
    }
  });
})(jQuery);