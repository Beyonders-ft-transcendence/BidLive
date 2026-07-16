from django.urls import path
from apps.analytics.api.views import IngestEventView, AnalyticsStatsView

urlpatterns = [
    path("analytics/events/", IngestEventView.as_view(), name="analytics-events-ingest"),
    path("analytics/stats/", AnalyticsStatsView.as_view(), name="analytics-stats-retrieve"),
]
