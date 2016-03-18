;(function($, window){
  'use strict';

  var $document = $(document);
  
  var raf  = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(cb) { return window.setTimeout(cb, 1000 / 60); };

  var defaults = {};
  
  // Mouse drag handler
  function bindHandlers($element, FSContext) {

    var lastPageY;

    function drag(e) {

      var delta = e.pageY - lastPageY;
      lastPageY = e.pageY;

      raf(function(){
        FSContext.element[0].scrollTop += delta / FSContext.scrollRatio;
      });

    }

    function stop() {
      
      $element.add(document.body).removeClass('enhanced-scroll--grabbed');
      $document.off('mousemove.drag mouseup.drag');

    }

    $element.on('mousedown.drag', function(e) {

      lastPageY = e.pageY;
      $element.add(document.body).addClass('enhanced-scroll--grabbed');
      $document.on('mousemove.drag', drag).on('mouseup.drag', stop);
      return false;

    });
  }

  // Constructor
  function EnhancedScroll($element, options) { 

    this.element        = $element;
    this.bar            = $('<div class="enhanced-scroll__drag-handle">');
    this.barcontainer   = $('<div class="enhanced-scroll__drag-container">');
    this.options        = $.extend({}, options, defaults);
    this.callback       = options.callback ? options.callback : null;
    this.maxScrollSoFar = 0;

    // wrap with needed DOM structure
    this.content = this.element
      .wrapInner(
        '<div class="enhanced-scroll__wrap">' + 
          '<div class="enhanced-scroll__content"></div>' + 
        '</div>'
      )
      .find('.enhanced-scroll__content');

    // insert the fake scroll bar into the container
    this.bar.appendTo(this.barcontainer);
    this.barcontainer.appendTo(this.content.closest(this.element));
    
    // initiate drag controller on the instance
    bindHandlers(this.bar, this);
    
    // run "moveBar" once
    this.moveBar();

    this.content.on('scroll.enhancedScroll mouseenter.enhancedScroll', this.moveBar.bind(this) );

  }

  EnhancedScroll.prototype = {

    destroy : function() {
      this.element.off('scroll.enhancedScroll mousedown.drag').removeData('_enhancedScroll');
    },

    moveBar: function() {
      var totalHeight = this.content[0].scrollHeight;
      var ownHeight   = this.content[0].clientHeight;
      var scrollRatio = ownHeight / totalHeight;
      var _this       = this;
      
      // update enhanced scrollbar location on the Y axis using requestAnimationFrame
      raf(function() {
        _this.bar[0]
          .style.cssText = 'height:' + 
            scrollRatio * 
            100 + '%; top:' + 
            (_this.content[0].scrollTop / totalHeight ) * 
            100 + '%';
      });
    }
  };  

  $.fn.enhancedScroll = function(options) {
    return this.each(function(){
      var $element = $(this); // convert window to the HTML element
      var pluginData;

      // if already bound, return
      if ( $element.data('_enhancedScroll') ) {
        return;
      }

      // create a new enhancedScroll instance
      pluginData = new EnhancedScroll($element, options || {});

      // bind the enhancedScroll instance to the DOM component
      $element.data('_enhancedScroll', pluginData);
    });
  };

})(jQuery, window);