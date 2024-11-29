$(document).ready(function () {
    // Verificar el estado del torneo al cargar la página
    verificarEstadoTorneo();

    // Toggle del sidebar
    $('#menu-toggle').click(function () {
        $('#wrapper').toggleClass('toggled');
    });

    // Llamar a la función para asignar los manejadores de eventos al inicio
    setEventHandlers();

    // Función para verificar el estado del torneo al cargar la página
    function verificarEstadoTorneo() {
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:5000/obtener_estado',
            success: function (response) {
                const estado = response.estado;
                if (estado === 'antes') {
                    mostrarOpcionesAntesDelTorneo();
                } else if (estado === 'después') {
                    mostrarOpcionesDespuesDelTorneo();
                }
            },
            error: function (error) {
                alert('Error al obtener el estado del torneo.');
                console.error('Error:', error);
            }
        });
    }

    // Función para mostrar las opciones antes de que comience el torneo
    function mostrarOpcionesAntesDelTorneo() {
        // Actualizar el menú de la izquierda
        $('#sidebar-wrapper .list-group').html(`
            <a href="#" id="view-dashboard" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="#" id="register-team" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-futbol"></i> Registrar Equipo
            </a>
            <a href="#" id="register-stadium" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-university"></i> Registrar Estadio
            </a>
            <a href="#" id="view-settings" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-cogs"></i> Ajustes
            </a>
            <a href="#" id="view-tournament-history" class="list-group-item list-group-item-action bg-dark text-white">
            <i class="fas fa-history"></i> Historial de Torneos
            </a>
        `);

        // Mostrar el contenido del dashboard
        loadDashboardContentAntes();

        // Reasignar los manejadores de eventos
        setEventHandlers();
    }

    // Función para mostrar las opciones después de que comience el torneo
    function mostrarOpcionesDespuesDelTorneo() {
        // Actualizar el menú de la izquierda
        $('#sidebar-wrapper .list-group').html(`
            <a href="#" id="view-dashboard" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="#" id="enter-results" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-edit"></i> Ingresar Resultados
            </a>
            <a href="#" id="view-schedule" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-calendar-alt"></i> Ver Calendario
            </a>
            <a href="#" id="view-standings" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-trophy"></i> Tabla de Posiciones
            </a>
            <a href="#" id="view-team-stats" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-chart-line"></i> Estadísticas de Equipos
            </a>
            <a href="#" id="view-settings" class="list-group-item list-group-item-action bg-dark text-white">
                <i class="fas fa-cogs"></i> Ajustes
            </a>
            <a href="#" id="finalizar-torneo" class="list-group-item list-group-item-action bg-dark text-white">
            <i class="fas fa-flag-checkered"></i> Finalizar Torneo
            </a>
        `);

        // Mostrar el contenido del dashboard para el estado después del torneo
        loadDashboardContentDespues();

        // Reasignar los manejadores de eventos
        setEventHandlers();
    }

    // Función para cargar el contenido del Dashboard antes del torneo
    function loadDashboardContentAntes() {
        $('#content').html(`
            <h1>Bienvenido al Sistema de la Super Copa de Guatemala</h1>
            <p>Selecciona una opción del menú para empezar.</p>

            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Equipos Registrados</h5>
                            <p class="card-text">Consulta y administra todos los equipos que participan en el torneo.</p>
                            <a href="#" id="view-teams" class="btn btn-primary">Ver Equipos</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Estadios Registrados</h5>
                            <p class="card-text">Gestiona los estadios en donde se jugarán los partidos.</p>
                            <a href="#" id="view-stadiums" class="btn btn-primary">Ver Estadios</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-12">
                    <div class="card mt-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">Sorteo del Torneo</h5>
                            <p class="card-text">Genera los partidos y el calendario para el torneo.</p>
                            <button id="draw-tournament" class="btn btn-success">Comenzar Sorteo</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        setEventHandlers();
    }

    function loadDashboardContentDespues() {
        $('#content').html(`
            <h1>Resumen del Torneo</h1>
            <p>Información actualizada del torneo en curso.</p>
    
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5><i class="fas fa-calendar-alt"></i> Próximos Partidos</h5>
                        </div>
                        <div class="card-body" id="proximos-partidos-container">
                            <p class="card-text">Cargando los próximos partidos...</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5><i class="fas fa-trophy"></i> Mejores Posiciones</h5>
                        </div>
                        <div class="card-body" id="mejores-posiciones-container">
                            <p class="card-text">Cargando los equipos con mejor desempeño en el torneo...</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
    
        // Obtener y mostrar el próximo partido
        cargarProximosPartidos();
        cargarMejoresPosiciones();
    }
    
    // Función para cargar los próximos partidos (mejorada visualmente)
    function cargarProximosPartidos() {
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:5000/obtener_calendario',
            success: function (response) {
                if (response && response.partidos && response.partidos.length > 0) {
                    // Tomar los próximos 3 partidos (o menos si hay menos de 3 partidos programados)
                    const proximosPartidos = response.partidos.slice(0, 3);
                    let proximosPartidosHtml = `<div class="row">`;
    
                    proximosPartidos.forEach((partido) => {
                        proximosPartidosHtml += `
                            <div class="col-md-12 mb-3">
                                <div class="card shadow-sm">
                                    <div class="card-body">
                                        <h5 class="card-title text-primary">
                                            <i class="fas fa-futbol"></i> ${partido.equipo_local} vs ${partido.equipo_visitante}
                                        </h5>
                                        <p class="card-text">
                                            <strong>Estadio:</strong> ${partido.estadio} <br>
                                            <strong>Fecha:</strong> ${partido.fecha}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
    
                    proximosPartidosHtml += `</div>`;
                    $('#proximos-partidos-container').html(proximosPartidosHtml);
                } else {
                    $('#proximos-partidos-container').html(`
                        <p class="card-text text-warning">No hay partidos programados actualmente.</p>
                    `);
                }
            },
            error: function (error) {
                $('#proximos-partidos-container').html(`
                    <p class="card-text text-danger">Error al cargar los próximos partidos. Intenta de nuevo más tarde.</p>
                `);
            }
        });
    }
    
    // Función para cargar las mejores posiciones (mejorada visualmente)
    function cargarMejoresPosiciones() {
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:5000/obtener_posiciones',
            success: function (response) {
                if (response && response.posiciones && response.posiciones.length > 0) {
                    let posicionesHtml = `<ul class="list-group">`;
    
                    response.posiciones.slice(0, 5).forEach((equipo, index) => {
                        let positionClass = 'list-group-item';
                        if (index === 0) {
                            positionClass += ' bg-warning text-dark'; // Destacar al primer lugar
                        } else if (index === 1 || index === 2) {
                            positionClass += ' bg-light'; // Destacar al segundo y tercer lugar
                        }
    
                        posicionesHtml += `
                            <li class="${positionClass}">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>#${index + 1} - ${equipo.equipo}</strong><br>
                                        <span class="text-muted">Puntos: ${equipo.puntos} | Diferencia de Goles: ${equipo.diferencia}</span>
                                    </div>
                                    <div>
                                        <i class="fas fa-medal text-secondary"></i>
                                    </div>
                                </div>
                            </li>
                        `;
                    });
    
                    posicionesHtml += `</ul>`;
                    
                    $('#mejores-posiciones-container').html(posicionesHtml);
                } else {
                    $('#mejores-posiciones-container').html(`
                        <p class="card-text text-warning">No hay posiciones disponibles actualmente.</p>
                    `);
                }
            },
            error: function (error) {
                $('#mejores-posiciones-container').html(`
                    <p class="card-text text-danger">Error al cargar las posiciones. Intenta de nuevo más tarde.</p>
                `);
            }
        });
    }

    // Función para manejar el clic en "Finalizar Torneo"
    function finalizarTorneo() {
        // Mostrar el modal de confirmación
        $('#finalizarTorneoModal').modal({
            backdrop: 'static', // Evita que se cierre al hacer clic fuera del modal
            keyboard: false     // Deshabilita el cierre con la tecla Escape
        });

        // Cargar imagen desde AWS S3 (suponiendo que el bucket tenga acceso público)
        const trophyImageUrl = 'https://escudos-equipos-supercopa.s3.us-east-1.amazonaws.com/trophy.png';
        $('#trophyImage').attr('src', trophyImageUrl);

        // Manejar el clic de confirmación dentro del modal
        $('#confirmarFinalizacion').off('click').on('click', function () {
            // Realizar la solicitud al servidor para finalizar el torneo
            $.ajax({
                type: 'POST',
                url: 'http://127.0.0.1:5000/finalizar_torneo',
                success: function (response) {
                    $('#finalizarTorneoModal').modal('hide'); // Ocultar el modal

                    // Mostrar mensaje de despedida emotivo
                    $('#content').html(`
                        <div class="loading-screen text-center">
                            <h2>¡El torneo ha llegado a su fin!</h2>
                            <p>¡Gracias por seguirnos en este emocionante viaje!</p>
                            <img src="${trophyImageUrl}" alt="Celebración" class="img-fluid my-4" style="width: 150px;">
                            <div class="spinner-border text-primary mt-3" role="status">
                                <span class="sr-only">Cargando...</span>
                            </div>
                        </div>
                    `);

                    // Después de 5 segundos, recargar el estado del torneo
                    setTimeout(function () {
                        verificarEstadoTorneo();
                    }, 5000);
                },
                error: function (error) {
                    alert('Error al finalizar el torneo. Intenta de nuevo.');
                    console.error('Error:', error);
                }
            });
        });

        // Manejar el clic en el botón de "Cancelar"
        $('#cancelarFinalizacion').off('click').on('click', function () {
            $('#finalizarTorneoModal').modal('hide'); // Ocultar el modal al cancelar
        });

        // Asegurarse de que el modal se pueda minimizar/cerrar correctamente con la "X"
        $('.btn-close').off('click').on('click', function () {
            $('#finalizarTorneoModal').modal('hide'); // Ocultar el modal cuando se minimice
        });
    }

    


    // Función para asignar los manejadores de eventos
    function setEventHandlers() {
        // Manejar clics en el menú del sidebar para el Dashboard
        $('#view-dashboard').click(function () {
            verificarEstadoTorneo(); // Verifica el estado del torneo y actualiza el contenido
        });

        // Manejar clic en "Finalizar Torneo"
        $('#finalizar-torneo').click(function () {
            finalizarTorneo();
        });

        // Obtener y mostrar equipos
        $('#view-teams').click(function () {
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_equipos',
                success: function (equipos) {
                    let equiposHtml = `
                        <h1>Equipos Registrados</h1>
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID del Equipo</th>
                                    <th>Nombre</th>
                                    <th>Estadio</th>
                                    <th>Ciudad</th>
                                    <th>Acciones</th> <!-- Añadir columna para las acciones -->
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    equipos.forEach(function (equipo) {
                        equiposHtml += `
                            <tr>
                                <td>${equipo.id_equipo}</td>
                                <td>${equipo.nombre}</td>
                                <td>${equipo.estadio}</td>
                                <td>${equipo.ciudad}</td>
                                <td>
                                    <button class="btn btn-warning btn-sm editar-equipo" data-id="${equipo.id_equipo}">Editar</button>
                                    <button class="btn btn-danger btn-sm eliminar-equipo" data-id="${equipo.id_equipo}">Eliminar</button>
                                </td>
                            </tr>
                        `;
                    });

                    equiposHtml += `
                            </tbody>
                        </table>
                    `;

                    $('#content').html(equiposHtml);

                    // Asignar evento para editar equipo
                    $('.editar-equipo').click(function () {
                        const idEquipo = $(this).data('id');

                        // Obtener los datos del equipo a editar
                        $.ajax({
                            type: 'GET',
                            url: `http://127.0.0.1:5000/obtener_equipo/${idEquipo}`,
                            success: function (equipo) {
                                // Primero, obtener los estadios existentes para el select del estadio
                                $.ajax({
                                    type: 'GET',
                                    url: 'http://127.0.0.1:5000/obtener_estadios',
                                    success: function (estadios) {
                                        // Generar las opciones para el select del estadio
                                        let estadioOptions = estadios.map(estadio => 
                                            `<option value="${estadio.nombre}" ${equipo.estadio === estadio.nombre ? 'selected' : ''}>${estadio.nombre}</option>`
                                        ).join('');

                                        // Mostrar el formulario con los datos actuales del equipo
                                        $('#content').html(`
                                            <h1>Editar Equipo</h1>
                                            <form id="edit-team-form">
                                                <div class="form-group">
                                                    <label for="nombre">Nombre del Equipo</label>
                                                    <input type="text" class="form-control" id="nombre" value="${equipo.nombre}" required>
                                                </div>
                                                <div class="form-group">
                                                    <label for="estadio">Estadio</label>
                                                    <select class="form-control" id="estadio" required>
                                                        ${estadioOptions}
                                                    </select>
                                                </div>
                                                <div class="form-group">
                                                    <label for="ciudad">Ciudad</label>
                                                    <input type="text" class="form-control" id="ciudad" value="${equipo.ciudad}" required>
                                                </div>
                                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                                            </form>
                                        `);

                                        // Manejar el envío del formulario para editar el equipo
                                        $('#edit-team-form').submit(function (e) {
                                            e.preventDefault();
                                            const equipoActualizado = {
                                                nombre: $('#nombre').val(),
                                                estadio: $('#estadio').val(),
                                                ciudad: $('#ciudad').val(),
                                            };

                                            $.ajax({
                                                type: 'PUT',
                                                url: `http://127.0.0.1:5000/editar_equipo/${idEquipo}`,
                                                contentType: 'application/json',
                                                data: JSON.stringify(equipoActualizado),
                                                success: function (response) {
                                                    alert(response.message);
                                                    $('#view-teams').click(); // Recargar la lista de equipos
                                                },
                                                error: function (error) {
                                                    alert('Error al actualizar el equipo. Por favor, intenta de nuevo.');
                                                }
                                            });
                                        });
                                    },
                                    error: function (error) {
                                        alert('Error al obtener los estadios. Por favor, intenta de nuevo.');
                                    }
                                });
                            },
                            error: function () {
                                alert('Error al obtener los datos del equipo. Por favor, intenta de nuevo.');
                            }
                        });
                    });

                                        

                    // Asignar evento para eliminar equipo
                    $('.eliminar-equipo').click(function () {
                        const idEquipo = $(this).data('id');

                        if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
                            $.ajax({
                                type: 'DELETE',
                                url: `http://127.0.0.1:5000/eliminar_equipo/${idEquipo}`,
                                success: function (response) {
                                    alert(response.message);
                                    $('#view-teams').click(); // Recargar la lista de equipos
                                },
                                error: function (error) {
                                    alert('Error al eliminar el equipo. Por favor, intenta de nuevo.');
                                }
                            });
                        }
                    });
                },
                error: function (error) {
                    alert('Error al obtener los equipos.');
                }
            });
        });

        // Obtener y mostrar estadios
        $('#view-stadiums').click(function () {
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_estadios',
                success: function (estadios) {
                    let estadiosHtml = `
                        <h1>Estadios Registrados</h1>
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID del Estadio</th>
                                    <th>Nombre</th>
                                    <th>Ubicación</th>
                                    <th>Capacidad</th>
                                    <th>Acciones</th> <!-- Añadir columna para las acciones -->
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    estadios.forEach(function (estadio) {
                        estadiosHtml += `
                            <tr>
                                <td>${estadio.id_estadio}</td>
                                <td>${estadio.nombre}</td>
                                <td>${estadio.ubicacion}</td>
                                <td>${estadio.capacidad}</td>
                                <td>
                                    <button class="btn btn-warning btn-sm editar-estadio" data-id="${estadio.id_estadio}">Editar</button>
                                    <button class="btn btn-danger btn-sm eliminar-estadio" data-id="${estadio.id_estadio}">Eliminar</button>
                                </td>
                            </tr>
                        `;
                    });

                    estadiosHtml += `
                            </tbody>
                        </table>
                    `;

                    $('#content').html(estadiosHtml);

                    // Asignar evento para editar estadio
                    $('.editar-estadio').click(function () {
                        const idEstadio = $(this).data('id');

                        // Obtener los datos del estadio seleccionado para editar
                        $.ajax({
                            type: 'GET',
                            url: `http://127.0.0.1:5000/obtener_estadio/${idEstadio}`,
                            success: function (estadio) {
                                // Mostrar el formulario con los datos actuales del estadio
                                $('#content').html(`
                                    <h1>Editar Estadio</h1>
                                    <form id="edit-stadium-form">
                                        <div class="form-group">
                                            <label for="nombre">Nombre del Estadio</label>
                                            <input type="text" class="form-control" id="nombre" value="${estadio.nombre}" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="ubicacion">Ubicación</label>
                                            <input type="text" class="form-control" id="ubicacion" value="${estadio.ubicacion}" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="capacidad">Capacidad</label>
                                            <input type="number" class="form-control" id="capacidad" value="${estadio.capacidad}" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                                    </form>
                                `);

                                // Manejar el envío del formulario para editar el estadio
                                $('#edit-stadium-form').submit(function (e) {
                                    e.preventDefault();
                                    const estadioActualizado = {
                                        nombre: $('#nombre').val(),
                                        ubicacion: $('#ubicacion').val(),
                                        capacidad: $('#capacidad').val(),
                                    };

                                    $.ajax({
                                        type: 'PUT',
                                        url: `http://127.0.0.1:5000/editar_estadio/${idEstadio}`,
                                        contentType: 'application/json',
                                        data: JSON.stringify(estadioActualizado),
                                        success: function (response) {
                                            alert(response.message);
                                            $('#view-stadiums').click(); // Recargar la lista de estadios
                                        },
                                        error: function (error) {
                                            alert('Error al actualizar el estadio. Por favor, intenta de nuevo.');
                                        }
                                    });
                                });
                            },
                            error: function (error) {
                                alert('Error al obtener los datos del estadio. Por favor, intenta de nuevo.');
                                console.error('Error:', error);
                            }
                        });
                    });
                    

                    // Asignar evento para eliminar estadio
                    $('.eliminar-estadio').click(function () {
                        const idEstadio = $(this).data('id');

                        if (confirm('¿Estás seguro de que deseas eliminar este estadio?')) {
                            $.ajax({
                                type: 'DELETE',
                                url: `http://127.0.0.1:5000/eliminar_estadio/${idEstadio}`,
                                success: function (response) {
                                    alert(response.message);
                                    $('#view-stadiums').click(); // Recargar la lista de estadios
                                },
                                error: function (error) {
                                    alert('Error al eliminar el estadio. Por favor, intenta de nuevo.');
                                }
                            });
                        }
                    });
                },
                error: function (error) {
                    alert('Error al obtener los estadios.');
                }
            });
        });

        // Comenzar sorteo del torneo
        $('#draw-tournament').click(function () {
            // Primero, verificar si hay suficientes equipos registrados
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/verificar_equipos',
                success: function (response) {
                    // Si la respuesta es exitosa, procedemos con el sorteo
                    // Mostrar mensaje de "sorteo en proceso"
                    $('#content').html(`
                        <div class="loading-screen text-center">
                            <h2>¡El sorteo está en proceso!</h2>
                            <p>Preparando los partidos... ¡No te vayas, esto se está poniendo emocionante!</p>
                            <div id="countdown" style="font-size: 2em; margin-top: 20px;">10</div>
                            <div class="spinner-border text-primary mt-3" role="status">
                                <span class="sr-only">Cargando...</span>
                            </div>
                        </div>
                    `);

                    // Iniciar cuenta regresiva de 10 segundos
                    let countdownValue = 10;
                    let countdownInterval = setInterval(function () {
                        countdownValue--;
                        $('#countdown').text(countdownValue);

                        if (countdownValue <= 0) {
                            clearInterval(countdownInterval);

                            // Mostrar mensaje de "Felicidades" cuando el contador llegue a 0
                            $('#content').html(`
                                <div class="loading-screen text-center">
                                    <h2>¡Felicidades, ha comenzado la Super Copa de Guatemala!</h2>
                                    <p>¡Prepárate para ver los emocionantes enfrentamientos del torneo!</p>
                                </div>
                            `);

                            // Esperar 2 segundos antes de realizar el siguiente paso
                            setTimeout(function () {
                                // Llamar a la API para generar el sorteo y mostrar los resultados
                                $.ajax({
                                    type: 'POST',
                                    url: 'http://127.0.0.1:5000/generar_sorteo',
                                    success: function (response) {
                                        // Actualizar el estado del torneo a "después"
                                        $.ajax({
                                            type: 'POST',
                                            url: 'http://127.0.0.1:5000/actualizar_estado',
                                            contentType: 'application/json',
                                            data: JSON.stringify({ estado: 'después' }),
                                            success: function () {
                                                // Cambiar las opciones del frontend para reflejar el nuevo estado del torneo
                                                mostrarOpcionesDespuesDelTorneo();

                                                // Verificar que la respuesta contiene la propiedad 'partidos'
                                                if (response && response.partidos) {
                                                    // Mostrar el calendario de partidos
                                                    let partidosHtml = `
                                                        <h1>Calendario de Partidos del Torneo</h1>
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th>Equipo Local</th>
                                                                    <th>Equipo Visitante</th>
                                                                    <th>Estadio</th>
                                                                    <th>Fecha</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                    `;

                                                    response.partidos.forEach(function (partido) {
                                                        partidosHtml += `
                                                            <tr>
                                                                <td>${partido.equipo_local}</td>
                                                                <td>${partido.equipo_visitante}</td>
                                                                <td>${partido.estadio}</td>
                                                                <td>${partido.fecha}</td>
                                                            </tr>
                                                        `;
                                                    });

                                                    partidosHtml += `
                                                            </tbody>
                                                        </table>
                                                    `;

                                                    $('#content').html(partidosHtml);
                                                } else {
                                                    // Mostrar un error si no se obtienen los partidos
                                                    $('#content').html(`
                                                        <h2>Error al generar el sorteo</h2>
                                                        <p>No se pudo obtener la información de los partidos. Por favor, intenta de nuevo.</p>
                                                    `);
                                                }
                                            },
                                            error: function () {
                                                alert('Error al actualizar el estado del torneo.');
                                            }
                                        });
                                    },
                                    error: function (error) {
                                        // Mostrar un mensaje de error si ocurre algún problema con la solicitud
                                        $('#content').html(`
                                            <h2>Error al generar el sorteo</h2>
                                            <p>Hubo un problema con el servidor. Por favor, intenta de nuevo.</p>
                                        `);
                                        console.error('Error:', error);
                                    }
                                });
                            }, 2000); // Esperar 2 segundos antes de mostrar el calendario
                        }
                    }, 1000); // Intervalo de 1 segundo para la cuenta regresiva
                },
                error: function (error) {
                    // Si la respuesta indica que no hay suficientes equipos, mostrar una alerta
                    alert(error.responseJSON.message);
                }
            });
        });


        // Otros manejadores de eventos como ver usuarios y registrar usuario (en Ajustes)
        $('#view-settings').click(function () {
            $('#content').html(`
                <h1>Ajustes del Sistema</h1>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Usuarios del Sistema</h5>
                                <p class="card-text">Administra los usuarios que tienen acceso al sistema.</p>
                                <button id="view-users" class="btn btn-primary">Ver Usuarios</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Registrar Usuario</h5>
                                <p class="card-text">Registra un nuevo usuario que tendrá acceso al sistema.</p>
                                <button id="register-user" class="btn btn-primary">Registrar Usuario</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            // Reasignar las funcionalidades para ver usuarios y registrar usuario
            $('#view-users').click(function () {
                $.ajax({
                    type: 'GET',
                    url: 'http://127.0.0.1:5000/obtener_usuarios',
                    success: function (usuarios) {
                        let usuariosHtml = `
                            <h1>Usuarios del Sistema</h1>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        usuarios.forEach(function (usuario) {
                            usuariosHtml += `
                                <tr>
                                    <td>${usuario.username}</td>
                                    <td>${usuario.nombre}</td>
                                    <td>${usuario.correo}</td>
                                    <td>${usuario.rol}</td>
                                </tr>
                            `;
                        });

                        usuariosHtml += `
                                </tbody>
                            </table>
                        `;

                        $('#content').html(usuariosHtml);
                    },
                    error: function (error) {
                        alert('Error al obtener los usuarios.');
                    }
                });
            });

            $('#register-user').click(function () {
                $('#content').html(`
                    <div class="container mt-5">
                        <div class="card shadow-lg">
                            <div class="card-header bg-primary text-white">
                                <h3><i class="fas fa-user-plus"></i> Registrar Usuario</h3>
                            </div>
                            <div class="card-body">
                                <form id="user-form">
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Username</label>
                                        <input type="text" class="form-control" id="username" placeholder="Introduce un nombre de usuario" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="nombre" class="form-label">Nombre Completo</label>
                                        <input type="text" class="form-control" id="nombre" placeholder="Introduce el nombre completo" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="correo" class="form-label">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="correo" placeholder="ejemplo@dominio.com" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="rol" class="form-label">Rol</label>
                                        <select class="form-select" id="rol" required>
                                            <option value="" disabled selected>Selecciona el rol del usuario</option>
                                            <option value="administrador">Administrador</option>
                                            <option value="usuario">Usuario</option>
                                        </select>
                                    </div>
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-success mt-3"><i class="fas fa-save"></i> Registrar Usuario</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                `);
                
                $('#user-form').submit(function (e) {
                    e.preventDefault();
                    const usuario = {
                        username: $('#username').val(),
                        nombre: $('#nombre').val(),
                        correo: $('#correo').val(),
                        rol: $('#rol').val(),
                    };
            
                    $.ajax({
                        type: 'POST',
                        url: 'http://127.0.0.1:5000/registrar_usuario',
                        contentType: 'application/json',
                        data: JSON.stringify(usuario),
                        success: function (response) {
                            alert(response.message);
                            $('#user-form')[0].reset();
                        },
                        error: function (error) {
                            alert('Error al registrar el usuario.');
                        }
                    });
                });
            });            
        });
        // Manejar clics en el menú del sidebar para registrar equipo
        $('#register-team').click(function () {
            // Primero, obtener los estadios disponibles desde el backend
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_estadios',
                success: function (estadios) {
                    // Crear el formulario dinámicamente, incluyendo un select para estadios
                    let estadioOptions = estadios.map(estadio => `<option value="${estadio.nombre}">${estadio.nombre}</option>`).join('');
                    
                    $('#content').html(`
                        <div class="container mt-5">
                            <div class="card shadow-lg">
                                <div class="card-header bg-warning text-dark">
                                    <h3><i class="fas fa-futbol"></i> Registrar Equipo</h3>
                                </div>
                                <div class="card-body">
                                    <form id="team-form">
                                        <div class="mb-3">
                                            <label for="id_equipo" class="form-label">ID del Equipo</label>
                                            <input type="text" class="form-control" id="id_equipo" placeholder="Introduce el ID del equipo" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="nombre" class="form-label">Nombre del Equipo</label>
                                            <input type="text" class="form-control" id="nombre" placeholder="Introduce el nombre del equipo" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="estadio" class="form-label">Estadio</label>
                                            <select class="form-select" id="estadio" required>
                                                <option value="" disabled selected>Selecciona un estadio</option>
                                                ${estadioOptions}
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="ciudad" class="form-label">Ciudad</label>
                                            <input type="text" class="form-control" id="ciudad" placeholder="Introduce la ciudad" required>
                                        </div>
                                        <div class="text-center">
                                            <button type="submit" class="btn btn-warning mt-3"><i class="fas fa-save"></i> Registrar Equipo</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    `);
        
                    // Manejar el envío del formulario de registro del equipo
                    $('#team-form').submit(function (e) {
                        e.preventDefault();
                        const equipo = {
                            id_equipo: $('#id_equipo').val(),
                            nombre: $('#nombre').val(),
                            estadio: $('#estadio').val(),
                            ciudad: $('#ciudad').val(),
                        };
        
                        $.ajax({
                            type: 'POST',
                            url: 'http://127.0.0.1:5000/registrar_equipo',
                            contentType: 'application/json',
                            data: JSON.stringify(equipo),
                            success: function (response) {
                                alert(response.message);
                                $('#team-form')[0].reset();
                            },
                            error: function (error) {
                                alert('Error al registrar el equipo. Por favor, intenta de nuevo.');
                            }
                        });
                    });
                },
                error: function (error) {
                    alert('Error al obtener los estadios. Por favor, intenta de nuevo.');
                }
            });
        });        

        // Manejar clics en el menú del sidebar para registrar estadio
        $('#register-stadium').click(function () {
            $('#content').html(`
                <div class="container mt-5">
                    <div class="card shadow-lg">
                        <div class="card-header bg-info text-white">
                            <h3><i class="fas fa-university"></i> Registrar Estadio</h3>
                        </div>
                        <div class="card-body">
                            <form id="stadium-form">
                                <div class="mb-3">
                                    <label for="id_estadio" class="form-label">ID del Estadio</label>
                                    <input type="text" class="form-control" id="id_estadio" placeholder="Introduce el ID del estadio" required>
                                </div>
                                <div class="mb-3">
                                    <label for="nombre" class="form-label">Nombre del Estadio</label>
                                    <input type="text" class="form-control" id="nombre" placeholder="Introduce el nombre del estadio" required>
                                </div>
                                <div class="mb-3">
                                    <label for="ubicacion" class="form-label">Ubicación</label>
                                    <input type="text" class="form-control" id="ubicacion" placeholder="Introduce la ubicación" required>
                                </div>
                                <div class="mb-3">
                                    <label for="capacidad" class="form-label">Capacidad del Estadio</label>
                                    <input type="number" class="form-control" id="capacidad" placeholder="Introduce la capacidad (número de personas)" required>
                                </div>
                                <div class="text-center">
                                    <button type="submit" class="btn btn-info mt-3"><i class="fas fa-save"></i> Registrar Estadio</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `);
        
            $('#stadium-form').submit(function (e) {
                e.preventDefault();
                const estadio = {
                    id_estadio: $('#id_estadio').val(),
                    nombre: $('#nombre').val(),
                    ubicacion: $('#ubicacion').val(),
                    capacidad: $('#capacidad').val(),
                };
        
                $.ajax({
                    type: 'POST',
                    url: 'http://127.0.0.1:5000/registrar_estadio',
                    contentType: 'application/json',
                    data: JSON.stringify(estadio),
                    success: function (response) {
                        alert(response.message);
                        $('#stadium-form')[0].reset();
                    },
                    error: function (error) {
                        alert('Error al registrar el estadio.');
                    }
                });
            });
        });        

        // Manejar clics en el menú del sidebar para ver el calendario
        $('#view-schedule').click(function () {
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_calendario',
                success: function (response) {
                    if (response && response.partidos) {
                        let partidosHtml = `
                            <h1>Calendario de Partidos del Torneo</h1>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Equipo Local</th>
                                        <th>Equipo Visitante</th>
                                        <th>Estadio</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        response.partidos.forEach(function (partido) {
                            partidosHtml += `
                                <tr>
                                    <td>${partido.equipo_local}</td>
                                    <td>${partido.equipo_visitante}</td>
                                    <td>${partido.estadio}</td>
                                    <td>${partido.fecha}</td>
                                </tr>
                            `;
                        });

                        partidosHtml += `
                                </tbody>
                            </table>
                        `;

                        $('#content').html(partidosHtml);
                    } else {
                        $('#content').html(`
                            <h2>Error al obtener el calendario</h2>
                            <p>No se pudo obtener la información de los partidos. Por favor, intenta de nuevo.</p>
                        `);
                    }
                },
                error: function (error) {
                    $('#content').html(`
                        <h2>Error al obtener el calendario</h2>
                        <p>Hubo un problema con el servidor. Por favor, intenta de nuevo.</p>
                    `);
                    console.error('Error:', error);
                }
            });
        });

        // Manejar clics en el menú del sidebar para ingresar resultados
        $('#enter-results').click(function () {
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_calendario',
                success: function (response) {
                    if (response && response.partidos) {
                        let partidosHtml = `
                            <h1>Ingresar Resultados de Partidos</h1>
                            <p>Selecciona un partido y proporciona el resultado.</p>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID del Partido</th>
                                        <th>Equipo Local</th>
                                        <th>Equipo Visitante</th>
                                        <th>Estadio</th>
                                        <th>Fecha</th>
                                        <th>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        response.partidos.forEach(function (partido) {
                            const resultadoActual = partido.resultado || ""; // Mostrar un string vacío si el resultado está vacío
                        
                            partidosHtml += `
                                <tr>
                                    <td>${partido.id_partido}</td>
                                    <td>${partido.equipo_local || "undefined"}</td>
                                    <td>${partido.equipo_visitante || "undefined"}</td>
                                    <td>${partido.estadio || "undefined"}</td>
                                    <td>${partido.fecha || "undefined"}</td>
                                    <td>
                                        <div class="input-group">
                                            <input type="text" id="resultado-${partido.id_partido.replace(/\\/g, '')}" class="form-control resultado-input" placeholder="Ej: 2-1" value="${resultadoActual}">
                                            <div class="input-group-append">
                                                <button class="btn btn-primary ingresar-resultado" data-id="${partido.id_partido.replace(/\\/g, '')}">Guardar</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        });                        

                        partidosHtml += `
                                </tbody>
                            </table>
                        `;

                        $('#content').html(partidosHtml);
                    } else {
                        $('#content').html(`
                            <h2>Error al obtener los partidos</h2>
                            <p>No se pudo obtener la información de los partidos. Por favor, intenta de nuevo.</p>
                        `);
                    }
                },
                error: function (error) {
                    $('#content').html(`
                        <h2>Error al obtener los partidos</h2>
                        <p>Hubo un problema con el servidor. Por favor, intenta de nuevo.</p>
                    `);
                    console.error('Error:', error);
                }
            });
        });

        // Delegación de eventos para manejar clics en los botones "Guardar" de resultados
        $('#content').off('click', '.ingresar-resultado').on('click', '.ingresar-resultado', function () {
            const idPartido = $(this).data('id');
            const resultadoInput = $(`#resultado-${CSS.escape(idPartido)}`);

            if (resultadoInput.length === 0) {
                console.error(`No se encontró el campo de resultado para el partido con ID: ${idPartido}`);
                alert('No se pudo encontrar el campo de resultado. Por favor, recarga la página.');
                return;
            }

            const resultado = resultadoInput.val().trim();

            // Verificar si el resultado está en el formato correcto
            if (/^\d+-\d+$/.test(resultado)) {
                $.ajax({
                    type: 'POST',
                    url: 'http://127.0.0.1:5000/ingresar_resultado',
                    contentType: 'application/json',
                    data: JSON.stringify({ id_partido: idPartido, resultado: resultado }),
                    success: function (response) {
                        alert(response.message);
                        // Actualizar el valor mostrado en el input después de ingresar el resultado
                        resultadoInput.val(resultado);
                    },
                    error: function (error) {
                        alert('Error al ingresar el resultado. Por favor, intenta de nuevo.');
                        console.error('Error:', error);
                    }
                });
            } else {
                alert('Por favor, ingresa un resultado válido en el formato X-Y (ej: 2-1).');
            }
        });

        // Manejar clics en el menú del sidebar para ver la tabla de posiciones
        $('#view-standings').click(function () {
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_posiciones',
                success: function (response) {
                    if (response && response.posiciones) {
                        let posicionesHtml = `
                            <h1>Tabla de Posiciones del Torneo</h1>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Posición</th>
                                        <th>Equipo</th>
                                        <th>Puntos</th>
                                        <th>Jugados</th>
                                        <th>Ganados</th>
                                        <th>Empatados</th>
                                        <th>Perdidos</th>
                                        <th>Goles a Favor</th>
                                        <th>Goles en Contra</th>
                                        <th>Diferencia de Goles</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        response.posiciones.forEach(function (equipo, index) {
                            posicionesHtml += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${equipo.equipo}</td>
                                    <td>${equipo.puntos}</td>
                                    <td>${equipo.jugados}</td>
                                    <td>${equipo.ganados}</td>
                                    <td>${equipo.empatados}</td>
                                    <td>${equipo.perdidos}</td>
                                    <td>${equipo.goles_favor}</td>
                                    <td>${equipo.goles_contra}</td>
                                    <td>${equipo.diferencia}</td>
                                </tr>
                            `;
                        });

                        posicionesHtml += `
                                </tbody>
                            </table>
                        `;

                        $('#content').html(posicionesHtml);
                    } else {
                        $('#content').html(`
                            <h2>Error al obtener la tabla de posiciones</h2>
                            <p>No se pudo obtener la información de las posiciones. Por favor, intenta de nuevo.</p>
                        `);
                    }
                },
                error: function (error) {
                    $('#content').html(`
                        <h2>Error al obtener la tabla de posiciones</h2>
                        <p>Hubo un problema con el servidor. Por favor, intenta de nuevo.</p>
                    `);
                    console.error('Error:', error);
                }
            });
        });

        // Manejar clics en el menú del sidebar para ver las estadísticas de los equipos
        $('#view-team-stats').click(function () {
            console.log('Botón de Estadísticas de Equipos fue clickeado.');
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_posiciones',
                success: function (equipos) {
                    console.log("Datos recibidos: ", equipos);

                    if (equipos && equipos.posiciones) {
                        // Creamos el HTML que contendrá los gráficos
                        let estadisticasHtml = `
                            <h1>Estadísticas de Equipos</h1>
                            <div class="chart-container" style="position: relative; height:60vh; width:80vw">
                                <canvas id="goalsChart"></canvas>
                            </div>
                            <div class="chart-container" style="position: relative; height:60vh; width:80vw">
                                <canvas id="winsChart"></canvas>
                            </div>
                        `;

                        $('#content').html(estadisticasHtml);

                        // Preparar datos para los gráficos
                        let equiposNombres = equipos.posiciones.map(equipo => equipo.equipo);
                        let golesAFavor = equipos.posiciones.map(equipo => equipo.goles_favor);
                        let golesEnContra = equipos.posiciones.map(equipo => equipo.goles_contra);
                        let ganados = equipos.posiciones.map(equipo => equipo.ganados);

                        // Crear el gráfico de Goles
                        let ctxGoals = document.getElementById('goalsChart').getContext('2d');
                        new Chart(ctxGoals, {
                            type: 'bar',
                            data: {
                                labels: equiposNombres,
                                datasets: [
                                    {
                                        label: 'Goles a Favor',
                                        data: golesAFavor,
                                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        borderWidth: 1
                                    },
                                    {
                                        label: 'Goles en Contra',
                                        data: golesEnContra,
                                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                        borderColor: 'rgba(255, 99, 132, 1)',
                                        borderWidth: 1
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });

                        // Crear el gráfico de Partidos Ganados
                        let ctxWins = document.getElementById('winsChart').getContext('2d');
                        new Chart(ctxWins, {
                            type: 'bar',
                            data: {
                                labels: equiposNombres,
                                datasets: [
                                    {
                                        label: 'Partidos Ganados',
                                        data: ganados,
                                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 1
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });

                    } else {
                        $('#content').html(`
                            <h2>Error al obtener las estadísticas de los equipos</h2>
                            <p>No se pudo obtener la información de las estadísticas. Por favor, intenta de nuevo.</p>
                        `);
                    }
                },
                error: function (error) {
                    alert('Error al obtener las estadísticas de los equipos.');
                    console.error('Error:', error);
                }
            });
        });

        // Función para manejar el clic en "Historial de Torneos"
        $('#view-tournament-history').click(function () {
            $.ajax({
                type: 'GET',
                url: 'http://127.0.0.1:5000/obtener_historial',
                success: function (response) {
                    if (response && response.Items && response.Items.length > 0) {
                        let historialHtml = `
                            <h1>Historial de Torneos</h1>
                            <div class="accordion" id="tournamentHistoryAccordion">
                        `;

                        response.Items.forEach((torneo, index) => {
                            historialHtml += `
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="heading${index}">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                                            Torneo ${torneo.año ? torneo.año : 'N/A'}
                                        </button>
                                    </h2>
                                    <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#tournamentHistoryAccordion">
                                        <div class="accordion-body">
                                            <h5>Equipos Participantes:</h5>
                                            <ul>
                                                ${torneo.equipos && Array.isArray(torneo.equipos) ? 
                                                    torneo.equipos.map(equipo => `<li>${equipo.nombre ? equipo.nombre : 'Desconocido'}</li>`).join('') : 
                                                    '<li>No hay equipos disponibles.</li>'}
                                            </ul>
                                            <h5>Estadios Utilizados:</h5>
                                            <ul>
                                                ${torneo.estadios && Array.isArray(torneo.estadios) ? 
                                                    torneo.estadios.map(estadio => `<li>${estadio.nombre} - ${estadio.ubicacion}</li>`).join('') : 
                                                    '<li>No hay estadios disponibles.</li>'}
                                            </ul>
                                            <h5>Partidos Jugados:</h5>
                                            <ul>
                                                ${torneo.partidos && Array.isArray(torneo.partidos) ? 
                                                    torneo.partidos.map(partido => `
                                                        <li>${partido.equipo_local} vs ${partido.equipo_visitante} en ${partido.estadio} el ${partido.fecha} - Resultado: ${partido.resultado ? partido.resultado : 'N/A'}</li>
                                                    `).join('') : 
                                                    '<li>No hay partidos disponibles.</li>'}
                                            </ul>
                                            <h5>Gráfica de Posiciones:</h5>
                                            <img src="${torneo.grafica_posiciones_url}" alt="Gráfica de Posiciones" class="img-fluid my-3">
                                        </div>
                                    </div>
                                </div>
                            `;
                        });

                        historialHtml += `
                            </div>
                        `;

                        $('#content').html(historialHtml);
                    } else {
                        $('#content').html(`
                            <h2>No hay torneos en el historial.</h2>
                            <p>Aún no se ha finalizado ningún torneo o los datos del historial no están disponibles.</p>
                        `);
                    }
                },
                error: function (error) {
                    alert('Error al obtener el historial de torneos. Intenta de nuevo.');
                    console.error('Error:', error);
                }
            });
        });


    }
});