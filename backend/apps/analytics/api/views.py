from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import TruncHour
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from drf_spectacular.utils import OpenApiResponse, extend_schema

from common.responses import success_response
from apps.analytics.api.serializers import IngestEventSerializer
from apps.analytics.tasks import save_analytics_event_task
from apps.analytics.models import AnalyticsEvent
from apps.auctions.models import Auction, AuctionStatus, Bid

User = get_user_model()


def _client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class IngestEventView(APIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = IngestEventSerializer

    @extend_schema(
        tags=["analytics"],
        summary="Ingerir evento comportamental",
        description="Recebe um evento enviado pelo frontend de forma assíncrona usando Celery.",
        request=IngestEventSerializer,
        responses={
            202: OpenApiResponse(description="Evento aceito para processamento."),
            400: OpenApiResponse(description="Erro de validação."),
        },
    )
    def post(self, request):
        serializer = IngestEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = request.user.id if request.user and request.user.is_authenticated else None
        event_type = serializer.validated_data["event_type"]
        metadata = serializer.validated_data.get("metadata", {})
        ip_address = _client_ip(request)

        # Dispatch celery task asynchronously
        save_analytics_event_task.delay(
            user_id=user_id,
            event_type=event_type,
            metadata=metadata,
            ip_address=ip_address,
        )

        return success_response(
            {},
            message="Evento aceito para processamento.",
            status_code=status.HTTP_202_ACCEPTED,
        )


class AnalyticsStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        tags=["analytics"],
        summary="Obter estatísticas e relatórios de analytics",
        description="Retorna dados agregados e métricas comportamentais (exclusivo para staff/admin).",
        responses={
            200: OpenApiResponse(description="Estatísticas geradas com sucesso."),
            401: OpenApiResponse(description="Não autenticado."),
            403: OpenApiResponse(description="Não autorizado."),
        },
    )
    def get(self, request):
        now = timezone.now()
        one_hour_ago = now - timedelta(hours=1)
        one_day_ago = now - timedelta(days=1)

        # 1. Active & Online Users
        active_users_last_hour = User.objects.filter(last_seen__gte=one_hour_ago).count()
        online_users_count = User.objects.filter(is_online=True).count()

        # 2. Bids placed per hour (last 24 hours)
        bids_per_hour_queryset = (
            Bid.objects.filter(created_at__gte=one_day_ago)
            .annotate(hour=TruncHour("created_at"))
            .values("hour")
            .annotate(count=Count("id"))
            .order_by("hour")
        )
        bids_per_hour = [
            {"hour": item["hour"].isoformat() if item["hour"] else None, "count": item["count"]}
            for item in bids_per_hour_queryset
        ]

        # 3. Conversion Metrics
        # Auction conversion rate (SOLD vs ended/cancelled)
        total_ended_auctions = Auction.objects.filter(
            status__in=[AuctionStatus.ENDED, AuctionStatus.SOLD, AuctionStatus.CANCELLED]
        ).count()
        sold_auctions_count = Auction.objects.filter(status=AuctionStatus.SOLD).count()
        auction_conversion_rate = (
            round((sold_auctions_count / total_ended_auctions) * 100.0, 2)
            if total_ended_auctions > 0
            else 0.0
        )

        # Bidder engagement rate (users who have placed bids vs active users)
        total_active_users = User.objects.filter(is_active=True).count()
        unique_bidders = Bid.objects.values("bidder").distinct().count()
        bidder_engagement_rate = (
            round((unique_bidders / total_active_users) * 100.0, 2)
            if total_active_users > 0
            else 0.0
        )

        # Top event types summary
        top_events = list(
            AnalyticsEvent.objects.values("event_type")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        stats_data = {
            "active_users": {
                "online_now": online_users_count,
                "active_last_hour": active_users_last_hour,
            },
            "bids_activity": {
                "bids_per_hour_last_24h": bids_per_hour,
            },
            "conversion_metrics": {
                "auction_conversion_rate_percentage": auction_conversion_rate,
                "bidder_engagement_rate_percentage": bidder_engagement_rate,
                "total_ended_auctions": total_ended_auctions,
                "sold_auctions": sold_auctions_count,
                "total_active_users": total_active_users,
                "unique_bidders": unique_bidders,
            },
            "top_event_types": top_events,
        }

        return success_response(stats_data, message="Estatísticas geradas com sucesso.")
