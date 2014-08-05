/*jslint browser: true */
/*global imageResize */

function DisplayCache(data) {
    'use strict';
    if (data instanceof Image) {
        if (data.width > data.height) {
            this.width = 12;
            this.height = 12 * data.height / data.width;
        } else {
            this.width = 12 * data.width / data.height;
            this.height = 12;
        }
        this.displayCacheLarge = data;
        imageResize(data, 200, function (medimg) {
            this.displayCache = medimg;
            imageResize(medimg, 12, function (smallimg) {
                this.displayCacheSmall = smallimg;
            }.bind(this));
        }.bind(this));
    } else {
        this.width = 0;
        this.height = 0;
        if (data) {
            this.displayCache = data.toString();
        }
    }
}

DisplayCache.prototype.get = function (zoom) {
    'use strict';
    if (zoom > 50 && this.displayCacheLarge) {
        return this.displayCacheLarge;
    }
    if (zoom < 1) {
        return this.displayCacheSmall;
    }
    return this.displayCache;
};