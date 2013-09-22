/**
 * @file
 * Contains a behavior-function to initialize dragndrop_uploads_file widget.
 */

(function ($) {
  Drupal.behaviors.dragndropUploadsImage = {
    attach: function (context, settings) {
      if (!settings.dragndropUploadsImage) {
        return;
      }

      $.each(settings.dragndropUploadsImage, function (i, selector) {
        $(selector, context).once('dnd-uploads-image', function () {
          new DnDUploadsImage($(this));
        });
      });
    }
  }
})(jQuery);
