// script.js

(function () {
    var canvas = $('#canvas');

    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    var width = canvas.width();
    var height = canvas.height();

    canvas.attr("width", width);
    canvas.attr("height", height);

    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(139, 69, 19)",
            scale: 4
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 5,
            speed: 10,
        }
    }

    // ---------- Final: foto dentro de marco de flores ----------
    function florSVG(size) {
        var petalos = '';
        for (var a = 0; a < 360; a += 45) {
            petalos += '<ellipse cx="50" cy="26" rx="11" ry="20" fill="#FFD21F" ' +
                       'stroke="#E0A800" stroke-width="1.5" transform="rotate(' + a + ' 50 50)"/>';
        }
        return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '">' +
               petalos +
               '<circle cx="50" cy="50" r="15" fill="#6b3a10"/>' +
               '<circle cx="50" cy="50" r="8" fill="#3d1f08"/></svg>';
    }

    function ponerFlor(marco, izq, arriba, size) {
        var f = $('<div class="flor-marco"></div>').html(florSVG(size));
        f.css({
            left: izq + '%',
            top: arriba + '%',
            transform: 'translate(-50%, -50%) rotate(' + Math.floor(Math.random() * 60) + 'deg)'
        });
        marco.append(f);
    }

    function armarMarcoFlores() {
        var marco = $('#foto-marco');
        var i, p, tam;
        var nH = 9, nV = 7;   // flores por lado horizontal y vertical
        for (i = 0; i <= nH; i++) {
            p = i / nH * 100;
            tam = (i % 2 == 0) ? 50 : 36;
            ponerFlor(marco, p, 0, tam);
            ponerFlor(marco, p, 100, tam);
        }
        for (i = 1; i < nV; i++) {
            p = i / nV * 100;
            tam = (i % 2 == 0) ? 50 : 36;
            ponerFlor(marco, 0, p, tam);
            ponerFlor(marco, 100, p, tam);
        }
    }

    function abrirFoto() {
        $('#pista').hide();
        $('#foto-modal').css('display', 'flex');
        setTimeout(function () { $('#foto-modal').addClass('abierto'); }, 20);
    }

    function cerrarFoto() {
        $('#foto-modal').removeClass('abierto');
        setTimeout(function () { $('#foto-modal').hide(); }, 400);
    }

    function activarFoto() {
        // quitar los manejadores de la semilla y dejar solo el clic en el árbol
        canvas.unbind("click");
        canvas.unbind("mousemove");
        canvas.removeClass('hand');

        $('#pista').fadeIn(800);
        canvas.bind("click.foto", function (e) {
            var x = e.pageX - canvas.offset().left;
            if (x > 500) abrirFoto();          // solo la zona del árbol
        }).bind("mousemove.foto", function (e) {
            var x = e.pageX - canvas.offset().left;
            canvas.toggleClass('hand', x > 500);
        });
    }

    armarMarcoFlores();
    $('#foto-cerrar').click(cerrarFoto);
    $('#foto-modal').click(function (e) {
        if (e.target === this) cerrarFoto();   // clic en el fondo oscuro
    });
    $(document).keydown(function (e) {
        if (e.keyCode == 27) cerrarFoto();     // tecla Esc
    });

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;

    canvas.click(function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        if (seed.hover(x, y)) {
            hold = 0;
            canvas.unbind("click");
            canvas.unbind("mousemove");
            canvas.removeClass('hand');
        }
    }).mousemove(function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        canvas.toggleClass('hand', seed.hover(x, y));
    });

    $(document).keydown(function(e) {
        if (e.keyCode == 13) {
            if (hold) {
                hold = 0;
                canvas.unbind("click");
                canvas.unbind("mousemove");
                canvas.removeClass('hand');
            }
        }
    });


    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, 3);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(5));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.flower(5);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        tree.snapshot("p1", 240, 0, 610, 680);
        while (tree.move("p1", 500, 0)) {
            foot.draw();
            $await(Jscex.Async.sleep(4));
        }
        foot.draw();
        tree.snapshot("p2", 500, 0, 610, 680);

        canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
        canvas.css("background", "#F5E8DC");
        $await(Jscex.Async.sleep(300));
        canvas.css("background", "none");
    }));

  var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        while (true) {
            tree.ctx.clearRect(0, 0, width, height);
            tree.jump();
            foot.draw();
            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2026, 1, 2);
        together.setHours(13);
        together.setMinutes(5);
        together.setSeconds(0);
        together.setMilliseconds(0);

        activarFoto();
        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();

        $await(jumpAnimate());
    }));

    runAsync().start();
})();
