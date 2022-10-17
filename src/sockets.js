module.exports = (io) => {
    const abc = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " "];
    const P = 104729;
    const G = 987;
    let numbers = require('numbers');

    const privKey = Math.floor(Math.random() * 10000) + 1;
    const publicKey = numbers.basic.powerMod(G, privKey, P);

    let nickNames = [];

    io.on('connection', socket => {
        io.sockets.emit('serverkey', publicKey);

        //Al recibir un mensaje recojemos los datos
        socket.on('enviar mensaje', (datos) => {
            //Lo enviamos a todos los usuarios (clientes)
            io.sockets.emit('nuevo mensaje', {
                msg: encrypt(datos, numbers.basic.powerMod(socket.userkey, privKey, P)),
                nick: socket.nickname
            });
        });


        socket.on('nuevo usuario', (datos, callback) => {
            //Nos devuelve el indice si el dato existe, es decir, si ya existe el nombre de usuario:
            if (nickNames.indexOf(datos) != -1) {
                callback(false);
            } else {
                //Si no existe le respondemos al cliente con true y agregamos el nuevo usuario:
                callback(true);
                socket.nickname = datos.nickName;
                socket.userkey = datos.pKey;
                nickNames.push(socket.nickname);
                //Enviamos al cliente el array de usuarios:
                updateUsers();
            }
        });

        socket.on('disconnect', datos => {
            //Si un usuario se desconecta lo eliminamos del array
            if (!socket.nickname) {
                return;
            } else {
                //buscamos su posición en el array y lo eliminamos con splice()
                nickNames.splice(nickNames.indexOf(socket.nickname), 1);

                //Enviamos al cliente el array de usuarios actualizado:
                updateUsers();
            }
        });

        const updateUsers = ()=> {
            io.sockets.emit('usernames', nickNames);
        }

        //Función para encriptar un texto, mediante el algorimo de César mejorado, dada una clave.
        const encrypt = (text, key) => {
            let result = "";
            text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            if (key % abc.length) key += G;

            for (i = 0; i < text.length; i++) {
                let car = text[i]
                let aux = (abc.indexOf(car.toLowerCase()) + key) % abc.length;
                if(car === car.toLowerCase()){
                    result += abc[aux];
                }else{
                    result += abc[aux].toUpperCase();
                }
            }

            return result
        }

    });

}