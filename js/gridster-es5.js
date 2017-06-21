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

    };

    Gridster.prototype = {
        init: function() {
            this.initMatrix();
            this.initChild();
            this.sort();
            document.body.setAttribute('onselectstart', 'return false')
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
                    continue;
                } else if (child) {
                    this.setStyle(child, {
                        'transform': 'translate(' + ((this.matrix[now][0] - 1) * (this.options.widget_base_dimensions[0] + this.options.widget_margin[0])) + 'px,' + ((this.matrix[now][1] - 1) * (this.options.widget_base_dimensions[1] + this.options.widget_margin[1])) + 'px)',
                        //     'transition': 'all .5s linear'
                    });
                    this.setAttr(child, {
                        'data-col': this.matrix[i][0],
                        'data-row': this.matrix[i][1]
                    });
                    this.childComponent[i].col = this.matrix[i][0];
                    this.childComponent[i].row = this.matrix[i][1];
                    now++;
                }
            }
            console.log(this)
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
        interchange: function(newElem, targetElem, newIdx, targetIdx) {
            if (!newElem || !targetElem) return;
            var targetNode = targetElem,
                sourceNode = newElem;
            var siblingNode = newElem.nextSibling;
            this.node.insertBefore(sourceNode, targetNode);
            this.node.insertBefore(targetNode, siblingNode);
            //  this.childComponent[newIdx] = this.childComponent.splice(targetIdx, 1, this.childComponent[newIdx])[0];
            //  console.log('change')
        },
        /*insertAfter: function(newElem, targetElem) {
            var parentElem = targetElem.parentNode;

            if (parentElem.lastChild == targetElem) {
                parentElem.appendChild(newElem);
            } else {
                parentElem.insertBefore(newElem, targetElem);
            }
        },*/
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
        },
        getAttr: function(elem, property) {
            return elem.getAttribute(property);
        }


    }

    var GridsterComponent = function(parent, child, options) {
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
                matrix = this.parent.matrix,
                move = false,
                changenode = null,
                indexArray = null,
                n = 0,
                widthPart = this.parent.widthPart,
                width = _this.dimensions[0],
                height = _this.dimensions[1],
                marginTop = _this.margin[0],
                marginLeft = _this.margin[1];
            this.node.addEventListener('mousedown', dragStart, false);

            function dragStart(event) {
                var pos = _this.getTargetPos();

                this.startX = _this.startX = event.pageX;
                this.startY = _this.startY = event.pageY;

                this.sourceX = _this.sourceX = pos.x;
                this.sourceY = _this.sourceY = pos.y;

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
                    y = 0,
                    idxX = 0,
                    idxY = 0,
                    col = _this.col,
                    row = _this.row,
                    changeIdx = null;

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
                console.log(row + ',' + col)
                if (!move) {
                    if (x % (width + marginLeft) > (width + marginLeft) / 2 && distanceX > 0) {
                        changeIdx = (row - 1) * widthPart + col;
                        changenode = _this.parent.childs[changeIdx];
                        col = col + 1
                        if (!changenode) return;
                        nx = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[4]) - _this.dimensions[0] - _this.margin[0];
                        ny = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[5]);

                    } else if (x % (width + marginLeft) < (width + marginLeft) / 2 && distanceX < 0) {

                    }

                    if (y % (height + marginTop) > (height + marginTop) / 2 && distanceY > 0) {

                    } else if (y % (height + marginTop) < (height + marginTop) / 2 && distanceY < 0) {

                    }

                    move = true;

                    if (changenode && row && col && move) {
                        _this.setStyle(changenode, {
                            'transform': 'translate(' + nx + 'px,' + ny + 'px)',
                        })
                        _this.parent.interchange(_this.parent.childs[index], changenode, index, changeIdx);
                        row = null;
                        col = null;
                        nx = null;
                        ny = null;
                        changenode = null;
                        changeIdx = null;

                        move = false;
                    }
                } else {

                }



                /*if ((Math.abs(distanceX) > _this.dimensions[0] * (n + 0.5) || Math.abs(distanceY) > _this.dimensions[1] * (n + 0.5)) && !move) {
                    var changenode = null;
                    var nx, ny;
                    col = parseInt(x / (_this.dimensions[0] + _this.margin[0])) + 1;
                    row = parseInt(y / (_this.dimensions[1] + _this.margin[1])) + 1;
                    if (distanceX > _this.dimensions[0] * (n + 0.5)) { //right

                        changeIdx = (nrow - 1) * widthPart + ncol;
                        changenode = _this.parent.childs[changeIdx];
                        ncol = ncol + 1
                        if (!changenode) return;
                        nx = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[4]) - _this.dimensions[0] - _this.margin[0];
                        ny = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[5]);
                        move = true;

                    } else if (distanceY > _this.dimensions[1] * (n + 0.5)) { //bottom
                        console.log('2')

                        changenode = _this.parent.childs[nrow * widthPart + ncol - 1];
                        nrow += 1
                        if (!changenode) return;
                        nx = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[4]);
                        ny = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[5]) - _this.dimensions[1] - _this.margin[1];

                    } else if (-distanceX > _this.dimensions[1] * (n + 0.5)) { //left
                        console.log('3')

                        changenode = _this.parent.childs[(nrow - 1) * widthPart + ncol - 1];
                        ncol -= 1;
                        if (!changenode) return;
                        nx = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[4]) + _this.dimensions[0] + _this.margin[0];
                        ny = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[5]);

                    } else if (-distanceY > _this.dimensions[1] * (n + 0.5)) { //top
                        console.log('4')
                        changenode = _this.parent.childs[(nrow - 2) * widthPart + ncol - 1];
                        nrow -= 1;
                        if (!changenode) return;
                        nx = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[4]);
                        ny = parseInt(_this.getStyle(changenode, 'transform').match(/-?\d+/g)[5]) + _this.dimensions[1] + _this.margin[1];


                    }
                    if (changenode && row && col) {
                        _this.setStyle(changenode, {
                            'transform': 'translate(' + nx + 'px,' + ny + 'px)',
                        })
                        _this.parent.interchange(_this.parent.childs[index], changenode, index, changeIdx);
                        n += 1;
                        row = null;
                        col = null;
                        nx = null;
                        ny = null;
                        changenode = null;
                        changeIdx = null;
                        move = false;
                    }

                }*/

                _this.setTargetPos({
                    x: x,
                    y: y
                })

                if (Math.abs(distanceX) > (_this.dimensions[0] + _this.margin[0]) || Math.abs(distanceY) > (_this.dimensions[1] + _this.margin[1])) {
                    move = false;

                    for (var i = 0; i < _this.parent.childComponent.length; i++) {
                        if (self == _this.parent.childs[i]) {
                            index = i;
                        }
                    }
                }

            }

            function dragEnd(event) {
                _this.parent.sort();
                move = false;
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