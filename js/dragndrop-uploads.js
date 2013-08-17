/**
 * @file
 *
 */

(function ($) {
  Drupal.behaviors.dragndropUploads = {
    attach: function (context, settings) {
      $.each(settings.dragndropAPI, function (selector, settings) {
        var $droppable = $(selector);
        var $element = $droppable.parent();

        if (!$droppable.size()) {
          return;
        }

        var dnd = $droppable.DnD();

        $droppable.bind('dnd:send:form', function (event, form) {
          var settings = $(this).DnD().settings;
          var $formEl = $droppable.closest('form');

          $('input', $formEl).each(function (i, el) {
            var $el = $(el);
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
        });

        $droppable.bind('dnd.send:beforeSend', function (event, xmlhttprequest, options) {
          var settings = $(this).DnD().settings;
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
        });

        $droppable.bind('dnd:send:success', function (event, response, status) {
          var settings = $(this).DnD().settings;
          var ajax = Drupal.ajax[settings.uploadButton];

          ajax.options.success(response, status);
        });

        $droppable.bind('dnd:send:complete', function (event, response, status) {
          var settings = $(this).DnD().settings;
          var ajax = Drupal.ajax[settings.uploadButton];

          ajax.options.success(response, status);
        });

        $droppable.bind('dnd:send:options', function (event, options) {
          var settings = $(this).DnD().settings;
          var ajax = Drupal.ajax[settings.uploadButton];

          options.url = ajax.url;
        });

        $droppable.bind('dnd:addFiles:finished', function (event) {
          $droppable.DnD().send();
        });

        /**
         * Add handler for Browse button.
         */
        $('.droppable-browse-button', $droppable).click(function (event) {
          event.preventDefault();

          $droppable.DnD().$activeDroppable = $(this).closest('.droppable');
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

          $droppable.DnD().addFiles($droppable.DnD().$activeDroppable, transFiles);
        });

        /**
         * Add custom error handling.
         */
        $droppable.unbind('dnd:showErrors').bind('dnd:showErrors', function (event, errors) {
          var settings = $(this).DnD().settings;
          var messages = [];

          // Go through the errors array and create human-readable messages.
          $.each(errors, function (i, error) {
            if (!settings.errorsInfo[error.type]) {
              error.type = 'unknown';
            }
            messages.push(Drupal.t(settings.errorsInfo[error.type], error.args));
          });

          $('>.messages.error', $element).remove();
          $element.prepend('<div class="messages error file-upload-js-error">' + messages + '</div>');
        });
      });
    }
  }
})(jQuery);
