const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
const port = 5000;

// Configuración de conexión a SQL Server
const dbConfig = {
  server: "localhost",
  database: "BDSINFA",
  user: "prueba",
  password: "123",
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

app.get("/api/Empleados", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Empleados");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener elementos:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/CrearEmpleado", (req, res) => {
  const {
    nombreEmpleado,
    telefonoEmpleado,
    correoEmpleado,
    direccionEmpleado,
  } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ mensaje: "Error interno del servidor 1 - Conexion la BD" });
    }
    const insertQuery = `INSERT INTO Empleados (NombreEmpleado, TelefonoEmpleado, CorreoEmpleado, DireccionEmpleado) VALUES ('${nombreEmpleado}', '${telefonoEmpleado}', '${correoEmpleado}', '${direccionEmpleado}')`;

    connection.request().query(insertQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res
          .status(500)
          .json({ mensaje: "Error interno del servidor 3" });
      }

      connection.close();
      res.status(201).json({ mensaje: "Empleado registrado correctamente" });
      // console.log(`Cliente: ${nombreCliente}, creado correctamente`);
    });
  });
});

app.put("/api/ActualizarEmpleados/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del cliente de los parámetros de la solicitud
    const {
      nombreEmpleado,
      telefonoEmpleado,
      correoEmpleado,
      direccionEmpleado,
    } = req.body; // Obtener los nuevos valores del cliente de la solicitud

    const pool = await sql.connect(dbConfig);

    // Obtener los datos actuales del cliente desde la base de datos
    const queryEmpleado =
      "SELECT * FROM Empleados WHERE IdEmpleado = @IdEmpleado";
    const resultEmpleado = await pool
      .request()
      .input("IdEmpleado", id)
      .query(queryEmpleado);
    const empleadoActual = resultEmpleado.recordset[0];

    // Verificar si los campos están vacíos y usar los valores actuales en su lugar
    const nombreActual = nombreEmpleado || empleadoActual.NombreEmpleado;
    const telefonoActual = telefonoEmpleado || empleadoActual.TelefonoEmpleado;
    const correoActual = correoEmpleado || empleadoActual.CorreoEmpleado;
    const direccionActual =
      direccionEmpleado || empleadoActual.DireccionEmpleado;

    // Actualizar el cliente en la base de datos
    const queryActualizar =
      "UPDATE Empleados SET NombreEmpleado = @NombreEmpleado, TelefonoEmpleado = @TelefonoEmpleado, CorreoEmpleado = @CorreoEmpleado, DireccionEmpleado = @DireccionEmpleado WHERE IdEmpleado = @IdEmpleado";
    const resultActualizar = await pool
      .request()
      .input("IdEmpleado", id)
      .input("NombreEmpleado", nombreActual)
      .input("TelefonoEmpleado", telefonoActual)
      .input("CorreoEmpleado", correoActual)
      .input("DireccionEmpleado", direccionActual)
      .query(queryActualizar);

    res.json({ message: `Empleado actualizado correctamente` });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/DeleteEmpleado", (req, res) => {
  const { id } = req.body;
  // console.log("el id es:" + id);

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }

    // Consultar si hay referencias en Ventas
    const checkReferencesQuery = `
 
  SELECT TOP 1 1
  FROM Ventas
  WHERE IdEmpleado = '${id}'
  UNION ALL
  SELECT TOP 1 1
  FROM Compras
  WHERE IdEmpleado = '${id}'
`;

    connection.request().query(checkReferencesQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje: "No se puede eliminar este empleado porque tiene registros.",
        });
      }

      // Si no hay referencias, proceder con la eliminación
      const deleteQuery = `DELETE FROM Empleados WHERE IdEmpleado = ${id}`;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el empleado" });
        }

        connection.close();
        res.status(201).json({ mensaje: "Empleado eliminado correctamente" });
        // console.log(`Cliente con id ${id}, eliminado correctamente`);
      });
    });
  });
});

// Crud categorias
app.get("/api/Categorias", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool.request().query("SELECT * FROM Categorias");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener categorias:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/CrearCategoria", (req, res) => {
  const { nombreCategoria } = req.body;
  // console.log(`la categoria es: ${nombreCategoria}`);

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ mensaje: "Error interno del servidor 1 - Conexion BD" });
    }

    // Verificar si el nombre ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM Categorias WHERE Nombre = @Nombre`;

    const request = connection.request();
    request.input("Nombre", sql.VarChar, nombreCategoria);

    request.query(checkQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({
          mensaje: "Error interno del servidor 2 - Verificación de nombre",
        });
      }

      if (result.recordset[0].count > 0) {
        // Si el nombre ya existe, enviar un mensaje de error
        connection.close();
        return res.status(400).json({ mensaje: "Esta categoria ya existe" });
      } else {
        // Si el nombre no existe, realizar la inserción
        const insertQuery = `INSERT INTO Categorias (Nombre) VALUES (@Nombre)`;

        const request = connection.request();
        request.input("Nombre", sql.VarChar, nombreCategoria);

        request.query(insertQuery, (err, result) => {
          if (err) {
            console.log(err);
            connection.close();
            return res
              .status(500)
              .json({ mensaje: "Error interno del servidor 3 - En el query" });
          }

          connection.close();
          res.status(201).json({ mensaje: "Categoria creada correctamente" });
          // console.log(`Categoria: ${nombreCategoria}, creada correctamente`);
        });
      }
    });
  });
});

// app.delete("/api/DeleteCategoria/:id", async (req, res) => {
//   const { id } = req.params;
//   // console.log("el id es: " + id);

//   try {
//     // Crear una nueva conexión
//     const connection = await sql.connect(dbConfig);

//     // Eliminar el proveedor directamente sin verificar referencias
//     const deleteQuery = `DELETE FROM Categorias WHERE IdCategoria = ${id}`;
//     await connection.query(deleteQuery);

//     await connection.close();
//     res.status(201).json({ mensaje: "Categoria eliminada correctamente" });
//   } catch (err) {
//     console.error("Error al eliminar la categoria:", err);
//     res.status(500).json({ mensaje: "Error interno del servidor" });
//   }
// });
app.delete("/api/DeleteCategoria/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await sql.connect(dbConfig);

    const deleteQuery = `DELETE FROM Categorias WHERE IdCategoria = ${id}`;
    await connection.query(deleteQuery);

    await connection.close();
    res.status(201).json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    if (error.number === 547) {
      // Error de conflicto de clave foránea
      return res.status(400).json({
        mensaje: "No se puede eliminar esta categoría porque existe registro.",
        referencia: true,
      });
    }

    console.error("Error al eliminar la categoria:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// app.delete("/api/DeleteCategoria/:nombre", (req, res) => {
//   const { nombre } = req.params;

//   const connection = new sql.ConnectionPool(dbConfig);

//   connection.connect((err) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
//     }

//     const checkReferencesQuery = `
//       SELECT TOP 1 1
//       FROM Productos
//       WHERE Categoria = '${nombre}'
//     `;

//     connection.request().query(checkReferencesQuery, (err, result) => {
//       if (err) {
//         console.log(err);
//         connection.close();
//         return res.status(500).json({ mensaje: "Error en el query" });
//       }

//       if (result.recordset.length > 0) {
//         connection.close();
//         return res.status(400).json({
//           mensaje:
//             "No se puede eliminar esta categoría porque existe registro.",
//           referencia: true,
//         });
//       }

//       const deleteQuery = `DELETE FROM Categorias WHERE Nombre = '${nombre}'`;

//       connection.request().query(deleteQuery, (err, result) => {
//         if (err) {
//           console.log(err);
//           connection.close();
//           return res
//             .status(500)
//             .json({ mensaje: "Error al eliminar la categoría" });
//         }

//         connection.close();
//         res.status(201).json({ mensaje: "Categoría eliminada correctamente" });
//       });
//     });
//   });
// });

// app.put("/api/EditCategoria/:id", async (req, res) => {
//   const { id } = req.params;
//   const { nombreCategoria } = req.body;

//   try {
//     // Crear una nueva conexión
//     const connection = await sql.connect(dbConfig);

//     // Consulta SQL para actualizar el nombre de la categoría
//     const updateQuery = `
//       UPDATE Categorias
//       SET Nombre = '${nombreCategoria}'
//       WHERE IdCategoria = ${id}
//     `;

//     // Ejecutar la consulta de actualización
//     await connection.query(updateQuery);

//     await connection.close();
//     res
//       .status(200)
//       .json({ mensaje: "Nombre de categoría actualizado correctamente" });
//   } catch (err) {
//     console.error("Error al editar el nombre de la categoría:", err);
//     res.status(500).json({ mensaje: "Error interno del servidor" });
//   }
// });

app.put("/api/EditCategoria/:id", async (req, res) => {
  const { id } = req.params;
  const { nombreCategoria } = req.body;

  try {
    // Crear una nueva conexión
    const connection = await sql.connect(dbConfig);

    // Consulta SQL para actualizar el nombre de la categoría
    const updateQuery = `
      UPDATE Categorias
      SET Nombre = '${nombreCategoria}'
      WHERE IdCategoria = ${id}
    `;

    // Ejecutar la consulta de actualización
    await connection.query(updateQuery);

    await connection.close();
    res
      .status(200)
      .json({ mensaje: "Nombre de categoría actualizado correctamente" });
  } catch (err) {
    if (err.number === 547) {
      // Error de conflicto de clave foránea
      return res.status(400).json({
        mensaje:
          "No se puede actualizar esta categoría porque existe registro asociado en la tabla Productos.",
        referencia: true,
      });
    }

    console.error("Error al editar el nombre de la categoría:", err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
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

app.get("/api/TiposEntrada", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query("SELECT Id, Nombre FROM TiposDeEntrada");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener elementos:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/TiposDeSalida", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query("SELECT Id, Nombre FROM TipoDeSalida");
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
      // console.log(`Cliente: ${nombreCliente}, creado correctamente`);
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

    // Consultar si hay referencias en Ventas
    const checkReferencesQuery = `
      SELECT TOP 1 1
      FROM Ventas
      WHERE IdCliente = ${id}
    `;

    connection.request().query(checkReferencesQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje:
            "No se puede eliminar este cliente porque tiene ventas asociadas.",
        });
      }

      // Si no hay referencias, proceder con la eliminación
      const deleteQuery = `DELETE FROM Clientes WHERE IdCliente = ${id}`;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el cliente" });
        }

        connection.close();
        res.status(201).json({ mensaje: "Cliente eliminado correctamente" });
        // console.log(`Cliente con id ${id}, eliminado correctamente`);
      });
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
      // console.log(`Cliente: ${nombreProveedor}, creado correctamente`);
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

    const checkReferencesQuery = `
      SELECT TOP 1 1
      FROM Compras
      WHERE IdProveedor = ${id}
    `;

    connection.request().query(checkReferencesQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res
          .status(500)
          .json({ mensaje: "Error en la consulta de referencias" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje:
            "No se puede eliminar este proveedor porque tiene registros.",
        });
      }

      const deleteQuery = `DELETE FROM Proveedores WHERE IdProveedor = ${id}`;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el proveedor" });
        }

        connection.close();
        res.status(201).json({ mensaje: "Proveedor eliminado correctamente" });
        // console.log(`Proveedor con id ${id}, eliminado correctamente`);
      });
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
  const {
    nombreProducto,
    descripcion,
    precioCompra,
    precioVenta,
    nombreCategoria,
    numeroSerie,
  } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectar a la BD" });
    }

    // Verificar si el producto ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM Productos WHERE Nombre = @nombreProducto`;

    const request = connection.request();
    request.input("nombreProducto", sql.VarChar, nombreProducto);

    request.query(checkQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({
          mensaje: "Error interno del servidor - Verificación de nombre",
        });
      }

      if (result.recordset[0].count > 0) {
        connection.close();
        return res.status(400).json({ mensaje: "Este producto ya existe" });
      }

      // Si el producto no existe, realizar la inserción
      const insertQuery = `
        INSERT INTO Productos (Nombre, Descripcion, PrecioCompra, PrecioVenta, Categoria, NumeroSerie)
        OUTPUT Inserted.IdProducto
        VALUES ('${nombreProducto}', '${descripcion}', '${precioCompra}', '${precioVenta}', '${nombreCategoria}', '${numeroSerie}')
      `;

      const request = connection.request();
      request.query(insertQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res.status(500).json({ mensaje: "Error en la petición" });
        }

        const productoId = result.recordset[0].IdProducto;

        // Insertar en la tabla de Inventario
        const insertInventarioQuery = `
          INSERT INTO Inventario (IDProducto, Nombre, Stock, CantidadEntrada, CantidadSalida, Fecha, NumeroSerie)
          SELECT ${productoId}, '${nombreProducto}', 0, 0, 0, GETDATE(),'${numeroSerie}'
        `;

        connection.request().query(insertInventarioQuery, (err, result) => {
          if (err) {
            console.log(err);
            connection.close();
            return res.status(500).json({ mensaje: "Error en la petición" });
          }

          connection.close();
          res.status(201).json({ mensaje: "Producto creado correctamente" });
        });
      });
    });
  });
});

app.get("/api/ValidarNumeroSerie/:numeroSerie", (req, res) => {
  const numeroSerie = req.params.numeroSerie;

  // Conectarte a la base de datos y realizar la validación
  const connection = new sql.ConnectionPool(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectar a la BD" });
    }

    const query = `SELECT COUNT(*) AS count FROM Productos WHERE NumeroSerie = '${numeroSerie}'`;
    connection.request().query(query, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en la validación" });
      }

      const count = result.recordset[0].count;

      connection.close();
      res.json({ existe: count > 0 });
    });
  });
});

app.post("/api/DeleteProducto", (req, res) => {
  const { numeroSerie } = req.body;
  // console.log(`ID del producto a eliminar: ${numeroSerie}`);

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }

    const checkConditionsQuery = `
      SELECT TOP 1 1
      FROM Inventario
      WHERE NumeroSerie = '${numeroSerie}'
        AND (Stock <> 0 OR CantidadEntrada <> 0 OR CantidadSalida <> 0)
      `;

    connection.request().query(checkConditionsQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje:
            "El producto contiene datos en stock, entrada o salida y no puede ser eliminado.",
        });
      }

      const deleteQuery = `
        BEGIN TRANSACTION;

        DELETE FROM Inventario
        WHERE NumeroSerie = '${numeroSerie}'
          AND Stock = 0
          AND CantidadEntrada = 0
          AND CantidadSalida = 0;

        DELETE FROM Productos
        WHERE NumeroSerie = '${numeroSerie}';

        COMMIT TRANSACTION;
        `;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el producto" });
        }

        connection.close();
        res.status(201).json({ mensaje: "Producto eliminado correctamente" });
        // console.log(`Producto con id ${numeroSerie}, eliminado correctamente`);
      });
    });
  });
});

app.put("/api/ActualizarProducto/:numeroSerie", async (req, res) => {
  try {
    const { numeroSerie } = req.body; // Obtener el número de serie del producto de los parámetros de la solicitud
    const { nombreProducto, descrip, precioCompra, precioVenta, categoria } =
      req.body; // Obtener los nuevos valores del producto de la solicitud

    console.log("Número de Serie:", numeroSerie);
    console.log("Nombre Producto:", nombreProducto);
    console.log("Descripción:", descrip);
    console.log("Precio Compra:", precioCompra);
    console.log("Precio Venta:", precioVenta);
    console.log("Nueva Categoría:", categoria);
    const pool = await sql.connect(dbConfig);

    // Verificar si se proporciona una nueva categoría y actualizarla si es necesario
    if (categoria) {
      const queryActualizarCategoria =
        "UPDATE Productos SET Categoria = @categoria WHERE NumeroSerie = @NumeroSerie";
      await pool
        .request()
        .input("Categoria", categoria)
        .input("NumeroSerie", numeroSerie)
        .query(queryActualizarCategoria);
    }

    // Verificar si se proporciona un nuevo nombre y actualizarlo si es necesario
    if (nombreProducto) {
      const queryActualizarNombre =
        "UPDATE Inventario SET Nombre = @NuevoNombre WHERE NumeroSerie = @NumeroSerie";
      await pool
        .request()
        .input("NuevoNombre", nombreProducto)
        .input("NumeroSerie", numeroSerie)
        .query(queryActualizarNombre);
    }

    // Actualizar los demás campos del producto en la base de datos
    const queryActualizar =
      "UPDATE Productos SET Nombre = @Nombre, Descripcion = @Descripcion, PrecioCompra = @PrecioCompra , PrecioVenta = @PrecioVenta WHERE NumeroSerie = @NumeroSerie";
    await pool
      .request()
      .input("NumeroSerie", numeroSerie)
      .input("Nombre", nombreProducto)
      .input("Descripcion", descrip)
      .input("PrecioCompra", precioCompra)
      .input("PrecioVenta", precioVenta)
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
  const idProveedor = req.body.idProveedor;
  const idEmpleado = req.body.idEmpleado;
  // const tipoTransaccion = req.body.tipoTransaccion;
  // const UnidadMedida = req.body.unidadMedida;
  // console.log("compras:", compras);
  // console.log("id del empleado:", idEmpleado);

  // console.log("nombreEmpleado desde el body:", req.body.nombreEmpleado);
  // console.log("idEmpleado desde el body:", req.body.idEmpleado);

  try {
    // Crear una nueva instancia de conexión a la base de datos
    const connection = await sql.connect(dbConfig);
    // Agregar logs para verificar los datos del frontend
    // console.log("total Pagado:", totalPagado);
    // console.log("Cambio:", vuelto);
    // console.log(`Id del proveedor: ${idProveedor}`);

    const table = new sql.Table("ComprasType");
    table.create = true;
    table.columns.add("NombreProducto", sql.NVarChar(100), { nullable: false });
    table.columns.add("NombreEmpleado", sql.NVarChar(100), {
      nullable: false,
    });
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
    table.columns.add("TipoEntrada", sql.NVarChar(100), {
      nullable: false,
    }); // Agrega la columna TipoTransaccionID
    table.columns.add("IdProveedor", sql.Int, { nullable: false });
    table.columns.add("IdEmpleado", sql.Int, { nullable: false });

    compras.forEach((compra) => {
      table.rows.add(
        compra.nombre,
        req.body.nombreEmpleado,
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

        compra.tipoEntrada, // Agrega tipo de transacción
        req.body.idProveedor,
        req.body.idEmpleado
      );
    });

    const request = connection.request();
    request.input("Compras", table);
    request.input("TotalPagado", totalPagado);
    request.input("Vuelto", vuelto);
    request.input("IdProveedor", idProveedor);
    request.input("IdEmpleado", idEmpleado);
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
  const idCliente = req.body.idCliente;
  const idEmpleado = req.body.idEmpleado;
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
    // console.log(`el id del cliente es:${idEmpleado}`);

    const table = new sql.Table("VentasType");
    table.create = true;
    table.columns.add("NombreProducto", sql.NVarChar(100), { nullable: false });
    table.columns.add("NombreCliente", sql.NVarChar(100), { nullable: false });
    table.columns.add("NombreEmpleado", sql.NVarChar(100), { nullable: false });
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
    table.columns.add("IdCliente", sql.Int, { nullable: false }); // Agregar el campo IdCliente
    table.columns.add("IdEmpleado", sql.Int, { nullable: false });
    ventas.forEach((venta) => {
      // console.log("Unidad de Medida existe?:", venta.UnidadDeMedida); // Agrega este log
      table.rows.add(
        venta.nombre,
        req.body.nombreCliente,
        req.body.nombreEmpleado,
        venta.cantidad,
        venta.precio,
        venta.descuento,
        venta.iva,
        venta.subtotal,
        venta.total,
        req.body.totalPagado,
        req.body.vuelto,
        venta.UnidadDeMedida, // Agrega unidad de medida

        venta.tipoTransaccion, // Agrega tipo de transacción
        req.body.idCliente,
        req.body.idEmpleado
      );
    });

    const request = connection.request();
    request.input("Ventas", table);
    request.input("TotalPagado", totalPagado);
    request.input("Vuelto", vuelto);
    request.input("IdCliente", idCliente);
    request.input("IdEmpleado", idEmpleado);
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

app.get("/api/CantidadProveedores", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    // Realizamos la consulta para obtener todos los clientes
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS TotalProveedores FROM Proveedores;");
    // El response va contener todos los datos que se obtuvieron de la BD
    res.send(result.recordset);
  } catch (error) {
    // Caso contrario nos manda el error del porque no se puede
    console.error("Error al obtener total de proveedores:", error);
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
      

    SELECT Codigo, Fecha, Cliente, Empleado, Total 
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
      

    SELECT Codigo, Fecha, Empleado, Proveedor, Total 
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

// CRUD UNIDADES DE MEDIDA

app.get("/api/UnidadesDeMedida", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query("SELECT * FROM UnidadesDeMedida");

    res.send(result.recordset);
  } catch (error) {
    console.error("Error al obtener Unidades de Medida:", error);
    res.status(500).send("Error del servidor");
  }
});

app.post("/api/CrearUnidadDeMedida", (req, res) => {
  const { nombreUnidad } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ mensaje: "Error interno del servidor 1 - Conexion BD" });
    }

    // Verificar si el nombre ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM UnidadesDeMedida WHERE Nombre = @nombreUnidad`;

    const request = connection.request();
    request.input("nombreUnidad", sql.VarChar, nombreUnidad);

    request.query(checkQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({
          mensaje: "Error interno del servidor 2 - Verificación de nombre",
        });
      }

      if (result.recordset[0].count > 0) {
        // Si el nombre ya existe, enviar un mensaje de error
        connection.close();
        return res
          .status(400)
          .json({ mensaje: "Esta Unidad de medida ya existe" });
      } else {
        // Si el nombre no existe, realizar la inserción
        const insertQuery = `INSERT INTO UnidadesDeMedida (Nombre) VALUES (@nombreUnidad)`;

        const request = connection.request();
        request.input("nombreUnidad", sql.VarChar, nombreUnidad);

        request.query(insertQuery, (err, result) => {
          if (err) {
            console.log(err);
            connection.close();
            return res
              .status(500)
              .json({ mensaje: "Error interno del servidor 3 - En el query" });
          }

          connection.close();
          res
            .status(201)
            .json({ mensaje: "Unidad de Medida creada correctamente" });
          console.log(
            `Unidad de medida: ${nombreUnidad}, creada correctamente`
          );
        });
      }
    });
  });
});

app.delete("/api/DeleteUnidadDeMedida/:nombre", (req, res) => {
  const { nombre } = req.params;
  console.log(nombre);

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }

    const checkReferencesQuery = `
      SELECT TOP 1 1
      FROM DetalleVentas
      WHERE UnidadDeMedida = '${nombre}'
      UNION ALL
      SELECT TOP 1 1
      FROM DetalleCompras
      WHERE UnidadDeMedida = '${nombre}'
    `;

    connection.request().query(checkReferencesQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje:
            "No se puede eliminar esta unidad de medida porque está referenciada en DetalleVentas o DetalleCompras.",
        });
      }

      const deleteQuery = `DELETE FROM UnidadesDeMedida WHERE Nombre = '${nombre}'`;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar la unidad de medida" });
        }

        connection.close();
        res
          .status(201)
          .json({ mensaje: "Unidad de medida eliminada correctamente" });
      });
    });
  });
});

app.put("/api/ActualizarUnidadDeMedida/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreUnidad } = req.body;

    const pool = await sql.connect(dbConfig);

    const queryMedida = "SELECT * FROM UnidadesDeMedida WHERE ID = @ID";
    const resultMedida = await pool
      .request()
      .input("ID", id)
      .query(queryMedida);
    const medidaActual = resultMedida.recordset[0];

    const nombreActual = nombreUnidad || medidaActual.Nombre;

    const queryActualizar =
      "UPDATE UnidadesDeMedida SET Nombre = @Nombre WHERE ID = @ID";
    const resultActualizar = await pool
      .request()
      .input("ID", id)
      .input("Nombre", nombreActual)
      .query(queryActualizar);

    res.json({ message: "Medida actualizada correctamente" });
  } catch (error) {
    // Verificar si el error es debido a una restricción de clave foránea
    if (error.number === 547) {
      // Restricción de clave foránea violada
      return res.status(400).json({
        mensaje:
          "No se puede actualizar la medida porque está siendo referenciada en DetalleCompras o DetalleVentas.",
      });
    } else {
      // Otro tipo de error
      console.error("Error al actualizar la medida:", error);
      return res.status(500).send("Error del servidor");
    }
  }
});

// CRUD TIPO DE ENTRADA Y SALIDA

//!
app.post("/api/CrearTipoDeEntrada", (req, res) => {
  const { nombreTransaccion } = req.body;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ mensaje: "Error interno del servidor 1 - Conexion BD" });
    }

    // Verificar si el nombre ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM TiposDeEntrada WHERE Nombre = @nombreTransaccion`;

    const request = connection.request();
    request.input("nombreTransaccion", sql.VarChar, nombreTransaccion);

    request.query(checkQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({
          mensaje: "Error interno del servidor 2 - Verificación de nombre",
        });
      }

      if (result.recordset[0].count > 0) {
        connection.close();
        return res
          .status(400)
          .json({ mensaje: "Este tipo de Transacción ya existe" });
      }

      // Si el nombre no existe, realizar la inserción
      const insertQuery = `INSERT INTO TiposDeEntrada (Nombre) VALUES (@nombreTransaccion)`;

      const request = connection.request();
      request.input("nombreTransaccion", sql.VarChar, nombreTransaccion);

      request.query(insertQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error interno del servidor 3 - En el query" });
        }

        connection.close();
        res
          .status(201)
          .json({ mensaje: "Tipo de entrada creada correctamente" });
        // console.log(
        //   `Tipo de transaccion: ${nombreTransaccion}, creada correctamente`
        // );
      });
    });
  });
});

//!
// app.put("/api/ActualizarTiposDeEntrada/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { nombreTransaccion } = req.body;
//     // console.log(`veremos ${nombreTransaccion}`);

//     const pool = await sql.connect(dbConfig);

//     const queryTipoDeTransaccion =
//       "SELECT * FROM TiposDeEntrada WHERE ID = @ID";
//     const resultTipoDeTransaccion = await pool
//       .request()
//       .input("ID", id)
//       .query(queryTipoDeTransaccion);
//     const transaccionActual = resultTipoDeTransaccion.recordset[0];

//     const nombreActual = nombreTransaccion || transaccionActual.Nombre;

//     const queryActualizar =
//       "UPDATE TiposDeEntrada SET Nombre = @Nombre WHERE ID = @ID";
//     const resultActualizar = await pool
//       .request()
//       .input("ID", id)
//       .input("Nombre", nombreActual)
//       .query(queryActualizar);

//     res.json({ message: "Tipo De Entrada actualizada correctamente" });
//   } catch (error) {
//     // Verificar si el error es debido a una restricción de clave foránea
//     if (error.number === 547) {
//       // Restricción de clave foránea violada
//       return res.status(400).json({
//         mensaje:
//           "No se puede actualizar el tipo de Entrada porque existe registros.",
//       });
//     } else {
//       // Otro tipo de error
//       console.error("Error al actualizar el tipo de entrada:", error);
//       return res.status(500).send("Error del servidor");
//     }
//   }
// });
app.put("/api/ActualizarTiposDeEntrada/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreTransaccion } = req.body;

    const pool = await sql.connect(dbConfig);

    // Verificar si el nuevo nombre ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM TiposDeEntrada WHERE Nombre = @nombreTransaccion AND ID <> @ID`;

    const checkResult = await pool
      .request()
      .input("nombreTransaccion", sql.VarChar, nombreTransaccion)
      .input("ID", id)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({
        mensaje: "Este tipo de Transacción ya existe",
      });
    }

    // Continuar con la actualización si el nombre no existe
    const queryActualizar =
      "UPDATE TiposDeEntrada SET Nombre = @Nombre WHERE ID = @ID";
    const resultActualizar = await pool
      .request()
      .input("ID", id)
      .input("Nombre", nombreTransaccion)
      .query(queryActualizar);

    res.json({ message: "Tipo De Entrada actualizada correctamente" });
  } catch (error) {
    if (error.number === 547) {
      return res.status(400).json({
        mensaje:
          "No se puede actualizar el tipo de Entrada porque existen registros asociados.",
      });
    } else {
      console.error("Error al actualizar el tipo de entrada:", error);
      return res.status(500).send("Error del servidor");
    }
  }
});

app.delete("/api/DeleteTipoDeEntrada/:nombre", (req, res) => {
  const { nombre } = req.params;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }

    const checkReferencesQuery = `
      SELECT TOP 1 1
      FROM DetalleCompras
      WHERE TipoEntrada = '${nombre}'
    `;

    connection.request().query(checkReferencesQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje:
            "No se puede eliminar este tipo de entrada porque existen registros.",
        });
      }

      const deleteQuery = `DELETE FROM TiposDeEntrada WHERE Nombre = '${nombre}'`;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el tipo de entrada" });
        }

        connection.close();
        res
          .status(201)
          .json({ mensaje: "Tipo de entrada eliminada correctamente" });
      });
    });
  });
});

app.post("/api/CrearTipoDeSalida", (req, res) => {
  const { nombreTransaccion } = req.body;
  // console.log(nombreTransaccion);

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ mensaje: "Error interno del servidor 1 - Conexion BD" });
    }

    // Verificar si el nombre ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM TipoDeSalida WHERE Nombre = @nombreTransaccion`;

    const request = connection.request();
    request.input("nombreTransaccion", sql.VarChar, nombreTransaccion);

    request.query(checkQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({
          mensaje: "Error interno del servidor 2 - Verificación de nombre",
        });
      }

      if (result.recordset[0].count > 0) {
        connection.close();
        return res
          .status(400)
          .json({ mensaje: "Este tipo de Salida ya existe" });
      }

      // Si el nombre no existe, realizar la inserción
      const insertQuery = `INSERT INTO TipoDeSalida (Nombre) VALUES (@nombreTransaccion)`;

      const request = connection.request();
      request.input("nombreTransaccion", sql.VarChar, nombreTransaccion);

      request.query(insertQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error interno del servidor 3 - En el query" });
        }

        connection.close();
        res
          .status(201)
          .json({ mensaje: "Tipo de salida creada correctamente" });
        // console.log(
        //   `Tipo de transaccion: ${nombreTransaccion}, creada correctamente`
        // );
      });
    });
  });
});
app.put("/api/ActualizarTiposDeSalida/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreTransaccion } = req.body;

    const pool = await sql.connect(dbConfig);

    // Verificar si el nuevo nombre ya existe
    const checkQuery = `SELECT COUNT(*) as count FROM TiposDeEntrada WHERE Nombre = @nombreTransaccion AND ID <> @ID`;

    const checkResult = await pool
      .request()
      .input("nombreTransaccion", sql.VarChar, nombreTransaccion)
      .input("ID", id)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({
        mensaje: "Este tipo de Transacción ya existe",
      });
    }

    // Continuar con la actualización si el nombre no existe
    const queryActualizar =
      "UPDATE TipoDeSalida SET Nombre = @Nombre WHERE ID = @ID";
    const resultActualizar = await pool
      .request()
      .input("ID", id)
      .input("Nombre", nombreTransaccion)
      .query(queryActualizar);

    res.json({ message: "Tipo De Salida actualizada correctamente" });
  } catch (error) {
    if (error.number === 547) {
      return res.status(400).json({
        mensaje:
          "No se puede actualizar el tipo de Salida porque existen registros asociados.",
      });
    } else {
      console.error("Error al actualizar el tipo de salida:", error);
      return res.status(500).send("Error del servidor");
    }
  }
});

app.delete("/api/DeleteTipoDeSalida/:nombre", (req, res) => {
  const { nombre } = req.params;

  const connection = new sql.ConnectionPool(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al conectarse a la BD" });
    }

    const checkReferencesQuery = `
    SELECT TOP 1 1
    FROM DetalleVentas
    WHERE TipoSalida = '${nombre}'
`;

    connection.request().query(checkReferencesQuery, (err, result) => {
      if (err) {
        console.log(err);
        connection.close();
        return res.status(500).json({ mensaje: "Error en el query" });
      }

      if (result.recordset.length > 0) {
        connection.close();
        return res.status(400).json({
          mensaje:
            "No se puede eliminar este tipo de salida porque existen registros.",
        });
      }

      const deleteQuery = `DELETE FROM TipoDeSalida WHERE Nombre = '${nombre}'`;

      connection.request().query(deleteQuery, (err, result) => {
        if (err) {
          console.log(err);
          connection.close();
          return res
            .status(500)
            .json({ mensaje: "Error al eliminar el tipo de entrada" });
        }

        connection.close();
        res
          .status(201)
          .json({ mensaje: "Tipo de SALIDA eliminada correctamente" });
      });
    });
  });
});

// Reportes

app.get("/api/VentasPorDia", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
    SELECT 
    DATEPART(dw, Fecha) as DiaDeLaSemana,
    COUNT(*) as TotalVentas
  FROM Ventas
  GROUP BY DATEPART(dw, Fecha)
  ORDER BY DiaDeLaSemana ASC
    `);
    res.send(result.recordset);
  } catch (error) {
    console.error("Error al obtener Ventas por Día:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/TopProductos", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 3 
        dv.Producto AS nombre,
        SUM(dv.cantidad) AS ventas
      FROM 
        DetalleVentas dv
      GROUP BY 
        dv.Producto
      ORDER BY 
        ventas DESC
    `);
    res.send(result.recordset);
  } catch (error) {
    console.error(
      "Error al obtener el Top 3 de productos más vendidos:",
      error
    );
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/VentasMensuales", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
    SELECT 
    MONTH(v.Fecha) AS Mes,
    YEAR(v.Fecha) AS Año,
    COUNT(DISTINCT v.Codigo) AS Ventas
FROM 
    Ventas v
JOIN
    DetalleVentas dv ON v.Codigo = dv.IdVenta
GROUP BY 
    MONTH(v.Fecha), YEAR(v.Fecha)
ORDER BY 
    Año, Mes


    `);
    res.send(result.recordset);
  } catch (error) {
    console.error("Error al obtener las ventas del mes:", error);
    res.status(500).send("Error del servidor");
  }
});

app.get("/api/EmpleadosConVentas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const empleadosResult = await pool
      .request()
      .query("SELECT * FROM Empleados");

    const empleadosConVentas = await Promise.all(
      empleadosResult.recordset.map(async (empleado) => {
        const ventasResult = await pool
          .request()
          .input("IdEmpleado", sql.Int, empleado.IdEmpleado)
          .query(
            "SELECT COUNT(*) AS TotalVentas FROM Ventas WHERE IdEmpleado = @IdEmpleado"
          );

        return {
          ...empleado,
          Ventas: ventasResult.recordset[0].TotalVentas,
        };
      })
    );

    res.json(empleadosConVentas);
  } catch (error) {
    console.error("Error al obtener la lista de empleados con ventas:", error);
    res.status(500).send("Error interno del servidor");
  }
});
