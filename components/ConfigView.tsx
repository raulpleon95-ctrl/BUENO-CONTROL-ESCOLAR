import React, { useState } from 'react';
import { Cloud, Save, CheckCircle, WifiOff, ExternalLink, Flame, Lock, AlertTriangle } from 'lucide-react';
import { configureFirebase, getDb, disconnectFirebase, isHardcodedConfig } from '../firebaseClient';

const ConfigView: React.FC = () => {
  const [configJson, setConfigJson] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const isConnected = !!getDb();
  const isGlobal = isHardcodedConfig();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Limpiar input por si el usuario pegó basura alrededor
        const cleanJson = configJson.replace(/const firebaseConfig = /g, '').replace(/;/g, '');
        const config = JSON.parse(cleanJson);
        
        if (configureFirebase(config)) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    } catch (e) {
        setStatus('error');
    }
  };

  const handleDisconnect = () => {
    if (isGlobal) {
        alert("No se puede desconectar porque la configuración está fija en el código del sistema.");
        return;
    }
    if (confirm('¿Desconectar base de datos? Volverás al modo local.')) {
        disconnectFirebase();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Conexión a Base de Datos (Firebase)</h2>
        <p className="text-slate-500">Sincronización en tiempo real para que todos los dispositivos vean la misma información.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Instrucciones */}
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center text-orange-600">
                     <Flame size={20} className="mr-2" />
                     Estado de la Conexión
                </h3>
                
                {isGlobal ? (
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4 border border-blue-200">
                        <p className="font-bold flex items-center gap-2"><Lock size={16}/> Configuración Global Activa</p>
                        <p className="mt-2">El sistema está conectado mediante credenciales internas. Todos los usuarios comparten esta conexión automáticamente.</p>
                        <div className="mt-3 flex items-center gap-2 text-xs bg-white/50 p-2 rounded">
                            <CheckCircle size={14} className="text-green-600"/>
                            <span>Base de datos operativa</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-600 space-y-4">
                        <p className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                            Estado: <strong>{isConnected ? 'Conectado' : 'Modo Local (Sin sincronizar)'}</strong>
                        </p>
                        
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="font-bold text-slate-800 mb-2">Pasos para conectar:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-xs">
                                <li>Ve a <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Firebase Console <ExternalLink size={10} className="ml-1"/></a>.</li>
                                <li>Crea un proyecto y agrega una <strong>"App Web"</strong>.</li>
                                <li>En el menú "Compilación", crea una <strong>Firestore Database</strong> (selecciona "Modo de prueba").</li>
                                <li>En la configuración del proyecto, copia el contenido de <code>firebaseConfig</code>.</li>
                                <li>Pégalo en el cuadro de la derecha.</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            {isConnected && !isGlobal && (
                 <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
                    <CheckCircle size={40} className="text-green-600 mx-auto mb-2" />
                    <h4 className="text-xl font-bold text-green-800 mb-2">Dispositivo Conectado</h4>
                    <p className="text-green-700 mb-4 text-sm">Los datos se guardan en la nube.</p>
                    <button 
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold flex items-center justify-center mx-auto"
                    >
                        <WifiOff size={16} className="mr-2"/> Desconectar este dispositivo
                    </button>
                </div>
            )}
        </div>

        {/* Formulario (Solo si no es global) */}
        {!isGlobal && (
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-500 uppercase">
                            Configuración JSON
                        </label>
                        <span className="text-[10px] text-slate-400">Pegar objeto entre llaves {'{...}'}</span>
                    </div>
                    
                    <textarea 
                        value={configJson}
                        onChange={e => setConfigJson(e.target.value)}
                        placeholder={'{ \n  "apiKey": "AIzaSy...", \n  "authDomain": "...", \n  "projectId": "..." \n}'}
                        className="w-full h-64 p-4 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50"
                    />
                    
                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                            <AlertTriangle size={16}/>
                            Error en el formato. Asegúrate de copiar solo el objeto JSON.
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg flex items-center gap-2">
                            <CheckCircle size={16}/>
                            ¡Conexión exitosa! Recargando...
                        </div>
                    )}
                    
                    <button 
                        type="submit"
                        className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Cloud size={20} /> Conectar Escuela
                    </button>
                </form>
            </div>
        )}
        
        {/* Visual Placeholder for Global Config */}
        {isGlobal && (
            <div className="flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
                <Cloud size={80} className="mb-4" />
                <p className="text-sm font-medium">Gestión centralizada activa</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default ConfigView;