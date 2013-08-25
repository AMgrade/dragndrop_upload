/**
 * @file
 * Contains a behavior-function.
 *
 * Settings are provided via Drupal.settings.dragndropUploads variable.
 */

(function ($) {
  Drupal.behaviors.dragndropUploadsFile = {
    attach: function () {
      $.each(Drupal.settings.dragndropUploadsFile, function (i, selector) {
        var $droppable = $(selector);

        $droppable.once('dnd-uploads-file', function () {
          var settings = $droppable.DnD().settings;

          // Find the Upload and Remove buttons.
          var $uploadButton = $('#' + settings.uploadButton);
          var $droppableMsg = $('.droppable-message', $droppable);

          // This is needed to make Upload button not to appear during the
          // files upload.
          $uploadButton.hide();

          // Attach necessary events to the Upload and Remove buttons if
          // upload event is set to the 'manual' (so the user should click
          // Upload or Remove button for any action to be taken).
          if (settings.uploadEvent == 'manual') {
            $droppable.bind('dnd:send:complete, dnd:removeFile:empty', function () {
              if (!$(this).DnD().sending) {
                $uploadButton.hide();
                $droppableMsg.show();
              }
            });

            $uploadButton.unbind('mousedown').bind('mousedown', function (event) {
              event.preventDefault();
              event.stopPropagation();

              $droppable.DnD().send();
              return false;
            });
          }

          $droppable.bind('dnd:addFiles:after', function () {
            // Hide preview message if files number has reached the cardinality.
            if (settings.cardinality != -1 && settings.cardinality <= $droppable.DnD().getFilesList().length) {
              $droppableMsg.hide();
            }

            $uploadButton.show();
          });

          Drupal.behaviors.dragndropUploadsFile.attachPreviewers($droppable);
        });
      });
    },

    attachPreviewers: function ($droppable) {
      var $previewCnt = $('.droppable-preview', $droppable);

      // Define a preview callback for a file.
      var createPreview = function (event, dndFile) {
        var fileSize = dndFile.file.size;
        var sizes = [Drupal.t('@size B'), Drupal.t('@size KB'), Drupal.t('@size MB'), Drupal.t('@size GB')];
        for (var i in sizes) {
          if (fileSize > 1024) {
            fileSize /= 1024;
          }
          else {
            fileSize = sizes[i].replace('@size', fileSize.toPrecision(2));
            break;
          }
        }

        var $preview = dndFile.$preview = $('.droppable-preview-file', $previewCnt).last();
        $preview.data('dndFile', dndFile);

        $previewCnt.append($preview.clone());

        $('.preview-filename', $preview).html(dndFile.file.name);
        $('.preview-filesize', $preview).html(fileSize);
        $('.preview-remove', $preview).bind('click', function () {
          $droppable.DnD().removeFile(dndFile);
        });

        $preview.fadeIn();
      };
      $droppable.bind('dnd:createPreview', createPreview);

      var removePreview = function (event, dndFile) {
        /**
         * Do not remove preview while sending files, instead remove it when
         * the sending is finished in order not to confuse user.
         */
        if ($droppable.DnD().sending) {
          dndFile.$droppable.one('dnd:send:complete', function () {
            dndFile.$preview.remove();
          });
        }
        // Otherwise, just remove preview.
        else {
          dndFile.$preview.remove();
        }
      };
      $droppable.bind('dnd:removePreview', removePreview);
    }
  };
})(jQuery);
