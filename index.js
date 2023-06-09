const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 5000;

// Configuración de conexión a SQL Server

const dbConfig = {
  server: 'localhost',
  database: 'INVENT',
  user: 'prueba',
  password: '123',
  trustServerCertificate: true,
  options: {
    trustedConnection: true,
  },
};



// Configuración de CORS y body parser
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ENDPOINTS CLIENTES

app.get('/api/Clientes', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT * FROM Clientes');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener elementos:', error);
    res.status(500).send('Error del servidor');
  }
});

app.post('/api/CrearCliente', (req, res) => {
  const { nombreCliente, telefonoCliente } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'Error interno del servidor 1' });
    }
    const insertQuery = `INSERT INTO Clientes (NombreCliente, TelefonoCliente) VALUES ('${nombreCliente}', '${telefonoCliente}')`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Error interno del servidor 3' });
      }

      connection.close();
      res.status(201).json({ mensaje: 'Cliente registrado correctamente' });
      console.log(`Cliente: ${nombreCliente}, creado correctamente`)

    });
  });
});


// ENDPOINT ACTUALIZAR CLIENTE
app.put("/api/ActualizarClientes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del cliente de los parámetros de la solicitud
    const { nombreCliente, telefonoCliente } = req.body; // Obtener los nuevos valores del cliente de la solicitud

    const pool = await sql.connect(dbConfig);

    // Obtener los datos actuales del cliente desde la base de datos
    const queryCliente = "SELECT * FROM Clientes WHERE IdCliente = @IdCliente";
    const resultCliente = await pool
      .request()
      .input("IdCliente", id)
      .query(queryCliente);
    const clienteActual = resultCliente.recordset[0];

    // Verificar si los campos están vacíos y usar los valores actuales en su lugar
    const nombreActual = nombreCliente || clienteActual.NombreCliente;
    const telefonoActual = telefonoCliente || clienteActual.TelefonoCliente;

    // Actualizar el cliente en la base de datos
    const queryActualizar =
      "UPDATE Clientes SET NombreCliente = @NombreCliente, TelefonoCliente = @TelefonoCliente WHERE IdCliente = @IdCliente";
    const resultActualizar = await pool
      .request()
      .input("IdCliente", id)
      .input("NombreCliente", nombreActual)
      .input("TelefonoCliente", telefonoActual)
      .query(queryActualizar);

    res.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    res.status(500).send("Error del servidor");
  }
});



app.delete('/api/EliminarCliente/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Clientes WHERE IdCliente = @Id');

    res.sendStatus(200);
    console.log(`Cliente con ID: ${id}, ELIMINADO`)
  } catch (error) {
    console.error('Error al eliminar Cliente:', error);
    res.status(500).send('Error del servidor');
  }
});

app.post('/api/DeleteCliente', (req, res) => {
  const { id } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'Error al conectarse a la BD' });
    }
    const insertQuery = `DELETE FROM Clientes WHERE IdCliente = ${id}`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Error en el query' });
      }

      connection.close();
      res.status(201).json({ mensaje: 'Cliente eliminado correctamente' });
      console.log(`Cliente con id ${id}, eliminado correctamente`)

    });
  });
});

// ENDPOINTS PROVEEDORES

app.get('/api/Proveedores', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT * FROM Proveedores');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener Proveedores:', error);
    res.status(500).send('Error del servidor');
  }
});

// ENDPOINTS PRODUCTOS

app.get('/api/Productos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT * FROM Productos');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener Productos:', error);
    res.status(500).send('Error del servidor');
  }
});

app.post('/api/CrearProducto', (req, res) => {
  const { nombreProducto, descripcion } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  // Verificamos que se conecto a la BD de manera correcta
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'Error al conectar a la BD' });
    }

    // Insertar nuevo CLIENTE en la base de datos
    const insertQuery = `INSERT INTO Productos (Nombre, Descripcion) VALUES ('${nombreProducto}', '${descripcion}')`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Error en la peticion' });
      }

      connection.close();
      res.status(201).json({ mensaje: 'Producto creado correctamente' });

    });

  });
});

// ENTRADAS / SALIDAS
app.post('/api/GenerarEntrada', (req, res) => {
  const { idProduct, idProveedor, cantidad } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  // Verificamos que se conecto a la BD de manera correcta
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'No se pudo conectar a la BD' });
    }

    // Insertar nuevo CLIENTE en la base de datos
    const insertQuery = `
    DECLARE @IdProducto INT;
    DECLARE @IdProveedor INT;
    DECLARE @Cantidad INT;
    
    SET @IdProducto = ${idProduct}; 
    SET @IdProveedor = ${idProveedor}; 
    SET @Cantidad = ${cantidad}; 
    
    EXEC RegistrarEntrada @IdProducto, @IdProveedor, @Cantidad;`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Error interno del servidor 3' });
      }

      connection.close();
      res.status(201).json({ mensaje: 'Entrada Registrada Correctamente' });

    });

  });
});

app.get('/api/Entradas', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT * FROM Entradas');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener Entradas:', error);
    res.status(500).send('Error del servidor');
  }
});

app.post('/api/GenerarSalida', (req, res) => {
  const { idProduct, idCliente, cantidad } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  // Verificamos que se conecto a la BD de manera correcta
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'Error interno del servidor 1' });
    }

    if (!idProduct || !idCliente || !cantidad) {
      return res.status(400).json({ error: 'Todos los campos son necesarios' });
    }

    // Insertar nuevo CLIENTE en la base de datos
    const insertQuery = `
    DECLARE @IdProducto INT;
    DECLARE @IdCliente INT;
    DECLARE @Cantidad INT;

    SET @IdProducto = ${idProduct}; 
    SET @Cantidad = ${cantidad}; 
    SET @IdCliente = ${idCliente};

    EXEC RegistrarSalida @IdProducto, @IdCliente , @Cantidad;`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Por favor ingresa todos los campos' });
      }

      connection.close();
      res.status(201).json({ mensaje: 'Venta registrada correctamente' });

    });

  });
});

app.get('/api/Salidas', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT * FROM Salidas');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener Entradas:', error);
    res.status(500).send('Error del servidor');
  }
});

// Sesion Usuario

app.post('/login', (req, res) => {

  const { nombreUsuario, contrasena } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }

    // Buscar usuario por nombre de usuario y contraseña
    const query = `SELECT * FROM Users WHERE Username = '${nombreUsuario}' AND Pass = '${contrasena}'`;

    connection.request().query(query, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
      }

      if (result.recordset.length === 0) {
        connection.close();
        return res.status(401).json({ mensaje: 'Usuario/Contraseña Incorrectos' });
      }

      connection.close();
      res.status(200).json({ mensaje: 'Inicio de sesión exitoso' });
    });
  });
});

app.post('/registro', (req, res) => {
  const { nombreUsuario, contrasena } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: 'Error interno del servidor 1' });
    }

    // Verificar si el usuario ya existe
    const query = `SELECT * FROM Users WHERE Username = '${nombreUsuario}'`;

    connection.request().query(query, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: 'Error interno del servidor 2' });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({ mensaje: 'Nombre usuario no disponible' });
      }



      // Insertar nuevo usuario en la base de datos
      const insertQuery = `INSERT INTO Users (Username, Pass) VALUES ('${nombreUsuario}', '${contrasena}')`;

      connection.request().query(insertQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res.status(500).json({ mensaje: 'Error interno del servidor 3' });
        }

        connection.close();
        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

app.get('/api/CantidadProductos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT COUNT(*) AS TotalProductos FROM Productos;');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener total de productos:', error);
    res.status(500).send('Error del servidor');
  }
});

app.get('/api/CantidadClientes', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT COUNT(*) AS TotalClientes FROM Clientes;');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener total de Clientes:', error);
    res.status(500).send('Error del servidor');
  }
});

app.get('/api/CantidadVentasRealizadas', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query('SELECT COUNT(*) AS TotalSalidas FROM Salidas;');
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error('Error al obtener total de Ventas:', error);
    res.status(500).send('Error del servidor');
  }
});

