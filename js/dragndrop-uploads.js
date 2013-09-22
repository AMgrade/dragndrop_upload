/**
 * @file
 * Contains a behavior to initialize dragndrop_upload element.
 */

(function ($) {
  Drupal.behaviors.dragndropUploads = {
    attach: function (context, settings) {
      if (!settings.dragndropUploads) {
        return;
      }

      $.each(settings.dragndropUploads, function (selector) {
        $(selector, context).once('dnd-uploads', function () {
          new DnDUploads($(this));
        });
      });
    }
  };
})(jQuery);
