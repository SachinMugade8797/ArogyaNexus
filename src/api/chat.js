/**
 * ArogyaNexus — Consultation Chat API Client
 */

export async function getChatConversations(role = 'doctor') {
  try {
    const res = await fetch(`/api/chat/conversations?role=${encodeURIComponent(role)}`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.conversations || [];
    }
    return [];
  } catch (err) {
    console.warn('[ChatAPI] getChatConversations error:', err);
    return [];
  }
}

export async function getChatMessages(participantId, role = 'doctor') {
  try {
    const res = await fetch(
      `/api/chat/messages?participantId=${encodeURIComponent(participantId)}&role=${encodeURIComponent(role)}`,
      {
        credentials: 'include',
      }
    );
    const data = await res.json();
    if (res.ok && data.success) {
      return data.messages || [];
    }
    return [];
  } catch (err) {
    console.warn('[ChatAPI] getChatMessages error:', err);
    return [];
  }
}

/**
 * Subscribe to real-time chat updates via Server-Sent Events (SSE)
 * with automatic fallback polling to guarantee 100% reliable live updates.
 */
export function subscribeToChatUpdates(onUpdate) {
  let events = null;
  let active = true;

  if (typeof EventSource !== 'undefined') {
    try {
      events = new EventSource('/api/chat/events');
      events.addEventListener('chat-update', () => {
        if (active && onUpdate) onUpdate();
      });
      events.onerror = () => {
        // SSE disconnected or unsupported; fallback polling continues seamlessly
      };
    } catch {
      // ignore
    }
  }

  // Backup polling every 2.5 seconds to guarantee live updates
  const pollTimer = setInterval(() => {
    if (active && onUpdate) {
      onUpdate();
    }
  }, 2500);

  return () => {
    active = false;
    clearInterval(pollTimer);
    if (events) {
      try {
        events.close();
      } catch {
        // ignore
      }
    }
  };
}

export async function sendChatMessage({ receiverId, text, senderRole = 'doctor', senderId, senderName }) {
  try {
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ receiverId, text, senderRole, senderId, senderName }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data.message;
    }
    throw new Error(data.error || 'Could not send message.');
  } catch (err) {
    console.error('[ChatAPI] sendChatMessage error:', err);
    throw err;
  }
}
