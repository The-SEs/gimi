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
    # music
    path("tracks/", views.StudentTrackListCreateView.as_view()),
    path("tracks/<int:pk>/", views.StudentTrackDetailView.as_view()),

    #photos
    path("photos/", views.StudentPhotoView.as_view(), name="student-photos"),
    path("photos/replace/", views.StudentPhotoReplaceView.as_view(), name="student-photo-replace"),
    path("photos/<int:photo_id>", views.StudentPhotoView.as_view(), name="student-photo-delete"),
    path("admin/students/<int:user_id>/photos/", views.AdminStudentPhotoView.as_view(), name="admin-student-photos"),
]
