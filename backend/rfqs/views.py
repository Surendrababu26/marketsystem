from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RFQ
from .serializers import RFQSerializer

class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all().order_by('-created_at')
    serializer_class = RFQSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'open_rfqs']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my(self, request):
        rfqs = RFQ.objects.filter(buyer=request.user).order_by('-created_at')
        serializer = self.get_serializer(rfqs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def open(self, request):
        rfqs = RFQ.objects.filter(status='OPEN').order_by('-created_at')
        serializer = self.get_serializer(rfqs, many=True)
        return Response(serializer.data)
