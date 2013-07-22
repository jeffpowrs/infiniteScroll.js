/* ======================================
 All Components are using the pattern from :
 jQuery prototypal inheritance plugin boilerplate
 Originally by by Alex Sexton, Scott Gonzalez
 Licensed under the MIT license
 ====================================== */

;(function ( $, window, document, undefined ) {

  if ( typeof Object.create !== 'function' ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
  }

  if (!Function.prototype.bind) { // check if native implementation available
    Function.prototype.bind = function(){ 
      var fn = this, args = Array.prototype.slice.call(arguments),
          object = args.shift(); 
      return function(){ 
        return fn.apply(object, 
          args.concat(Array.prototype.slice.call(arguments))); 
      }; 
    };
  }

  $.fn.stringToRef = function (data, accessor) {
    var keys = accessor.split('.'),
        result = data;

    while (keys.length > 0) {
      var key = keys.shift();
      if (typeof result[key] !== 'undefined') {
        result = result[key];
      }
      else {
        result = null;
        break;
      }
    }
    return result;
  }

  $.component = function( name, object ) {
    $.fn[name] = function( options ) {
      return this.each(function() {
        if ( !$.data( this, name ) ) {
          $.data( this, name, Object.create(object).init( 
            $.extend(true, {}, $.fn[name].opts, options), this ) 
          );
        }
      });
    };
  };

})( jQuery, window , document );


/* ======================================
  AtBottom @jp 2013.04
 ====================================== */

;(function ( $, window, document, undefined ) {

    //references document scroll
    var atBottom = {
      opts: {
        'headerSelector': '.top'
      },
      init: function (options, el) {
          this.$el = $(el) ;
          this.$doc = $(document),
          this.$atBottom = this;
          this.winHeight = window.innerHeight,
          this.bind();
      },
      bind: function() {
        this.$doc.on('scroll.atbottom', 
          (function(){
            var scrolled = this.$doc.scrollTop();
            var scroll_diff = this.$el.height() - (scrolled + this.winHeight);
            if(Modernizr.touch){
              //Mobile Safari includes fixed positioned elements 
              scroll_diff -= $(this.opts.headerSelector).height();
            }
            if(scroll_diff < 20){
              this.$el.trigger('atbottom');
            }
          }).bind(this)
        );
        return this.$el;
      },
      destroy: function () {
        this.$doc.off('scroll.atbottom');
        return this.$el.removeData('atBottom');
      }
    };

    $.component('atBottom', atBottom);

})( jQuery, window , document );


/* ======================================
  InfiniteScroll @jp 2013.04
  Dependencies: AtBottom
 ====================================== */

;(function ( $, window, document, undefined ) {
  
    var infiniteScroll = {
      opts: {
        'headerSelector': '.top',
        'getUrl': '',
        'incrementParams': [],
        'templateReference': TMPL.searchResult,
        'useMasonry': false,
        'masonryParent': '.ms-grid'
      },
      init: function (options, el) {
        this.$el = $(el);
        this.$doc = $(document);
        this.opts = $.extend(true, {}, this.opts, options);
        this.isExecuting = false;
        //We don't have a url - abort!
        if( !this.opts.getUrl.length || /^\s+$/.test(this.opts.getURl) ) { return false; }
        this.bind();
      },
      bind: function() {
        return this.$el
          .atBottom(this.opts)
          .on('atbottom', 
            (function (evt) {
              if(! this.isExecuting){
                this.$doc.trigger({
                  'type': 'showloader',
                  'addTo': '.container'
                });
                this.incrementUrl();
                this.getData();
              }
            }).bind(this)
          );
      },
      incrementUrl: function () {
        if(this.opts.incrementParams.length){
          var incPrms = this.opts.incrementParams,
          incLen = incPrms.length;
          for( var i = 0; i < incLen; i++ ) {
            var currStr = incPrms[i],
            origRegex = new RegExp('\\/'+currStr+'\\/\\d+', "g"),
            origStr = this.opts.getUrl.match(origRegex).toString(),
            origDigits = parseInt(origStr.match(/\d+/)),
            newDigits = origDigits+1;
            this.opts.getUrl = this.opts.getUrl.replace(origStr,'/'+currStr+'/'+newDigits);
          }
        }
        return this.$el;
      },
      getData: function () {
        var query = $(this.opts.searchField).val();
        this.isExecuting = true;
        // $.get(settings.getUrl, function (data) {
        //   if(data.status === 'success'){
        //     methods.handleData(data);
        //   }
        // });
        //THIS IS FOR TESTING PURPOSES
        this.handleData(fakeSearchData);
      },
      handleData: function (data) {
        this.$el.append( Mustache.render(this.opts.templateReference, data) );
        this.$doc.trigger({
          'type': 'hideloader'
        });        
        if(this.opts.useMasonry){
          $(this.opts.masonryParent).masonry('reload');
        }
        //If there is more data to be had - rebind atbottom
        return this.$el;
      },
      destroy: function () {
        return this.$el
          .atBottom('destroy')
          .off('.infinte-scroll')
          .removeData('infiniteScroll');
      }
    };

    $.component('infiniteScroll', infiniteScroll);

})( jQuery, window , document );

/* ======================================
  Ousel @op
 ====================================== */
