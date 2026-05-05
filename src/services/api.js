// Función genérica para hacer peticiones seguras al API Gateway
export const peticionSeguraAPI = async (endpoint, metodo = 'GET', cuerpo = null) => {
  // 1. URL del API Gateway con HTTPS (Configurado previamente en AWS)
  const BASE_URL = 'https://api.tu-dominio-unach.com';
  
  // 2. Recuperamos el JWT (Asumiendo que lo guardaste en localStorage al iniciar sesión)
  const token = localStorage.getItem('tokenJWT');

  // 3. Preparamos las cabeceras (Headers) de la petición
  const headers = {
    'Content-Type': 'application/json',
  };

  // Si existe un token, lo inyectamos en la cabecera de Autorización
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 4. Configuración del método y cuerpo de la petición
  const opciones = {
    method: metodo,
    headers: headers,
  };

  if (cuerpo) {
    opciones.body = JSON.stringify(cuerpo);
  }

  // 5. Ejecutamos la petición hacia el servidor
  try {
    const respuesta = await fetch(`${BASE_URL}${endpoint}`, opciones);
    
    // Si el API Gateway responde con un 401 (No Autorizado), el token es inválido o expiró
    if (respuesta.status === 401) {
      console.error("Token JWT inválido o expirado. Cerrando sesión...");
      // Aquí podrías redirigir al login
      throw new Error("No autorizado");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en la petición HTTPS:", error);
    throw error;
  }
};