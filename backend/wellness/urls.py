from django.urls import path
from . import views

urlpatterns = [
    # journal
    path("journals/", views.JournalListCreateView.as_view()),
    path("journals/<int:pk>/", views.JournalDetailView.as_view()),
    # mood analyzed by ai via journal
    path("moods/", views.MoodListView.as_view()),
    path("moods/latest/", views.mood_latest),
    path("moods/summary/", views.mood_summary),
    path("moods/<int:pk>/", views.MoodDetailView.as_view()),
    # manual daily mood log
    path("daily-moods/", views.DailyMoodListCreateView.as_view()),
    # vector drawing
    path("drawings/", views.VectorDrawingListCreateView.as_view()),
    path("drawings/<int:pk>/", views.VectorDrawingDetailView.as_view()),
]
