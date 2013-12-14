/**
 * @file
 * Contains DnDUploadImage class.
 */

/**
 * DnDUploadImage class.
 *
 * Attaches events callback to make widget 'dragndrop_upload_image'
 * work properly.
 *
 * @param {jQuery} $droppable
 */
var DnDUploadImage = function ($droppable) {
  this.dnd = $droppable.DnD();
  if (!this.dnd) {
    throw new Error('The $droppable does not contain an instance of DnD!');
  }

  this.$droppable = $droppable;
  this.dnd.$droppables.data('DnDUploadImage', this);

  this.attachEvents(this.dnd.$droppables);
};

(function ($) {
  DnDUploadImage.prototype = $.extend(true, {}, DnDUploadFile.prototype, {
    /**
     * Attach events to the given droppable areas.
     *
     * @param {jQuery} $droppables
     */
    attachEvents: function ($droppables) {
      var me = this;

      me.parent().attachEvents.call(me, $droppables);

      // Unbind default createPreview event handler and add a new one.
      $droppables.unbind('dnd:createPreview').bind('dnd:createPreview', me.eventsList.dnd['dnd:createPreview']);
    },
    
    /**
     * Event callback that will be binded to the droppable areas.
     */
    eventsList: {
      /**
       * Droppable events.
       */
      dnd: {
        'dnd:createPreview': function (dndFile, reader) {
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
         * Detach events before the droppable area will be destroyed.
         *
         * @param event
         * @param $droppable
         */
        'dnd:destroy:before': function (event, $droppable) {
          $droppable.removeClass('dnd-upload-image-processed');
        }
      }
    }
  });
})(jQuery);
