/**
 * @file
 * Contains
 */

(function ($) {
  Drupal.behaviors.dragndropUploads = {
    attach: function () {
      $.each(Drupal.settings.dragndropUploads, function (i, selector) {
        $(selector).once('dnd-uploads', function () {
          var $this = $(this);
          var dnd = $this.DnD();

          // Do not process if there is no DnD instance or the item is a mirror.
          if (!dnd) {
            return;
          }

          var settings = dnd.settings;
          dnd.$droppables.data('DnDUploads', new DnDUploads(dnd));

          /**
           * Add handler for Browse button.
           */
          $(settings.browseButton).bind('click', browseButtonClick.bind(this));

          /**
           * Attach the change event to the file input element to track and add
           * to the droppable area files added by the Browse button.
           */
          $('input[name="'+ settings.name +'"]').unbind('change').bind('change', fileInputChange.bind(this));
        });
      });
    },

    detach: function (context, settings) {
      $.each(Drupal.settings.dragndropUploads, function (selector) {
        var $selector = $(selector);
        var dnd = $selector.DnD();

        if (!dnd) {
          return;
        }

        var settings = dnd.settings;

        $(settings.browseButton).unbind('click', browseButtonClick);
        $('input[name="' + settings.name + '"]').unbind('change', fileInputChange);
      });
    }
  };

  /**
   * Event callback for the Browse button.
   */
  var browseButtonClick = function (event) {
    event.preventDefault();

    var $this = $(this);
    var $element = $this.parent();
    var dnd = $this.DnD();
    dnd.$droppables.DnD().$activeDroppable = $this;
    $('.droppable-standard-upload-hidden input', $element).click();

    return false;
  };

  /**
   * Event callback for the file input element to handle uploading.
   */
  var fileInputChange = function (event) {
    // Clone files array before clearing the input element.
    var transFiles = $.extend({}, event.target.files);
    // Clear the input element before adding files to the droppable area,
    // because if auto uploading is enabled, files are sent twice - from
    // the input element and the droppable area.
    $(this).val('');

    var $this = $(this);
    var dnd = $this.DnD();

    dnd.$droppables.DnD().addFiles(dnd.$droppables.DnD().$activeDroppable, transFiles);
  };
})(jQuery);
