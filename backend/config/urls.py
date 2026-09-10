from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def home(request):
    return JsonResponse({
        "message": "RFQ Marketplace API is running"
    })


urlpatterns = [
    path("", home),

    path("admin/", admin.site.urls),

    path("api/accounts/", include("accounts.urls")),
    path("api/rfqs/", include("rfqs.urls")),
    path("api/quotations/", include("quotations.urls")),
]