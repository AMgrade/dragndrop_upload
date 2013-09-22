/**
 * @file
 * Contains a behavior-function to initialize dragndrop_uploads_file widget.
 *
 * Settings are provided via Drupal.settings.dragndropUploads variable.
 */

(function ($) {
  Drupal.behaviors.dragndropUploadsFile = {
    attach: function (context, settings) {
      if (!settings.dragndropUploadsFile) {
        return;
      }

      $.each(settings.dragndropUploadsFile, function (i, selector) {
        $(selector, context).once('dnd-uploads-file', function () {
          new DnDUploadsFile($(this));
        });
      });
    }
  };
})(jQuery);
