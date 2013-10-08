/**
 * @file
 * Contains DnDUploadFile class.
 */

/**
 * DnDUploadFile class.
 *
 * Attaches events callback to make widget 'dragndrop_upload_file'
 * work properly.
 *
 * @param {jQuery} $droppable
 */
var DnDUploadFile = function ($droppable) {
  this.dnd = $droppable.DnD();
  if (!this.dnd) {
    throw new Error('The $droppable does not contain an instance of DnD!');
  }

  this.$droppable = $droppable;
  this.dnd.$droppables.data('DnDUploadFile', this);

  this.attachEvents(this.dnd.$droppables);
};

(function ($) {
  DnDUploadFile.prototype = $.extend({}, DnDUploadAbstract.prototype, {
    /**
     * Attach events to the given droppable areas.
     *
     * @param {jQuery} $droppables
     */
    attachEvents: function ($droppables) {
      var me = this;
      var settings = me.dnd.settings;
      var $uploadButton = $('#' + settings.uploadButton);

      if (settings.uploadEvent == 'manual') {
        $uploadButton.unbind('mousedown').bind('mousedown', me.eventsList.uploadBtnMousedown.bind(me));
      }

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
      var $uploadButton = $('#' + settings.uploadButton);

      if (settings.uploadEvent == 'manual') {
        $uploadButton.unbind('mousedown');
      }

      me.parent().detachEvents.call(me, $droppables);
    },

    /**
     * Event callback that will be binded to the droppable areas.
     */
    eventsList: {
      /**
       * Droppable events.
       */
      dnd: {
        'dnd:addFiles:after': function () {
          var settings = this.dnd.settings;
          var $uploadButton = $('#' + settings.uploadButton);
          var $droppableMsg = $('.droppable-message', this.$droppable);

          // Hide preview message if files number has reached the cardinality.
          if (settings.cardinality != -1 && settings.cardinality <= this.dnd.getFilesList().length) {
            $droppableMsg.hide();
          }

          $uploadButton.show();
        },

        'dnd:send:complete, dnd:removeFile:empty': function () {
          var settings = this.dnd.settings;
          var $uploadButton = $('#' + settings.uploadButton);
          var $droppableMsg = $('.droppable-message', this.$droppable);

          if (this.dnd.settings.event == 'manual' && !this.dnd.sending) {
            $uploadButton.hide();
            $droppableMsg.show();
          }
        },

        'dnd:createPreview': function (event, dndFile) {
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

          var me = this;
          var $previewCnt = $('.droppable-preview', me.$droppable);
          var $preview = dndFile.$preview = $('.droppable-preview-file', $previewCnt).last();
          $preview.data('dndFile', dndFile);

          $previewCnt.append($preview.clone());

          $('.preview-filename', $preview).html(dndFile.file.name);
          $('.preview-filesize', $preview).html(fileSize);
          $('.preview-remove', $preview).bind('click', function () {
            me.dnd.removeFile(dndFile);
          });

          $preview.fadeIn();
        },

        'dnd:removePreview': function (event, dndFile) {
          /**
           * Do not remove preview while sending files, instead remove it when
           * the sending is finished in order not to confuse user.
           */
          if (this.dnd.sending) {
            dndFile.$droppable.one('dnd:send:complete', function () {
              dndFile.$preview.remove();
            });
          }
          // Otherwise, just remove preview.
          else {
            dndFile.$preview.remove();
          }
        },

        /**
         * Detach events before the droppable zone will be destroyed.
         *
         * @param event
         * @param $droppable
         */
        'dnd:destroy:before': function (event, $droppable) {
          this.detachEvents($droppable);
          $droppable.removeClass('dnd-upload-file-processed');
        }
      },

      /**
       * Event callback for the Upload button.
       */
      uploadBtnMousedown: function (event) {
        event.preventDefault();
        event.stopPropagation();

        this.dnd.send();
        return false;
      }
    }
  });
})(jQuery);
