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
        this.widthPart = parseFloat(this.getStyle(node, 'width')).toFixed() / options.widget_base_dimensions[0];
        this.heightPart = parseFloat(this.getStyle(node, 'height')).toFixed() / options.widget_base_dimensions[1];
        this.childComponent = new Array(this.childs.length);
        this.init();

        console.log(this)
    };

    Gridster.prototype = {
        init: function() {
            this.initMatrix();
            this.initChild();
            this.sort();
        },
        initChild: function() {
            for (var i = 0; i < this.childs.length; i++) {
                var child = new GridsterComponent(this, this.childs[i], this.options);
                this.childComponent[i] = child;
            }

        },
        sort: function(index, array) {
            var now = 0;
            var len = this.childs.length;
            for (var i = 0; i < len; i++) {
                var child = this.childs[i];
                if (index && index == i) {
                    //       now--;
                    continue;
                } else if (child) {
                    this.setStyle(child, {
                        'transform': 'translate(' + ((this.matrix[now][0] - 1) * (this.options.widget_base_dimensions[0] + this.options.widget_margin[0])) + 'px,' + ((this.matrix[now][1] - 1) * (this.options.widget_base_dimensions[1] + this.options.widget_margin[1])) + 'px)',
                        //     'transition': 'all .5s linear'
                    })
                    this.setAttr(child, {
                        'data-x': this.matrix[i][0],
                        'data-y': this.matrix[i][1]
                    });
                    now++;
                    if (array) {
                        for (var j = 0; j < len; j++) {
                            if (array[0] == this.matrix[j][0] && array[1] == this.matrix[j][1]) {
                                console.log(j)
                            }
                        }
                    }
                }
            }
        },
        initMatrix: function() {
            var len = this.childs.length,
                heightLen = this.heightPart,
                widthLen = this.widthPart,
                matrix = new Array(heightLen * widthLen);
            for (var i = 1; i <= heightLen; i++) {
                for (var j = 1; j <= widthLen; j++) {
                    matrix[(i - 1) * widthLen + j - 1] = [j, i];
                }
            }
            this.matrix = matrix;
        },
        interchange: function(newElem, targetElem) {
            var targetNode = targetElem,
                sourceNode = newElem;
            var siblingNode = newElem.nextSibling;
            this.node.insertBefore(sourceNode, targetNode);
            this.node.insertBefore(targetNode, siblingNode);
        },
        insertAfter: function(newElem, targetElem) {
            var parentElem = targetElem.parentNode;

            if (parentElem.lastChild == targetElem) {
                parentElem.appendChild(newElem);
            } else {
                parentElem.insertBefore(newElem, targetElem);
            }
        },
        getStyle: function(elem, property) {
            return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(elem)[property] : elem.currentStyle[property];
        },
        setStyle: function(elem, attr) {
            for (var property in attr) {
                elem.style[property] = attr[property];
            }
        },
        setAttr: function(elem, attr) {
            for (var property in attr) {
                elem.setAttribute(property, attr[property]);
            }
        }


    }

    var GridsterComponent = function(parent, child, options) {
        //    this.move = false;
        this.node = child;
        this.parent = parent;
        this.startX = 0;
        this.startY = 0;
        this.sourceX = 0;
        this.sourceY = 0;
        this.margin = options.widget_margin;
        this.dimensions = options.widget_base_dimensions;
        this.init();
    }

    GridsterComponent.prototype = {
        constructor: GridsterComponent,
        init: function() {
            this.setDrag();
            this.setStyle(this.node, {
                'marginTop': this.margin[0] + 'px',
                'marginLeft': this.margin[1] + 'px',
                'width': this.dimensions[0] + 'px',
                'height': this.dimensions[1] + 'px'
            })
        },
        setDrag: function() {
            var self = this.node,
                _this = this,
                index = null,
                indexnode = null,
                parent = this.parent.node,
                nowX, nowY;
            this.node.addEventListener('mousedown', dragStart, false);

            function dragStart(event) {
                var pos = _this.getTargetPos();

                this.startX = event.pageX;
                this.startY = event.pageY;

                this.sourceX = pos.x;
                this.sourceY = pos.y;

                for (var i = 0; i < _this.parent.childComponent.length; i++) {
                    if (self == _this.parent.childs[i]) {
                        index = i;
                    }
                }

                document.addEventListener("mousemove", drag, false);
                document.addEventListener("mouseup", dragEnd, false);
            }


            function drag(event) {
                var currentX = event.pageX,
                    currentY = event.pageY,
                    distanceX = currentX - self.startX,
                    distanceY = currentY - self.startY,
                    x = 0,
                    y = 0;

                if ((self.sourceX + distanceX).toFixed() < 0) {
                    x = 0;
                } else if ((self.sourceX + distanceX).toFixed() > parseInt(_this.getStyle(parent, 'width')) - parseInt(_this.getStyle(self, 'width'))) {
                    x = parseInt(_this.getStyle(parent, 'width')) - parseInt(_this.getStyle(self, 'width'));
                } else {
                    x = (self.sourceX + distanceX).toFixed();
                }

                if ((self.sourceY + distanceY).toFixed() < 0) {
                    y = 0;
                } else if ((self.sourceY + distanceY).toFixed() > parseInt(_this.getStyle(parent, 'height')) - parseInt(_this.getStyle(self, 'height'))) {
                    y = parseInt(_this.getStyle(parent, 'height')) - parseInt(_this.getStyle(self, 'height'));
                } else {
                    y = (self.sourceY + distanceY).toFixed();
                }

                if (Math.abs(distanceX) > _this.dimensions[0] / 2 || Math.abs(distanceY) > _this.dimensions[1] / 2) {
                    nowX = parseInt((self.sourceX + distanceX) / _this.dimensions[0]) + 1;
                    nowY = parseInt((self.sourceY + distanceY) / _this.dimensions[1]) + 1;
                    //  _this.parent.interchange(_this.parent.childs[index], _this.parent.childs[(nowY - 1) * 4 + nowX - 1])
                    //  _this.parent.sort(index);
                }

                _this.setTargetPos({
                    x: x,
                    y: y
                })
            }

            function dragEnd(event) {
                console.log(nowX)
                console.log(nowY)
                _this.parent.interchange(_this.parent.childs[index], _this.parent.childs[(nowY - 1) * 4 + nowX - 1])
                _this.parent.sort()
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
                this.node.style.top = pos.y + 'px';
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
        setStyle: function(elem, attr) {
            for (var property in attr) {
                elem.style[property] = attr[property];
            }
        },
        getStyle: function(elem, property) {
            return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(elem)[property] : elem.currentStyle[property];
        },
        getTargetPos: function() {
            var pos = { x: 0, y: 0 };
            var elem = this.node;
            var transform = this.getTransform();
            if (transform) {
                var transformValue = this.getStyle(elem, transform);
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
                if (this.getStyle(elem, 'position') == 'static') {
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