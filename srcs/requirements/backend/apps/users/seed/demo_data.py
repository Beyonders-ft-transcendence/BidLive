"""
Dados demo alinhados com frontend/src/data/mockData.ts.

Mapeamento de usuarios do mock:
  u-current / u-admin -> admin
  u-2               -> seller (Ana Silva)
  u-3               -> manager (Carlos Oliveira)
  u-4               -> banned (Beatriz Costa)
"""

from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from apps.auctions.models import AuctionStatus, ItemCondition
from apps.notifications.models import NotificationType
from apps.users.constants import ROLE_MONITOR, ROLE_SUPER_ADMIN
from apps.users.models import UserStatus

DEMO_EMAIL_DOMAIN = "bidlive.dev"
DEFAULT_DEMO_PASSWORD = "demo1234"


@dataclass(frozen=True)
class DemoUserSpec:
    key: str
    email: str
    username: str
    full_name: str
    avatar_url: str
    bio: str
    extra_roles: tuple[str, ...] = ()
    is_staff: bool = False
    status: str = UserStatus.ACTIVE


@dataclass(frozen=True)
class DemoBidSpec:
    bidder_key: str
    amount: Decimal
    offset_hours: float = 0


@dataclass(frozen=True)
class DemoAuctionSpec:
    key: str
    seller_key: str
    category_slug: str
    category_label: str
    title: str
    description: str
    image_urls: tuple[str, ...]
    starting_price: Decimal
    minimum_increment: Decimal
    reserve_price: Decimal | None
    buy_now_price: Decimal | None
    condition_type: str
    start_offset_hours: float
    end_offset_hours: float
    status: str
    bids: tuple[DemoBidSpec, ...] = ()
    watchers: tuple[str, ...] = ()
    stream_title: str | None = None
    stream_live: bool = False
    stream_viewer_count: int = 0
    stream_started_offset_hours: float | None = None


@dataclass(frozen=True)
class DemoMessageSpec:
    auction_key: str
    sender_key: str
    content: str
    offset_hours: float


@dataclass(frozen=True)
class DemoNotificationSpec:
    user_key: str
    notification_type: str
    title: str
    content: str
    is_read: bool
    offset_hours: float


@dataclass(frozen=True)
class DemoReportSpec:
    auction_key: str
    reporter_key: str
    description: str
    offset_hours: float


@dataclass(frozen=True)
class DemoAnalyticsSpec:
    user_key: str
    event_type: str
    metadata: dict
    offset_hours: float


def demo_email(local_part: str) -> str:
    return f"{local_part}@{DEMO_EMAIL_DOMAIN}"


def hours_from_now(hours: float):
    return timezone.now() + timedelta(hours=hours)


DEMO_USERS: tuple[DemoUserSpec, ...] = (
    DemoUserSpec(
        key="admin",
        email=demo_email("admin"),
        username="demo_admin",
        full_name="Daniel Ndomba",
        avatar_url=(
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
            "?auto=format&fit=crop&w=150&h=150&q=80"
        ),
        bio="Colecionador entusiasta e investidor de ativos digitais e relogios de luxo.",
        extra_roles=(ROLE_SUPER_ADMIN,),
        is_staff=True,
    ),
    DemoUserSpec(
        key="seller",
        email=demo_email("seller"),
        username="demo_seller",
        full_name="Ana Silva",
        avatar_url=(
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
            "?auto=format&fit=crop&w=100&h=100&q=80"
        ),
        bio="Focada em obras de artes analogicas e NFTs raros.",
    ),
    DemoUserSpec(
        key="manager",
        email=demo_email("manager"),
        username="demo_manager",
        full_name="Carlos Oliveira",
        avatar_url=(
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
            "?auto=format&fit=crop&w=100&h=100&q=80"
        ),
        bio="Curador de leiloes esportivos e colecionaveis raros.",
        extra_roles=(ROLE_MONITOR,),
    ),
    DemoUserSpec(
        key="banned",
        email=demo_email("banned"),
        username="demo_banned",
        full_name="Beatriz Costa",
        avatar_url=(
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
            "?auto=format&fit=crop&w=100&h=100&q=80"
        ),
        bio="Perseguindo as melhores ofertas.",
        status=UserStatus.BANNED,
    ),
)


# INITIAL_AUCTIONS em mockData.ts (auc-1 .. auc-5)
DEMO_AUCTIONS: tuple[DemoAuctionSpec, ...] = (
    DemoAuctionSpec(
        key="auc-1",
        seller_key="seller",
        category_slug="collectibles",
        category_label="Relogios de Luxo",
        title="Rolex Daytona Platinum Ice Blue Dial",
        description=(
            "Um classico lendario. Caixa de platina com mostrador azul glacial exuberante, "
            "luneta em ceramica marrom e movimento automatico calibre 4130 original. "
            "Inclui caixa, documentos de autenticidade carimbados e todos os elos originais. "
            "Estado de conservacao impecavel (Mint Condition 9.9/10)."
        ),
        image_urls=(
            "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=600&h=400&q=80",
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&h=400&q=80",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&h=400&q=80",
        ),
        starting_price=Decimal("72000.00"),
        minimum_increment=Decimal("500.00"),
        reserve_price=Decimal("75000.00"),
        buy_now_price=Decimal("95000.00"),
        condition_type=ItemCondition.USED,
        start_offset_hours=-2,
        end_offset_hours=1.5,
        status=AuctionStatus.LIVE,
        bids=(
            DemoBidSpec("seller", Decimal("73000.00"), offset_hours=-1.8),
            DemoBidSpec("admin", Decimal("74000.00"), offset_hours=-1.2),
            DemoBidSpec("manager", Decimal("75500.00"), offset_hours=-0.4),
        ),
        watchers=("admin", "seller", "manager"),
        stream_title="LEILAO REALTIME: Rolex e Joias Raras da Alta Sociedade",
        stream_live=True,
        stream_viewer_count=247,
        stream_started_offset_hours=-2,
    ),
    DemoAuctionSpec(
        key="auc-2",
        seller_key="manager",
        category_slug="electronics",
        category_label="Hardware & Tech",
        title="Estacao de Trabalho Dev-AI SuperCluster (Dual RTX 4090)",
        description=(
            "Maquina de computacao definitiva para Deep Learning. Equipado com 2x NVIDIA RTX 4090 "
            "24GB VRAM, AMD Threadripper PRO 5955WX (16 cores, 32 threads), 256GB ECC RAM DDR5, "
            "4TB SSD NVMe PCIe Gen5, Fonte Titanium de 1600W redundante e refrigeracao "
            "liquida selada industrial. Perfeito para treinamento de LLMs localmente."
        ),
        image_urls=(
            "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&h=400&q=80",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&h=400&q=80",
        ),
        starting_price=Decimal("8500.00"),
        minimum_increment=Decimal("200.00"),
        reserve_price=None,
        buy_now_price=Decimal("13500.00"),
        condition_type=ItemCondition.NEW,
        start_offset_hours=-1,
        end_offset_hours=3.2,
        status=AuctionStatus.LIVE,
        bids=(
            DemoBidSpec("manager", Decimal("9000.00"), offset_hours=-0.8),
            DemoBidSpec("admin", Decimal("10200.00"), offset_hours=-0.2),
        ),
        watchers=("admin", "seller"),
        stream_title="Supercomputadores de Inteligencia Artificial & Hardware Extremo",
        stream_live=True,
        stream_viewer_count=112,
        stream_started_offset_hours=-1,
    ),
    DemoAuctionSpec(
        key="auc-3",
        seller_key="admin",
        category_slug="collectibles",
        category_label="Colecionaveis Raros",
        title="Carta Magic: The Gathering - Black Lotus Limited Beta",
        description=(
            "A peca sagrada dos card games colecionaveis. Copia impecavel da carta mais valiosa "
            "e emblematica de MTG, impressa na colecao Beta de 1993. Certificacao PSA 9 MINT. "
            "Excelente saturacao de tintas estruturais, centrado magnifico (60/40) e bordas livres "
            "de atrito ou marcas d'agua."
        ),
        image_urls=(
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=400&q=80",
        ),
        starting_price=Decimal("150000.00"),
        minimum_increment=Decimal("1000.00"),
        reserve_price=None,
        buy_now_price=None,
        condition_type=ItemCondition.USED,
        start_offset_hours=-5,
        end_offset_hours=24,
        status=AuctionStatus.LIVE,
        bids=(
            DemoBidSpec("manager", Decimal("150500.00"), offset_hours=-4),
            DemoBidSpec("seller", Decimal("151000.00"), offset_hours=-3),
            DemoBidSpec("seller", Decimal("151500.00"), offset_hours=-2),
        ),
        watchers=("admin", "seller", "manager"),
    ),
    DemoAuctionSpec(
        key="auc-4",
        seller_key="manager",
        category_slug="other",
        category_label="Esportes & Outdoor",
        title="Bicicleta de Estrada Colnago C68 Carbon Edition",
        description=(
            "Estrutura premium inteiramente em fibra de carbono produzida a mao na Italia. "
            "Rodas Lightweight Meilenstein Obermayer, grupo de transmissao eletronico Campagnolo "
            "Super Record Wireless de 12 velocidades, guidao aerodinamico integrado e sela "
            "customizada de titanio. Peso total extraordinario de apenas 6.3kg."
        ),
        image_urls=(
            "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&h=400&q=80",
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&h=400&q=80",
        ),
        starting_price=Decimal("12000.00"),
        minimum_increment=Decimal("250.00"),
        reserve_price=None,
        buy_now_price=Decimal("16000.00"),
        condition_type=ItemCondition.NEW,
        start_offset_hours=4,
        end_offset_hours=52,
        status=AuctionStatus.SCHEDULED,
        watchers=("seller", "admin"),
    ),
    DemoAuctionSpec(
        key="auc-5",
        seller_key="seller",
        category_slug="gaming",
        category_label="Geek & HQ",
        title="Estatua Geralt of Rivia Primordial Scale (Sideshow)",
        description=(
            "Estatua macica colecionavel em escala real 1/3, pintada individualmente a mao pelos "
            "mestres da Sideshow. Replica precisa das texturas do jogo Witcher III. Inclui base "
            "tematica iluminada por fibra otica, duas espadas de metal reais intercambiaveis e "
            "cabeca esculpida alternativa."
        ),
        image_urls=(
            "https://images.unsplash.com/photo-1608889174637-3c44f6326f1a?auto=format&fit=crop&w=600&h=400&q=80",
        ),
        starting_price=Decimal("2200.00"),
        minimum_increment=Decimal("100.00"),
        reserve_price=None,
        buy_now_price=Decimal("4200.00"),
        condition_type=ItemCondition.USED,
        start_offset_hours=-12,
        end_offset_hours=-1,
        status=AuctionStatus.ENDED,
        bids=(
            DemoBidSpec("admin", Decimal("2400.00"), offset_hours=-10),
            DemoBidSpec("manager", Decimal("2800.00"), offset_hours=-8),
            DemoBidSpec("admin", Decimal("3400.00"), offset_hours=-6),
        ),
        watchers=("admin", "manager"),
    ),
)


# INITIAL_MESSAGES (roomId str-1 -> auc-1)
DEMO_MESSAGES: tuple[DemoMessageSpec, ...] = (
    DemoMessageSpec(
        auction_key="auc-1",
        sender_key="manager",
        content="Esse Daytona e simplesmente uma joia absurda! Luneta perfeita.",
        offset_hours=-0.25,
    ),
    DemoMessageSpec(
        auction_key="auc-1",
        sender_key="admin",
        content="Vale cada centavo, otima condicao. Estou acompanhando atento!",
        offset_hours=-0.2,
    ),
    DemoMessageSpec(
        auction_key="auc-1",
        sender_key="seller",
        content=(
            "Obrigada pelo feedback gente! Esse relogio pertenceu a uma colecao historica na Suica."
        ),
        offset_hours=-0.15,
    ),
)


# INITIAL_NOTIFICATIONS
DEMO_NOTIFICATIONS: tuple[DemoNotificationSpec, ...] = (
    DemoNotificationSpec(
        user_key="admin",
        notification_type=NotificationType.OUTBID,
        title="Sua oferta foi superada!",
        content="No leilao Rolex Daytona Platinum, Carlos ofertou R$ 75.500,00.",
        is_read=False,
        offset_hours=-0.4,
    ),
    DemoNotificationSpec(
        user_key="admin",
        notification_type=NotificationType.NEW_BID,
        title="Sua oferta esta vencendo!",
        content=(
            "Voce e o maior ofertante da Estacao de Trabalho Dev-AI SuperCluster por R$ 10.200,00."
        ),
        is_read=True,
        offset_hours=-0.2,
    ),
    DemoNotificationSpec(
        user_key="seller",
        notification_type=NotificationType.STREAM_STARTED,
        title="Live iniciada",
        content="Ana Silva iniciou a transmissao: Rolex e Joias Raras da Alta Sociedade.",
        is_read=False,
        offset_hours=-2,
    ),
)


# INITIAL_REPORTS (rep-1 -> auc-5)
DEMO_REPORTS: tuple[DemoReportSpec, ...] = (
    DemoReportSpec(
        auction_key="auc-5",
        reporter_key="manager",
        description="Imagem de qualidade questionavel ou descricao incoerente do frete.",
        offset_hours=-5,
    ),
)


# INITIAL_SYSTEM_LOGS -> AnalyticsEvent
DEMO_ANALYTICS_EVENTS: tuple[DemoAnalyticsSpec, ...] = (
    DemoAnalyticsSpec(
        user_key="admin",
        event_type="websocket.connected",
        metadata={
            "module": "WEBSOCKET_MANAGER",
            "message": "User connected successfully.",
            "details": "JWT Authentication verified. Protocol upgrade approved.",
            "level": "INFO",
        },
        offset_hours=-0.5,
    ),
    DemoAnalyticsSpec(
        user_key="admin",
        event_type="auction.bid",
        metadata={
            "module": "BID_PROCESSOR",
            "message": "Bid received for auc-1 from admin.",
            "details": "Amount: R$ 74.000,00. Result: Succeeded & Synchronized.",
            "level": "INFO",
            "auction_key": "auc-1",
            "amount": "74000.00",
        },
        offset_hours=-1.2,
    ),
    DemoAnalyticsSpec(
        user_key="admin",
        event_type="auth.login_throttled",
        metadata={
            "module": "OAUTH_CONNECTOR",
            "message": "Google login request throttled for IP 189.22.45.101",
            "details": "Rate Limit Threshold reached. Resetting in 60s.",
            "level": "WARNING",
        },
        offset_hours=-2.1,
    ),
)


DEMO_DOMAINS: tuple[dict, ...] = (
    {
        "owner_key": "seller",
        "name": "Colecao Primavera 2026",
        "description": "Leiloes tematicos de artes e relogios vintage.",
        "status": "active",
        "budget": Decimal("50000.00"),
    },
    {
        "owner_key": "manager",
        "name": "Tech Drops Semanais",
        "description": "Hardware de alto desempenho e setups gamer.",
        "status": "active",
        "budget": Decimal("25000.00"),
    },
)


DEMO_FRIENDSHIPS: tuple[tuple[str, str], ...] = (
    ("seller", "manager"),
    ("seller", "admin"),
    ("admin", "manager"),
)
