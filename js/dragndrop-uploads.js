/**
 * @file
 *
 */

(function ($) {
  Drupal.behaviors.dragndropUploads = {
    attach: function (context, settings) {
      $.each(settings.dragndropAPI, function (selector, settings) {
        var $selector = $(selector);
        var $element = $selector.parent();
        var dnd = $selector.DnD();

        // Do not process if there is no DnD instance or the item is a mirror.
        if (!dnd || settings.asMirrorFor) {
          return;
        }

        var $droppables = dnd.$droppables;
        var dndUploadsObj = new dndUploads(dnd);

//        if ($('#block-system-navigation').not('.dropped')) {
//          dndUploadsObj.addDroppable('#block-system-navigation');
//
//          $('#block-system-navigation').bind('dnd:send:complete', (function () {
//            dndUploadsObj.removeDroppable($(this));
//          }));
//        }

        /**
         * Add handler for Browse button.
         */
        $('.droppable-browse-button', $droppables).click(function (event) {
          event.preventDefault();

          $droppables.DnD().$activeDroppable = $(this).closest('.droppable');
          $('.droppable-standard-upload-hidden input', $element).click();

          return false;
        });

        /**
         * Attach the change event to the file input element to track and add
         * to the droppable area files added by the Browse button.
         */
        $('.droppable-standard-upload-hidden input', $element).unbind('change').change(function (event) {
          // Clone files array before clearing the input element.
          var transFiles = $.extend({}, event.target.files);
          // Clear the input element before adding files to the droppable area,
          // because if auto uploading is enabled, files are sent twice - from
          // the input element and the droppable area.
          $(this).val('');

          $droppables.DnD().addFiles($droppables.DnD().$activeDroppable, transFiles);
        });
      });
    }/*,

    detach: function () {
      $.each(settings.dragndropAPI, function (selector) {
        var $selector = $(selector);
        var dnd = $selector.DnD();

        if (!dnd) {
          return;
        }

        var $droppables = dnd.$droppables;
        var dndUploadsObj = new dndUploads(dnd);

//        if ($('#block-system-navigation').not('.dropped')) {
//          dndUploadsObj.addDroppable('#block-system-navigation');
//
//          $('#block-system-navigation').bind('dnd:send:complete', (function () {
//            dndUploadsObj.removeDroppable($(this));
//          }));
//        }

        *//**
         * Add handler for Browse button.
         *//*
        $('.droppable-browse-button', $droppables).click(function (event) {
          event.preventDefault();

          $droppables.DnD().$activeDroppable = $(this).closest('.droppable');
          $('.droppable-standard-upload-hidden input', $element).click();

          return false;
        });

        *//**
         * Attach the change event to the file input element to track and add
         * to the droppable area files added by the Browse button.
         *//*
        $('.droppable-standard-upload-hidden input', $element).unbind('change').change(function (event) {
          // Clone files array before clearing the input element.
          var transFiles = $.extend({}, event.target.files);
          // Clear the input element before adding files to the droppable area,
          // because if auto uploading is enabled, files are sent twice - from
          // the input element and the droppable area.
          $(this).val('');

          $droppables.DnD().addFiles($droppables.DnD().$activeDroppable, transFiles);
        });
      });
    }*/
  };

  var dndUploads = function (dnd) {
    this.dnd = dnd;
    this.attachEvents(dnd.$droppables);
  };

  dndUploads.prototype = {
    dnd: null,
    processed: {},

    /**
     * Attach events to the given droppable areas.
     *
     * @param {jQuery} $droppables
     */
    attachEvents: function ($droppables) {
      var callbacks = this.eventCallbacks;

      $droppables.bind('dnd:send:form', callbacks.dndSendForm.bind(this));

      $droppables.bind('dnd.send:beforeSend', callbacks.dndSendBeforeSend.bind(this));

      $droppables.bind('dnd:send:success', callbacks.dndSendSuccess.bind(this));

      $droppables.bind('dnd:send:complete', callbacks.dndSendComplete.bind(this));

      $droppables.bind('dnd:send:options', callbacks.dndSendOptions.bind(this));

      $droppables.bind('dnd:addFiles:finished', callbacks.dndAddFilesFinished.bind(this));

      $droppables.unbind('dnd:showErrors').bind('dnd:showErrors', callbacks.dndShowErrors.bind(this));
    },

    /**
     * Detach events from the given droppable areas.
     *
     * @param {jQuery} $droppables
     */
    detachEvents: function ($droppables) {
      var callbacks = this.eventCallbacks;

      $droppables.unbind('dnd:send:form', callbacks.dndSendForm.bind(this));

      $droppables.unbind('dnd.send:beforeSend', callbacks.dndSendBeforeSend.bind(this));

      $droppables.unbind('dnd:send:success', callbacks.dndSendSuccess.bind(this));

      $droppables.unbind('dnd:send:complete', callbacks.dndSendComplete.bind(this));

      $droppables.unbind('dnd:send:options', callbacks.dndSendOptions.bind(this));

      $droppables.unbind('dnd:addFiles:finished', callbacks.dndAddFilesFinished.bind(this));

      $droppables.unbind('dnd:showErrors', callbacks.dndShowErrors.bind(this));
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
      this.dnd.removeDroppable($droppable);

      this.detachEvents($droppable);
    },

    eventCallbacks: {
      dndSendForm: function (event, form) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.processed[event.type]) {
          return;
        }
        this.processed[event.type] = true;

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

      dndSendBeforeSend: function (event, xmlhttprequest, options) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.processed[event.type]) {
          return;
        }
        this.processed[event.type] = true;

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

      dndSendSuccess: function (event, response, status) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.processed[event.type]) {
          return;
        }
        this.processed[event.type] = true;

        var ajax = Drupal.ajax[this.dnd.settings.uploadButton];

        ajax.options.success(response, status);
      },

      dndSendComplete: function (event, response, status) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.processed[event.type]) {
          return;
        }
        this.processed[event.type] = true;

        var ajax = Drupal.ajax[this.dnd.settings.uploadButton];

        ajax.options.complete(response, status);

        // Clear the processed array after files have been sent.
        this.processed = {};
      },

      dndSendOptions: function (event, options) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.processed[event.type]) {
          return;
        }
        this.processed[event.type] = true;

        var ajax = Drupal.ajax[this.dnd.settings.uploadButton];

        options.url = ajax.url;
      },

      dndAddFilesFinished: function (event) {
        this.dnd.send();
      },

      dndShowErrors: function (event, errors) {
        // Do not call the callback for every droppable area, call it just once.
        if (this.processed[event.type]) {
          return;
        }
        this.processed[event.type] = true;

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
      }
    }
  };

})(jQuery);
