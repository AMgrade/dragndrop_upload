/**
 * @file
 * Contains DnDUploads class.
 */

/**
 * DnDUploads class.
 *
 * Attaches events callback to make Drupal form element 'dragndrop_uploads'
 * work properly.
 *
 * @param {jQuery} $droppable
 */
var DnDUploads = function ($droppable) {
  this.dnd = $droppable.DnD();
  if (!this.dnd) {
    throw new Error('The $droppable does not contain an instance of DnD!');
  }

  this.$droppable = $droppable;
  this.dnd.$droppables.data('DnDUploads', this);

  this.attachEvents(this.dnd.$droppables);
};

(function ($) {
  DnDUploads.prototype = $.extend({}, DnDUploadsAbstract.prototype, {
    /**
     * Attach events to the given droppable areas.
     *
     * @param {jQuery} $droppables
     */
    attachEvents: function ($droppables) {
      var me = this;
      var settings = me.dnd.settings;

      $droppables.unbind('dnd:showErrors');

      /**
       * Add handler for Browse button.
       */
      $(settings.browseButton).bind('click', me.eventsList.browseButtonClick.bind(me));

      /**
       * Attach the change event to the file input element to track and add
       * to the droppable area files added by the Browse button.
       */
      $('input[name="' + settings.name + '"]').unbind('change').bind('change', me.eventsList.inputFileChange.bind(me));

      me.parent().attachEvents.call(me, $droppables);
    },

    /**
     * Detach events from the given droppable areas.
     *
     * @param {jQuery|undefined} $droppables
     */
    detachEvents: function ($droppables) {
      var me = this;
      var settings = me.dnd.settings;

      me.parent().detachEvents.call(me, $droppables);

      $(settings.browseButton).unbind('click');
      $('input[name="' + settings.name + '"]').unbind('change');
    },

    /**
     * Event callback that will be binded to the droppable areas.
     */
    eventsList: {
      /**
       * Droppable events.
       */
      dnd: {
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

          /**
           * Add all input elements to the FormData.
           * Do not include submits and buttons as it will mess up a
           * 'triggering element' of the form.
           *
           * Also do not add file input element as it is empty.
           */
          var not = ['type="submit"', 'type="button"', 'name="' + settings.name + '"'];
          $('input:not([' + not.join(']):not([') + '])', $formEl).each(function (i, el) {
            var $el = $(el);
            form.append($el.attr('name'), $el.val());
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
        'dnd:send:beforeSend': function (event, xmlhttprequest, options) {
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
         * @param response
         * @param status
         */
        'dnd:send:success': function (response, status) {
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
         * Event callback for the 'dnd:addFiles:before' event.
         *
         * Removes old error messages.
         */
        'dnd:addFiles:before': function () {
          var settings = this.dnd.settings;
          var $element = $(settings.selector).parent();
          $('>.messages.error', $element).remove();
        },

        /**
         * Event callback for the 'dnd:addFiles:after' event.
         */
        'dnd:addFiles:after': function () {
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
          console.log(123, "0123");
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
          console.log($element, "$element");
          $('>.messages.error', $element).remove();
          $element.prepend('<div class="messages error file-upload-js-error">' + messages.join('<br/>') + '</div>');
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
      },

      /**
       * Event callback for the Browse button.
       */
      browseButtonClick: function (event) {
        event.preventDefault();

        this.dnd.$activeDroppable = this.$droppable;
        $('input[name="'+ this.dnd.settings.name +'"]').click();

        return false;
      },

      /**
       * Event callback for the file input element to handle uploading.
       */
      inputFileChange: function (event) {
        // Clone files array before clearing the input element.
        var transFiles = $.extend({}, event.target.files);
        // Clear the input element before adding files to the droppable area,
        // because if auto uploading is enabled, files are sent twice - from
        // the input element and the droppable area.
        $(event.target).val('');

        this.dnd.$droppables.DnD().addFiles(this.dnd.$activeDroppable, transFiles);
      }
    }
  });

})(jQuery);
