function EventHandlerList(handlers) {
    'use strict';
    this.handlers = new Set(handlers || []);
}

EventHandlerList.prototype.add = function (handler) {
    'use strict';
    this.handlers.add(handler);
};

EventHandlerList.prototype.delete = function (handler) {
    'use strict';
    this.handlers.delete(handler);
};

EventHandlerList.prototype.fire = function (data) {
    'use strict';
    this.handlers.forEach(function (h) {
        h({data: data});
    });
};