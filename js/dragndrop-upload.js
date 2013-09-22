/**
 * @file
 * Contains a behavior to initialize dragndrop_upload element.
 */

(function ($) {
  Drupal.behaviors.dragndropUpload = {
    attach: function (context, settings) {
      if (!settings.dragndropUpload) {
        return;
      }

      $.each(settings.dragndropUpload, function (selector) {
        $(selector, context).once('dnd-upload', function () {
          new DnDUpload($(this));
        });
      });
    }
  };
})(jQuery);
