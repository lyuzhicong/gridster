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
        this.widthPart = parseInt(parseFloat(getStyle(node, 'width')).toFixed() / options.widget_base_dimensions[0]);
        this.heightPart = Math.ceil(this.childs.length / this.widthPart);
        this.childComponent = new Array(this.childs.length);
        this.base_width = options.widget_base_dimensions[0];
        this.base_height = options.widget_base_dimensions[1];
        this.init();
        console.log(this)
    };

    Gridster.prototype = {
        init: function() {
            this.initChild();
            this.initMatrix();
            this.sort();
            document.body.setAttribute('onselectstart', 'return false')
            setStyle(this.node, {
                'height': this.heightPart * (this.options.widget_base_dimensions[1] + this.options.widget_margin[1]) + 'px'
            })
        },
        initChild: function() {
            for (var i = 0; i < this.childs.length; i++) {
                var child = new GridsterComponent(this, this.childs[i], this.options);
                this.childComponent[i] = child;
            }

        },
        sort: function(index, array) {
            var now = 0,
                len = this.childs.length,
                width = this.options.widget_base_dimensions[0],
                height = this.options.widget_base_dimensions[1],
                marginLeft = this.options.widget_margin[0],
                marginTop = this.options.widget_margin[1];
            for (var i = 0; i < len; i++) {
                var child = this.childs[i];
                var childComponent = this.childComponent[i];
                if (index && index == i) {
                    continue;
                } else if (child) {
                    setStyle(child, {
                        'transform': 'translate(' + ((this.matrix[now][0] - 1) * (width + marginLeft)) + 'px,' + ((this.matrix[now][1] - 1) * (height + marginTop)) + 'px)'
                    });
                    setAttr(child, {
                        'data-col': childComponent.col || this.matrix[i][0],
                        'data-row': childComponent.row || this.matrix[i][1]
                    });
                    childComponent.col = this.matrix[i][0];
                    childComponent.row = this.matrix[i][1];

                    childComponent.centerX = (this.matrix[now][0] - 1) * (width + marginLeft) + (width + marginLeft) / 2;
                    childComponent.centerY = (this.matrix[now][1] - 1) * (height + marginTop) + (height + marginTop) / 2;

                    childComponent.startX = (this.matrix[now][0] - 1) * (width + marginLeft);
                    childComponent.startY = (this.matrix[now][1] - 1) * (height + marginTop);
                    now++;
                }
            }
        },
        initMatrix: function() {
            var heightLen = this.heightPart,
                widthLen = this.widthPart,
                matrix = new Array(heightLen * widthLen);

            var childs = this.childs,
                components = this.childComponent,
                len = childs.length;
            for (var i = 0; i < len; i++) {
                console.log(components[i])
                if (i == 0) {
                    matrix[i] = [components[i].row || components[i].row = 1, components[i].col || components[i].col = 1];
                } else {
                    var preComponent = components[i - 1];
                    console.log(widthLen)
                    matrix[i] = components[i].sizeX + preComponent.sizeX > widthLen ? [preComponent.row + preComponent.sizeY, preComponent.col] : [preComponent.col + sizeX, preComponent.row]
                }
            }

            this.matrix = matrix
                /*var len = this.childs.length;
                if (this.matrix) {
                    for (var j = 1; j < len; j++) {
                        var childComponent = this.childComponent[j];
                        this.matrix[j][0] = childComponent[j + 1].col - childComponent[j].sizeX;
                        this.matrix[j][1] = childComponent[j].row - childComponent[j].sizeY;
                    }
                    console.log('in')
                } else {
                    var heightLen = this.heightPart,
                        widthLen = this.widthPart,
                        matrix = new Array(heightLen * widthLen);
                    for (var i = 1; i <= heightLen; i++) {
                        for (var j = 1; j <= widthLen; j++) {
                            matrix[(i - 1) * widthLen + j - 1] = [j, i];
                        }
                    }
                    this.matrix = matrix;
                }*/
                /*var len = this.childs.length,
                    heightLen = this.heightPart,
                    widthLen = this.widthPart,
                    matrix = new Array(heightLen * widthLen);
                for (var j = 1; j < len; j++) {
                    var childComponent = this.childComponent[j];
                    matrix[j][0] = childComponent[j + 1].col - childComponent[j].sizeX;
                    matrix[j][1] = childComponent[j].row - childComponent[j].sizeY;
                }
                this.matrix = matrix;*/
        },
        interchange: function(newElem, targetElem, newIdx, targetIdx) {
            if (!newElem || !targetElem) return;
            var targetNode = targetElem,
                sourceNode = newElem;
            var siblingNode = getNextElement(sourceNode);
            if (siblingNode == targetElem) {
                this.node.insertBefore(targetNode, sourceNode);
            } else {
                this.node.insertBefore(sourceNode, targetNode);
                this.node.insertBefore(targetNode, siblingNode);
            }
            this.childComponent[newIdx] = this.childComponent.splice(targetIdx, 1, this.childComponent[newIdx])[0];
        }


    }

    var GridsterComponent = function(parent, child, options) {
        var sizeX = child.getAttribute('data-sizeX'),
            sizeY = child.getAttribute('data-sizeY');
        this.node = child;
        this.parent = parent;
        this.startX = 0;
        this.startY = 0;
        this.sourceX = 0;
        this.sourceY = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.sizeX = sizeX ? (sizeX < parent.widthPart ? sizeX : parent.widthPart) : 1;
        this.sizeY = sizeY ? (sizeY < parent.heightPart ? sizeY : parent.heightPart) : 1;
        this.margin = options.widget_margin;
        this.dimensions = options.widget_base_dimensions;
        this.options = options;


        this.init();
    }

    GridsterComponent.prototype = {
        constructor: GridsterComponent,
        init: function() {
            this.setDrag();
            if (this.options.resize.enable) {
                this.resize = this.options.resize;
                this.zoom = this.initZoom();

            }

            setStyle(this.node, {
                'marginTop': this.margin[0] + 'px',
                'marginLeft': this.margin[1] + 'px',
                'width': this.dimensions[0] * this.sizeX + this.margin[1] * (this.sizeX - 1) + 'px',
                'height': this.dimensions[1] * this.sizeY + this.margin[0] * (this.sizeY - 1) + 'px'
            })
            console.log(this.node)
            this.node.setAttribute('data-sizeX', this.sizeX);
            this.node.setAttribute('data-sizeY', this.sizeY);
            addClass(this.node, 'grid')

        },
        initZoom: function() {
            var node = this.node;
            var zoom = document.createElement('span');

            addClass(zoom, 'zoom')

            node.appendChild(zoom);
            this.setSpanDrag(zoom);

            return zoom;
        },
        setSpanDrag: function(node) {
            var self = node,
                _this = this,
                distanceX = null,
                distanceY = null,
                base_width = this.parent.base_width,
                base_height = this.parent.base_height,
                excurrentX = null,
                excurrentY = null,
                child = _this.node;

            for (var resizeFun in _this.options.resize) {
                if (resizeFun == 'enable')
                    continue;
                else
                    _this.resize[resizeFun] == _this.options.resize[resizeFun];
            }


            node.addEventListener('mousedown', dragStart, false);

            function dragStart(event) {

                document.addEventListener("mousemove", drag, false);
                document.addEventListener("mouseup", dragEnd, false);

                event.stopPropagation();
            }

            function drag(event) {

                var currentX = event.pageX,
                    currentY = event.pageY;

                distanceX = excurrentX == null ? 0 : currentX - excurrentX;
                distanceY = excurrentX == null ? 0 : currentY - excurrentY;

                _this.width = child.style.width = ((parseInt(child.style.width) + distanceX) > base_width ? (parseInt(child.style.width) + distanceX) : base_width) + 'px';
                _this.height = child.style.height = ((parseInt(child.style.height) + distanceY) > base_height ? (parseInt(child.style.height) + distanceY) : base_height) + 'px';

                if (_this.resize && _this.resize.resize)
                    _this.resize.resize(event, child)

                event.stopPropagation();

                excurrentX = currentX;
                excurrentY = currentY;

            }

            function dragEnd(event) {

                _this.sizeX = parseInt((parseInt(_this.width) / base_width).toFixed()) == 0 ? 1 : parseInt((parseInt(_this.width) / base_width).toFixed());
                _this.sizeY = parseInt((parseInt(_this.height) / base_height).toFixed()) == 0 ? 1 : parseInt((parseInt(_this.height) / base_height).toFixed());

                _this.width = child.style.width = _this.sizeX * base_width + 'px';
                _this.height = child.style.height = _this.sizeY * base_height + 'px';

                _this.parent.sort();

                if (_this.resize && _this.resize.stop)
                    _this.resize.stop(event, child)

                excurrentX = null;
                excurrentY = null;

                console.log(_this)

                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', dragEnd)
            }
        },
        setDrag: function() {
            var self = this.node,
                _this = this,
                index = null,
                indexnode = null,
                parent = this.parent.node,
                matrix = this.parent.matrix,
                components = this.parent.childComponent,
                changenode = null,
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

                _this.centerX = _this.sourceX + width / 2;
                _this.centerY = _this.sourceY + height / 2;

                console.log(_this)

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

                    changeIdx = null;

                for (var i = 0; i < _this.parent.childComponent.length; i++) {
                    if (self == _this.parent.childs[i]) {
                        index = i;
                    }
                }

                if ((self.sourceX + distanceX).toFixed() < 0) {
                    x = 0;
                } else if ((self.sourceX + distanceX).toFixed() > parseInt(getStyle(parent, 'width')) - parseInt(getStyle(self, 'width'))) {
                    x = parseInt(getStyle(parent, 'width')) - parseInt(getStyle(self, 'width'));
                } else {
                    x = (self.sourceX + distanceX).toFixed();
                }

                if ((self.sourceY + distanceY).toFixed() < 0) {
                    y = 0;
                } else if ((self.sourceY + distanceY).toFixed() > parseInt(getStyle(parent, 'height')) - parseInt(getStyle(self, 'height'))) {
                    y = parseInt(getStyle(parent, 'height')) - parseInt(getStyle(self, 'height'));
                } else {
                    y = (self.sourceY + distanceY).toFixed();
                }
                var centerX = _this.centerX = parseInt(x) + width / 2;
                var centerY = _this.centerY = parseInt(y) + height / 2;

                for (var i = 0; i < components.length; i++) {
                    if ((components[i].centerX + width / 2 > centerX) && (components[i].centerX - width / 2 < centerX) && (components[i].centerY + height / 2 > centerY) && (components[i].centerY - height / 2 < centerY) && i != index && !changenode) {
                        changenode = _this.parent.childs[i];
                        changeIdx = i;
                        nx = (_this.parent.childComponent[index].col - 1) * (width + marginLeft);
                        ny = (_this.parent.childComponent[index].row - 1) * (height + marginTop);
                    }
                }
                if (changenode) {
                    setStyle(changenode, {
                        'transform': 'translate(' + nx + 'px,' + ny + 'px)',
                    })
                    _this.parent.interchange(self, changenode, index, changeIdx);
                    _this.parent.initMatrix();
                    _this.parent.sort();
                    row = null;
                    col = null;
                    nx = null;
                    ny = null;
                    changenode = null;
                    changeIdx = null;
                    index = null;
                }


                _this.setTargetPos({
                    x: x,
                    y: y
                })

                if (Math.abs(distanceX) > (_this.dimensions[0] + _this.margin[0]) || Math.abs(distanceY) > (_this.dimensions[1] + _this.margin[1])) {

                    for (var i = 0; i < _this.parent.childComponent.length; i++) {
                        if (self == _this.parent.childs[i]) {
                            index = i;
                        }
                    }
                }

            }

            function dragEnd(event) {
                _this.parent.initMatrix();
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
        getTargetPos: function() {
            var pos = { x: 0, y: 0 };
            var elem = this.node;
            var transform = this.getTransform();
            if (transform) {
                var transformValue = getStyle(elem, transform);
                if (transformValue == 'none') {
                    elem.style[transform] = 'translate(0, 0)';
                    return pos;
                } else {
                    var temp = transformValue.split(/[ ,]+/);
                    return pos = {
                        x: parseInt(temp[4].trim()),
                        y: parseInt(temp[5].trim())
                    }
                }
            } else {
                if (getStyle(elem, 'position') == 'static') {
                    elem.style.position = 'absolute';
                } else {
                    var x = parseInt(getStyle(elem, 'left') ? getStyle(elem, 'left') : 0);
                    var y = parseInt(getStyle(elem, 'top') ? getStyle(elem, 'top') : 0);
                    return pos = {
                        x: x,
                        y: y
                    }
                }
            }
        }

    }

    function getNextElement(element) {
        var e = element.nextSibling;
        if (e == null) { //测试同胞节点是否存在，否则返回空
            return null;
        }
        if (e.nodeType == 3) { //如果同胞元素为文本节点
            var two = getNextElement(e);
            if (two == null) return;
            if (two.nodeType == 1)
                return two;
        } else {
            if (e.nodeType == 1) { //确认节点为元素节点才返回
                return e;
            } else {
                return false;
            }
        }
    };


    function setStyle(elem, attr) {
        for (var property in attr) {
            elem.style[property] = attr[property];
        }
    };

    function getStyle(elem, property) {
        return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(elem)[property] : elem.currentStyle[property];
    };


    function setAttr(elem, attr) {
        for (var property in attr) {
            elem.setAttribute(property, attr[property]);
        }
    };

    function getAttr(elem, property) {
        return elem.getAttribute(property);
    };

    function hasClass(elem, cName) {
        return !!elem.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)")); // ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
    };

    function addClass(elem, cName) {
        if (!hasClass(elem, cName)) {
            if (elem.className)
                elem.className += " " + cName;
            else
                elem.className = cName;
        };
    };

    $.fn.tsgridster = function(opts) {
        return this.each(function() {
            $(this).data('gridster', new Gridster(this, opts));
        });
    };
});