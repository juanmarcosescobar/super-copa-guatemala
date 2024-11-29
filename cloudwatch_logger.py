import boto3
import logging
from watchtower import CloudWatchLogHandler

# Configurar el cliente de CloudWatch Logs
def setup_cloudwatch_logging(log_group_name):
    try:
        session = boto3.Session()
        client = session.client('logs')
        
        # Definir el Logger y agregar un manejador para CloudWatch
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)

        # Configurar el manejador para CloudWatch
        cloudwatch_handler = CloudWatchLogHandler(
            log_group=log_group_name,
            boto3_session=session
        )
        logger.addHandler(cloudwatch_handler)

        return logger

    except Exception as e:
        print(f"Error al configurar el logger para CloudWatch: {e}")
        return None
