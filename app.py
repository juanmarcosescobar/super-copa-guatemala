# Importación de Flask y Boto3
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask import Response
from datetime import datetime, timedelta
from botocore.exceptions import ClientError
import boto3
import random
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import uuid

# Inicializar la aplicación Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Asegura que CORS esté habilitado para todas las rutas

# Conectar Boto3 con DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')  # Usa la región en la que creaste la tabla DynamoDB
equipos_table = dynamodb.Table('equipos')
usuarios_table = dynamodb.Table('usuarios')
estadios_table = dynamodb.Table('estadios')
torneo_estado_table = dynamodb.Table('torneo_estado')
partidos_table = dynamodb.Table('partidos')
historial_table = dynamodb.Table('historial_torneos')

s3_client = boto3.client('s3', region_name='us-east-1')
bucket_name = 'historial-torneo'

def guardar_grafica_en_s3(image_path, s3_key):
    try:
        s3_client.upload_file(image_path, bucket_name, s3_key)
        url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
        return url
    except ClientError as e:
        print(f"Error al subir archivo a S3: {e}")
        return None

# Ruta de verificación de que mi app funciona
@app.route('/')
def home():
    return '¡Bienvenido al sistema de la Super Copa de Guatemala!'

# Ruta para inicializar el estado del torneo
@app.route('/inicializar_torneo', methods=['POST'])
def inicializar_torneo():
    try:
        # Añadir estado inicial del torneo
        torneo_estado_table.put_item(
            Item={
                'id': 'torneo',
                'estado': 'antes'  # Estado inicial
            }
        )
        return jsonify({'message': 'Estado del torneo inicializado a "antes".'}), 200
    except ClientError as e:
        return jsonify({'message': 'Error al inicializar el estado del torneo.'}), 500

# Ruta para obtener el estado del torneo
@app.route('/obtener_estado', methods=['GET'])
def obtener_estado():
    try:
        response = torneo_estado_table.get_item(Key={'id': 'torneo'})
        estado = response['Item']['estado']
        return jsonify({'estado': estado}), 200
    except ClientError as e:
        return jsonify({'message': 'Error al obtener el estado del torneo.'}), 500

# Ruta para actualizar el estado del torneo
@app.route('/actualizar_estado', methods=['POST'])
def actualizar_estado():
    nuevo_estado = request.json.get('estado')

    if nuevo_estado not in ['antes', 'después']:
        return jsonify({'message': 'Estado inválido.'}), 400

    try:
        torneo_estado_table.update_item(
            Key={'id': 'torneo'},
            UpdateExpression='SET estado = :val',
            ExpressionAttributeValues={':val': nuevo_estado}
        )
        return jsonify({'message': 'Estado actualizado correctamente.'}), 200
    except ClientError as e:
        return jsonify({'message': 'Error al actualizar el estado del torneo.'}), 500

# Ruta que permite registrar nuevos equipos
@app.route('/registrar_equipo', methods=['POST'])
def registrar_equipo():
    # Obtener los datos del equipo desde la solicitud
    data = request.get_json()

    # Verificar que el estadio esté registrado en DynamoDB
    response = estadios_table.scan(FilterExpression=boto3.dynamodb.conditions.Attr('nombre').eq(data['estadio']))
    if len(response.get('Items', [])) == 0:
        return jsonify({'message': 'El estadio seleccionado no está registrado. Por favor, registra el estadio primero.'}), 400

    # Añadir el equipo a DynamoDB
    equipos_table.put_item(
        Item={
            'id_equipo': data['id_equipo'],
            'nombre': data['nombre'],
            'estadio': data['estadio'],
            'ciudad': data['ciudad']
        }
    )
    return jsonify({'message': 'Equipo registrado exitosamente'}), 200

# Ruta para registrar nuevos usuarios
@app.route('/registrar_usuario', methods=['POST'])
def registrar_usuario():
    # Obtener los datos del usuario desde la solicitud
    data = request.get_json()

    # Añadir el usuario a DynamoDB
    response = usuarios_table.put_item(
        Item={
            'username': data['username'],
            'nombre': data['nombre'],
            'correo': data['correo'],
            'rol': data['rol']  # Ej: 'administrador'
        }
    )
    return jsonify({'message': 'Usuario registrado exitosamente'}), 200

# Ruta para registrar nuevos estadios
@app.route('/registrar_estadio', methods=['POST'])
def registrar_estadio():
    # Obtener los datos del estadio desde la solicitud
    data = request.get_json()

    # Añadir el estadio a DynamoDB
    response = estadios_table.put_item(
        Item={
            'id_estadio': data['id_estadio'],
            'nombre': data['nombre'],
            'ubicacion': data['ubicacion'],
            'capacidad': data['capacidad']
        }
    )
    return jsonify({'message': 'Estadio registrado exitosamente'}), 200

# Ruta para obtener los equipos
@app.route('/obtener_equipos', methods=['GET'])
def obtener_equipos():
    try:
        response = equipos_table.scan()
        equipos = response.get('Items', [])
        return jsonify(equipos), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener los equipos: {str(e)}"}), 500

# Ruta para obtener los usuarios
@app.route('/obtener_usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        response = dynamodb.Table('usuarios').scan()
        usuarios = response.get('Items', [])
        return jsonify(usuarios), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener los usuarios: {str(e)}"}), 500

# Ruta para obtener los estadios
@app.route('/obtener_estadios', methods=['GET'])
def obtener_estadios():
    try:
        response = dynamodb.Table('estadios').scan()
        estadios = response.get('Items', [])
        return jsonify(estadios), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener los estadios: {str(e)}"}), 500

# Ruta para verificar cantidad de equipos inscritos
@app.route('/verificar_equipos', methods=['GET'])
def verificar_equipos():
    try:
        response = equipos_table.scan()
        equipos = response.get('Items', [])
        if len(equipos) == 36:
            return jsonify({"message": "Hay suficientes equipos registrados para comenzar el torneo."}), 200
        else:
            return jsonify({"message": f"Se necesitan 36 equipos para comenzar el torneo, actualmente hay {len(equipos)} equipos registrados."}), 400
    except Exception as e:
        return jsonify({"message": f"Error al verificar los equipos: {str(e)}"}), 500

# Ruta para generar sorteo
@app.route('/generar_sorteo', methods=['POST'])
def generar_sorteo():
    # Obtener todos los equipos registrados
    response = equipos_table.scan()
    equipos = response.get('Items', [])

    if len(equipos) < 36:
        return jsonify({'message': 'No hay suficientes equipos registrados. Se necesitan 36 equipos para comenzar el torneo.'}), 400

    random.shuffle(equipos)  # Mezclar los equipos aleatoriamente para el sorteo

    partidos = []
    fecha_inicial = datetime(2024, 12, 1)

    # Asignar partidos de manera justa
    for i in range(0, len(equipos), 2):
        local = equipos[i]
        visitante = equipos[i + 1]

        # Elegir al azar si el local juega en su estadio o si el visitante juega como local
        estadio = local['estadio'] if random.choice([True, False]) else visitante['estadio']

        # Calcular la fecha del partido
        fecha_partido = fecha_inicial + timedelta(days=i)

        # Generar un ID único para cada partido (evitando caracteres problemáticos)
        id_partido = f"{local['nombre'].replace(' ', '_')}_vs_{visitante['nombre'].replace(' ', '_')}_{fecha_partido.strftime('%Y%m%d')}"


        # Crear el partido en formato dict
        partido = {
            'id_partido': id_partido,
            'equipo_local': local['nombre'],
            'equipo_visitante': visitante['nombre'],
            'estadio': estadio,
            'fecha': fecha_partido.strftime('%Y-%m-%d'),
            'resultado': ""  # Inicialmente el resultado es una cadena vacía (String)
        }

        partidos.append(partido)

        # Guardar el partido en la tabla de DynamoDB
        try:
            partidos_table.put_item(Item=partido)
        except ClientError as e:
            return jsonify({'message': f'Error al guardar el partido {id_partido} en DynamoDB.'}), 500

    # Actualizar el estado del torneo a "después" una vez generado el sorteo
    try:
        torneo_estado_table.update_item(
            Key={'id': 'torneo'},
            UpdateExpression='SET estado = :val',
            ExpressionAttributeValues={':val': 'después'}
        )
    except ClientError as e:
        return jsonify({'message': 'Error al actualizar el estado del torneo después del sorteo.'}), 500

    return jsonify({'partidos': partidos}), 200


# Ruta para obtener el calendario de partidos
@app.route('/obtener_calendario', methods=['GET'])
def obtener_calendario():
    try:
        response = partidos_table.scan()
        partidos = response.get('Items', [])

        # Si el resultado es null, cambiarlo por una cadena vacía
        for partido in partidos:
            if partido.get('resultado') is None:
                partido['resultado'] = ""

        return jsonify({'partidos': partidos}), 200
    except ClientError as e:
        return jsonify({'message': 'Error al obtener el calendario de partidos.'}), 500

@app.route('/ingresar_resultado', methods=['POST'])
def ingresar_resultado():
    data = request.get_json()
    id_partido = data.get('id_partido').replace("\\", "")  # Eliminar barras invertidas que puedan estar presentes
    resultado = data.get('resultado')

    if not id_partido or not resultado:
        return jsonify({'message': 'ID de partido o resultado no proporcionados.'}), 400

    try:
        # Actualizar el resultado del partido en la tabla
        response = partidos_table.update_item(
            Key={'id_partido': id_partido},
            UpdateExpression='SET resultado = :res',
            ExpressionAttributeValues={':res': resultado},
            ReturnValues="UPDATED_NEW"
        )

        # Comprobar si la actualización fue exitosa
        if 'Attributes' in response:
            return jsonify({'message': 'Resultado ingresado exitosamente.'}), 200
        else:
            return jsonify({'message': 'Error al actualizar el resultado en DynamoDB.'}), 500
    except ClientError as e:
        return jsonify({'message': f'Error al ingresar el resultado: {str(e)}'}), 500
    
# Ruta para obtener la tabla de posiciones
@app.route('/obtener_posiciones', methods=['GET'])
def obtener_posiciones():
    try:
        # Obtener todos los partidos registrados
        response = partidos_table.scan()
        partidos = response.get('Items', [])

        # Inicializar el diccionario de posiciones
        posiciones = {}

        # Recorrer los partidos para calcular posiciones
        for partido in partidos:
            equipo_local = partido['equipo_local']
            equipo_visitante = partido['equipo_visitante']
            resultado = partido['resultado']

            # Inicializar equipos en el diccionario si no existen
            if equipo_local not in posiciones:
                posiciones[equipo_local] = {
                    'equipo': equipo_local,
                    'puntos': 0,
                    'jugados': 0,
                    'ganados': 0,
                    'empatados': 0,
                    'perdidos': 0,
                    'goles_favor': 0,
                    'goles_contra': 0,
                    'diferencia': 0
                }

            if equipo_visitante not in posiciones:
                posiciones[equipo_visitante] = {
                    'equipo': equipo_visitante,
                    'puntos': 0,
                    'jugados': 0,
                    'ganados': 0,
                    'empatados': 0,
                    'perdidos': 0,
                    'goles_favor': 0,
                    'goles_contra': 0,
                    'diferencia': 0
                }

            # Actualizar estadísticas solo si hay un resultado registrado
            if resultado:
                goles_local, goles_visitante = map(int, resultado.split('-'))

                # Actualizar equipo local
                posiciones[equipo_local]['jugados'] += 1
                posiciones[equipo_local]['goles_favor'] += goles_local
                posiciones[equipo_local]['goles_contra'] += goles_visitante
                posiciones[equipo_local]['diferencia'] = posiciones[equipo_local]['goles_favor'] - posiciones[equipo_local]['goles_contra']

                # Actualizar equipo visitante
                posiciones[equipo_visitante]['jugados'] += 1
                posiciones[equipo_visitante]['goles_favor'] += goles_visitante
                posiciones[equipo_visitante]['goles_contra'] += goles_local
                posiciones[equipo_visitante]['diferencia'] = posiciones[equipo_visitante]['goles_favor'] - posiciones[equipo_visitante]['goles_contra']

                # Determinar resultado del partido
                if goles_local > goles_visitante:
                    posiciones[equipo_local]['ganados'] += 1
                    posiciones[equipo_local]['puntos'] += 3
                    posiciones[equipo_visitante]['perdidos'] += 1
                elif goles_local < goles_visitante:
                    posiciones[equipo_visitante]['ganados'] += 1
                    posiciones[equipo_visitante]['puntos'] += 3
                    posiciones[equipo_local]['perdidos'] += 1
                else:
                    posiciones[equipo_local]['empatados'] += 1
                    posiciones[equipo_visitante]['empatados'] += 1
                    posiciones[equipo_local]['puntos'] += 1
                    posiciones[equipo_visitante]['puntos'] += 1

        # Convertir el diccionario de posiciones en una lista y ordenarlo por puntos y diferencia de goles
        posiciones_list = list(posiciones.values())
        posiciones_list.sort(key=lambda x: (-x['puntos'], -x['diferencia'], -x['goles_favor']))

        return jsonify({'posiciones': posiciones_list}), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener la tabla de posiciones: {str(e)}'}), 500

# Ruta para obtener las estadísticas de los equipos
@app.route('/obtener_estadisticas_equipos', methods=['GET'])
def obtener_estadisticas_equipos():
    try:
        # Obtener todos los partidos registrados
        response = partidos_table.scan()
        partidos = response.get('Items', [])

        # Inicializar el diccionario de estadísticas
        estadisticas = {}

        # Recorrer los partidos para calcular estadísticas
        for partido in partidos:
            equipo_local = partido['equipo_local']
            equipo_visitante = partido['equipo_visitante']
            resultado = partido['resultado']

            # Inicializar equipos en el diccionario si no existen
            if equipo_local not in estadisticas:
                estadisticas[equipo_local] = {
                    'nombre': equipo_local,
                    'jugados': 0,
                    'ganados': 0,
                    'empatados': 0,
                    'perdidos': 0,
                    'goles_a_favor': 0,
                    'goles_en_contra': 0,
                    'diferencia_goles': 0
                }

            if equipo_visitante not in estadisticas:
                estadisticas[equipo_visitante] = {
                    'nombre': equipo_visitante,
                    'jugados': 0,
                    'ganados': 0,
                    'empatados': 0,
                    'perdidos': 0,
                    'goles_a_favor': 0,
                    'goles_en_contra': 0,
                    'diferencia_goles': 0
                }

            # Actualizar estadísticas solo si hay un resultado registrado
            if resultado:
                goles_local, goles_visitante = map(int, resultado.split('-'))

                # Actualizar equipo local
                estadisticas[equipo_local]['jugados'] += 1
                estadisticas[equipo_local]['goles_a_favor'] += goles_local
                estadisticas[equipo_local]['goles_en_contra'] += goles_visitante
                estadisticas[equipo_local]['diferencia_goles'] = estadisticas[equipo_local]['goles_a_favor'] - estadisticas[equipo_local]['goles_en_contra']

                # Actualizar equipo visitante
                estadisticas[equipo_visitante]['jugados'] += 1
                estadisticas[equipo_visitante]['goles_a_favor'] += goles_visitante
                estadisticas[equipo_visitante]['goles_en_contra'] += goles_local
                estadisticas[equipo_visitante]['diferencia_goles'] = estadisticas[equipo_visitante]['goles_a_favor'] - estadisticas[equipo_visitante]['goles_en_contra']

                # Determinar resultado del partido
                if goles_local > goles_visitante:
                    estadisticas[equipo_local]['ganados'] += 1
                    estadisticas[equipo_visitante]['perdidos'] += 1
                elif goles_local < goles_visitante:
                    estadisticas[equipo_visitante]['ganados'] += 1
                    estadisticas[equipo_local]['perdidos'] += 1
                else:
                    estadisticas[equipo_local]['empatados'] += 1
                    estadisticas[equipo_visitante]['empatados'] += 1

        # Convertir el diccionario de estadísticas a una lista
        estadisticas_list = list(estadisticas.values())

        return jsonify(estadisticas_list), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener las estadísticas de los equipos: {str(e)}'}), 500


@app.route('/finalizar_torneo', methods=['POST'])
def finalizar_torneo():
    try:
        # Obtener la información del torneo
        equipos = equipos_table.scan().get('Items', [])
        estadios = estadios_table.scan().get('Items', [])
        partidos = partidos_table.scan().get('Items', [])

        # Generar gráficos de estadísticas y posiciones
        response = obtener_posiciones()
        print(f"Response obtenido de obtener_posiciones(): {response}")
        print(f"Tipo de response: {type(response)}")

        # Ajustar según la estructura de response
        if isinstance(response, tuple):
            print("Response es una tupla")
            response_data = response[0]  # Acceder al primer elemento si es una tupla
            if isinstance(response_data, Response):
                posiciones = response_data.get_json().get('posiciones', [])
            else:
                return jsonify({"error": "Error inesperado: response no contiene un objeto de tipo Response."}), 500
        else:
            return jsonify({"error": "Error inesperado al obtener posiciones."}), 500

        # Graficar posiciones y guardar la imagen localmente
        nombres = [equipo['equipo'] for equipo in posiciones]
        puntos = [equipo['puntos'] for equipo in posiciones]

        plt.figure(figsize=(10, 6))
        plt.bar(nombres, puntos, color='blue')
        plt.xlabel('Equipos')
        plt.ylabel('Puntos')
        plt.title('Tabla de Posiciones - Super Copa de Guatemala')
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()

        grafica_path = f"posiciones_{uuid.uuid4()}.png"
        plt.savefig(grafica_path)

        # Subir gráfica a S3
        grafica_url = guardar_grafica_en_s3(grafica_path, f"graficas/{grafica_path}")
        if grafica_url is None:
            return jsonify({'message': 'Error al guardar la gráfica en S3.'}), 500

        # Crear un nuevo registro en el historial
        año_actual = datetime.now().year
        id_torneo = str(uuid.uuid4())

        historial_table.put_item(
            Item={
                'id_torneo': id_torneo,
                'año': año_actual,
                'equipos': equipos,
                'estadios': estadios,
                'partidos': partidos,
                'grafica_posiciones_url': grafica_url
            }
        )

        # Vaciar las tablas actuales
        for table, key in [(equipos_table, 'id_equipo'), (estadios_table, 'id_estadio'), (partidos_table, 'id_partido')]:
            items = table.scan().get('Items', [])
            for item in items:
                table.delete_item(
                    Key={key: item[key]}
                )

        # Cambiar el estado del torneo a "antes"
        torneo_estado_table.update_item(
            Key={'id': 'torneo'},
            UpdateExpression="SET estado = :nuevo_estado",
            ExpressionAttributeValues={':nuevo_estado': 'antes'}
        )

        return jsonify({"message": "El torneo ha sido finalizado y guardado en el historial."}), 200

    except Exception as e:
        print(f"Error en finalizar_torneo: {e}")  # Agregar una impresión del error
        return jsonify({"error": str(e)}), 500
    
@app.route('/obtener_historial', methods=['GET'])
def obtener_historial():
    try:
        # Escaneo de todos los elementos en la tabla historial_torneos
        response = historial_table.scan()

        if 'Items' not in response:
            raise ValueError("No se encontraron torneos en la base de datos")

        torneos = response['Items']

        # Deserializar datos de DynamoDB a un formato más simple
        historial = []
        for torneo in torneos:
            try:
                # Extraer la información del torneo, ya que son listas de diccionarios simples
                equipos = torneo.get('equipos', [])
                estadios = torneo.get('estadios', [])
                partidos = torneo.get('partidos', [])

                historial.append({
                    'id_torneo': torneo['id_torneo'],
                    'año': int(torneo['año']),  # Convertir Decimal a int
                    'equipos': equipos,
                    'estadios': estadios,
                    'partidos': partidos,
                    'grafica_posiciones_url': torneo['grafica_posiciones_url']
                })
            except Exception as ex:
                print(f"Error al procesar un torneo específico: {ex}")

        return jsonify({"historial": historial}), 200

    except Exception as e:
        print(f"Error general: {e}")
        return jsonify({"error": str(e)}), 500

# Ruta para editar equipo
@app.route('/editar_equipo/<string:id_equipo>', methods=['PUT'])
def editar_equipo(id_equipo):
    try:
        # Obtener los datos enviados en la solicitud
        datos_actualizados = request.get_json()

        # Crear una expresión de actualización en DynamoDB
        update_expression = "SET nombre = :nombre, estadio = :estadio, ciudad = :ciudad"
        expression_attribute_values = {
            ':nombre': datos_actualizados['nombre'],
            ':estadio': datos_actualizados['estadio'],
            ':ciudad': datos_actualizados['ciudad']
        }

        # Actualizar el equipo en DynamoDB
        response = equipos_table.update_item(
            Key={'id_equipo': id_equipo},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

        return jsonify({'message': f'Equipo {id_equipo} actualizado exitosamente.'}), 200

    except Exception as e:
        return jsonify({'message': f'Error al actualizar el equipo: {str(e)}'}), 500
    
# Ruta para editar estadio
@app.route('/editar_estadio/<string:id_estadio>', methods=['PUT'])
def editar_estadio(id_estadio):
    try:
        # Obtener los datos enviados en la solicitud
        datos_actualizados = request.get_json()

        # Crear una expresión de actualización en DynamoDB
        update_expression = "SET nombre = :nombre, ubicacion = :ubicacion, capacidad = :capacidad"
        expression_attribute_values = {
            ':nombre': datos_actualizados['nombre'],
            ':ubicacion': datos_actualizados['ubicacion'],
            ':capacidad': datos_actualizados['capacidad']
        }

        # Actualizar el estadio en DynamoDB
        response = estadios_table.update_item(
            Key={'id_estadio': id_estadio},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

        return jsonify({'message': f'Estadio {id_estadio} actualizado exitosamente.'}), 200

    except Exception as e:
        return jsonify({'message': f'Error al actualizar el estadio: {str(e)}'}), 500

# Ruta para eliminar equipo
@app.route('/eliminar_equipo/<string:id_equipo>', methods=['DELETE'])
def eliminar_equipo(id_equipo):
    try:
        # Eliminar el equipo de la tabla DynamoDB
        response = equipos_table.delete_item(
            Key={'id_equipo': id_equipo}
        )

        return jsonify({'message': f'Equipo {id_equipo} eliminado exitosamente.'}), 200

    except Exception as e:
        return jsonify({'message': f'Error al eliminar el equipo: {str(e)}'}), 500

# Ruta para eliminar estadio
@app.route('/eliminar_estadio/<string:id_estadio>', methods=['DELETE'])
def eliminar_estadio(id_estadio):
    try:
        # Eliminar el estadio de la tabla DynamoDB
        response = estadios_table.delete_item(
            Key={'id_estadio': id_estadio}
        )

        return jsonify({'message': f'Estadio {id_estadio} eliminado exitosamente.'}), 200

    except Exception as e:
        return jsonify({'message': f'Error al eliminar el estadio: {str(e)}'}), 500
    
# Ruta para obtener un equipo por ID
@app.route('/obtener_equipo/<string:id_equipo>', methods=['GET'])
def obtener_equipo(id_equipo):
    try:
        # Obtener el equipo específico basado en el ID
        response = equipos_table.get_item(Key={'id_equipo': id_equipo})
        if 'Item' in response:
            return jsonify(response['Item']), 200
        else:
            return jsonify({"message": "Equipo no encontrado."}), 404
    except Exception as e:
        return jsonify({"message": f"Error al obtener el equipo: {str(e)}"}), 500
    
# Ruta para obtener un estadio específico
@app.route('/obtener_estadio/<id_estadio>', methods=['GET'])
def obtener_estadio(id_estadio):
    try:
        # Obtener el estadio con el id proporcionado
        response = estadios_table.get_item(Key={'id_estadio': id_estadio})
        estadio = response.get('Item')

        if estadio:
            return jsonify(estadio), 200
        else:
            return jsonify({"message": "El estadio no se pudo encontrar."}), 404

    except Exception as e:
        return jsonify({"message": f"Error al obtener el estadio: {str(e)}"}), 500




# Ejecuta la aplicación Flask
if __name__ == '__main__':
    app.run(debug=True)
