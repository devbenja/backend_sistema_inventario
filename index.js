const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
const port = 5000;

// Configuración de conexión a SQL Server
const dbConfig = {
  server: "localhost",
  database: "INVENT22",
  user: "sa",
  password: "1234",
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
app.get("/api/Clientes", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Clientes");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener elementos:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/CrearCliente", (req, res) => {
  const { nombreCliente, telefonoCliente, correoCliente, direccionCliente } =
    req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ mensaje: "Error interno del servidor 1 - Conexion la BD" });
    }
    const insertQuery = `INSERT INTO Clientes (NombreCliente, TelefonoCliente, CorreoCliente, DireccionCliente) VALUES ('${nombreCliente}', '${telefonoCliente}', '${correoCliente}', '${direccionCliente}')`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res
          .status(500)
          .json({ mensaje: "Error interno del servidor 3" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Cliente registrado correctamente" });
      console.log(`Cliente: ${nombreCliente}, creado correctamente`);
    });
  });
});

app.put("/api/ActualizarClientes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del cliente de los parámetros de la solicitud
    const { nombreCliente, telefonoCliente, correoCliente, direccionCliente } =
      req.body; // Obtener los nuevos valores del cliente de la solicitud

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
    const correoActual = correoCliente || clienteActual.CorreoCliente;
    const direccionActual = direccionCliente || clienteActual.DireccionCliente;

    // Actualizar el cliente en la base de datos
    const queryActualizar =
      "UPDATE Clientes SET NombreCliente = @NombreCliente, TelefonoCliente = @TelefonoCliente, CorreoCliente = @CorreoCliente, DireccionCliente = @DireccionCliente WHERE IdCliente = @IdCliente";
    const resultActualizar = await pool
      .request()
      .input("IdCliente", id)
      .input("NombreCliente", nombreActual)
      .input("TelefonoCliente", telefonoActual)
      .input("CorreoCliente", correoActual)
      .input("DireccionCliente", direccionActual)
      .query(queryActualizar);

    res.json({ message: `Cliente actualizado correctamente` });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/DeleteCliente", (req, res) => {
  const { id } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }
    const insertQuery = `DELETE FROM Clientes WHERE IdCliente = ${id}`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Cliente eliminado correctamente" });
      console.log(`Cliente con id ${id}, eliminado correctamente`);
    });
  });
});

// ENDPOINTS PROVEEDORES
app.get("/api/Proveedores", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Proveedores");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Proveedores:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/CrearProveedor", (req, res) => {
  const {
    nombreProveedor,
    telefonoProveedor,
    direccionProveedor,
    correoProveedor,
    pais,
  } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error interno del servidor 1" });
    }
    const insertQuery = `INSERT INTO Proveedores (NombreProveedor, TelefonoProveedor, DireccionProveedor, CorreoProveedor, Pais) VALUES ('${nombreProveedor}', '${telefonoProveedor}', '${direccionProveedor}', '${correoProveedor}', '${pais}')`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res
          .status(500)
          .json({ mensaje: "Error interno del servidor 3 - En el query" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Proveedor creado correctamente" });
      console.log(`Cliente: ${nombreProveedor}, creado correctamente`);
    });
  });
});

app.put("/api/ActualizarProveedor/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del cliente de los parámetros de la solicitud
    const {
      nombreProveedor,
      telefonoProveedor,
      direccionProveedor,
      correoProveedor,
      pais,
    } = req.body; // Obtener los nuevos valores del cliente de la solicitud

    const pool = await sql.connect(dbConfig);

    // Obtener los datos actuales del cliente desde la base de datos
    const queryProveedor =
      "SELECT * FROM Proveedores WHERE IdProveedor = @IdProveedor";
    const resultProveedor = await pool
      .request()
      .input("IdProveedor", id)
      .query(queryProveedor);
    const proveedorActual = resultProveedor.recordset[0];

    // Verificar si los campos están vacíos y usar los valores actuales en su lugar
    const nombreActual = nombreProveedor || proveedorActual.NombreCliente;
    const telefonoActual = telefonoProveedor || proveedorActual.TelefonoCliente;
    const direccionActual =
      direccionProveedor || proveedorActual.DireccionProveedor;
    const correoActual = correoProveedor || proveedorActual.CorreoProveedor;
    const paisActual = pais || proveedorActual.Pais;

    // Actualizar el cliente en la base de datos
    const queryActualizar =
      "UPDATE Proveedores SET NombreProveedor = @NombreProveedor, TelefonoProveedor = @TelefonoProveedor, DireccionProveedor = @DireccionProveedor, CorreoProveedor = @CorreoProveedor, Pais = @Pais WHERE IdProveedor = @IdProveedor";
    const resultActualizar = await pool
      .request()
      .input("IdProveedor", id)
      .input("NombreProveedor", nombreActual)
      .input("TelefonoProveedor", telefonoActual)
      .input("DireccionProveedor", direccionActual)
      .input("CorreoProveedor", correoActual)
      .input("Pais", paisActual)
      .query(queryActualizar);

    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el Proveedor:", error);
    res.status(500).send("Error del servidor");
  }
});

app.delete("/api/DeleteProveedor/:id", (req, res) => {
  const { id } = req.params;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }
    const insertQuery = `DELETE FROM Proveedores WHERE IdProveedor = ${id}`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Proveedor eliminado correctamente" });
      console.log(`Proveedor con id ${id}, eliminado correctamente`);
    });
  });
});

// ENDPOINTS PRODUCTOS
app.get("/api/Productos", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Productos");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Productos:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/CrearProducto", (req, res) => {
  const { nombreProducto, descripcion } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  // Verificamos que se conecto a la BD de manera correcta
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectar a la BD" });
    }

    // Insertar nuevo CLIENTE en la base de datos
    const insertQuery = `INSERT INTO Productos (Nombre, Descripcion, PrecioCompra, PrecioVenta) VALUES ('${nombreProducto}', '${descripcion}', '${precioCompra}', '${precioVenta}')`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en la peticion" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Producto creado correctamente" });
    });
  });
});

app.get("/api/ProductoPrecioCompra", async (req, res) => {
  const nombreProducto = req.query.nombre;

  try {
    // Establecer la conexión a la base de datos
    await sql.connect(dbConfig);

    // Ejecutar la consulta para obtener el precio del producto
    const result = await sql.query(
      `SELECT PrecioCompra FROM Productos WHERE Nombre = '${nombreProducto}'`
    );

    // Verificar si se encontró el producto y devolver el precio
    if (result.recordset.length > 0) {
      const precio = result.recordset[0].PrecioCompra;
      res.json({ precio });
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  } finally {
    // Cerrar la conexión a la base de datos
    sql.close();
  }
});

app.get("/api/ProductoPrecioVenta", async (req, res) => {
  
  const nombreProducto = req.query.nombre;

  try {
    // Establecer la conexión a la base de datos
    await sql.connect(dbConfig);

    // Ejecutar la consulta para obtener el precio del producto
    const result = await sql.query(
      `SELECT PrecioVenta FROM Productos WHERE Nombre = '${nombreProducto}'`
    );

    // Verificar si se encontró el producto y devolver el precio
    if (result.recordset.length > 0) {
      const precio = result.recordset[0].PrecioVenta;
      res.json({ precio });
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  } finally {
    // Cerrar la conexión a la base de datos
    sql.close();
  }
});

// ENTRADAS - SALIDAS
app.post("/api/GenerarEntrada", (req, res) => {

  const { nombreProducto, nombreProveedor, cantidad, precio, subtotal, total, iva } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  // Verificamos que se conecto a la BD de manera correcta
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "No se pudo conectar a la BD" });
    }

    if (!nombreProducto || !nombreProveedor || !cantidad || !total || !precio || !subtotal || !iva) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son necesarios" });
    }

    // Insertar nuevo CLIENTE en la base de datos
    const insertQuery = `
    DECLARE @NombreProducto VARCHAR(100);
    DECLARE @NombreProveedor VARCHAR(100);
    DECLARE @Cantidad INT;
    DECLARE @SubtotalCompra INT;
    DECLARE @TotalDineroGastado INT;
    DECLARE @PrecioCompra INT;
    DECLARE @IVA DECIMAL(10,2);

    SET @NombreProducto = '${nombreProducto}'; 
    SET @NombreProveedor = '${nombreProveedor}'; 
    SET @Cantidad = ${cantidad};
    SET @SubtotalCompra = ${subtotal};
    SET @TotalDineroGastado = ${total}; 
    SET @PrecioCompra = ${precio};
    SET @IVA = ${iva};

    EXEC RegistrarEntrada @NombreProducto, @NombreProveedor, @Cantidad, @PrecioCompra, @SubtotalCompra, @TotalDineroGastado, @IVA;`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Compra Registrada Correctamente" });
    });
  });
});

app.get("/api/Entradas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Entradas");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Entradas:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/GenerarSalida", (req, res) => {

  const { nombreProducto, nombreCliente, cantidad, totalMasIva, subtotal, precio, iva } = req.body;

  // Crear una nueva instancia de conexión a la base de datos
  const connection = new sql.ConnectionPool(dbConfig);

  // Verificamos que se conecto a la BD de manera correcta
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "No se conecto a la BD" });
    }

    if (!nombreProducto || !nombreCliente || !cantidad || !totalIngreso ) {
      return res.status(400).json({ error: "Todos los campos son necesarios" });
    }

    // Insertar nuevo CLIENTE en la base de datos
    const insertQuery = `
    DECLARE @NombreProducto VARCHAR(100);
    DECLARE @NombreCliente VARCHAR(100);
    DECLARE @Cantidad INT;
    DECLARE @TotalDineroIngresado INT;
    DECLARE @SubtotalVenta INT;
    DECLARE @PrecioVenta INT;
    DECLARE @IVA DECIMAL(10,2); 

    SET @NombreProducto = '${nombreProducto}'; 
    SET @NombreCliente = '${nombreCliente}'; 
    SET @Cantidad = ${cantidad};
    SET @TotalDineroIngresado = ${totalMasIva}; 
    SET @SubtotalVenta = ${subtotal};
    SET @PrecioVenta = ${precio};
    SET @IVA = ${iva};

    EXEC RegistrarSalida @NombreProducto, @NombreCliente, @Cantidad, @TotalDineroIngresado, @SubtotalVenta, @PrecioVenta, @IVA;`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Venta registrada correctamente" });
    });
  });
});

app.get("/api/Salidas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Salidas");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Entradas:", error);
    res.status(500).send("Error del servidor");
  }
});

// REPORTES
app.get("/api/CantidadProductos", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS TotalProductos FROM Productos;");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener total de productos:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/CantidadClientes", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS TotalClientes FROM Clientes;");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener total de Clientes:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/CantidadVentasRealizadas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS TotalSalidas FROM Salidas;");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener total de Ventas:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/reporte-ventas", async (req, res) => {
  console.log("Solicitud de reporte de ventas recibida");
  const { fechaInicio, fechaFin } = req.body;

  console.log("Fecha de inicio recibida:", fechaInicio);
  console.log("Fecha de fin recibida:", fechaFin);

  try {
    // Crea una nueva instancia de la conexión a la base de datos
    await sql.connect(dbConfig);

    // Obtener las fechas inicial y final del rango deseado desde el frontend
    const fechaInicial = new Date(fechaInicio);
    const fechaFinal = new Date(fechaFin);

    // Establecer la hora para la fecha final como 23:59:59 para incluir todo el día
    fechaFinal.setHours(23, 59, 59);

    // Consulta SQL para obtener los registros en el rango de fechas
    const query = `
      

    SELECT IdSalida, NombreProducto, NombreCliente, Cantidad, TotalDineroIngresado, FechaSalida
    FROM Salidas
      WHERE FechaSalida >= @fechaInicial AND FechaSalida <= @fechaFinal;
    `;

    // Crear un objeto de solicitud
    const request = new sql.Request();

    // Establecer los valores de los parámetros utilizando el método input() y value()
    request.input("fechaInicial", sql.DateTime, fechaInicial);
    request.input("fechaFinal", sql.DateTime, fechaFinal);

    // Ejecutar la consulta utilizando el objeto de solicitud
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    // Maneja el error en caso de que ocurra
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error en el servidor" });
  } finally {
    // Cierra la conexión a la base de datos dentro del bloque finally
    if (sql.connected) {
      sql.close();
    }
  }
});
app.post("/api/reporte-compras", async (req, res) => {
  console.log("Solicitud de reporte de compra recibida");
  const { fechaInicio, fechaFin } = req.body;

  console.log("Fecha de inicio recibida:", fechaInicio);
  console.log("Fecha de fin recibida:", fechaFin);

  try {
    // Crea una nueva instancia de la conexión a la base de datos
    await sql.connect(dbConfig);

    // Obtener las fechas inicial y final del rango deseado desde el frontend
    const fechaInicial = new Date(fechaInicio);
    const fechaFinal = new Date(fechaFin);

    // Establecer la hora para la fecha final como 23:59:59 para incluir todo el día
    fechaFinal.setHours(23, 59, 59);

    // Consulta SQL para obtener los registros en el rango de fechas
    const query = `
	  SELECT IdEntrada, NombreProducto, NombreProveedor, Cantidad, TotalDineroGastado, FechaEntrada
    FROM Entradas
      WHERE FechaEntrada >= @fechaInicial AND FechaEntrada <= @fechaFinal;
    `;

    // Crear un objeto de solicitud
    const request = new sql.Request();

    // Establecer los valores de los parámetros utilizando el método input() y value()
    request.input("fechaInicial", sql.DateTime, fechaInicial);
    request.input("fechaFinal", sql.DateTime, fechaFinal);

    // Ejecutar la consulta utilizando el objeto de solicitud
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    // Maneja el error en caso de que ocurra
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error en el servidor" });
  } finally {
    // Cierra la conexión a la base de datos dentro del bloque finally
    if (sql.connected) {
      sql.close();
    }
  }
});

// Eliminar compras
app.delete("/api/EliminarEntrada/:id", async (req, res) => {
  const entradaId = req.params.id;

  if (!entradaId) {
    return res
      .status(400)
      .json({ mensaje: "Se requiere proporcionar el ID de la entrada" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Verificar si la entrada existe antes de eliminarla
    const verificarQuery = `SELECT IdEntrada, NombreProducto, Cantidad FROM Entradas WHERE IdEntrada = ${entradaId}`;
    const verificarResult = await pool.request().query(verificarQuery);

    if (verificarResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: "La entrada no existe" });
    }

    // Obtener los datos de la entrada eliminada
    const { IdEntrada, NombreProducto, Cantidad } =
      verificarResult.recordset[0];

    // Obtener el producto asociado a la entrada eliminada
    const productoQuery = `SELECT IdProducto, Stock FROM Productos WHERE Nombre = '${NombreProducto}'`;
    const productoResult = await pool.request().query(productoQuery);

    if (productoResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: "El producto no existe" });
    }

    // Eliminar la entrada de la base de datos
    const eliminarQuery = `DELETE FROM Entradas WHERE IdEntrada = ${entradaId}`;
    await pool.request().query(eliminarQuery);

    // Actualizar el stock del producto
    const productoId = productoResult.recordset[0].IdProducto;
    const stockActual = productoResult.recordset[0].Stock;
    const nuevoStock = stockActual - Cantidad;

    const actualizarStockQuery = `UPDATE Productos SET Stock = ${nuevoStock} WHERE IdProducto = ${productoId}`;
    await pool.request().query(actualizarStockQuery);

    // Obtener la lista actualizada de entradas
    const entradasQuery = "SELECT * FROM Entradas";
    const entradasResult = await pool.request().query(entradasQuery);
    const entradas = entradasResult.recordset;

    res
      .status(200)
      .json({ mensaje: "La compra ha sido eliminada exitosamente", entradas });
  } catch (error) {
    console.error("Error al eliminar la entrada:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

// Eliminar Ventas
app.delete("/api/EliminarSalida/:id", async (req, res) => {
  const salidaId = req.params.id;

  if (!salidaId) {
    return res
      .status(400)
      .json({ mensaje: "Se requiere proporcionar el ID de la venta" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Verificar si la venta existe antes de eliminarla
    const verificarQuery = `SELECT IdSalida, NombreProducto, Cantidad FROM Salidas WHERE IdSalida = ${salidaId}`;
    const verificarResult = await pool.request().query(verificarQuery);

    if (verificarResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: "La venta no existe" });
    }

    // Obtener los datos de la venta eliminada
    const { IdSalida, NombreProducto, Cantidad } = verificarResult.recordset[0];

    // Obtener el producto asociado a la venta eliminada
    const productoQuery = `SELECT IdProducto, Stock FROM Productos WHERE Nombre = '${NombreProducto}'`;
    const productoResult = await pool.request().query(productoQuery);

    if (productoResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: "El producto no existe" });
    }

    // Eliminar la venta de la base de datos
    const eliminarQuery = `DELETE FROM Salidas WHERE IdSalida = ${salidaId}`;
    await pool.request().query(eliminarQuery);

    // Actualizar el stock del producto
    const productoId = productoResult.recordset[0].IdProducto;
    const stockActual = productoResult.recordset[0].Stock;
    const nuevoStock = stockActual + Cantidad; // Se regresa la cantidad al stock

    const actualizarStockQuery = `UPDATE Productos SET Stock = ${nuevoStock} WHERE IdProducto = ${productoId}`;
    await pool.request().query(actualizarStockQuery);

    // Obtener la lista actualizada de ventas
    const salidasQuery = "SELECT * FROM Salidas";
    const salidasResult = await pool.request().query(salidasQuery);
    const salidas = salidasResult.recordset;

    res
      .status(200)
      .json({ mensaje: "La venta ha sido eliminada exitosamente", salidas });
  } catch (error) {
    console.error("Error al eliminar la salida:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
