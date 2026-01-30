import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL base de tu API de Node.js
const API_BASE_URL = 'http://localhost:5000';

// Componente principal de la aplicación
const App = () => {
  // Estado para manejar la autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('login'); // 'login' o 'marcacion'
  const [userData, setUserData] = useState(null);

  
  // Lógica para el manejo de la sesión (Reemplazando localStorage con useState por la arquitectura de React)
  useEffect(() => {
    // Aquí podrías intentar re-autenticar al usuario si usaras tokens JWT
    // Por ahora, solo simulamos que el usuario necesita logearse.
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased flex flex-col">
      <Header isLoggedIn={isLoggedIn} userData={userData} setIsLoggedIn={setIsLoggedIn} setView={setView} />
      
      <main className="flex-grow p-4 md:p-8 flex justify-center items-start">
        {view === 'login' && <LoginView setView={setView} setUserData={setUserData} setIsLoggedIn={setIsLoggedIn} />}
        {view === 'marcacion' && <MarcacionView userData={userData} />}
      </main>

      <Footer />
    </div>
  );
};

// --- Componentes de la Interfaz ---

// 1. Componente de Encabezado (Adaptado de tu HTML)
const Header = ({ isLoggedIn, userData, setIsLoggedIn, setView }) => {
  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    setView('login');
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        {/* Placeholder para el logo */}
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">FA</div>
        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Ferretería El Amigo - Sistema de Marcación</h1>
        <h1 className="text-xl font-bold text-gray-800 sm:hidden">F.A. Marcación</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {isLoggedIn && userData && (
          <p className="text-sm text-gray-600 hidden md:block">
            Bienvenido, <span className="font-semibold text-blue-600">{userData.name || userData.user}</span>
          </p>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Salir
          </button>
        ) : (
          <button
            onClick={() => setView('login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150"
          >
            <i className="fas fa-user mr-2"></i> Login
          </button>
        )}
      </div>
    </header>
  );
};

// 2. Componente de Login (Ventana Modal adaptada)
const LoginView = ({ setView, setUserData, setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Función de autenticación (ADAPTADA de tu lógica de la API externa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Reemplaza esta URL con tu API real de autenticación si tienes una:
      // const response = await axios.post("https://apitest.grupocarosa.com/ApiDatos/ConsultarUsuarioWeb", {
      //   user: username,
      //   pass: password,
      //   // bd: bd // Variable 'bd' no definida, fue eliminada
      // });

      // SIMULACIÓN DE LOGIN para continuar con la Marcación
      // Idealmente, aquí conectarías con tu API de Node.js, 
      // que a su vez hablaría con la API externa o directamente con tu SQL Server.
      if (username === 'empleado' && password === '123') {
        setTimeout(() => {
          setIsLoggedIn(true);
          setUserData({ user: username, name: 'Empleado Amigo', id: 101, userRole: 2 });
          setView('marcacion');
        }, 1000); // Simula el tiempo de respuesta
      } else {
        setError('Credenciales incorrectas. Usa "empleado" y "123" para la prueba.');
      }
      
    } catch (err) {
      setError('Error al conectar con el servidor de autenticación.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mt-10 p-6 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        <i className="fas fa-lock mr-2 text-blue-600"></i> Iniciar Sesión
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Usuario
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <i className="fas fa-exclamation-triangle mr-2"></i>{error}
          </p>
        )}
        
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-semibold shadow-lg transition duration-150 ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin mr-2"></i>
          ) : (
            <i className="fas fa-sign-in-alt mr-2"></i>
          )}
          {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

// 3. Componente de Marcación (La funcionalidad central)
const MarcacionView = ({ userData }) => {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Hook para activar la cámara y obtener ubicación al cargar
  useEffect(() => {
    // Solicitar Acceso a la cámara
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCapturing(true);
          }
        })
        .catch((err) => {
          setError('ERROR: No se pudo acceder a la cámara. Asegúrate de dar permisos.');
          console.error('Error al acceder a la cámara:', err);
        });
    }

    // Solicitar Ubicación GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError(prev => prev + ' | ERROR: No se pudo obtener la ubicación GPS.');
          console.error('Error al obtener ubicación:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      // Limpia el stream de la cámara al desmontar el componente
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Captura de la foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ajustar canvas al tamaño del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      // Dibuja el frame actual del video en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Obtiene la data URL (Base64) de la imagen
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);

      // Desactivar la cámara para ahorrar recursos
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      }
    }
  };

  // 3. Envío de la Marcación al Backend
  const handleMark = async (type) => {
    if (!location) {
        alert("No se pudo obtener la ubicación. Inténtelo de nuevo.");
        return;
    }
    if (!photoData) {
        alert("Debe capturar una foto antes de marcar.");
        return;
    }
    
    setIsSending(true);
    setMessage('');

    const payload = {
      empleadoId: userData.id, // ID del empleado autenticado
      tipoMarcacion: type,     // 'Entrada' o 'Salida'
      fechaHora: new Date().toISOString(), // Fecha y hora actual
      latitud: location.lat,
      longitud: location.lng,
      fotoBase64: photoData, // Foto en Base64
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/marcar`, payload);
      setMessage(`✅ ${response.data.message}`);
      // Limpiar datos después de un envío exitoso
      setPhotoData(null);
      setIsCapturing(false);
      // Podrías recargar la vista si el empleado va a marcar de nuevo
    } catch (err) {
      setMessage(`❌ Error al registrar marcación: ${err.response?.data?.error || err.message}`);
      console.error('Error en el envío de marcación:', err.response?.data?.details || err);
    } finally {
      setIsSending(false);
      // Nota: Aquí se necesitaría implementar una lógica para reactivar la cámara si el usuario va a seguir usando el sistema.
    }
  };

  return (
    <div className="w-full max-w-4xl mt-4 p-6 bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
        <i className="fas fa-clock mr-2 text-blue-600"></i> Registro de Marcación
      </h2>
      
      <p className="mb-4 text-gray-600">
        **Empleado:** {userData?.name} ({userData?.user}) | **ID:** {userData?.id}
      </p>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          <i className="fas fa-exclamation-circle mr-2"></i> {error}
        </div>
      )}
      {message && (
        <div className={`p-3 mb-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de Ubicación y Hora */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3 text-gray-700"><i className="fas fa-map-marker-alt mr-2"></i> Datos de la Marcación</h3>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Hora Local: <span className="text-blue-600">{new Date().toLocaleTimeString()}</span></p>
            <p className="font-medium">Fecha: <span className="text-blue-600">{new Date().toLocaleDateString()}</span></p>
            <p>Latitud: <span className={`font-mono ${location ? 'text-green-600' : 'text-yellow-600'}`}>{location ? location.lat.toFixed(6) : 'Cargando...'}</span></p>
            <p>Longitud: <span className={`font-mono ${location ? 'text-green-600' : 'text-yellow-600'}`}>{location ? location.lng.toFixed(6) : 'Cargando...'}</span></p>
          </div>
        </div>

        {/* Panel de Cámara y Foto */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3 text-gray-700"><i className="fas fa-camera mr-2"></i> Captura de Rostro (Requerido)</h3>
          
          <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
            {isCapturing && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                // Pequeño estilo para reflejar el video (como un espejo)
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
            {!isCapturing && !photoData && (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    <i className="fas fa-video-slash text-5xl"></i>
                    <p className="ml-3">Cámara Inactiva</p>
                 </div>
            )}
            
            {/* Muestra la foto capturada */}
            {photoData && (
              <img src={photoData} alt="Rostro capturado" className="w-full h-full object-cover absolute top-0 left-0" />
            )}
          </div>
          
          <button 
            onClick={capturePhoto} 
            disabled={!isCapturing || photoData}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-150 ${
                !isCapturing || photoData 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow'
            }`}
          >
            <i className="fas fa-image mr-2"></i> {photoData ? 'Foto Capturada' : 'Tomar Foto'}
          </button>
          
          {photoData && (
            <button 
              onClick={() => { setPhotoData(null); setError(''); setIsCapturing(true); }}
              className="mt-2 w-full py-2 px-4 rounded-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white transition duration-150 shadow"
            >
              <i className="fas fa-redo mr-2"></i> Repetir
            </button>
          )}

          {/* Canvas oculto para la captura */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Botones de Marcación */}
      <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-around space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          onClick={() => handleMark('Entrada')}
          disabled={!location || !photoData || isSending}
          className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-[1.02] shadow-xl ${
            !location || !photoData || isSending 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isSending ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sign-in-alt mr-2"></i>}
          MARCAR ENTRADA
        </button>

        <button 
          onClick={() => handleMark('Salida')}
          disabled={!location || !photoData || isSending}
          className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-[1.02] shadow-xl ${
            !location || !photoData || isSending 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isSending ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sign-out-alt mr-2"></i>}
          MARCAR SALIDA
        </button>
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        Nota: La marcación se enviará a `{API_BASE_URL}/api/marcar`.
      </p>
    </div>
  );
};

// 4. Componente de Pie de Página
const Footer = () => {
  return (
    <footer className="bg-gray-800 p-4 text-center text-white text-sm">
      <p>&copy; 2025 Ferretería El Amigo - Sistema de Marcación. Todos los derechos reservados.</p>
    </footer>
  );
};

export default App;
