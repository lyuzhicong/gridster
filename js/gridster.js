;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'lodash'], factory);
    } else {
        factory(jQuery, _);
    }
})(function($, _) {
    class Gridster {
        constructor(node, options) {
            this.node = node;
            this.options = options;
            init();
        }

        static init() {

            var node = $(this.node);
            node.children().attr("class", "grid");

            /*let options = {
                base_dimensions: [],
                autogrow_cols: false,
                max_cols: 3,
                min_cols: 1,
                avoid_overlapped_widgets: true,
                draggable: {
                    start: {},
                    drag: {},
                    stop: {}
                },
                resize: {
                    enabled: false,
                    max_size: [],
                    resize: {},
                    stop: {}
                }
            };*/





        }

        _prepare_node = (node, resize) => {

        }



    }

    var drag = () => {

    }

    $.fn.gridster = opts => {
        return this.each(function() {
            if (!$(this).data('gridster')) {
                $(this).data('gridster', new Gridster(this, opts));
            }
        });
    }
})