// popup.js
// o2web.ca
// 2015

//
//
// DEFINE MODULE
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // Define AMD module
    define(['jquery'], factory);
  } else {
    // JQUERY INIT
    factory(jQuery);
  }

}

//
//
// MAIN CODE
(this, function($){
  //
  // VARIABLES
  var root = this;
  root.popup = {
    //
    items: [],
    scrolled: 0,
    req: undefined,
    historyEnabled: root.history.length != undefined,
    current: {},
    //
    $doc: $(document.documentElement),
    $page: $(document.body),
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
  function stopEvent(e){
    e.stopPropagation();
  }

  //
  //
  // ACTIONS

  function popHistory(e){
    root.onpopstate = undefined;
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

    // Add class to HTML doc
    popup.$doc.addClass('has-popup');
  }


  function unfreezePage($el){

    // Add class to HTML doc
    popup.$doc.removeClass('has-popup');

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


  //
  //
  // GET AJAX CONTENT
  function getAjaxContent($el){
    var settings = $el[0].popup;
    var url = settings.type=='form' ? $el.attr('action') : $el.attr('href');
    if(!url) return false;
    if(settings.endpoint) url += settings.endpoint;
    var options = {
      url: url,
      success: function(data){
        popup.req = undefined;
        popup.current.$loader.remove();
        popup.current.$data = $(data);
        if(typeof settings.onSuccess == 'function'){
          var callback = settings.onSuccess(popup.current.$data);
          if(callback === false) return
          else if(callback instanceof $) popup.current.$data = callback;
        }
        popup.$popup.append(popup.current.$data);
        popup.current.$data.on('click', stopEvent);
        popup.$popup.on('click', closePopup);
      },
      error: function(data){
        popup.req = undefined;
        popup.current.$loader.remove();
        popup.current.$error = settings.error ? settings.error : popup.$error;
        popup.current.$error.html(popup.current.messages.error);
        popup.$popup.append(popup.current.$error);
        if(typeof settings.onError == 'function') settings.onError(popup.current.$error);
      }
    }
    if(settings.type=='form'){
      options.type ='post';
      options.data = $el.serialize();
    }
    popup.req = $.ajax(options);

  }

  function getAttrContent($el){
    var settings = $el[0].popup;
    var content = $el.attr('popup-content');
    if(!content) return false;
    popup.current.$loader.remove();
    popup.current.$data = $(content);
    popup.$popup.append(popup.current.$data);
    popup.current.$data.on('click', stopEvent);
    popup.$popup.on('click', closePopup);
  }


  function parseType($el){
    var type = $el[0].popup.type;
    if(!type) return false;
    if(type=='ajax'){
      getAjaxContent($el);
    }
    else if(type=='attr'){
      getAttrContent($el);
    }
    else if(type=='form'){
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
      root.history.pushState({}, 'popup', '#!/popup');
      root.onpopstate = popHistory;
    }

    freezePage($el);
    parseType($el);

    if(typeof settings.afterInit == 'function') settings.afterInit(settings);

    if(e && e.stopPropagation){
      e.stopPropagation();
      e.preventDefault();
    }
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
      root.onpopstate = undefined;
      popup.popped = undefined;
      root.history.go(-1);
    }

    popup.$popup.off('click', closePopup);

    if(typeof settings.afterClose == 'function') settings.afterClose(settings);

    if(e && e.stopPropagation){
      e.stopPropagation();
      e.preventDefault();
    }
  }


  //
  //
  // PARSE METHODS
  function parseMethods(arg, options){
    if(arg=='close') closePopup();
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
        onSuccess: undefined,
        onError: undefined,
        beforeClose: undefined,
        afterClose: undefined

      };
      $.extend(settings, args);
      var type = $el.attr('popup');
      if(typeof type != 'undefined' && !!type) settings.type = type;
      if($el[0].popup) $el[0].popup = settings
      else $el[0].popup = $.extend($el[0].popup, settings);

      root.popup.items.push($el[0]);

      if(type=='form'){
        $el.on('submit', openPopup);
      }
      else{
        $el.on('click', openPopup);
      }
    }
  }

}));