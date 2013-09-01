/**
 * @file
 * Contains DnDUploadsImage class.
 */

/**
 * DnDUploadsImage class.
 *
 * Attaches events callback to make widget 'dragndrop_uploads_image'
 * work properly.
 *
 * @param {jQuery} $droppable
 */
var DnDUploadsImage = function ($droppable) {
  this.dnd = $droppable.DnD();
  if (!this.dnd) {
    throw new Error('The $droppable does not contain an instance of DnD!');
  }

  this.$droppable = $droppable;
  this.dnd.$droppables.data('DnDUploadsImage', this);

  this.attachEvents(this.dnd.$droppables);
};

(function ($) {
  DnDUploadsImage.prototype = $.extend(true, {}, DnDUploadsFile.prototype, {
    /**
     * Event callback that will be binded to the droppable areas.
     */
    eventsList: {
      /**
       * Droppable events.
       */
      dnd: {
        'dnd:createPreview': function (event, dndFile, reader) {
          var me = this;
          var $previewCnt = $('.droppable-preview', me.$droppable);
          var $preview = dndFile.$preview = $('.droppable-preview-image', $previewCnt).last();
          $preview.data('dndFile', dndFile);

          $previewCnt.append($preview.clone());

          $('img', $preview).attr('src', reader.result);

          $('.preview-remove', $preview).click(function () {
            me.dnd.removeFile(dndFile);
          });

          $preview.fadeIn();
        },

        /**
         * Detach events before the droppable zone will be destroyed.
         *
         * @param event
         * @param $droppable
         */
        'dnd:destroy:before': function (event, $droppable) {
          this.detachEvents($droppable);
          $droppable.removeClass('dnd-uploads-image-processed');
        }
      }
    }
  });
})(jQuery);
