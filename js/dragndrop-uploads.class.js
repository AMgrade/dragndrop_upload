/**
 * @file
 * Contains dndUploads class.
 */

/**
 * dndUploads class.
 *
 * Attaches events callback to make Drupal form element 'dragndrop_uploads'
 * work properly.
 *
 * @param {DnD} dnd
 */
var DnDUploads = function (dnd) {
  this.dnd = dnd;
  this.attachEvents(dnd.$droppables);
};

(function ($) {
  DnDUploads.prototype = {
    dnd: null,
    processed: {},

    /**
     * Attach events to the given droppable areas.
     *
     * @param {jQuery} $droppables
     */
    attachEvents: function ($droppables) {
      var me = this;
      $droppables.unbind('dnd:showErrors');

      $.each(me.eventsList, function (name, func) {
        $droppables.bind(name, func.bind(me));
      });
    },

    /**
     * Detach events from the given droppable areas.
     *
     * @param {jQuery|undefined} $droppables
     */
    detachEvents: function ($droppables) {
      var me = this;

      $.each(me.eventsList, function (name) {
        $droppables.unbind(name);
      });
    },

    /**
     * Add droppable zone.
     *
     * @param {string|jQuery} droppable
     */
    addDroppable: function (droppable) {
      var $droppable = $(droppable);
      this.dnd.addDroppable($droppable);

      this.attachEvents($droppable);
    },

    /**
     * Remove droppable zone.
     *
     * @param {string|jQuery} droppable
     */
    removeDroppable: function (droppable) {
      var $droppable = $(droppable);
      this.detachEvents($droppable);

      this.dnd.removeDroppable($droppable);

    },

    /**
     * Set the given event callback as processed.
     *
     * @param {String} name
     */
    setProcessed: function (name) {
      this.processed[name] = true;
    },

    /**
     * Check whether the given event callback is already processed.
     *
     * @param {String} name
     */
    isProcessed: function (name) {
      this.processed[name] = true;
    },

    /**
     * Clear the processed event callbacks stack.
     */
    clearProcessed: function () {
      var me = this;
      $.each(me.processed, function (name) {
        me.processed[name] = false;
      });
    },

    /**
     * Event callback that will be binded to the droppable areas.
     */
    eventsList: {
      /**
       * Appends the necessary data to the FormData object.
       *
       * @param event
       * @param form
       */
      'dnd:send:form': function (event, form) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.isProcessed(event.type)) {
          return;
        }
        this.setProcessed(event.type);

        var settings = this.dnd.settings;
        var $formEl = $(settings.selector).closest('form');

        // Add all input elements to the FormData.
        $('input', $formEl).each(function (i, el) {
          var $el = $(el);
          // Do not add file input as it is empty.
          if ($el.attr('name') != settings.name) {
            form.append($el.attr('name'), $el.val());
          }
        });

        var $uploadButton = $('#' + settings.uploadButton);
        form.append('_triggering_element_name', $uploadButton.attr('name'));
        form.append('_triggering_element_value', $uploadButton.attr('value'));

        // Prevent duplicate HTML ids in the returned markup.
        // @see drupal_html_id()
        var ajaxHtmlIds = $.map($('[id]'), function (element, index) {
          return element.id;
        });

        // Add Drupal-specific data to the request.
        form.append('ajax_html_ids[]', ajaxHtmlIds.join(','));

        // Allow Drupal to return new JavaScript and CSS files to load without
        // returning the ones already loaded.
        // @see ajax_base_page_theme()
        // @see drupal_get_css()
        // @see drupal_get_js()
        form.append('ajax_page_state[theme]', Drupal.settings.ajaxPageState.theme);
        form.append('ajax_page_state[theme_token]', Drupal.settings.ajaxPageState.theme_token);
        for (var key in Drupal.settings.ajaxPageState.css) {
          form.append('ajax_page_state[css][' + key + ']', 1);
        }
        for (key in Drupal.settings.ajaxPageState.js) {
          form.append('ajax_page_state[js][' + key + ']', 1);
        }
      },

      /**
       * Detach behaviors and execute  Drupal.ajax.beforeSend() method.
       *
       * @param event
       * @param xmlhttprequest
       * @param options
       * @returns {*}
       */
      'dnd.send:beforeSend': function (event, xmlhttprequest, options) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.isProcessed(event.type)) {
          return;
        }
        this.setProcessed(event.type);

        var settings = this.dnd.settings;
        var ajax = Drupal.ajax[settings.uploadButton];

        // Allow detaching behaviors to update field values before collecting them.
        // This is only needed when field values are added to the POST data, so only
        // when there is a form such that this.form.ajaxSubmit() is used instead of
        // $.ajax(). When there is no form and $.ajax() is used, beforeSerialize()
        // isn't called, but don't rely on that: explicitly check this.form.
        if (ajax.form) {
          var ajaxSettings = ajax.settings || Drupal.settings;
          Drupal.detachBehaviors(ajax.form, ajaxSettings, 'serialize');
        }

        ajax.ajaxing = true;

        return ajax.beforeSend(xmlhttprequest, options);
      },


      /**
       * Execute Drupal ajax.success().
       *
       * @param event
       * @param response
       * @param status
       */
      'dnd:send:success': function (event, response, status) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.isProcessed(event.type)) {
          return;
        }
        this.setProcessed(event.type);

        var ajax = Drupal.ajax[this.dnd.settings.uploadButton];

        ajax.options.success(response, status);
      },

      /**
       * Execute Drupal ajax.complete.
       *
       * @param response
       * @param status
       */
      'dnd:send:complete': function (response, status) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.isProcessed(event.type)) {
          return;
        }
        this.setProcessed(event.type);

        var ajax = Drupal.ajax[this.dnd.settings.uploadButton];

        ajax.options.complete(response, status);

        // Clear the processed array after files have been sent.
        this.clearProcessed();
      },

      /**
       * Set the needed URL for the ajax request.
       *
       * @param event
       * @param options
       */
      'dnd:send:options': function (event, options) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.isProcessed(event.type)) {
          return;
        }
        this.setProcessed(event.type);

        var ajax = Drupal.ajax[this.dnd.settings.uploadButton];

        options.url = ajax.url;
      },

      /**
       * Event callback for the 'dnd:addFiles:finished'.
       *
       * @param event
       */
      'dnd:addFiles:finished': function (event) {
        if (this.dnd.settings.uploadEvent == 'auto') {
          this.dnd.send();
        }
      },

      /**
       * Error callback.
       *
       * @param event
       * @param {Array} errors
       */
      'dnd:showErrors': function (event, errors) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.isProcessed(event.type)) {
          return;
        }
        this.setProcessed(event.type);

        var settings = this.dnd.settings;
        var messages = [];

        // Go through the errors array and create human-readable messages.
        $.each(errors, function (i, error) {
          if (!settings.errorsInfo[error.type]) {
            error.type = 'unknown';
          }
          messages.push(Drupal.t(settings.errorsInfo[error.type], error.args));
        });

        var $element = $(settings.selector).parent();
        $('>.messages.error', $element).remove();
        $element.prepend('<div class="messages error file-upload-js-error">' + messages + '</div>');
      },

      /**
       * Detach events before the droppable zone will be destroyed.
       *
       * @param event
       * @param $droppable
       */
      'dnd:destroy:before': function (event, $droppable) {
        this.detachEvents($droppable);
        $droppable.removeClass('dnd-uploads-processed');
      }
    }
  };

})(jQuery);
