/**
 * @file
 * Contains a behavior-function to add a previewer callback for an image.
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
