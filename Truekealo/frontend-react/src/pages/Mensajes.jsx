import { useState, useEffect, useRef } from 'react';
import { getConversaciones, getConversacion, sendMensaje, marcarComoLeido } from '../services/mensajesService';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/helpers';

const Mensajes = () => {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    if (!user?.id || lastUserIdRef.current === user.id) return;
    lastUserIdRef.current = user.id;
    loadConversaciones();
  }, [user?.id]);

  const loadConversaciones = async () => {
    if (!user?.id) {
      setConversaciones([]);
      setSelectedChat(null);
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getConversaciones();
      const safeData = Array.isArray(data) ? data : [];
      setConversaciones(safeData);
      if (safeData.length > 0) {
        setSelectedChat(safeData[0]);
        loadMessages(safeData[0].otro_usuario_id);
      } else {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Error al cargar conversaciones');
      setConversaciones([]);
      setSelectedChat(null);
      setMessages([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (usuarioId) => {
    try {
      const data = await getConversacion(usuarioId);
      // El backend retorna directamente un array de mensajes
      setMessages(Array.isArray(data) ? data : []);
      
      // Marcar como leído
      const mensajesNoLeidos = Array.isArray(data) 
        ? data.filter(m => !m.leido && m.remitente_id === usuarioId)
        : [];
      
      if (mensajesNoLeidos.length > 0) {
        for (const msg of mensajesNoLeidos) {
          await marcarComoLeido(msg.id);
        }
      }
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      setMessages([]);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    await loadMessages(chat.otro_usuario_id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    setError('');
    try {
      const nuevoMensaje = await sendMensaje({
        destinatario_id: selectedChat.otro_usuario_id,
        contenido: newMessage,
      });

      setMessages([...messages, nuevoMensaje]);
      setNewMessage('');
      await loadConversaciones();
      await loadMessages(selectedChat.otro_usuario_id);
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="mensajes-container">
      <div className="mensajes-layout">
        {/* Lista de conversaciones */}
        <div className="conversaciones-list">
          <h2>Mensajes</h2>
          {conversaciones.length === 0 ? (
            <div className="empty-state">
              <p>No tienes conversaciones aún</p>
            </div>
          ) : (
            <div className="chat-list">
              {conversaciones.map(chat => (
                <div
                  key={chat.otro_usuario_id}
                  className={`chat-item ${selectedChat?.otro_usuario_id === chat.otro_usuario_id ? 'active' : ''} ${chat.mensajes_no_leidos > 0 ? 'unread' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="chat-item-header">
                    <strong>{chat.otro_usuario_nombre}</strong>
                    {chat.mensajes_no_leidos > 0 && (
                      <span className="unread-badge">{chat.mensajes_no_leidos}</span>
                    )}
                  </div>
                  <p className="chat-item-preview">{chat.ultimo_mensaje}</p>
                  <small>{formatRelativeTime(chat.ultimo_mensaje_fecha)}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Área de chat */}
        <div className="chat-area">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <h3>{selectedChat.otro_usuario_nombre}</h3>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <p>Inicia la conversación</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`message ${msg.tipo === 'system' ? 'system-message' : (msg.remitente_id === user.id ? 'own' : 'other')}`}
                    >
                      <div className="message-content">
                        {msg.tipo === 'system' ? (
                          <em>{msg.contenido}</em>
                        ) : (
                          msg.contenido
                        )}
                      </div>
                      <small className="message-time">
                        {formatRelativeTime(msg.created_at)}
                      </small>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  disabled={sending}
                />
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn btn-primary"
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <p>Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mensajes;
