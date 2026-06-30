import { useState } from "react";
import { Users, UserPlus, MessageSquare, Search } from "lucide-react";
import { 
  useFriendsQuery, 
  useOnlineFriendsQuery,
} from "@/hooks/useSocial";
import Avatar from "../common/Avatar";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";

export default function FriendsTab() {
  const navigate = useNavigate();
  
  const [activeSubTab, setActiveSubTab] = useState<"friends" | "requests" | "search">("friends");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: friendsResponse, isLoading: isLoadingFriends } = useFriendsQuery();
  const { data: onlineResponse } = useOnlineFriendsQuery();

  const friends = Array.isArray(friendsResponse) ? friendsResponse : ((friendsResponse as any)?.data || []);
  const onlineFriends = Array.isArray(onlineResponse) ? onlineResponse : ((onlineResponse as any)?.data || []); 

  const isOnline = (friendId: number) => {
    return onlineFriends.some((of: any) => of.id === friendId);
  };

  const handleSendMessage = (userId: number) => {
    navigate(`/user?tab=chat&recipient=${userId}`);
  };

  return (
    <div className="bg-card border border-border rounded-sm shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300 min-h-[500px] flex flex-col">
      <div className="flex border-b border-border bg-muted/20">
        <button
          onClick={() => setActiveSubTab("friends")}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors ${
            activeSubTab === "friends" ? "text-primary border-b-2 border-primary bg-background" : "text-muted-foreground hover:bg-muted/50 border-b-2 border-transparent"
          }`}
        >
          <Users size={16} />
          Meus Amigos
        </button>
        <button
          onClick={() => setActiveSubTab("requests")}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors ${
            activeSubTab === "requests" ? "text-primary border-b-2 border-primary bg-background" : "text-muted-foreground hover:bg-muted/50 border-b-2 border-transparent"
          }`}
        >
          <UserPlus size={16} />
          Pedidos
        </button>
        <button
          onClick={() => setActiveSubTab("search")}
          className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider transition-colors ${
            activeSubTab === "search" ? "text-primary border-b-2 border-primary bg-background" : "text-muted-foreground hover:bg-muted/50 border-b-2 border-transparent"
          }`}
        >
          <Search size={16} />
          Encontrar
        </button>
      </div>

      <div className="p-6 flex-1">
        {activeSubTab === "friends" && (
          <div className="space-y-4">
            {isLoadingFriends ? (
              <p className="text-center text-xs text-muted-foreground py-8">A carregar amigos...</p>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                <Users size={32} className="opacity-30 mb-3" />
                <p className="text-sm font-bold text-foreground">Ainda não tens amigos</p>
                <p className="text-[10px] mt-1 max-w-xs">
                  Adiciona utilizadores para os acompanhares e enviares mensagens diretas.
                </p>
                <button 
                  onClick={() => setActiveSubTab("search")}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-sm uppercase tracking-wider"
                >
                  Procurar Utilizadores
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend: any) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border border-border rounded-sm bg-background hover:border-primary/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar src={friend.avatar_url} name={friend.username} size="sm" />
                        {isOnline(friend.id) && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{friend.username}</span>
                        <span className="text-[10px] text-muted-foreground">{isOnline(friend.id) ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSendMessage(friend.id)}
                        className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-sm transition-colors border-none cursor-pointer"
                        title="Enviar Mensagem"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "requests" && (
          <div className="space-y-4">
             <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                <UserPlus size={32} className="opacity-30 mb-3" />
                <p className="text-sm font-bold text-foreground">Sem novos pedidos</p>
                <p className="text-[10px] mt-1 max-w-xs">
                  Não tens nenhum pedido de amizade pendente.
                </p>
              </div>
          </div>
        )}

        {activeSubTab === "search" && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome ou username..." 
                  className="pl-9 h-10 bg-background/50 border-border focus-visible:ring-primary rounded-sm text-sm w-full"
              />
            </div>
            
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
              <Search size={32} className="opacity-30 mb-3" />
              <p className="text-[10px] mt-1 max-w-xs">
                A funcionalidade de pesquisa global de utilizadores está atualmente indisponível.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
