from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit_journal_interceptor, name='submit_journal')
]
