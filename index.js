const { Client, LocalAuth } = require("whatsapp-web.js"); //llamamos el paquete de whatsapp web

// OJO: Para INICIAR el proyecto escribimos en consola: node . 

/*
 es una biblioteca no oficial de código abierto que no está hecha por WhatsApp ni afiliada
  a ella de ninguna manera. Esta biblioteca está diseñada para ofrecer a los desarrolladores
   la libertad de crear clientes de WhatsApp, chatbots, aplicaciones y más node.js
*/

const qrcode = require("qrcode-terminal"); //llamamos el paquete "qrcode-terminal" para generar un QR para autenticación
const client = new Client({ authStrategy: new LocalAuth({ //creamos el cliente y le pasamos los datos
  dataPath: "./src/wwebjs-auth/", //La sesión de whatsapp se guarda en ese archivo y el cliente mirará si tiene una sesión para autenticar.
    puppeteer: { //puppeteer es una API que permite controlar el motor de Chrome a traves de codigo, es utilizado por la biblioteca de "whatsapp-web.js"
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" //indicamos a puppeteer que utilice Chrome guardado en local.
    }
  })  
});

/* EVENTOS - INICIO */

client.on("ready", () => { 
  //El evento ready se ejecutará cuando el bot se esté ejecutando sin problemas.
  return console.log("[BOT] El cliente está listo para utilizar!") //Mostramos mensaje por consola
});

client.on("qr", (qr) => { 
  //El evento "QR" se ejecutará para mostrar una codigo QR al usuario para iniciar sesión del bot
  //El evento se ejecutará siempre en cuando NO haya una sesión en el cache.

  return qrcode.generate(qr, { small: true }) //generamos un QR con la informacion proporcionada por el cliente, lo generaremos de manera pequeña.
})

client.on("auth_failure", (message) => {
  // "auth_failure" nos ayudará a averiguar si habo algún error al iniciar sesión.
  return console.error("[ERROR] No se pudo autenticar por el codigo QR:", message); //retornaremos un console.error con el mensaje de error.
})

client.initialize(); //iniciamos el cliente

client.on("message_create", async (message) => {
  /*
  Este evento se ejecutará cada vez que el bot detecté un mensaje, haremos un filtro para que ejecute comandos con un cierto prefijo, 
  en este caso el prefijo será "/" 
  */

  if (message.from == "status@broadcast") return; // si el mensaje proviene de un estado, lo ignoraremos.

  let getUserName = message._data.notifyName //obtenemos el nombre de usuario del escritor del mensaje
  let getUserPhone = message._data.id.remote //obtenemos el numero de telefono
  
  if (getUserName !== undefined && message.type === "chat" && // Si el nombre de usuario NO es indefinido y el mensaje es tipo CHAT 
    message.body.length > 0 && message.quotedMsg && message.quotedMsg.type === "chat") { //si la longitud del mensaje es mayor a 0 y el mensaje está recitado y ek mensaje recitado es tipo chat, continuaremos.
    
    let getQuotedMessage = message._data.quotedMsg.body //obtenemos el contenido del mensaje recitado
    let getQuotedUser = message._data.quotedMsg.quotedParticipant._serialized //obtenemos el autor del mensaje
    console.log(`[Message] ${getUserName} (${getUserPhone}) → ${getQuotedUser}: ${message.body}`) //mostramos el mensaje en consola
  } else if (getUserName !== undefined && getUserPhone.endsWith("@c.us")) { //si el nombre no está definido y termina en @c.us continuaremos
  } else if (getUserPhone.endsWith("@g.us")) { //si termina en @g.us significará que el mensaje proviene de un grupo
      let getGroupName = await message.getChat() //obtenemos el nombre del grupo
      if (getUserName === undefined) return undefined; // si no podemos obtener el nombre del grupo no retornamos undefined.

      console.log(`[Message] ${getUserName} ${message._data.author} in <1>${getGroupName.name}: ${message.body}`) //Mostramos el mensaje en consola
    }

  if (message.type == "chat" && message.body.length > 0) { //Si el mensaje proviene de un chat y la longitud del mensaje es mayor a 0 continuamos.
    let prefijo = "/" //Definimos el prefijo para ejecutar el comando
    let args = message.body.slice(prefijo.length).trim().split(/ +/g); //Extraemos los argumentos, para dividir el mensaje enviado por el usuario en varias parte.

    /* Ejemplo:

    message.body: Representa el contenido del mensaje enviado por el usuario, como " /hola mundo ".

    slice(prefijo.length):

    El método slice() recorta una parte del texto. En este caso, elimina el prefijo (/) del inicio del mensaje.
    Por ejemplo, si el mensaje es "/hola mundo", después de este paso quedará "hola mundo".
    trim():

    Elimina los espacios en blanco al inicio y al final del texto.
    Si el texto recortado era " hola mundo ", tras este paso se convierte en "hola mundo".
    split(/ +/g):

    Divide el texto en un arreglo, separándolo por uno o más espacios (/ +/ es una expresión regular que detecta uno o más espacios consecutivos).
    Por ejemplo, "hola mundo" se dividirá en ["hola", "mundo"].
*/
    let nombre_comando = args.shift().toLowerCase();

    /*

    El método shift() elimina y devuelve el primer elemento del arreglo args (el array)
    Por ejemplo, si args = ["comando", "arg1", "arg2"], después de ejecutar shift(), el arreglo será:
    args = ["arg1", "arg2"];

    */
    
    if (!message.body.startsWith(prefijo)) return; //Si el mensaje no comienza por el prefijo no retornamos nada.
    let comandos = [
      "youtube",
      "avatar",
      "ayuda"
    ] //lista de comandos
    if (comandos.includes(nombre_comando)) { //Si COMANDOS incluye "nombre_comando" ejecutaremos el comando
      if (nombre_comando === "youtube") {
        if (!args[0]) return message.reply(`❌ Necesitas *escribir* el nombre del video que quieres buscar.`) // si el usuario solo ejecuta el comando pero no pone algo para la busqueda le indicaremos que escriba algo para buscar.
          let busqueda = args.join(" "); //aca usaremos el método "join" para unir los argumentos para tener el texto entero.

          /*
            Ejemplo: /youtube Video de Prueba
            Sin el metodo Join el texto se vería asi: ["video", "de", "prueba"], se estaría separando por bloques del Array
            Con el método "join(" ")" los elementos del array se convertirá en un solo array: ["Video de Prueba"]
          */

          const BuscarEnYoutube = require('youtube-search'); //utilizamos este paquete para acceder a la API de Youtube rapidamente para obtener los videos.
          const filtros = { maxResults: 1, type: "video", videoSyndicated: true, key: 'AIzaSyAY7LRfXRAvM0EzjVKfoevjEuWya-ulqF0' }; //escribimos los filtros para la busqueda

          /*
            En este caso los filtros en la busquedaa sera:
  
            maxResults: Los resultados maximos que obtendremos será 1 video.
            type: el tipo de busqueda, en este caso solo querremos videos.
            videoSyndicated: El parámetro videoSyndicated te permite restringir una búsqueda para incluir solo los videos que se pueden reproducir fuera de youtube.com.
            key: Aqui pondras la llave de acceso a la API de Youtube, para conseguir una debes crear un proyecto aquí: https://console.developers.google.com/apis/credentials
          */

          await BuscarEnYoutube(busqueda, filtros, async function (err, results) { //realizamos la busqueda en youtube utilizando la biblioteca de youtube-search.
              if (err) { //Si hay un error procedemos a mostrar el error en consola
                  console.error(err) //Mostramos el error en consola.
                  return message.reply("❌ Ha ocurrido un error interno!") //Le indicamos al usuario que hubo un error interno y que intente mas tarde.
              }
              if (results.length < 1) return message.reply("❌ No he encontrado resultados!"); //Si la longitud de los resultados es menor a 1 pues indicaremos que no se encontró ningún video.
              let link = [] //creamos un Array vacio
              let r // r = sin valor inicial (undefined o indefinido por ahora)
              results.length >  1? r = 1 : r = results.length
              // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              /*
                results.length > 1 ? r = 1 : r = results.length;

                Aquí se usa un operador ternario para decidir el valor de r. 
                SI el resultado "results" es mayor a 1, pues r = será igual a 1, de lo contrario a r = se le asignara la longitud de results.length
            
              */
              
              let miniatura; //declaramos la variable de la miniatura a fuera de FOR para poder utilizarla afuera de FOR.
  
              for (var i = 0; i < results.length; i++) { //FOR es un bucle para ir revisando elemento por elemento del Array results.
                link.push(`
*Titulo: ${results[i].title}*

${results[i].link}`); //agregamos los objetos al Array
miniatura = results[i].thumbnails.high.url //asignamos la miniatura
              }
              
              const { MessageMedia } = require("whatsapp-web.js"); //llamamos "MessageMedia" de la biblioteca whatsapp-web.js para poder crear un archivo multimedia para subir a whatsapp.
              let urlMiniatura = await MessageMedia.fromUrl(miniatura) //con la Clase "MessageMedia" utilizamos su metodo "fromURL" para descargar el archivo desde la URL 
                                                                      //y devolverlo en un objeto MessageMedia para enviar a whatsapp
              
              return client.sendMessage(message.from, urlMiniatura, { caption: `*Aqui tienes el resultado de tu busqueda.*\n\n${link[0]} ` }) 
              //Enviamos el mensaje al usuario que ejecuto el comando utilizando "message.from"
              // cargamos la miniatura del video en el mensaje
              //Agregamos un caption al mensaje y el link del video obtenido.
          });
      }
    }
  }

})
/* EVENTOS - INICIO */
