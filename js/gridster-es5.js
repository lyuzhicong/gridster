;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
})(function($) {

    var Gridster = function Gridster(node, options) {

        var _this = this;
        this.node = node;
        this.options = options;
        this.childs = node.children;
        this.childComponent = new Array(this.childs.length);
        for (var i = 0; i < this.childs.length; i++) {
            var child = new GridsterComponent(this.childs[i], options);
            this.childComponent[i] = child;
        }

    };

    Gridster.prototype = {


    }

    var GridsterComponent = function(child, options) {
        //    this.move = false;
        this.node = child;
        this.startX = 0;
        this.startY = 0;
        this.sourceX = 0;
        this.sourceY = 0;
        this.init()

        /* child.addEventListener("mousemove", _this.drag);
         child.addEventListener("mouseup", _this.dragEnd);*/


    }

    GridsterComponent.prototype = {
        constructor: GridsterComponent,
        init: function() {
            this.setDrag();
        },
        setDrag: function() {
            var self = this.node;
            var _this = this;
            this.node.addEventListener('mousedown', dragStart, false);

            function dragStart(event) {
                this.startX = event.pageX;
                this.startY = event.pageY;
                var pos = _this.getTargetPos();

                this.sourceX = pos.x;
                this.sourceY = pos.y;

                document.addEventListener("mousemove", drag, false);
                document.addEventListener("mouseup", dragEnd, false);
            }


            function drag(event) {
                var currentX = event.pageX;
                var currentY = event.pageY;

                var distanceX = currentX - self.startX;
                var distanceY = currentY - self.startY;

                _this.setTargetPos({
                    x: (self.sourceX + distanceX).toFixed(),
                    y: (self.sourceY + distanceY).toFixed()
                })
            }

            function dragEnd(event) {

                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', dragEnd)
            }

        },
        setTargetPos: function(pos) {
            var transform = this.getTransform();
            if (transform) {
                this.node.style[transform] = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
            } else {
                this.node.style.left = pos.x + 'px';
                this.node.stye.top = pos.y + 'px';
            }
        },
        getTransform: function() {
            var transform = '',
                divStyle = document.createElement('div').style,
                transformAttr = ['transform', 'webkitTranform', 'MozTransform', 'msTransform', 'OTransform'],
                len = transformAttr.length;

            for (var j = 0; j < len; j++) {
                if (transformAttr[j] in divStyle)
                    return transform = transformAttr[j];
            }

            return transform;
        },
        getStyle: function(property) {
            return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(this.node)[property] : elem.currentStyle[property];
        },
        getTargetPos: function() {
            var pos = { x: 0, y: 0 };
            var elem = this.node;
            var transform = this.getTransform();
            if (transform) {
                var transformValue = this.getStyle(transform);
                if (transformValue == 'none') {
                    elem.style[transform] = 'translate(0, 0)';
                    return pos;
                } else {
                    var temp = transformValue.match(/-?\d+/g);
                    return pos = {
                        x: parseInt(temp[4].trim()),
                        y: parseInt(temp[5].trim())
                    }
                }
            } else {
                if (this.getStyle('position') == 'static') {
                    elem.style.position = 'absolute';
                } else {
                    var x = parseInt(this.getStyle(elem, 'left') ? this.getStyle(elem, 'left') : 0);
                    var y = parseInt(this.getStyle(elem, 'top') ? this.getStyle(elem, 'top') : 0);
                    return pos = {
                        x: x,
                        y: y
                    }
                }
            }
        }

    }



    $.fn.gridster = function(opts) {
        return this.each(function() {
            if (!$(this).data('gridster')) {
                $(this).data('gridster', new Gridster(this, opts));
            }
        });
    };
});