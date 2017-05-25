;
(function() {
    class Gridster {
        constructor(node) {
            this.node = node;
        }

        static init(options) {
            let node = this.node;
            if (typeof node == 'object') {
                this.node = node;
            } else {
                this.node = document.getElementsByClassName(node);
            }




        }

    }
})