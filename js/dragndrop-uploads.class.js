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

      // Unbind default event callbacks.
      $droppables.unbind('dnd:showErrors');
      $droppables.unbind('dnd:send:options');
      $droppables.unbind('dnd:addFiles:after');

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
         * Event callback for dnd:send:options
         *
         * Appends the necessary data to the FormData object, alters ajax
         * options to add Drupal ajax support for element.
         *
         * @param event
         * @param form
         */
        'dnd:send:options': function (event, options, form) {
          // Do not call the callback for every droppable area, call it just once.
          if (this.isProcessed(event.type)) {
            return;
          }
          this.setProcessed(event.type);

          var me = this;
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

          // Alter options to add Drupal ajax options.
          var ajax = Drupal.ajax[me.dnd.settings.uploadButton];
          var drupalAjaxOptions = $.extend({}, ajax.options);
          options = $.extend(options, drupalAjaxOptions, {
            data: null,
            beforeSend: function (xmlhttprequest, options) {
              options.data = drupalAjaxOptions.data;

              // Call standard Drupal ajax methods.
              drupalAjaxOptions.beforeSerialize(me.dnd.$droppables, options);
              drupalAjaxOptions.beforeSend(xmlhttprequest, options);

              // Transform options.data into FormData.
              var data = $.extend({}, options.data);
              options.data = form;
              $.each(data, function (key, value) {
                form.append(key, value);
              });
            }
          });
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
        $('input[name="' + this.dnd.settings.name + '"]').click();

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
