$(function () {
    const socket = io();
    const abc = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " "];
    const P = 104729;
    const G = 987;
    let nick = '';
    let serverKey;
    const privKey = 23438;

    //Obtenemos los elementos del DOM
    const messageForm = $('#messages-form');
    const messageBox = $('#message');
    const chat = $('#chat');

    const nickForm = $('#nick-form');
    const nickError = $('#nick-error');
    const nickName = $('#nick-name');

    const userNames = $('#usernames');

    //Función para desencriptar un texto, mediante el algorimo de César mejorado, dada una clave.
    const decrypt = (text, key) => {
        let result = "";

        if (key % abc.length) key += G;

        for (i = 0; i < text.length; i++) {
            let car = text[i]

            let aux = (abc.indexOf(car.toLowerCase()) - key) % abc.length;
            if (aux != 0) aux += abc.length

            if (car === car.toLowerCase()) {
                result += abc[aux];
            } else {
                result += abc[aux].toUpperCase();
            }
        }

        return result
    }

    //Eventos
    messageForm.submit(e => {
        e.preventDefault();
        //Enviamos el evento que debe recibir el servidor:
        socket.emit('enviar mensaje', messageBox.val());
        messageBox.val('');
    });

    //Obtenemos respuesta del servidor:
    socket.on('nuevo mensaje', function (datos) {
        let color = '#f5f4f4';
        let align = 'left';
        if (nick == datos.nick) {
            color = '#9ff4c5';
            align = 'right';
        }

        let id = "msg" + uuid();
        let isDecrypt = false;

        chat.append(`
        <div class="msg-area mb-2" id="${id}" style="background-color:${color}; text-align: ${align};">
            <p class="msg"><b>${datos.nick}: </b>${datos.msg}</p>
        </div>
        `);

        let msgTag = document.getElementById(id);
        msgTag.addEventListener("click", () => {
            let tagText = `<p class="msg"><b>${datos.nick}: </b>${datos.msg}</p>`
            if (!isDecrypt) {
                tagText = `<p class="msg"><b>${datos.nick}: </b>${decrypt(datos.msg, numbers.basic.powerMod(serverKey, privKey, P))}</p>`
            }
            msgTag.innerHTML = tagText;
            isDecrypt = !isDecrypt;
        })
    });


    nickForm.submit(e => {
        e.preventDefault();
        socket.emit('nuevo usuario', { nickName: nickName.val(), pKey: calcPublicKey(privKey) }, datos => {
            if (datos) {
                nick = nickName.val();
                $('#nick-wrap').hide();
                $('#content-wrap').show();
            } else {
                nickError.html(`
                <div class="alert alert-danger">
                    El usuario ya existe
                </div>
                `);
            }
            nickName.val('');
        });

    });

    //Obtenemos el array de usuarios de sockets.js
    socket.on('usernames', datos => {
        let html = '';
        let color = '#000';
        let salir = '';
        for (let i = 0; i < datos.length; i++) {
            if (nick == datos[i]) {
                color = '#027f43';
                salir = `<a class="enlace-salir" href="/"><i class="fas fa-sign-out-alt salir"></i></a>`;
            } else {
                color = '#000';
                salir = '';
            }
            html += `<p style="color:${color}"><i class="fas fa-user"></i> ${datos[i]} ${salir}</p>`;
        }

        userNames.html(html);
    });

    socket.on('serverkey', key => serverKey = key)

    function calcPublicKey(privKey) {
        return numbers.basic.powerMod(G, privKey, P);
    }

    function uuid() {
        var result = '';
        for (var i = 0; i < 32; i++)
            result += Math.floor(Math.random() * 16).toString(16).toUpperCase
                ();
        return result
    }
});