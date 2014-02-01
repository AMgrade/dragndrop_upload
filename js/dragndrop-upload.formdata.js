/**
 * @file
 * Contains DnDFormData class.
 * 
 * This is a wrapper for FormData class designed to allow filtering 
 * and removing of appended elements.
 *
 * @param {Object} [data]
 */
function DnDFormData(data) {
  this.data = {};
  this.multiAppend(data);
}

(function ($) {
  DnDFormData.prototype = {

    /**
     * Clear current data object and fill it with new data.
     * 
     * @param data
     */
    hydrate: function (data) {
      this.clear();
      this.multiAppend(data);
    },

    /**
     * Append to DnDFormData multiple elements at once.
     * 
     * @param data
     */
    multiAppend: function (data) {
      var me = this;
      if (data) {
        $.each(data, function (key, value) {
          me.append(key, value);
        });
      }
    },
    
    /**
     * Append value to DnDFormData.
     *
     * @param {String} key
     * @param {String|File|Blob} value
     * @param {String} [name]
     *    File or Blob name
     */
    append: function (key, value, name) {
      if (name) {
        value = {
          data: value,
          name: name
        };
      }

      if (!this.data.hasOwnProperty(key)) {
        this.data[key] = value;
      }
      else {
        if (!$.isArray(this.data[key])) {
          this.data[key] = [this.data[key]];
        }

        this.data[key].push(value);
      }
    },

    /**
     * Remove element from DnDFormData.
     * 
     * @param key
     * @param index
     * @returns {boolean}
     */
    remove: function (key, index) {
      if (!this.data.hasOwnProperty(key)) {
        return false;
      }
      else {
        if (index) {
          if ($.isArray(this.data[key]) && this.data[key][index]) {
            this.data[key].splice(index, 1);
            return true;
          }
          else {
            return false;
          }
        }
        else {
          delete this.data[key];
          return true;
        }
      }
    },

    /**
     * Filter current values of DnDFormData.
     * 
     * @param {Function} callback
     *    function (value, key) {
     *      // ...
     *    }
     * @see jQuery.map()
     */
    filter: function (callback) {
      var _map = function (obj) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if ($.isArray(obj[key])) {
              obj[key] = _map(obj[key], key);
            }
            else {
              if ((obj[key] = callback(obj[key], key)) === null) {
                delete obj[key];
              }
            }            
          }
        }
        return obj;
      };

      this.data = _map(this.data);
    },    

    /**
     * Get element from DnDFormData.
     * 
     * @param {String }key
     * @param {Number} index
     * @returns {*}
     */
    getElement: function (key, index) {
      if (this.data.hasOwnProperty(key)) {
        if (index) {
          if ($.isArray(this.data[key]) && this.data[key][index]) {
            return this.data[key][index];
          }
          else {
            return undefined;
          }
        }
        else {
          return this.data[key];
        }
      }
      else {
        return undefined;
      }
    },

    /**
     * Clear DnDFormData object.
     */
    clear: function () {
      this.data = {};
    },

    /**
     * Render DnDFormData object.
     * 
     * @returns {FormData}
     */
    render: function () {
      var formData = new FormData();
      $.each(this.data, function (key, value) {
        if ($.isArray(value)) {
          $.each(value, function (i, v) {
            if ($.isPlainObject(v)) {
              formData.append(key, v.data, v.name);
            }
            else {
              formData.append(key, v);
            }
          });
        }
        else {
          if ($.isPlainObject(value)) {
            formData.append(key, value.data, value.name);
          }
          else {
            formData.append(key, value);
          }
        }
      });
      return formData;
    }
  };
})(jQuery);
