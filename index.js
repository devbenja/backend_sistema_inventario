const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
const port = 5000;

// Configuración de conexión a SQL Server
const dbConfig = {
  server: "localhost",
  database: "prueba2",
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
//!
app.get("/api/UnidadesMedida", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM UnidadesDeMedida");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener elementos:", error);
    res.status(500).send("Error del servidor");
  }
});
app.get("/api/TiposTransaccion", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query(
        "SELECT Id, Nombre FROM TiposDeTransaccion WHERE Nombre <> 'Compra'"
      );
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
  const { nombreProducto, descripcion, precioCompra, precioVenta } = req.body;

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

app.post("/api/DeleteProducto", (req, res) => {
  const { id } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }
    const insertQuery = `DELETE FROM Productos WHERE IdProducto = ${id}`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Producto eliminado correctamente" });
      console.log(`Producto con id ${id}, eliminado correctamente`);
    });
  });
});

app.put("/api/ActualizarProducto/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del producto de los parámetros de la solicitud
    const { nombreProducto, descrip, precioCompra, precioVenta } = req.body; // Obtener los nuevos valores del producto de la solicitud

    const pool = await sql.connect(dbConfig);

    // Obtener los datos actuales del cliente desde la base de datos
    const queryProducto =
      "SELECT * FROM Productos WHERE IdProducto = @IdProducto";
    const resultProducto = await pool
      .request()
      .input("IdProducto", id)
      .query(queryProducto);
    const productoActual = resultProducto.recordset[0];

    // Verificar si los campos están vacíos y usar los valores actuales en su lugar
    const nombreActual = nombreProducto || productoActual.Nombre;
    const descripActual = descrip || productoActual.Descripcion;
    const precioCompraActual = precioCompra || productoActual.PrecioCompra;
    const precioVentaActual = precioVenta || productoActual.PrecioVenta;

    // Actualizar el cliente en la base de datos
    const queryActualizar =
      "UPDATE Productos SET Nombre = @Nombre, Descripcion = @Descripcion, PrecioCompra = @PrecioCompra , PrecioVenta = @PrecioVenta WHERE IdProducto = @IdProducto";
    const resultActualizar = await pool
      .request()
      .input("IdProducto", id)
      .input("Nombre", nombreActual)
      .input("Descripcion", descripActual)
      .input("PrecioCompra", precioCompraActual)
      .input("PrecioVenta", precioVentaActual)
      .query(queryActualizar);

    res.json({ message: `Producto actualizado correctamente` });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).send("Error del servidor");
  }
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

// PROCEDIMIENTOS

app.post("/api/GenerarEntrada", async (req, res) => {
  const compras = req.body.productosEnVenta;
  const totalVenta = req.body.total;
  const totalPagado = req.body.totalPagado;
  const vuelto = req.body.vuelto;
  // const tipoTransaccion = req.body.tipoTransaccion;
  // const UnidadMedida = req.body.unidadMedida;

  try {
    // Crear una nueva instancia de conexión a la base de datos
    const connection = await sql.connect(dbConfig);
    // Agregar logs para verificar los datos del frontend
    // console.log("compras:", compras);
    // console.log("total Pagado:", totalPagado);
    // console.log("Cambio:", vuelto);

    const table = new sql.Table("ComprasType");
    table.create = true;
    table.columns.add("NombreProducto", sql.NVarChar(100), { nullable: false });
    table.columns.add("NombreProveedor", sql.NVarChar(100), {
      nullable: false,
    });
    table.columns.add("Cantidad", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Precio", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Descuento", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("IVA", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Subtotal", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Total", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("TotalPagado", sql.Decimal(10, 2), { nullable: false }); // Agregar la columna TotalPagado
    table.columns.add("Vuelto", sql.Decimal(10, 2), { nullable: false }); // Agregar la columna Vuelto
    table.columns.add("UnidadDeMedida", sql.NVarChar(100), {
      nullable: false,
    }); // Agrega la columna UnidadDeMedidaID
    table.columns.add("TipoTransaccion", sql.NVarChar(100), {
      nullable: false,
    }); // Agrega la columna TipoTransaccionID

    compras.forEach((compra) => {
      table.rows.add(
        compra.nombre,
        req.body.nombreProveedor,
        compra.cantidad,
        compra.precio,
        compra.descuento,
        compra.iva,
        compra.subtotal,
        compra.total,
        req.body.totalPagado,
        req.body.vuelto,
        compra.UnidadDeMedida, // Agrega unidad de medida

        compra.tipoTransaccion // Agrega tipo de transacción
      );
    });

    const request = connection.request();
    request.input("Compras", table);
    request.input("TotalPagado", totalPagado);
    request.input("Vuelto", vuelto);
    // request.input("UnidadDeMedida", sql.NVarChar(100), UnidadMedida); // Reemplaza "Cajas" con el valor real desde tu objeto de ventas
    // request.input("TipoTransaccion", sql.NVarChar(100), tipoTransaccion); // Reemplaza "Venta" con el valor real desde tu objeto de ventas
    const result = await request.execute("RegistrarCompra");

    connection.close();

    res.status(201).json({ mensaje: "Compra registrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar la venta" });
  }
});

app.get("/api/Entradas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Compras");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Entradas:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/GenerarSalida", async (req, res) => {
  const ventas = req.body.productosEnVenta;
  const totalVenta = req.body.total;
  const totalPagado = req.body.totalPagado;
  const vuelto = req.body.vuelto;
  // const tipoTransaccion = req.body.tipoTransaccion;
  // const UnidadMedida = req.body.unidadMedida;

  try {
    // Crear una nueva instancia de conexión a la base de datos
    const connection = await sql.connect(dbConfig);
    // Agregar logs para verificar los datos del frontend
    // console.log("Ventas:", ventas);
    // console.log("total Pagado:", totalPagado);
    // console.log("Cambio:", vuelto);
    // console.log("tipo de venta", tipoTransaccion);

    const table = new sql.Table("VentasType");
    table.create = true;
    table.columns.add("NombreProducto", sql.NVarChar(100), { nullable: false });
    table.columns.add("NombreCliente", sql.NVarChar(100), { nullable: false });
    table.columns.add("Cantidad", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Precio", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Descuento", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("IVA", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Subtotal", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("Total", sql.Decimal(10, 2), { nullable: false });
    table.columns.add("TotalPagado", sql.Decimal(10, 2), { nullable: false }); // Agregar la columna TotalPagado
    table.columns.add("Vuelto", sql.Decimal(10, 2), { nullable: false }); // Agregar la columna Vuelto
    table.columns.add("UnidadDeMedida", sql.NVarChar(100), {
      nullable: false,
    }); // Agrega la columna UnidadDeMedidaID
    table.columns.add("TipoTransaccion", sql.NVarChar(100), {
      nullable: false,
    }); // Agrega la columna TipoTransaccionID

    ventas.forEach((venta) => {
      // console.log("Unidad de Medida existe?:", venta.UnidadDeMedida); // Agrega este log
      table.rows.add(
        venta.nombre,
        req.body.nombreCliente,
        venta.cantidad,
        venta.precio,
        venta.descuento,
        venta.iva,
        venta.subtotal,
        venta.total,
        req.body.totalPagado,
        req.body.vuelto,
        venta.UnidadDeMedida, // Agrega unidad de medida

        venta.tipoTransaccion // Agrega tipo de transacción
      );
    });

    const request = connection.request();
    request.input("Ventas", table);
    request.input("TotalPagado", totalPagado);
    request.input("Vuelto", vuelto);
    // request.input("UnidadDeMedida", sql.NVarChar(100), UnidadMedida); // Reemplaza "Cajas" con el valor real desde tu objeto de ventas
    // request.input("TipoTransaccion", sql.NVarChar(100), tipoTransaccion); // Reemplaza "Venta" con el valor real desde tu objeto de ventas

    const result = await request.execute("RegistrarSalida33");

    connection.close();

    res.status(201).json({ mensaje: "Venta registrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar la venta" });
  }
});

app.get("/api/Salidas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Ventas");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Entradas:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/ClientesConTotalGastado", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const query = `
      SELECT
        C.IdCliente,
        C.NombreCliente,
        C.TelefonoCliente,
        C.CorreoCliente,
        C.DireccionCliente,
        ISNULL(SUM(V.Total), 0) AS TotalGastado
      FROM
        Clientes C
      LEFT JOIN
        Ventas V ON C.NombreCliente = V.Cliente
      GROUP BY
        C.IdCliente,
        C.NombreCliente,
        C.TelefonoCliente,
        C.CorreoCliente,
        C.DireccionCliente
      ORDER BY
        TotalGastado DESC;
    `;

    const result = await pool.request().query(query);
    res.send(result.recordset);
    // console.log(query);
  } catch (error) {
    console.error(
      "Error al obtener la lista de clientes con total gastado:",
      error
    );
    res.status(500).send("Error del servidor");
  }
});
app.get("/api/ProveedoresConTotalGastado", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const query = `
      SELECT
        P.IdProveedor,
        P.NombreProveedor,
        P.TelefonoProveedor,
        P.DireccionProveedor,
        P.CorreoProveedor,
        P.Pais,
        ISNULL(SUM(CM.Total), 0) AS TotalGastado
      FROM
        Proveedores P
      LEFT JOIN
        Compras CM ON P.NombreProveedor = CM.Proveedor
      GROUP BY
        P.IdProveedor,
        P.NombreProveedor,
        P.TelefonoProveedor,
        P.DireccionProveedor,
        P.CorreoProveedor,
        P.Pais
      ORDER BY
        TotalGastado DESC;
    `;

    const result = await pool.request().query(query);
    res.send(result.recordset);
  } catch (error) {
    console.error(
      "Error al obtener la lista de proveedores con total gastado:",
      error
    );
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
      .query("SELECT COUNT(*) AS TotalSalidas FROM Ventas;");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener total de Ventas:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/reporte-ventas", async (req, res) => {
  //   console.log("Solicitud de reporte de ventas recibida");
  const { fechaInicio, fechaFin } = req.body;

  // console.log("Fecha de inicio recibida:", fechaInicio);
  // console.log("Fecha de fin recibida:", fechaFin);

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
      

    SELECT Codigo, Fecha, Cliente, Vendedor, Total 
    FROM Ventas
      WHERE Fecha >= @fechaInicial AND Fecha <= @fechaFinal;
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
  //   console.log("Solicitud de reporte de ventas recibida");
  const { fechaInicio, fechaFin } = req.body;

  // console.log("Fecha de inicio recibida:", fechaInicio);
  // console.log("Fecha de fin recibida:", fechaFin);

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
      

    SELECT Codigo, Fecha, Comprador, Proveedor, Total 
    FROM Compras
      WHERE Fecha >= @fechaInicial AND Fecha <= @fechaFinal;
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

// Endpoint para obtener los detalles de una venta específica
app.get("/api/DetallesVenta/:id", async (req, res) => {
  const ventaId = req.params.id;

  try {
    // Crear una nueva instancia de conexión a la base de datos
    const pool = await sql.connect(dbConfig);

    // Consulta SQL para obtener los detalles de la venta
    const result = await pool
      .request()
      .input("ventaId", sql.Int, ventaId)
      .query("SELECT * FROM DetalleVentas WHERE IdVenta = @ventaId");

    // Cerrar la conexión a la base de datos
    pool.close();

    // Enviar los datos de los detalles de la venta como respuesta
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los detalles de la venta:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener los detalles de la venta" });
  }
});

//! detalles compras
app.get("/api/DetallesCompra/:id", async (req, res) => {
  const compraId = req.params.id;

  try {
    // Crear una nueva instancia de conexión a la base de datos
    const pool = await sql.connect(dbConfig);

    // Consulta SQL para obtener los detalles de la venta
    const result = await pool
      .request()
      .input("compraId", sql.Int, compraId)
      .query("SELECT * FROM DetalleCompras WHERE IdCompra = @compraId");

    // Cerrar la conexión a la base de datos
    pool.close();

    // Enviar los datos de los detalles de la venta como respuesta
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener los detalles de la compra:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener los detalles de la compra" });
  }
});

//! stock
app.get("/api/VerificarStock/:nombreProducto", async (req, res) => {
  const nombreProducto = req.params.nombreProducto;

  try {
    // Crear una nueva instancia de conexión a la base de datos
    const connection = await sql.connect(dbConfig);

    // Consultar el stock del producto en la base de datos
    const result = await connection.query(
      `SELECT Stock FROM Productos WHERE Nombre = '${nombreProducto}'`
    );

    // Verificar si se encontró el producto en la base de datos
    if (result.recordset.length === 0) {
      res.status(404).json({ mensaje: "Producto no encontrado" });
      return;
    }

    // Obtener el stock del producto desde la consulta
    const stock = result.recordset[0].Stock;

    // Enviar el stock como respuesta
    res.json({ stock });

    // Cerrar la conexión a la base de datos
    connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener el stock del producto" });
  }
});

//!
app.get("/api/VerificarStockVenta/:nombreProducto", async (req, res) => {
  const nombreProducto = req.params.nombreProducto;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("NombreProducto", sql.NVarChar(100), nombreProducto)
      .query("SELECT Stock FROM Productos WHERE Nombre = @NombreProducto");

    if (result.recordset.length === 0) {
      // El producto no existe en la base de datos
      res.status(404).json({ mensaje: "El producto no existe" });
    } else {
      const stock = result.recordset[0].Stock;
      res.json({ stock });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener el stock del producto" });
  }
});
app.get("/api/VerificarStockCompra/:nombreProducto", async (req, res) => {
  const nombreProducto = req.params.nombreProducto;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("NombreProducto", sql.NVarChar(100), nombreProducto)
      .query("SELECT Stock FROM Productos WHERE Nombre = @NombreProducto");

    if (result.recordset.length === 0) {
      // El producto no existe en la base de datos
      res.status(404).json({ mensaje: "El producto no existe" });
    } else {
      const stock = result.recordset[0].Stock;
      res.json({ stock });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener el stock del producto" });
  }
});

//! funciona
// app.delete("/api/EliminarVenta/:ventaId", async (req, res) => {
//   const ventaId = req.params.ventaId;

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request().input("VentaId", sql.Int, ventaId).query(`
//       BEGIN TRANSACTION;
//       -- Obtener los detalles de la venta para devolver la cantidad al stock
//       DECLARE @Detalles AS dbo.VentasType;
//       INSERT INTO @Detalles (NombreProducto, Cantidad)
//       SELECT Producto, Cantidad
//       FROM DetalleVentas
//       WHERE IdVenta = @VentaId;

//       -- Eliminar la venta
//       DELETE FROM Ventas WHERE Codigo = @VentaId;
//       -- Eliminar los detalles de la venta
//       DELETE FROM DetalleVentas WHERE IdVenta = @VentaId;

//       -- Devolver la cantidad al stock
//       UPDATE Productos
//       SET Stock = Stock + d.Cantidad
//       FROM Productos p
//       JOIN @Detalles d ON p.Nombre = d.NombreProducto;

//       COMMIT TRANSACTION;
//     `);

//     res.sendStatus(200); // Enviar una respuesta 200 OK si todo fue exitoso
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ mensaje: "Error al eliminar la venta" });
//   }
// });

//!
// app.delete("/api/EliminarVenta/:ventaId", async (req, res) => {
//   const ventaId = req.params.ventaId;

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request().input("VentaId", sql.Int, ventaId).query(`
//       BEGIN TRANSACTION;
//       -- Obtener los detalles de la venta para devolver la cantidad al stock
//       DECLARE @Detalles AS dbo.VentasType;
//       INSERT INTO @Detalles (NombreProducto, Cantidad)
//       SELECT Producto, Cantidad
//       FROM DetalleVentas
//       WHERE IdVenta = @VentaId;

//       -- Eliminar la venta
//       DELETE FROM Ventas WHERE Codigo = @VentaId;
//       -- Eliminar los detalles de la venta
//       DELETE FROM DetalleVentas WHERE IdVenta = @VentaId;

//       -- Devolver la cantidad al stock de producto
//       UPDATE Productos
//       SET Stock = Stock + d.Cantidad
//       FROM Productos p
//       JOIN @Detalles d ON p.Nombre = d.NombreProducto;

//       -- Actualizar la cantidad de salida
//       UPDATE Inventario
//       SET CantidadSalida = CantidadSalida - (
//         SELECT SUM(Cantidad)
//         FROM @Detalles
//       );

//       -- Devolver la cantidad al stock de inventario
//       UPDATE Inventario
//       SET Stock = Stock + (
//         SELECT SUM(Cantidad)
//         FROM @Detalles
//       );

//       COMMIT TRANSACTION;
//     `);

//     res.sendStatus(200); // Enviar una respuesta 200 OK si todo fue exitoso
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ mensaje: "Error al eliminar la venta" });
//   }
// });

//!

app.delete("/api/EliminarVenta/:ventaId", async (req, res) => {
  const ventaId = req.params.ventaId;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().input("VentaId", sql.Int, ventaId).query(`
      BEGIN TRANSACTION;
      -- Obtener los detalles de la venta para devolver la cantidad al stock
      DECLARE @Detalles AS dbo.VentasType;
      INSERT INTO @Detalles (NombreProducto, Cantidad)
      SELECT Producto, Cantidad
      FROM DetalleVentas
      WHERE IdVenta = @VentaId;

      -- Eliminar la venta
      DELETE FROM Ventas WHERE Codigo = @VentaId;
      -- Eliminar los detalles de la venta
      DELETE FROM DetalleVentas WHERE IdVenta = @VentaId;

      -- Devolver la cantidad al stock de producto
      UPDATE Productos
      SET Stock = Stock + d.Cantidad
      FROM Productos p
      JOIN @Detalles d ON p.Nombre = d.NombreProducto;

      -- Actualizar la cantidad de salida solo para los productos en @Detalles
      UPDATE Inventario
      SET CantidadSalida = CantidadSalida - d.Cantidad
      FROM Inventario i
      JOIN @Detalles d ON i.Nombre = d.NombreProducto;

      -- Devolver la cantidad al stock de inventario
      UPDATE Inventario
      SET Stock = Stock + d.Cantidad
      FROM Inventario i
      JOIN @Detalles d ON i.Nombre = d.NombreProducto;

      COMMIT TRANSACTION;
    `);

    res.sendStatus(200); // Enviar una respuesta 200 OK si todo fue exitoso
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al eliminar la venta" });
  }
});

//! esta bueno, pero no actualiza la entrada

// app.delete("/api/EliminarCompra/:compraId", async (req, res) => {
//   const compraId = req.params.compraId;

//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request().input("CompraId", sql.Int, compraId).query(`
//       BEGIN TRANSACTION;
//       -- Obtener los detalles de la venta para devolver la cantidad al stock
//       DECLARE @Detalles AS dbo.ComprasType;
//       INSERT INTO @Detalles (NombreProducto, Cantidad)
//       SELECT Producto, Cantidad
//       FROM DetalleCompras
//       WHERE IdCompra = @CompraId;

//       -- Eliminar la compra
//       DELETE FROM Compras WHERE Codigo = @CompraId;
//       -- Eliminar los detalles de la venta
//       DELETE FROM DetalleCompras WHERE IdCompra = @CompraId;

//       -- Devolver la cantidad al stock
//       UPDATE Productos
//       SET Stock = Stock - d.Cantidad
//       FROM Productos p
//       JOIN @Detalles d ON p.Nombre = d.NombreProducto;

//       COMMIT TRANSACTION;
//     `);

//     res.sendStatus(200); // Enviar una respuesta 200 OK si todo fue exitoso
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ mensaje: "Error al eliminar la compra" });
//   }
// });
//! funciona god
app.delete("/api/EliminarCompra/:compraId", async (req, res) => {
  const compraId = req.params.compraId;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().input("CompraId", sql.Int, compraId).query(`
      BEGIN TRANSACTION;
      -- Obtener los detalles de la compra para devolver la cantidad al stock
      DECLARE @Detalles AS dbo.ComprasType;
      INSERT INTO @Detalles (NombreProducto, Cantidad)
      SELECT Producto, Cantidad
      FROM DetalleCompras
      WHERE IdCompra = @CompraId;

      -- Eliminar la compra
      DELETE FROM Compras WHERE Codigo = @CompraId;
      -- Eliminar los detalles de la compra
      DELETE FROM DetalleCompras WHERE IdCompra = @CompraId;

      -- Devolver la cantidad al stock del producto
      UPDATE Productos
      SET Stock = Stock - d.Cantidad
      FROM Productos p
      JOIN @Detalles d ON p.Nombre = d.NombreProducto;

      -- Devolver la cantidad al stock de inventario
      UPDATE Inventario
      SET Stock = Stock - d.Cantidad
      FROM Inventario i
      JOIN @Detalles d ON i.Nombre = d.NombreProducto;

      -- Actualizar la cantidad de entrada solo para los productos en @Detalles
      UPDATE Inventario
      SET CantidadEntrada = CantidadEntrada - d.Cantidad
      FROM Inventario i
      JOIN @Detalles d ON i.Nombre = d.NombreProducto;

      COMMIT TRANSACTION;
    `);

    res.sendStatus(200); // Enviar una respuesta 200 OK si todo fue exitoso
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al eliminar la compra" });
  }
});

app.get("/api/Inventario", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Inventario");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener Entradas:", error);
    res.status(500).send("Error del servidor");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
