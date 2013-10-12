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
      this.parent().attachEvents.call(this, $droppables);
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
      }
    }
  });
})(jQuery);
