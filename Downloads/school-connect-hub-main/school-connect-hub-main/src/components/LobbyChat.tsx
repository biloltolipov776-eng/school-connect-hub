// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export function LobbyChat({ lobbyId, userId, nickname, isTeacher }: { lobbyId: string; userId?: string; nickname?: string; isTeacher?: boolean }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!lobbyId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("lobby_messages")
        .select(`
          id, user_id, message, created_at,
          profiles (display_name, avatar_url)
        `)
        .eq("lobby_id", lobbyId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data as any || []);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Subscribe to new messages with realtime
    const channel = supabase
      .channel(`lobby_chat_${lobbyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lobby_messages", filter: `lobby_id=eq.${lobbyId}` },
        async (payload) => {
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profile || { display_name: 'Пользователь', avatar_url: null }
          } as Message;

          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase
      .from("lobby_messages")
      .insert({
        lobby_id: lobbyId,
        user_id: user.id,
        message: msg
      });

    if (error) {
      toast.error("Ошибка при отправке сообщения");
      console.error(error);
      setNewMessage(msg); // Restore message on error
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-primary text-primary-foreground hover:bg-primary/90 md:h-12 md:w-12 md:bottom-8 md:right-8"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  // Mobile fullscreen overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Чат Лобби
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full hover:bg-primary/10" 
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Сообщений пока нет</p>
              <p className="text-xs opacity-70">Напишите первым!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === user?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] text-muted-foreground mb-1 px-2">
                    {msg.profiles?.display_name || 'Ученик'}
                  </span>
                  <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm break-words ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-border/50 bg-card flex gap-2 sticky bottom-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Сообщение..."
            maxLength={500}
            className="flex-1 h-10 bg-muted/50 border border-border/50 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-10 w-10 rounded-full shrink-0" 
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    );
  }

  // Desktop floating panel
  return (
    <div className="fixed bottom-6 right-6 w-80 h-[450px] bg-card border border-border/50 shadow-2xl rounded-2xl flex flex-col z-40 overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Чат Лобби
        </h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground mt-10">Сообщений пока нет. Напишите первым!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted-foreground mb-1 ml-1">
                  {msg.profiles?.display_name || 'Ученик'}
                </span>
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-border/50 bg-card flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Сообщение..."
          maxLength={500}
          className="flex-1 h-9 bg-muted/50 border-none rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit" size="icon" className="h-9 w-9 rounded-full shrink-0" disabled={!newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
